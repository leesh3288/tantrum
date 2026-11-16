#!/usr/bin/env python3

from collections import deque
from contextlib import redirect_stdout
from libdebug import debugger, libcontext
from libdebug.data.breakpoint import Breakpoint
from libdebug.data.memory_map import MemoryMap
from libdebug.debugger.debugger import Debugger
from libdebug.state.thread_context import ThreadContext
import fcntl
import io
import json
import os
import random
import re
import signal
import struct
import sys
import time

### args ###
import argparse

def parse_skips(skip_str):
  skips = []
  for x in skip_str.split(','):
    if '-' not in x:
      skips.append(int(x))
    else:
      st, en = x.split('-')
      skips.extend(range(int(st), int(en) + 1))
  return skips

def parse_rand_params(params_str):
  return [int(x, 0) for x in params_str.split(',')]

parser = argparse.ArgumentParser(description='Run with optional reproduction mode')
parser.add_argument('--d8', type=str, help='Path to d8 executable')
subparsers = parser.add_subparsers(dest='command')

repro_parser = subparsers.add_parser('repro', help='Reproduce with a specific seed')
repro_parser.add_argument('seed', type=int, help='Random seed for reproduction')
repro_parser.add_argument('skips', type=parse_skips, nargs='?', default=[],
                          help='Comma-separated, faults to skip (e.g., 1,2,5-8,10)')
repro_parser.add_argument('--test_p', type=parse_rand_params,
                          help='test random parameters')
repro_parser.add_argument('--try_offsets', type=parse_rand_params,
                          help='try_offsets random parameters')
repro_parser.add_argument('--bits_to_flip', type=parse_rand_params,
                          help='bits_to_flip random parameters')

args = parser.parse_args()

repro_seed = args.seed if args.command == 'repro' else -1
skips = args.skips if args.command == 'repro' else []
TARGET_D8 = args.d8 or './builds/fe14dcc/d8'
test_p = (args.command == 'repro' and args.test_p) or [5, 8]
try_offsets_p = (args.command == 'repro' and args.try_offsets) or [-0x100, 0x100, 4, 0, 9]
bits_to_flip_p = (args.command == 'repro' and args.bits_to_flip) or [-0x100*8, 0x100*8, 1, 0, 17]
############

# pprint symbolizer fix @ libdebug/state/thread_context.py: `resolve_address_in_maps(return_address, filtered_maps)` -> resolve_address_in_maps(return_address, maps)

KNOWN_BUGS = [
]
STATS_FN = './stats.json'
ALARM_SECONDS = 10
SIGSEGV = 11
SIGABRT = 6
SIGPROF = 27
STAT_SYNC_FREQ = 1000

r_ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
libcontext.sym_lvl = 4

def p64(v):
  return struct.pack('<Q', v)

def p32(v):
  return struct.pack('<I', v)

def p8(v):
  return struct.pack('<B', v)

def u64(b):
  return struct.unpack('<Q', b)[0]

def u32(b):
  return struct.unpack('<I', b)[0]

def u8(b):
  return struct.unpack('<B', b)[0]

# preload symbols here
d = debugger([TARGET_D8], aslr=False, fast_memory=True)
d.run()
BINARY_BASE = 0x555555554000
_ZN2v86Script3RunENS_5LocalINS_7ContextEEE = d.symbols['v8::Script::Run(v8::Local<v8::Context>)'][0].start
_ZN2v85Shell13WriteLcovDataEPNS_7IsolateEPKc = d.symbols['v8::Shell::WriteLcovData(v8::Isolate*, char const*)'][0].start
# jae -> int3
Builtins_SwitchOnGeneratorStateHandler_unreachable = d.symbols['Builtins_SwitchOnGeneratorStateHandler'][0].start + 61
assert d.memory[BINARY_BASE + Builtins_SwitchOnGeneratorStateHandler_unreachable + 2 + u8(d.memory[BINARY_BASE + Builtins_SwitchOnGeneratorStateHandler_unreachable + 1])] == b'\xcc'
# je ...; int3
Builtins_InterpreterEntryTrampoline_unreachable = d.symbols['Builtins_InterpreterEntryTrampoline'][0].start + 165
assert d.memory[BINARY_BASE + Builtins_InterpreterEntryTrampoline_unreachable + 2] == b'\xcc'
# je ...; int3
Builtins_CallApiCallbackGeneric_unreachable = d.symbols['Builtins_CallApiCallbackGeneric'][0].start + 59
assert d.memory[BINARY_BASE + Builtins_CallApiCallbackGeneric_unreachable + 2] == b'\xcc'
d.kill()
d.terminate()
del d

def merge_stats(dst: dict, src: dict):
  for k, v in src.items():
    if isinstance(v, int):
      dst[k] = dst.get(k, 0) + v
    elif isinstance(v, dict):
      dst[k] = merge_stats(dst.get(k, {}), v)
    else:
      assert False
  return dst

if repro_seed == -1:
  # start forkloop
  sync_ctr, sync_stat = 0, {}
  while True:
    pid = os.fork()
    assert pid >= 0
    if pid > 0:   # parent
      print(f'[*] Parent: os.waitpid({pid}) waiting..')
      wpid, status = os.waitpid(pid, 0)
      exit_code = os.WEXITSTATUS(status)
      print(f'[*] Parent: os.waitpid({pid}) = ({wpid}, {exit_code = :#x}) complete!')
      print()

      merge_stats(sync_stat, {'exec': 1, 'exit_code': {str(exit_code): 1}})

      sync_ctr += 1
      if sync_ctr == STAT_SYNC_FREQ:
        print(f'[*] Parent: Stat sync checkpoint')
        # file descriptor unique, implicitly unlocked on close
        with open(STATS_FN, 'r+') as f:
          # acquire exclusive lock on full file
          fcntl.lockf(f.fileno(), fcntl.LOCK_EX)

          # read stats
          stat_str = f.read()
          stat = {}
          try:
            stat = json.loads(stat_str)
          except ValueError:
            pass

          # update stats
          merge_stats(stat, sync_stat)

          # write back stats
          f.seek(0)
          f.write(json.dumps(stat))
          f.truncate()
          f.flush()

        sync_ctr, sync_stat = 0, {}
    else:         # child
      break

# child continues here
TIME = time.time_ns()
PID = os.getpid()
SEED = (TIME << 32) | PID
if repro_seed != -1:
  SEED = repro_seed
print(f'[*] Child: executing with SEED: {SEED}')
random.seed(SEED)

with open('tests.txt', 'rt') as f:
  tests_list = [fn.strip() for fn in f.readlines()]

tests = random.choices(tests_list, k=test_p[0]) * test_p[1]
print(f'[*] running tests: {tests}')

R_FLAGS = re.compile(r'^\s*//\s*flags\s*:\s*(.+)$', flags=re.I|re.M)

DEFAULT_FLAGS = [
  '--single-threaded',
  '--allow-natives-syntax',
  '--expose-gc',
  '--sandbox-testing',
  '--trace-turbo-path=nonexistent',
]

def get_all_flags(fn):
  return sum((x.strip().split() for x in R_FLAGS.findall(open(fn, 'rt').read())), [])

flags = list(set(DEFAULT_FLAGS + sum((get_all_flags(test) for test in tests), [])))
print(f'[*] flags: {" ".join(flags)}')

cmd = [
  TARGET_D8,
  *flags,
  './test/mjsunit/mjsunit.js',
  './runner.js',
  '--',
  *tests
]
d = debugger(cmd, aslr=False, fast_memory=True)
p = d.run()

v8sbx_heuristics = []
v8sbx_violation = False
crash_maps = []
pprint_segv = ''
hook_dq = deque(maxlen=0x1000)
int3_detected = False

### exit code definition ###
# flags set eagerly on each triggers
EXIT_SUCCESS = 0                # successful run w/o segv crash
EXIT_FAILURE = 1                # script failure, set implicitly
EXIT_PRE_FAIL = 2               # premature exit, flag incompatibility
EXIT_TRAP_OK = 3                # trap hit, non-violation
EXIT_SEGV_OK = 4                # segv crash, non-violation
EXIT_SEGV_V8SBX = 5             # segv (or heuristics), v8sbx bypass
EXIT_SEGV_NONCANON = 6          # segv, non-canonical
EXIT_STATUS_MASK = 0x7
EXIT_FLAG_TIMEOUT = 0x8         # set on sigalrm handler, also by reaper watchdog (SIGKILL)
EXIT_FLAG_HEURISTICS = 0x10     # set on pc-control / sp-control heuristics hit
EXIT_FLAG_INT3 = 0x20           # set on true int3 (EXIT_TRAP_OK) or heuristic int3 (prev)
runner_exit_code = EXIT_SUCCESS

def set_exit_flag(flag):
  global runner_exit_code
  runner_exit_code |= flag

def set_exit_status(status):
  global runner_exit_code
  runner_exit_code = (runner_exit_code & ~EXIT_STATUS_MASK) | status

def report(do_wait=True):
  result_to_str = ['0-nocrash', '1-v8sbx', '2-noncanon']
  result = 0
  if v8sbx_violation:
    # v8sbx violation detected, run until completion for stderr logging
    # if inside signal handler, don't wait
    # note that this can also trigger on other heuristics (e.g. PC control) potentially with different end states
    if do_wait:
      for _ in range(2):
        try:
          d.cont()
          d.wait()
        except Exception:
          pass
      try:
        print(f'[!] V8 sandbox violation: signal = {d.exit_signal}')
      except ValueError:
          print(f'[!] V8 sandbox violation: signal = ??? (exception thrown!)')
    else:
      print(f'[!] V8 sandbox violation: signal = ??? (no wait!)')

    try:
      p.recverruntil(b'## V8 sandbox violation detected!', optional=True, timeout=0.1)
      err = b'## V8 sandbox violation detected!' + p.recverr(0x10000, timeout=0.1)
    except (RuntimeError, TimeoutError):
      err = b''

    try:
      out = p.recv(0x10000, timeout=0.1)
    except (RuntimeError, TimeoutError):
      out = b''
    result = 1
    set_exit_status(EXIT_SEGV_V8SBX)
  else:
    try:
      err = p.recverr(0x10000, timeout=0.1)
    except (RuntimeError, TimeoutError):
      err = b''
    if b'Caught harmless memory access violation' in err and (b'non-canonical' in err): # or b'kernel space' in err
      print(f'[!] Potential V8 sandbox violation!')
      try:
        out = p.recv(0x10000, timeout=0.1)
      except (RuntimeError, TimeoutError):
        out = b''
      result = 2
      set_exit_status(EXIT_SEGV_NONCANON)
    if do_wait:
      if d.exit_code is None and d.exit_signal is not None:
        set_exit_flag(EXIT_FLAG_TIMEOUT)
      print(f'exit: code = {d.exit_code}')
    else:
      print(f'exit: code = ???')

  if result in [1]: # only report v8sbx violations at the moment
    signal.alarm(0)

    with redirect_stdout(io.StringIO()) as f:
      print('[*] ===== testcase =====')
      print(f'CMD: {" ".join(cmd)}')
      print(f'Hook Logs (Max 0x1000):')
      for l in hook_dq:
        print(f'- {l}')

      print('[*] ===== stderr log =====')
      print(err.decode())
      print()

      print('[*] ===== stdout log =====')
      print(out.decode())
      print()

      print('[*] ===== memory map =====')
      for m in crash_maps:
        print(m)
      print()

      print('[*] ===== crash state =====')
      print(pprint_segv)
      print()

      if v8sbx_heuristics:
        print(f'[+] Detected via heuristics: {", ".join(v8sbx_heuristics)}')

      if int3_detected:
        print('[!] ========== WARNING : WATCHPOINT HITS FOLLOWING INT3 DETECTED ==========')

    crash_log = f.getvalue()
    print(crash_log)

    known = next((k for k in KNOWN_BUGS if k in crash_log), None)
    if known is None:
      fn = f'./logs/{result_to_str[result]}-{TIME}-{PID}-{SEED}.txt' if repro_seed == -1 else './repro.txt'
      with open(fn, 'wt') as f:
        f.write(crash_log)
      if repro_seed == -1:
        crash_state = r_ansi_escape.sub('', pprint_segv)
        s = f'### `{fn}`\n'
        if int3_detected:
          s += '**========== WARNING : WATCHPOINT HITS FOLLOWING INT3 DETECTED ==========**\n'
        s += f'```text\n{err.decode().strip()[:1800]}\n'
        remain = 1980 - len(s)
        s += f'{crash_state[:remain]}{"[...]" if len(crash_state) > remain else ""}\n```'
    else:
      print(f'[!] skipping (suspected) v8sbx violation case due to known bug @ {known}')
      pass

def sigalrm_handler(signum, frame):
  print()
  print('[!] SIGALRM, checking report')
  report(False)
  print('[!] SIGALRM exit')
  set_exit_flag(EXIT_FLAG_TIMEOUT)
  os._exit(runner_exit_code)

signal.signal(signal.SIGALRM, sigalrm_handler)
signal.alarm(ALARM_SECONDS)

# run until d8 script entry
bp_script_run = d.breakpoint(BINARY_BASE + _ZN2v86Script3RunENS_5LocalINS_7ContextEEE)
# cont #0: hit on mjsunit script exec
# cont #1: hit on test script exec
for i in range(2):
  d.cont()
  if not bp_script_run.hit_on(d):
    print('[!] premature exit, maybe flag failure?')
    set_exit_status(EXIT_PRE_FAIL)
    exit(runner_exit_code)
bp_script_run.disable()

# load v8sbx maps
maps = d.maps
sbx_guard_lo = next(m for m in maps if m.permissions == '---p' and m.size == 0x900000000)
sbx_guard_hi = next(m for m in maps if m.permissions == '---p' and m.size >= 1024**4)
sbx_base = sbx_guard_lo.end

# break on exec completion (w/o last GC)
bp_lcov = d.breakpoint(BINARY_BASE + _ZN2v85Shell13WriteLcovDataEPNS_7IsolateEPKc)

# avoid int3 suppressing bug
bp_generator_switch_unreachable = d.breakpoint(BINARY_BASE + Builtins_SwitchOnGeneratorStateHandler_unreachable)
bp_interpreterentrytrampoline_unreachable = d.breakpoint(BINARY_BASE + Builtins_InterpreterEntryTrampoline_unreachable)
bp_callapicallbackgeneric_unreachable = d.breakpoint(BINARY_BASE + Builtins_CallApiCallbackGeneric_unreachable)

bp_sigaction = d.breakpoint('sigaction', file='libc')
bp_mprotect = d.breakpoint('mprotect', file='libc')

catch_segv = d.catch_signal(SIGSEGV)

# update writable maps -> update hardware watchpoints -> rewrite on demand
def ptrcage_writable_maps(d: Debugger, sbx_base: int) -> list[MemoryMap]:
  return [m for m in d.maps if m.start >= sbx_base and m.end <= sbx_base + (1<<32) and 'rw' in m.permissions]

def is_rw(address: int, maps: list[MemoryMap]) -> bool:
  for vmap in maps:
    if vmap.start <= address < vmap.end and 'rw' in vmap.permissions:
      return True
  return False

# 4 watchpoints on x86-64
skips_ctr = -1
def random_watchpoints(d: Debugger, maps: list[MemoryMap], k: int = 4) -> list[Breakpoint]:
  sz = sum(m.end - m.start for m in maps)
  if not sz:
    return []
  tgts = sorted(random.sample(range(0, sz, 8), k), reverse=True)
  real_tgts = []
  acc_sz = 0
  for m in maps:
    m_sz = m.end - m.start

    while tgts and tgts[-1] in range(acc_sz, acc_sz + m_sz):
      real_tgts.append(tgts.pop() - acc_sz + m.start)

    if not tgts:
      break

    acc_sz += m_sz

  #print(real_tgts)
  assert len(real_tgts) == 4

  wps = []
  for real_tgt in real_tgts:
    def hook(t, b):
      # int3 suppressing bug mitigation: either wp hit + int3, or int3 + int3 => both always traps
      # note: this is insufficient, fuzzer still trips on single int3s... why is this hitting on watchpoints in the first place??
      if t.memory[t.regs.rip] == b'\xcc':
        print('[!] Panicing due to watchpoint int3 suppression bug!!')
        set_exit_status(EXIT_TRAP_OK)
        set_exit_flag(EXIT_FLAG_INT3)
        os._exit(runner_exit_code)
      
      # int3 suppressing bug mitigation: wp hit + valid, or int3 + valid
      # we don't know yet, so just mark it as potentially int3 detected
      try:
        if t.memory[t.regs.rip - 1] == b'\xcc':
          global int3_detected
          res = f'[!] ========== WATCHPOINT HIT @ {hex(t.regs.rip)}: PREVIOUS INSTRUCTION IS INT3 =========='
          print(res)
          hook_dq.append(res)
          set_exit_flag(EXIT_FLAG_INT3)
          int3_detected = True
      except Exception:
        pass

      # always visit hit watchpoint
      targets = [b.address]

      # mutation: add 1-deep dereference targets
      try_offsets = [] if try_offsets_p == [0]*5 else random.sample(range(*try_offsets_p[0:3]), random.randrange(*try_offsets_p[3:5]))
      for ofs in try_offsets:
        try:
          addr = b.address + ofs
          tagged = u32(d.memory[addr, 4])
          tagged_addr = sbx_base + (tagged & ~1)
          # not a tagged ptr or in rw
          if (tagged & 1) != 1 or not is_rw(tagged_addr, maps):
            continue
          targets.append(tagged_addr)
        except Exception:
          pass
      res = f'[+] hit @ {hex(t.regs.rip)} on accessing address {hex(b.address)} - targeting addresses {", ".join(hex(addr) for addr in targets)}'
      print(res)
      hook_dq.append(res)

      # mutation: random bitflips in targeted objects
      for target in targets:
        bits_to_flip = sorted(random.sample(range(*bits_to_flip_p[0:3]), random.randrange(*bits_to_flip_p[3:5])))
        res = f'    [*] {hex(target)} - flipping bits {", ".join(hex(x) for x in bits_to_flip)}'
        print(res)
        hook_dq.append(res)
        if repro_seed != -1:
          t.pprint_backtrace()
        for bit_pos in bits_to_flip:
          if repro_seed != -1:
            global skips_ctr
            skips_ctr += 1
            if skips_ctr in skips:
              res = f'    [!] => bit {hex(bit_pos)} - skipping for repro delta-debugging!! {skips_ctr = }'
              print(res)
              hook_dq.append(res)
              continue
          try:
            byte_ofs, bit_ofs = divmod(bit_pos, 8)
            addr = target + byte_ofs
            if not is_rw(addr, maps):
              continue
            old_v = u8(d.memory[addr])
            new_v = old_v ^ (1 << bit_ofs)
            d.memory[addr] = p8(new_v)
            res = f'    [+] => addr {hex(addr)} : {hex(old_v)} -> {hex(new_v)}'
            print(res)
            hook_dq.append(res)
          except Exception as e:
            pass

    wps.append(d.breakpoint(real_tgt, hardware=True, condition='rw', length=8, callback=hook))

  res = f'[*] watching {", ".join(hex(wp.address & 0xffffffff) for wp in wps)}'
  print(res)
  hook_dq.append(res)

  return wps

# force remove breakpoints
def force_unset_breakpoint(d: Debugger, bp: Breakpoint, delete=True):
  try:
    d._internal_debugger.debugging_interface.unset_breakpoint(bp, delete=delete)
  except:
    pass

target_maps = ptrcage_writable_maps(d, sbx_base)
wps = random_watchpoints(d, target_maps)

def on_complete(keep_sigaction=False):
  print(f'[*] on_complete({keep_sigaction=})')
  for wp in wps:
    wp.disable()
  bp_mprotect.disable()
  catch_segv.disable()
  if not keep_sigaction:
    bp_sigaction.disable()

def hit_thread(d: Debugger, bp: Breakpoint) -> ThreadContext | None:
  for t in d.threads:
    if bp.hit_on(t):
      return t
  return None

while True:
  try:
    d.cont()
  except RuntimeError:          # exec complete?
    break  # fails to properly take into account dead process and waits indefinitely
  # currently handled with script infloop + sigalrm timeout
  d.wait()

  if (t := hit_thread(d, bp_mprotect)):
    res = f'[*] mprotect({hex(t.regs.rdi)}, {hex(t.regs.rsi)}, {bin(t.regs.rdx)})'
    print(res)
    hook_dq.append(res)
    # disable wp -> finish() -> delete
    # this allows us to deatch and delete hardware watchpoints "properly"
    for wp in wps:
      wp.disable()    # this seems to result in threads prematurely dying...?
    # resulting in hangs & "ptrace_cont failed for thread ..."
    # + /proc/tid/maps read error on ptrcage_writable_maps()
    t.finish()
    for wp in wps:
      force_unset_breakpoint(d, wp)

    try:
      new_target_maps = ptrcage_writable_maps(d, sbx_base)
      #if new_target_maps != target_maps:
      #  print(f'{new_target_maps = }')
      target_maps = new_target_maps
      wps = random_watchpoints(d, target_maps)
    except:
      print()
      print('[!] main thread dead or watchpoints deletion buggy, skipping new random watchpoints')
      wps = []
  elif (t := hit_thread(d, bp_sigaction)):
    res = f'[*] sigaction({t.regs.rdi}, {t.regs.rsi}, {t.regs.rdx})'
    print(res)
    hook_dq.append(res)
    if t.regs.rdi == SIGSEGV:   # either v8sbx violation, or just a benign crash
      on_complete(keep_sigaction=True)
    elif t.regs.rdi == SIGABRT: # UninstallCrashFilter()
      v8sbx_violation = True
      break
    elif t.regs.rdi == SIGPROF: # profiler, skip crash heuristics
      continue
    # if crashes hit from non-main thread, threads get terminated & ptrace hangs
    # fix this by forcing thread state as dead
    if t is not d.threads[0]:
      for tt in d.threads:
        if tt is not t:          d._internal_debugger.set_thread_as_dead(tt.thread_id, 128 + t.regs.rdi, t.regs.rdi)
  elif (t := hit_thread(d, bp_lcov)):     # exec complete w/o crashing, disable mprotect breakpoint
    set_exit_status(EXIT_SUCCESS)   # this is needed to overwrite previous segv hits (e.g. wasm memory oob)
    on_complete()
  elif (t := hit_thread(d, catch_segv)):  # dump backtrace & regs on segv
    #catch_segv.disable()       # don't disable segv handler, this may just be a benign segfault (e.g. wasm memory oob)
    crash_maps = d.maps

    # look for potentially valid PC control
    if (t.regs.rip >> 47) == 0 and t.regs.rip >= 0x10000:
      # pc in canonical userland address, check for mapping
      pc_maps = crash_maps.filter(t.regs.rip)
      # either nonexistent or non-executable, both of which are likely problematic
      if not pc_maps or 'x' not in pc_maps[0].permissions:
        v8sbx_heuristics.append('pc-control')
        v8sbx_violation = True
        set_exit_flag(EXIT_FLAG_HEURISTICS)
    
    # look for potentially valid SP control
    if (t.regs.rsp >> 47) == 0 and t.regs.rsp >= 0x10000:
      sp_maps = crash_maps.filter(t.regs.rsp)
      sp_maps_nextpage = crash_maps.filter(t.regs.rsp + 0x1000)
      # nonexistent (+ not stack overflow, e.g. infinite recursion) or existent but not rw- (normal read/writable stack) or --- (guard)
      if (not sp_maps and not sp_maps_nextpage) or not ('rw-' in sp_maps[0].permissions or '---' in sp_maps[0].permissions):
        v8sbx_heuristics.append('sp-control')
        v8sbx_violation = True
        set_exit_flag(EXIT_FLAG_HEURISTICS)

    with redirect_stdout(io.StringIO()) as f:
      print('--------------------------------------------------------')
      t.pprint_registers()
      print('--------------------------------------------------------')
      try:
        insts = d.memory[t.regs.rip - 0x30, 0x61]
      except Exception:
        # maybe rip control via call?
        print('[!] Instruction fetch failure, fallback to ret = [rsp]')
        try:
          ret = u64(d.memory[t.regs.rsp, 0x8])
          print(f'    => [rsp] = {hex(ret)}')
          insts = d.memory[ret - 0x30, 0x61]
        except Exception:
          # failed too...
          insts = []
      print('[*] Instructions: ' + ' '.join(f'<{v:02x}>' if i == 0x30 else f'{v:02x}' for i, v in enumerate(insts)))
      try:
        t.pprint_backtrace()
      except Exception:
        print('[!] Backtrace print failure, fallback to rsp += 8')
        orig_rip = t.regs.rip
        orig_rsp = t.regs.rsp
        try:
          ret = u64(d.memory[t.regs.rsp, 0x8])
          t.regs.rip = ret
          t.regs.rsp += 8
          t.pprint_backtrace()
        except Exception:
          pass
        finally:
          t.regs.rip = orig_rip
          t.regs.rsp = orig_rsp
      print('--------------------------------------------------------')
    pprint_segv = f.getvalue()

    # other segv cases will be set on report()
    set_exit_status(EXIT_SEGV_OK)

    # if we already know that this is a v8sbx violation, break and let it run to exit + report
    if v8sbx_violation:
      break
  else:                         # other stopping reason (watchpoint hit, ...)
    pass

on_complete()

report()

d.kill()
d.terminate()
print()
os._exit(runner_exit_code)
