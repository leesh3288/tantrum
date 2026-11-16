#!/usr/bin/env python3

from ast import literal_eval
from os import getpid
from pathlib import Path
from tantrum_trace_single import run_once
import argparse
import cgrp
import marshal

parser = argparse.ArgumentParser(description='Run with optional reproduction mode')
parser.add_argument('log', type=str, help='Path to generated crash log (.txt)')
args = parser.parse_args()
f = open(args.log, 'rt').read()
l_input, l_fault, _, l_cmd = f.splitlines()[:4]

D8_PATH = l_cmd[len('CMD: '):].split()[0]
js_path = l_input[len('Input: '):]
faults = literal_eval(l_fault[len('Fault: '):])

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

SHM_SIZE = 0x30000
fault_state = {
  'faults': faults,
}
fault_state['hits'] = {k: 0 for k in faults}
fuzz_args = (js_path, list(faults.keys()), fault_state, marshal.dumps(fault_gen.__code__), 'repro')

Path('./logs/repro.txt').unlink(True)
cg_name = f'fuzz_{getpid()}'
cg = cgrp.create_cgroup(cg_name, 8*(1024**3))
try:
  run_once(D8_PATH, *fuzz_args, cg, shm_size=SHM_SIZE)
except Exception as e:
  print(f"[w] Error in fuzzer process: {e}")
finally:
  print(f"[w] Reaping fuzzer process ${cg_name}")
  cgrp.reap(cg)
  cgrp.remove_cgroup(cg_name)

print(open('./logs/repro.txt', 'rt').read())
