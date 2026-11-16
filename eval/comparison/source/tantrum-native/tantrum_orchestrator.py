#!/usr/bin/env python3

from collections.abc import Callable
from functools import partial
from hashlib import sha256
from multiprocessing import Pool, Process, Queue, cpu_count
from pathlib import Path
from tantrum_trace_single import run_once
from threading import Thread, Lock
from tqdm import tqdm
from typing import Tuple, TypeVar, Any
import cgrp
import copy
import functools
import json
import marshal
import math
import pickle
import queue as _stdq
import random
import struct
import sys
import time
import numpy as np

from os import environ, unlink, nice, getpid
environ['PYTHONUNBUFFERED'] = '1'

# fault_fn: (state, insn, mem_addr, data, mem) -> (new_state, (pre_data, post_data), revert: bool)
FaultFnStateType = TypeVar("State")
FaultFnType = Callable[[FaultFnStateType, int, int, bytes, Any], Tuple[FaultFnStateType, Tuple[bytes|None, bytes|None], bool]]


D8_PATH = '/work/v8-build/out/fair-build/d8'
TESTS_LIST = './tests.txt'
SHM_SIZE = 0x100000          # 955776
MAX_FUZZ_ENTRIES = 50000
MAX_FAULT_INSNS = 3
MAX_FAULT_SEQ = 0x100

# sync w/ tantrum_trace_single.py!
EXIT_SEGV_V8SBX = 5
EXIT_STATUS_MASK = 0x7



def p64(v):
  return struct.pack('<Q', v)

def u64(b):
  return struct.unpack('<Q', b)[0]


def log_path(dump_marker):
  fn = f'./logs/{dump_marker}.txt'
  return fn

def stat_path(ts):
  fn = f'./logs/stat/{ts}.json'
  return fn


def preload_syms():
  # preload symbols
  from libdebug import debugger, libcontext
  libcontext.sym_lvl = 1

  BINARY_BASE = 0x555555554000
  d = debugger([D8_PATH], aslr=False, fast_memory=True)
  d.run()
  syms_tgt = [
    'v8::internal::trap_handler::SetV8SandboxBaseAndSize(unsigned long, unsigned long)',
    'v8::Script::Run(v8::Local<v8::Context>)',
    'v8::base::OS::Abort()',
    'v8::Shell::WriteLcovData(v8::Isolate*, char const*)',
    #'__asan_on_error',
  ]
  syms = {sym: d.symbols[sym][0].start + BINARY_BASE for sym in syms_tgt}
  d.kill()
  d.terminate()
  del d

  return syms

# fuzzer processes
def run_fuzzer(workQ: Queue, resultQ: Queue):
  nice(1)
  syms = preload_syms()
  cg_name = f'fuzz_{getpid()}'
  cg = cgrp.create_cgroup(cg_name, 8*(1024**3))
  try:
    while True:
      try:
        # unique work identifier and fuzz_args
        work_id, fuzz_args = workQ.get()
        res = run_once(D8_PATH, *fuzz_args, cg, shm_size=SHM_SIZE, syms=syms)
        res = (afl_to_fuzzilli(res[0]), res[1])
        resultQ.put((work_id, res))
      except Exception as e:
        print(f"[w] Error in fuzzer process: {e}")
  finally:
    print(f"[w] Reaping fuzzer process ${cg_name}")
    cgrp.reap(cg)
    cgrp.remove_cgroup(cg_name)


def merge_stats(dst: dict, src: dict):
  for k, v in src.items():
    if isinstance(v, int):
      dst[k] = dst.get(k, 0) + v
    elif isinstance(v, dict):
      dst[k] = merge_stats(dst.get(k, {}), v)
    elif isinstance(v, list):
      dst[k] = dst.get(k, [])
      dst[k].extend(v)
    else:
      assert False
  return dst


## coverage ##
def afl_to_fuzzilli(afl_cov):
    arr = np.frombuffer(afl_cov, dtype=np.uint8)
    bits = (arr != 0).astype(np.uint8)
    return np.packbits(bits, bitorder='little').tobytes()

def bytes_or(a, b):
    return np.bitwise_or(
        np.frombuffer(a, dtype=np.uint8),
        np.frombuffer(b, dtype=np.uint8)
    ).tobytes()

POPCOUNT_TABLE = np.array([bin(i).count('1') for i in range(256)], dtype=np.int64)
def bytes_bitcnt(cov):
    return int(POPCOUNT_TABLE[np.frombuffer(cov, dtype=np.uint8)].sum())

def bytes_new(cov_old, cov_new):
    old = np.frombuffer(cov_old, dtype=np.uint8)
    new = np.frombuffer(cov_new, dtype=np.uint8)
    return (new & ~old).tobytes()
## coverage ##

def sz_range(sz):
  if sz == 0:
    return []
  lst = [1<<i for i in range(0, sz.bit_length())]
  if lst[-1] != sz:   # not a power of two...?
    lst.append(sz)
  return lst


# tracemap worker
def _get_tracemap(fn, suffix=None):
  assert suffix
  try:
    trace_raw = open(fn + suffix, 'rb').read()
    assert trace_raw[-4:] == b'#eof'
    assert (len(trace_raw) - 4) % 0x10 == 0
  except:
    return {}

  ctr = {}
  for i in range(0, len(trace_raw) - 4, 0x10):
    # read trace (inst_addr 8b, v8sbx_offset 4b, nth_total_read 3b, read_bytes 1b)
    trace_slice = trace_raw[i:i+0x10]
    trace_inst = u64(trace_slice[0:0x8])
    trace_readsz = trace_slice[0xf]
    if (trace_inst >> 47) != 0:
      break
    ctr = merge_stats(ctr, {(trace_inst, trace_readsz): 1})
  
  return ctr


# get the trace map
def get_tracemap(fns, worker_cnt):
  with Pool(worker_cnt) as pool:
    ctrs = list(tqdm(pool.imap(partial(_get_tracemap, suffix='.1.trace'), fns), total=len(fns)))

  # merge the trace maps
  ctr_total = {}
  for fn_idx, ctr in enumerate(tqdm(ctrs)):
    ctr_merge = {}
    for inst in ctr:
      ctr_merge[inst] = [(fn_idx, ctr[inst])]
    ctr_total = merge_stats(ctr_total, ctr_merge)
  
  # sort by descending hitcnt
  for inst in ctr_total:
    ctr_total[inst].sort(key=lambda x: x[1], reverse=True)

  return ctr_total, ctrs


# send work to the work queue, with fault_fn code marshalled for use at each hit @ child fuzzer proc
def enqueue_work(workQ, work_id, js_path, target_insns, fault_state, fault_fn: FaultFnType, marker):
  fault_fn_code = marshal.dumps(fault_fn.__code__)
  workQ.put((work_id, (js_path, target_insns, fault_state, fault_fn_code, marker)))


# run multiple threaded workers, mostly for worker/result queue processors
def run_threaded_workers(*args):
  ts = []
  for fn in args:
    t = Thread(target=fn)
    t.start()
    ts.append(t)
  for t in ts:
    t.join()


def update_v8sbx_log(marker, fn, faults):
  log_fn = log_path(marker)
  try:
    with open(log_fn, 'rt') as f:
      log_contents = f.read()
  except:
    print(f'[!] update_v8sbx_log(): failed to open {log_fn}, v8sbx log dump failed?')
    return

  # we should have log_contents by now. append fn and fault info
  new_log_fn = log_path('v8sbx-' + marker)
  with open(new_log_fn, 'wt') as f:
    f.write(f'Input: {fn}\n')
    f.write(f'Fault: {repr(faults)}\n')
    f.write(log_contents)

  # new log written, unlink previous
  unlink(log_fn)


class BufferedLogger(object):
  def __init__(self, batch_size=64, flush_interval=0.5):
    self.q = _stdq.Queue()
    self.batch_size = batch_size
    self.flush_interval = flush_interval
    self.thread = Thread(target=self._run, daemon=True)
    self.thread.start()

  def log(self, msg):
    self.q.put(msg)

  def _run(self):
    buf = []
    while True:
      try:
        msg = self.q.get(timeout=self.flush_interval)
        buf.append(msg)
        if len(buf) >= self.batch_size:
          sys.stdout.write(''.join(buf))
          sys.stdout.flush()
          buf.clear()
      except _stdq.Empty:
        if buf:
          sys.stdout.write(''.join(buf))
          sys.stdout.flush()
          buf.clear()

LOG = BufferedLogger()
def log(msg):
  LOG.log(msg + '\n')


# Bounded random-access corpus. Lock-free O(1) sample / sample_same_fn_idx,
# tournament-K eviction on full.
# Writes serialized via self.lock. Reads may see slightly stale entries.
class Corpus(object):
  def __init__(self, capacity, tournament_k=3, decay=0.9999):
    self.cap = capacity
    self.k = tournament_k
    self.decay = decay
    self.entries = []      # list of FuzzEntry (forward-defined)
    self.by_fn = {}        # fn_idx -> tuple of slot indices
    self.lock = Lock()
    self._counter = 0      # monotonic add-stamp for decay

  def __len__(self):
    return len(self.entries)

  def _eff_score(self, idx):
    e = self.entries[idx]
    age = max(0, self._counter - getattr(e, 'epoch', 0))
    return e.score * (self.decay ** age)

  def add(self, e):
    with self.lock:
      e.epoch = self._counter
      self._counter += 1
      if len(self.entries) < self.cap:
        slot = len(self.entries)
        self.entries.append(e)
      else:
        # tournament eviction on decayed score
        k = min(self.k, self.cap)
        candidates = random.sample(range(self.cap), k)
        slot = min(candidates, key=self._eff_score)
        old = self.entries[slot]
        # update by_fn FIRST (drop slot from old fn), then entries, then add slot to new fn
        old_slots = self.by_fn.get(old.fn_idx, ())
        new_old_slots = tuple(s for s in old_slots if s != slot)
        if new_old_slots:
          self.by_fn[old.fn_idx] = new_old_slots
        else:
          self.by_fn.pop(old.fn_idx, None)
        self.entries[slot] = e
      self.by_fn[e.fn_idx] = self.by_fn.get(e.fn_idx, ()) + (slot,)

  def sample(self):
    """Lock-free uniform random sample. May rarely return None if empty."""
    n = len(self.entries)
    if n == 0:
      return None
    return self.entries[random.randrange(0, n)]

  def sample_same_fn_idx(self, fn_idx):
    """Lock-free sample within a given fn_idx. Validates fn_idx after read
    in case of a race (slot just got reused for a different fn_idx)."""
    slots = self.by_fn.get(fn_idx)
    if not slots:
      return None
    slot = random.choice(slots)
    n = len(self.entries)
    if slot >= n:
      return None
    entry = self.entries[slot]
    if entry.fn_idx != fn_idx:  # race: slot got reused
      return None
    return entry


# fuzzer output entries for scheduling / mutations
# Note: this is pickled as part of dataset @ baseline.pickle
class FuzzEntry(object):
  def __init__(self, score: int, fn_idx: int, fuzz_faults: dict[int, list[tuple[int, bytes]]], fuzz_exitcode: int):
    self.score = score
    self.fn_idx = fn_idx
    self.fuzz_faults = fuzz_faults
    # do we need to track full coverage for each fuzz entries?
    # this takes up 192KB per entries, which translates to ~3.66GB for 20000 entries
    # self.fuzz_cov = fuzz_cov
    self.fuzz_exitcode = fuzz_exitcode

  def __repr__(self):
    return f'FuzzEntry({self.score}, {self.fn_idx}, {self.fuzz_faults}, (exitcode {self.fuzz_exitcode}))'

  def __lt__(self, other):
    return self.score < other.score


# main orchestrator / scheduler
def run_orchestrator():
  FUZZ_START_TIME = time.time()
  CPUS = cpu_count()
  worker_cnt = CPUS


  # fetch js testcase list
  with open(TESTS_LIST, 'rt') as f:
    js_testcases = f.read()

  js_testcases_hash = sha256(js_testcases.encode('utf-8')).hexdigest()
  fns = [fn.strip() for fn in js_testcases.splitlines()]

  # fetch js testcase trace map
  try:
    with open('tracemap.pickle', 'rb') as f:
      _js_testcases_hash, tracemap, trace_per_fn = pickle.load(f)
    assert _js_testcases_hash == js_testcases_hash
  except KeyboardInterrupt:
    raise
  except:
    print('[!] invalid tracemap.pickle, recomputing tracemap')
    tracemap, trace_per_fn = get_tracemap(fns, worker_cnt)
    with open('tracemap.pickle', 'wb') as f:
      pickle.dump((js_testcases_hash, tracemap, trace_per_fn), f)


  # spin up workers & set up IPC through Queue
  workQ, resultQ = Queue(worker_cnt * 4), Queue(worker_cnt * 4)
  fuzzer_procs = []
  for _ in range(worker_cnt):
    fuzzer_procs.append(Process(target=run_fuzzer, args=(workQ, resultQ)))
    fuzzer_procs[-1].start()

  # 1. run every tests to measure baseline coverage
  # 1-1. wait for baseline coverage
  # - ~~Include all baselines as fuzz dataset entry, with base score 3~~ disabled for now
  #   - This allows every testcase have a non-zero chance of being picked from scratch
  # Note: Fault params = List of corruptions w/ saturating hit counter as index
  # list (heapq) of (score, (*fuzz target, dict inst -> list of faults), (*fuzz results)))
  try:
    with open('baseline.pickle', 'rb') as f:
      _js_testcases_hash, dataset, baseline_stats, baseline = pickle.load(f)
    assert _js_testcases_hash == js_testcases_hash
  except KeyboardInterrupt:
    raise
  except:
    print('[!] invalid baseline.pickle, recomputing baseline')
    nop: FaultFnType = lambda state, _insn, _mem_addr, data, _mem: (state, (None, None), False)
    def f_work():
      for fn_idx, fn in enumerate(fns):
        enqueue_work(workQ, fn_idx, fn, [], None, nop, 'baseline')

    dataset: list[FuzzEntry] = []
    baseline_stats = {}
    baseline = [None]*len(fns)
    def f_result():
      nonlocal baseline_stats
      for i in tqdm(range(len(fns))):
        fn_idx, fuzz_result = resultQ.get()
        assert baseline[fn_idx] is None
        baseline[fn_idx] = list(fuzz_result)
        _cov, exitcode = fuzz_result

        # NOTE: this is baseline run, should not have encountered any v8sbx violations.
        # fuzz_entry = FuzzEntry(3, fn_idx, {}, exitcode)
        # dataset.append(fuzz_entry)

        baseline_stats = merge_stats(baseline_stats, {exitcode: 1})

    run_threaded_workers(f_work, f_result)

    assert workQ.empty()
    assert resultQ.empty()

    with open('baseline.pickle', 'wb') as f:
      pickle.dump((js_testcases_hash, dataset, baseline_stats, baseline), f)

  # compute baseline total cov
  total_cov = afl_to_fuzzilli(bytes(SHM_SIZE))
  for baseline_res in baseline:
    total_cov = bytes_or(total_cov, baseline_res[0])
  total_cov_cnt = bytes_bitcnt(total_cov)
  print(f'[*] Baseline Coverage: {total_cov_cnt}')

  corpus = Corpus(capacity=MAX_FUZZ_ENTRIES, tournament_k=3)
  for _e in dataset:
    corpus.add(_e)
  del dataset

  # 2. manually run every "base mutations" for every instructions seen in trace
  #    - consider prioritizing least hit instructions?
  #      - assumption: unique logic / exceptional case tested only by a few # of testcases
  #    - prioritize testcases that hit the target instruction the most
  #      - assumption: testcase is relevant or tailor-made to that logic
  #    - test byte-level equivalence classes
  #      - assumption: no inter-byte dependency (although latter splice mutations can help fix this)
  #      - assumption: equivalence class holds meaning, i.e. flips of 0x42 and 0xff are correlated
  def fault_gen(state, insn, mem_addr, data, mem):
    def xorshift128p_seed(buf: bytes):
      # 0x3bffb83978e24f88, 0x9238d5d56c71cd35
      buf += b'\x88O\xe2x9\xb8\xff;5\xcdql\xd5\xd58\x92'
      return [int.from_bytes(buf[0:8], 'little'), int.from_bytes(buf[8:16], 'little')]

    def xorshift128p(s):
      s1 = s[0]
      s0 = s[1]
      s[0] = s0
      s1 ^= (s1 << 23) & ((1<<64)-1)
      s[1] = s1 ^ s0 ^ (s1 >> 18) ^ (s0 >> 5)
      return (s[1] + s0) & ((1<<64)-1)

    if 'BOUND_4' in state:
      BOUND_4 = state['BOUND_4']
    else:
      BOUND_4 = list(
        v.to_bytes(4, 'little') for v in (
          list(range(0x10)) + list(range(0x7ffffff8, 0x80000008)) + list(range(0xfffffff8, 0x100000000))
        )
      )
      state['BOUND_4'] = BOUND_4

    faults = state['faults']
    hits = state['hits']
    if (insn not in faults) or (insn not in hits) or len(faults[insn]) == 0:
      return (state, (None, None), False)
    hits[insn] += 1

    # saturate index to last element
    fault_idx = min(hits[insn] - 1, len(faults[insn]) - 1)
    (rnd_pre, rnd_post), mut = faults[insn][fault_idx]
    bytes_pre = bytearray(data) if rnd_pre is not None else None
    bytes_post = bytearray(data) if rnd_post is not None else None
    _mut = mut % (4 if len(data) == 4 else 3)

    for b, r in ((bytes_pre, rnd_pre), (bytes_post, rnd_post)):
      if b is None:
        continue

      if _mut == 3:   # handles / boundary values
        if b[3] == 0 and (mut & 0x40):  # try handle / ptr heuristics
          if b[0] & 1:   # tagged?
            # following the chain may be an option, but for now just toggle nearby
            h = int.from_bytes(b[:2], 'little')
            h = (h ^ (int.from_bytes(r, 'little') << 2)) & 0xffff
            b[:2] = h.to_bytes(2, 'little')
          else:
            h = int.from_bytes(b[:3], 'little')
            h = (h ^ (int.from_bytes(r, 'little') << 4)) & 0xffffff
            b[:3] = h.to_bytes(3, 'little')
        else:   # try boundary heuristics
          b[:4] = BOUND_4[int.from_bytes(r, 'little') % len(BOUND_4)]
      elif _mut == 2:    # xor
        b[:len(r)] = bytes(x^y for x, y in zip(b[:len(r)], r))
      elif _mut == 1:  # add/sub
        val_bytes = b[:len(r)]
        bytelen = len(val_bytes)
        val = int.from_bytes(val_bytes, 'little')
        if mut & 0x40:
          val += int.from_bytes(r, 'little')
        else:
          val -= int.from_bytes(r, 'little')
        val &= ((1 << (bytelen * 8)) - 1)
        b[:bytelen] = val.to_bytes(bytelen, 'little')
      else:   # bitflip nearby. this effect is persistent.
        st = mem_addr - min(0x80, len(r)*0x8)
        en = mem_addr + min(0x80, len(r)*0x8)
        seed = xorshift128p_seed(r)
        orig = bytearray(mem[st, en - st])
        bitlen = len(orig) * 8
        for _ in range(bitlen // 8):   # bitflip density: 1 bitflip per byte
          rnd = xorshift128p(seed) % bitlen
          byte_ofs = rnd // 8
          bit_ofs = rnd % 8
          orig[byte_ofs] ^= (1 << bit_ofs)
        mem[st, len(orig)] = bytes(orig)

        # reset bytes and break out, fault already applied
        bytes_pre = None
        bytes_post = None
        break

    # randomly decide revert. sourcing entropy from mut top bit
    # only applicable when bytes_pre && !bytes_post
    do_revert = bytes_pre is not None and bytes_post is None and bool(mut & 0x80)
    return (state, (
      bytes(bytes_pre) if bytes_pre is not None else None,
      bytes(bytes_post) if bytes_post is not None else None,
    ), do_revert)

  # dry-run to compute entry counts, must match f_work()
  prune_run_entries = 0
  for tr_key, _ in tracemap.items():
    _, tr_readsz = tr_key
    for _ in sz_range(tr_readsz):
      prune_run_entries += 1

  def f_work_prune():
    for tr_key, tr_cases in tracemap.items():
      tr_inst, tr_readsz = tr_key
      fn_idx = tr_cases[0][0]
      tr_top_fn = fns[fn_idx]
      hitcnt = trace_per_fn[fn_idx][tr_key]
      for eqv in sz_range(tr_readsz):      # equivalence classes based on unit size
        # force zeros -> 0xff to force all bytes to flip by some value
        seq_len = min(hitcnt + 1, MAX_FAULT_SEQ)
        mut_seq = random.randbytes(seq_len)
        xor_seq = bytearray(random.randbytes(eqv*seq_len))
        for i in range(len(xor_seq)):
          if xor_seq[i] == 0:
            xor_seq[i] = 0xff
        state = {
          'faults': {
            # fault starts at bytepos `pos`, of random 4-byte-long xor value
            tr_inst: tuple(
              (
                (bytes(xor_seq[fault_idx*eqv:(fault_idx+1)*eqv]), None),
                0x80 | ((mut_seq[fault_idx] & 0x41) + 1)   # xor/add/sub, revert
              )
              for fault_idx in range(seq_len)
            ),
          },
          'hits': {
            tr_inst: 0,
          }
        }
        marker = f'prune-{fn_idx}-{tr_inst:#x}-{eqv}'
        enqueue_work(
          workQ, (marker, fn_idx, state['faults']), tr_top_fn, [tr_inst], state,
          fault_gen, marker
        )

  # 2-1. wait for base mutation results
  last_print = time.time()
  total_execs = 0
  def process_one_result(exc_exit=False):
    nonlocal total_cov, total_cov_cnt, last_print, total_execs

    fuzz_info, fuzz_result = resultQ.get()
    marker, fn_idx, faults = fuzz_info
    cov, exitcode = fuzz_result

    cov_arr = np.frombuffer(cov, dtype=np.uint8)
    baseline_arr = np.frombuffer(baseline[fn_idx][0], dtype=np.uint8)

    # delta vs per-fn baseline; if zero, nothing this result can help globally either
    new_vs_baseline = cov_arr & ~baseline_arr
    new_edge_cnt = int(POPCOUNT_TABLE[new_vs_baseline].sum())

    if new_edge_cnt > 0:
      total_arr = np.frombuffer(total_cov, dtype=np.uint8)
      new_vs_total = cov_arr & ~total_arr
      global_delta = int(POPCOUNT_TABLE[new_vs_total].sum())
      # only do the 128KB OR + alloc when there's actually a delta
      if global_delta > 0:
        total_cov = (total_arr | cov_arr).tobytes()
        prev = total_cov_cnt
        total_cov_cnt += global_delta
        log(f'[+] Global Coverage Increase: {prev} -> {total_cov_cnt} ({time.time() - FUZZ_START_TIME:.2f}s)')
      baseline[fn_idx][0] = (baseline_arr | cov_arr).tobytes()
    else:
      global_delta = 0

    tr_inst = list(faults.keys())[0]    # any one of the faults. must be the only fault for pruning runs.

    # dump stats every 10min
    total_execs += 1
    T = time.time()
    if T - last_print > 10*60:
      workQ_sz = workQ.qsize()
      resultQ_sz = resultQ.qsize()
      elapsed = T - FUZZ_START_TIME

      stat = {
        'workQ': workQ_sz,
        'resultQ': resultQ_sz,
        'execs': total_execs,
        'eps': total_execs / elapsed,
        'epsc': total_execs / elapsed / CPUS,
        'coverage': total_cov_cnt,
        'elapsed': int(elapsed),
        'timestamp': int(T),
      }
      stat_json = json.dumps(stat)
      print(f'[*] {stat_json = }')
      with open(stat_path(int(T)), 'wt') as f:
        f.write(stat_json)

      last_print = T

    # 1. increased coverage compared to baseline execution of the same js testcase
    # 2. some kind of exceptional exit detected (usually this implies 1)
    if new_edge_cnt > 0 or (exc_exit and (exitcode & EXIT_STATUS_MASK) >= 3):   # EXIT_TRAP_OK
      cov_old_bitcnt = int(POPCOUNT_TABLE[baseline_arr].sum())
      cov_new_bitcnt = int(POPCOUNT_TABLE[cov_arr].sum())
      log(f'[+] {fn_idx = :}, {tr_inst = :#x} : coverage {cov_old_bitcnt} -> {cov_new_bitcnt} ({new_edge_cnt} new)')
      new_edge_cnt += global_delta * 100   # more value in global coverage
      fuzz_entry = FuzzEntry(new_edge_cnt, fn_idx, faults, exitcode)
      corpus.add(fuzz_entry)

    # pruning runs may also hit a stray v8sbx violation. dump info
    if (exitcode & EXIT_STATUS_MASK) == EXIT_SEGV_V8SBX:
      update_v8sbx_log(marker, fns[fn_idx], faults)

    return 1


  def f_result_prune():
    processor = functools.partial(process_one_result, exc_exit=True)
    remaining = prune_run_entries - worker_cnt
    print(f'[*] Prune: total {prune_run_entries} entries')
    while remaining > 0:
      remaining -= processor()
      if remaining % 1000 == 0:
        print(f'[*] Prune: {remaining} / {prune_run_entries} remaining ({remaining*100/prune_run_entries:.2f}%, {time.time() - FUZZ_START_TIME:.2f}s)')

  run_threaded_workers(f_work_prune, f_result_prune)
  print('[+] Prune: initial run complete. continuing on to main fuzzing loop.')

  # prep structures for main fuzzer loop
  inst2fn: dict[int, set[int]] = {}
  for tr_key, tr_cases in tracemap.items():
    tr_inst, _ = tr_key
    if tr_inst not in inst2fn:
      inst2fn[tr_inst] = set()
    fn_set: set = inst2fn[tr_inst]
    for fn_idx, _ in tr_cases:
      fn_set.add(fn_idx)

  # used for merge/splice op
  def fuzz_entry_merge(insns, f1, f2):
    f = {}
    for insn in insns:
      if insn in f1 and insn in f2:
        s1, s2 = f1[insn], f2[insn]
        min_len = min(len(s1), len(s2))
        # one random byte per 8 positions; index bits to pick s1 vs s2 per position
        mask = random.randbytes((min_len + 7) >> 3)
        spliced = [s2[i] if (mask[i >> 3] >> (i & 7)) & 1 else s1[i] for i in range(min_len)]
        # append remainder from whichever is longer (one of the two slices is empty)
        f[insn] = spliced + list(s1[min_len:]) + list(s2[min_len:])
      elif insn in f1:
        f[insn] = f1[insn]
      elif insn in f2:
        f[insn] = f2[insn]
      # else: skip the insn (shouldn't happen)
    return f

  def gen_faults(tr_readsz, seq_len, orig_seq=None):
    assert (orig_seq is None) or (len(orig_seq) == seq_len)
    new_fvs = []

    # attempt skipping some operations in the start.
    # decreasing probability from the start of sequence, using (len - index) as random weight.
    seq_skips_rnd = random.randrange(0, seq_len * (seq_len + 1) // 2)     # 3 => [0, 1, 2, 3, 4, 5]
    seq_skips = seq_len - 1 - (math.isqrt(1 + 8*seq_skips_rnd) - 1) // 2  # 3 => [2, 1, 1, 0, 0, 0]
    seq_skips = max(0, min(seq_skips, seq_len - 1))

    rnd_seq = random.randbytes(seq_len)
    mut_seq = random.randbytes(seq_len)
    # xor_seq split into two non-overlapping halves of seq_len*tr_readsz bytes each
    # so rnd_pre[i] and rnd_post[i] (and rnd_post[i] vs rnd_pre[i+1]) are independent
    xor_seq = random.randbytes(tr_readsz*2*seq_len)
    post_base = tr_readsz * seq_len
    for i in range(seq_len):
      if i < seq_skips or (rnd_seq[i] & 0xf) == 0:
        # initial skip or 1/16 chance of random skip
        new_fvs.append(((None, None), 0))
      else:
        # otherwise, mutate the fault.
        if orig_seq and (rnd_seq[i] & 0x10):
          # 1/2 chance of taking the original.
          new_fvs.append(orig_seq[i])
        else:
          # 1/2 chance of generating a new fault.
          rnd_pre, rnd_post = None, None
          if rnd_seq[i] & 0x20:
            fault_len = random.choice(sz_range(tr_readsz))
            rnd_pre = xor_seq[i*tr_readsz:i*tr_readsz+fault_len]
          if rnd_seq[i] & 0x40:
            fault_len = random.choice(sz_range(tr_readsz))
            rnd_post = xor_seq[post_base+i*tr_readsz:post_base+i*tr_readsz+fault_len]
          new_fvs.append(((rnd_pre, rnd_post), mut_seq[i]))

    return new_fvs

  def f_work():
    fuzz_ctr = 0
    while True:
      fuzz_ctr += 1
      next_fuzz = None
      # mut_op: 4=replace, 3=merge, 2=add, 1=mutate, 0=new. fallback steps down.
      mut_op = random.randint(0, 4)
      try:
        entry = corpus.sample()
        if entry is None:
          continue

        # edge case: baseline run w/o faults is still alive, force add op
        if not entry.fuzz_faults:
          mut_op = 2

        if mut_op == 4:   # replace
          # compute base inputs that trigger all the fault injection instructions
          faults = list(entry.fuzz_faults.keys())
          fn_set = inst2fn.get(faults[0], set())
          for i in range(1, len(faults)):
            fn_set &= inst2fn.get(faults[i], set())
          if fn_set:
            swap_fn = random.choice(tuple(fn_set))
            next_fuzz = (swap_fn, entry.fuzz_faults)
            mut_op *= -1
          else:
            mut_op -= 1

        if mut_op == 3:   # merge (splice)
          merge_entry = None
          for _ in range(3):
            cand = corpus.sample_same_fn_idx(entry.fn_idx)
            if cand is not None and cand is not entry and cand.fuzz_faults:
              merge_entry = cand
              break
          if merge_entry is not None:
            # 1. randomly select instructions from entry.fuzz_faults & merge_entry.fuzz_faults
            # at most MAX_FAULT_INSNS of them
            this_insns = tuple(entry.fuzz_faults.keys())
            merge_insns = tuple(merge_entry.fuzz_faults.keys())
            # always choose at least one from each side
            rnd_from_both = set([random.choice(this_insns), random.choice(merge_insns)])
            # select any remainders
            rem_insns = tuple((set(this_insns) | set(merge_insns)) - rnd_from_both)
            rnd_remain = random.sample(rem_insns, k=min(MAX_FAULT_INSNS-len(rnd_from_both), len(rem_insns)))
            # finalize selection
            sel_insns = rnd_remain + list(rnd_from_both)

            # 2. merge the faults
            next_fuzz = (entry.fn_idx, fuzz_entry_merge(sel_insns, entry.fuzz_faults, merge_entry.fuzz_faults))
            mut_op *= -1
          else:
            mut_op -= 1

        if mut_op == 2:   # add
          # 0. can we afford to add more fault injection points?
          # if we reached the limit, skip to next op
          if len(entry.fuzz_faults) < MAX_FAULT_INSNS:
            # 1. get the full trace hit by this base program input, excluding insns already faulted
            tr_keys = list(filter(lambda k: k[0] not in entry.fuzz_faults, trace_per_fn[entry.fn_idx].keys()))

            # 2. add new insn as a fault point
            if tr_keys:
              tr_key = random.choice(tr_keys)
              tr_inst, tr_readsz = tr_key
              hitcnt = trace_per_fn[entry.fn_idx][tr_key]

              new_faults = copy.copy(entry.fuzz_faults)
              seq_len = min(hitcnt + 1, MAX_FAULT_SEQ)
              new_faults[tr_inst] = gen_faults(tr_readsz, seq_len)
              next_fuzz = (entry.fn_idx, new_faults)
              mut_op *= -1
            else:
              mut_op -= 1
          else:
            mut_op -= 1

        if mut_op == 1:   # mutate
          if entry.fuzz_faults:
            insn = random.choice(list(entry.fuzz_faults.keys()))
            tr_readsz = max(
              filter(lambda tr: tr[0] == insn, trace_per_fn[entry.fn_idx].keys()),
              default=(insn, 16),
              key=lambda tr: tr[1]
            )[1]

            # entry already exists, no need to bound length to MAX_FAULT_SEQ
            orig_seq = entry.fuzz_faults[insn]
            new_faults = copy.copy(entry.fuzz_faults)
            new_faults[insn] = gen_faults(tr_readsz, len(orig_seq), orig_seq)
            next_fuzz = (entry.fn_idx, new_faults)
            mut_op *= -1
          else:
            mut_op -= 1

        if mut_op == 0:   # new
          # 1. select fn_idx
          fn_idx = random.randrange(0, len(trace_per_fn))
          # 2. select target insn
          tr_key = random.choice(list(trace_per_fn[fn_idx].keys()))
          tr_inst, tr_readsz = tr_key
          hitcnt = trace_per_fn[fn_idx][tr_key]
          # get random fuzz entry
          seq_len = min(hitcnt + 1, MAX_FAULT_SEQ)
          next_fuzz = (fn_idx, {tr_inst: gen_faults(tr_readsz, seq_len)})

        if next_fuzz is None:
          log('[!] next_fuzz is None, regenerate next fuzz entry')
          continue

        # 3. dispatch the new fuzz entry
        state = {'faults': next_fuzz[1], 'hits': {k: 0 for k in next_fuzz[1]}}
        marker = f'fuzz-{next_fuzz[0]}-{fuzz_ctr}'
        enqueue_work(
          workQ, (marker, *next_fuzz), fns[next_fuzz[0]], list(next_fuzz[1].keys()), state,
          fault_gen, marker
        )
      except Exception as e:
        log(f'[!] orchestrator threw exception while enqueueing new entry: {e}')

  # concurrently receive results from fuzzer processes
  def f_result():
    while True:
      process_one_result()

  # 3. run the main scheduler loop. does not return.
  run_threaded_workers(f_work, f_result)


def init():
  assert cgrp.is_cgroups_v2()
  cgrp.ensure_memory_controller()
  Path('./logs/stat').mkdir(parents=True, exist_ok=True)


if __name__ == '__main__':
  init()
  run_orchestrator()
