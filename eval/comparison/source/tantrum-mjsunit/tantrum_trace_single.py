#!/usr/bin/env python3
# tantrum-trace.py, but exported as a single callable function `run_once(...)`
# spawns another python process to hook the victim d8 with libdebug under the hood

from multiprocessing import Process
from multiprocessing.managers import SharedMemoryManager
import marshal, types
from collections.abc import Callable
from typing import Tuple, TypeVar, Any
import cgrp
from os import getpid

# fault_fn: (state, insn, mem_addr, data, mem) -> (new_state, (pre_data, post_data), revert: bool)
FaultFnStateType = TypeVar("State")
FaultFnType = Callable[[FaultFnStateType, int, int, bytes, Any], Tuple[FaultFnStateType, Tuple[bytes|None, bytes|None], bool]]

### SysVShm Compat ###
import ctypes, ctypes.util, os

libc = ctypes.CDLL(ctypes.util.find_library("c"), use_errno=True)
libc.shmat.argtypes = [ctypes.c_int, ctypes.c_void_p, ctypes.c_int]
libc.shmat.restype = ctypes.c_void_p
libc.shmdt.argtypes = [ctypes.c_void_p]
libc.shmdt.restype = ctypes.c_int
libc.shmctl.argtypes = [ctypes.c_int, ctypes.c_int, ctypes.c_void_p]
libc.shmctl.restype = ctypes.c_int
libc.shmget.argtypes = [ctypes.c_int, ctypes.c_size_t, ctypes.c_int]
libc.shmget.restype = ctypes.c_int

IPC_CREAT = 0o1000
IPC_RMID = 0

class SysVShm:
    def __init__(self, size):
        self.size = size
        self.id = None
        self.ptr = None

    def __enter__(self):
        self.id = libc.shmget(0, self.size, IPC_CREAT | 0o666)
        if self.id < 0:
          err = ctypes.get_errno()
          raise OSError(err, f"shmget failed: {os.strerror(err)}")
        self.ptr = libc.shmat(self.id, None, 0)
        if self.ptr == ctypes.c_void_p(-1).value:
            err = ctypes.get_errno()
            raise OSError(err, f"shmat failed: {os.strerror(err)}")
        ctypes.memset(self.ptr, 0, self.size)
        return self

    def read(self, size=None):
        return bytes((ctypes.c_uint8 * (size or self.size)).from_address(self.ptr))

    def clear(self):
        ctypes.memset(self.ptr, 0, self.size)

    def __exit__(self, *args):
        rc = libc.shmdt(self.ptr)
        if rc != 0:
          print(f"[w] shmdt failed: {os.strerror(ctypes.get_errno())}")
        rc = libc.shmctl(self.id, IPC_RMID, None)
        if rc != 0:
            print(f"[w] shmctl IPC_RMID failed: {os.strerror(ctypes.get_errno())}")
### SysVShm Compat ###

def run_once(d8_path, js_path, target_insns, fault_state, fault_fn_code, marker, cg, shm_size=0x200000, syms={}, timeout_sec=20, env_override={}):
  assert len(target_insns) <= 4
  with SysVShm(shm_size) as shm:
    # launch the debugger-fuzzer, which adds itself to cgroups
    p = Process(target=_run_child, args=(d8_path, js_path, target_insns, fault_state, fault_fn_code, shm_size, shm.id, marker, cg, syms, timeout_sec, env_override))
    p.start()

    # give an additional second after timeout
    p.join(timeout_sec + 1)

    # reap everything inside the cgroup, then join again
    if cg is not None:
      cgrp.reap(cg)
    p.join()

    shm_buf = shm.read()

    return shm_buf, p.exitcode


def log_path(dump_marker):
  fn = f'./logs/{dump_marker}.txt'
  return fn


# must always be executed in a separate process, unless this is a one-off process
def _run_child(*args, **kwargs):
  code = marshal.loads(args[4])
  fault_fn: FaultFnType = types.FunctionType(code, globals(), "fault_fn")
  args = (*args[:4], fault_fn, *args[5:])
  __run_child(*args, **kwargs)


# another level of indirection to force fault_fn typing
def __run_child(d8_path, js_path, target_insns, fault_state, fault_fn: FaultFnType, shm_size, shm_id, dump_marker, cg, syms, timeout_sec, env_override):
  import libdebug_fixes as _

  from libdebug import debugger, libcontext
  from libdebug.data.breakpoint import Breakpoint
  from libdebug.data.memory_map import MemoryMap
  from libdebug.debugger.debugger import Debugger
  from libdebug.state.thread_context import ThreadContext

  from collections import deque
  from contextlib import redirect_stdout, contextmanager
  from threading import Thread, Lock, Event
  import capstone as cs
  import io
  import os
  import re
  import signal
  import struct
  import json

  # attach debugger-fuzzer to cgroups
  if cg is not None:
    cgrp.attach(cg, getpid())

  ### exit code definition ###
  # flags set eagerly on each triggers
  EXIT_SUCCESS = 0                # successful run w/o segv crash
  EXIT_FAILURE = 1                # script failure, set implicitly
  EXIT_PRE_FAIL = 2               # premature exit, flag incompatibility
  EXIT_TRAP_OK = 3                # trap hit, non-violation
  EXIT_SEGV_OK = 4                # segv crash, non-violation
  EXIT_SEGV_V8SBX = 5             # segv (or heuristics), v8sbx bypass
  EXIT_SEGV_NONCANON = 6          # segv, non-canonical
  EXIT_ABRT_OK = 7                # abrt hit, non-violation
  EXIT_STATUS_MASK = 0x7
  EXIT_FLAG_TIMEOUT = 0x8         # set on sigalrm handler, also by reaper watchdog (signal.SIGKILL)
  EXIT_FLAG_HEURISTICS = 0x10     # set on pc-control / sp-control heuristics hit

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

  R_FLAGS = re.compile(r'^\s*//\s*flags\s*:\s*(.+)$', flags=re.I|re.M)

  DEFAULT_FLAGS = [
    '--no-abort-on-contradictory-flags',
    #'--single-threaded',
    #'--allow-natives-syntax',
    #'--expose-gc',
    #'--sandbox-testing',
    '--trace-turbo-path=nonexistent',
    #'--predictable',
    
    # SbxBrk flags
    '--fuzzing',
    '--sandbox-fuzzing',
    '--single-threaded',
    '--allow-natives-syntax',
    '--expose-gc',

    # Tantrum flags
    '--predictable',
    '--single-threaded',
  ]

  ENV = {
    # SbxBrk fuzzer/v8fuzz/src/modes/shared.rs
    'ASAN_OPTIONS': 'symbolize=0,abort_on_error=true',
    #'LD_LIBRARY_PATH': '/work/fuzzer/target/release',
    'LD_BIND_NOW': '1',
  }
  ENV['AFL_MAP_SIZE'] = str(shm_size)
  ENV['__AFL_SHM_ID'] = str(shm_id)
  ENV |= env_override

  def get_all_flags(fn):
    return sum((x.strip().split() for x in R_FLAGS.findall(open(fn, 'rt').read())), [])

  def get_exec_fns(fn):
    if 'mjsunit' in fn:
      return ['test/mjsunit/mjsunit.js', fn]
    return [fn]

  flags = DEFAULT_FLAGS + get_all_flags(js_path)
  exec_fns = get_exec_fns(js_path)

  cmd = [
    d8_path,
    *flags,
    *exec_fns,
  ]
  d = debugger(cmd, env=ENV, aslr=False, fast_memory=True, follow_children=False)
  p = d.run()

  # pty has its internal buffer limit, reaching this will block
  # run the internal reader
  # https://stackoverflow.com/a/16782391
  @contextmanager
  def acquire_timeout(lock):
    result = lock.acquire(blocking=False)
    try:
      yield result
    finally:
      if result:
        lock.release()

  def _p_reader(lock: Lock, event: Event, stderr: bool):
    while (p._stderr_is_open if stderr else p._stdout_is_open) and not event.is_set():
      with acquire_timeout(lock) as acquired:
        # locked by reporter
        if not acquired:
          break
        try:
          p._raw_recv(0x10000, 0.1, stderr)
        except Exception:
          break

  p_ol, p_el = Lock(), Lock()
  p_oe, p_ee = Event(), Event()
  Thread(target=_p_reader, args=(p_ol, p_oe, False), daemon=True).start()
  Thread(target=_p_reader, args=(p_el, p_ee, True), daemon=True).start()

  v8sbx_heuristics = []
  v8sbx_violation = False
  crash_maps = []
  pprint_segv = ''
  hook_dq = deque(maxlen=0x1000)
  int3_detected = False

  runner_exit_code = EXIT_SUCCESS

  def set_exit_flag(flag):
    nonlocal runner_exit_code
    runner_exit_code |= flag

  def set_exit_status(status):
    nonlocal runner_exit_code
    runner_exit_code = (runner_exit_code & ~EXIT_STATUS_MASK) | status

  def report(do_wait=True):
    # stop the background readers to avoid racing
    p_oe.set()
    p_ee.set()
    p_ol.acquire(True, 0.3)
    p_el.acquire(True, 0.3)

    # result_to_str = ['0-nocrash', '1-v8sbx', '2-noncanon']
    result = 0
    if v8sbx_violation:
      # v8sbx violation detected, run until completion for stderr logging
      # if inside signal handler, don't wait
      # note that this can also trigger on other heuristics (e.g. PC control) potentially with different end states
      if do_wait:
        try:
          d.cont()
          d.wait()
        except Exception:
          pass

      try:
        err_pre = p.recverruntil(b'## V8 sandbox violation detected!', optional=True, timeout=0.1)
        err = err_pre + p.recverr(0x10000, timeout=0.1)
      except Exception:
        err = b''

      try:
        out = p.recv(0x10000, timeout=0.1)
      except Exception:
        out = b''
      result = 1
      set_exit_status(EXIT_SEGV_V8SBX)
    else:
      try:
        err = p.recverr(0x10000, timeout=0.1)
      except Exception:
        err = b''
      if b'Caught harmless memory access violation' in err and (b'non-canonical' in err): # or b'kernel space' in err
        try:
          out = p.recv(0x10000, timeout=0.1)
        except Exception:
          out = b''
        result = 2
        set_exit_status(EXIT_SEGV_NONCANON)
      elif b'Caught harmless signal' in err:
        if b'(SIGABRT)' in err:
          set_exit_status(EXIT_ABRT_OK)
        elif b'(SIGTRAP)' in err:
          set_exit_status(EXIT_TRAP_OK)
      if do_wait:
        if d.exit_code is None and d.exit_signal is not None:
          set_exit_flag(EXIT_FLAG_TIMEOUT)

    if result in [1]:
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

        # old heuristics due to int3 bp bug in libdebug
        if int3_detected:
          print('[!] ========== WARNING : WATCHPOINT HITS FOLLOWING INT3 DETECTED ==========')

      crash_log = f.getvalue()

      with open('known_bugs.json', 'rt') as f:
        KNOWN_BUGS = [b['keyword'] for b in json.load(f)]
      known = next((k for k in KNOWN_BUGS if k in crash_log), None)
      if known is None:
        fn = log_path(dump_marker)
        with open(fn, 'wt') as f:
          f.write(crash_log)

  def sigalrm_handler(signum, frame):
    try:
      report(False)
    except Exception:
      pass
    set_exit_flag(EXIT_FLAG_TIMEOUT)
    if d.pid > 0:   # should really be an assert...
      try:
        # sometimes the underlying program is already gone,
        # it's just the debugger that's broken
        os.kill(d.pid, signal.SIGKILL)
      except Exception:
        pass
    os._exit(runner_exit_code)

  signal.signal(signal.SIGALRM, sigalrm_handler)
  signal.alarm(timeout_sec)

  def bp_sym(tgt, file='hybrid'):
    if tgt in syms:
      return d.breakpoint(syms[tgt], file='absolute')
    return d.breakpoint(tgt, file=file)

  libcontext.sym_lvl = 1

  # run until v8sbx hook
  bp_v8sbx_hook = bp_sym('v8::internal::trap_handler::SetV8SandboxBaseAndSize(unsigned long, unsigned long)', file='binary')
  d.cont()
  if not bp_v8sbx_hook.hit_on(d):
    set_exit_status(EXIT_PRE_FAIL)
    exit(runner_exit_code)
  sbx_base = d.regs.rdi
  bp_v8sbx_hook.disable()

  # run until d8 script entry
  bp_script_run = bp_sym('v8::Script::Run(v8::Local<v8::Context>)', file='binary')
  # cont #0: hit on mjsunit script exec
  # cont #1: hit on test script exec
  for _ in range(len(exec_fns)):
    d.cont()
    if not bp_script_run.hit_on(d):
      set_exit_status(EXIT_PRE_FAIL)
      exit(runner_exit_code)
  bp_script_run.disable()

  # load v8sbx maps
  # maps = d.maps
  # sbx_guard_lo = next(m for m in maps if m.permissions == '---p' and m.size == 0x1000000000)
  # sbx_guard_hi = next(m for m in maps if m.permissions == '---p' and m.size >= 1024**4 - (1<<32))
  # sbx_base = sbx_guard_lo.end

  # break on OS::Abort()
  bp_abort = bp_sym('v8::base::OS::Abort()', file='binary')

  # break on exec completion (w/o last GC)
  bp_lcov = bp_sym('v8::Shell::WriteLcovData(v8::Isolate*, char const*)', file='binary')

  # break on ASAN error, before printing out the asan stacktrace
  # bp_asan_on_error = bp_sym('__asan_on_error', file='binary')

  bp_sigaction = d.breakpoint('sigaction', file='libc')
  bp_mprotect = d.breakpoint('mprotect', file='libc')

  catch_segv = d.catch_signal(signal.SIGSEGV)

  # update writable maps -> update hardware watchpoints -> rewrite on demand
  def ptrcage_writable_maps(d: Debugger, sbx_base: int) -> list[MemoryMap]:
    return [m for m in d.maps if m.start >= sbx_base and m.end <= sbx_base + (1<<32) and 'rw' in m.permissions]

  def is_rw(address: int, maps: list[MemoryMap], size: int = 1) -> bool:
    if not size:
      return True
    for vmap in maps:
      vmap_range = range(vmap.start, vmap.end)
      if address in vmap_range and address+size-1 in vmap_range and 'rw' in vmap.permissions:
        return True
    return False

  target_maps = ptrcage_writable_maps(d, sbx_base)

  target_insn_bps = list(d.breakpoint(insn, hardware=True, file='absolute') for insn in target_insns)
  addrgen_map = {}

  # called at point of no return
  def on_complete(keep_sigaction=False):
    bp_mprotect.disable()
    if not keep_sigaction:
      bp_sigaction.disable()
    bp_lcov.disable()
    bp_abort.disable()
    # bp_asan_on_error.disable()
    catch_segv.disable()
    for bp in target_insn_bps:
      bp.disable()

  def hit_thread(d: Debugger, bp: Breakpoint) -> ThreadContext | None:
    for t in d.threads:
      if bp.hit_on(t):
        return t
    return None

  #libcontext.sym_lvl = 0
  while True:
    try:
      d.cont()
    except Exception:          # exec complete?
      break

    # libdebug sometimes fail to properly take into account dead process and waits indefinitely
    # currently handled with script infloop + sigalrm timeout
    d.wait()

    if (t := hit_thread(d, bp_mprotect)):
      res = f'[*] mprotect({hex(t.regs.rdi)}, {hex(t.regs.rsi)}, {bin(t.regs.rdx)})'
      hook_dq.append(res)
      # t.finish() sometimes tries to (brokenly) use hw breakpoints
      # force use of sw breakpoint by manually setting a sw bp on the same target (return address)
      bp_ret = d.breakpoint(u64(d.memory[t.regs.rsp, 0x8]), hardware=False, file='absolute')
      t.finish()
      bp_ret.disable()
      del bp_ret

      try:
        new_target_maps = ptrcage_writable_maps(d, sbx_base)
        target_maps = new_target_maps
      except:
        pass
    elif (t := hit_thread(d, bp_sigaction)):
      res = f'[*] sigaction({t.regs.rdi}, {t.regs.rsi}, {t.regs.rdx})'
      hook_dq.append(res)
      if t.regs.rdi == signal.SIGSEGV:   # either v8sbx violation, or just a benign crash
        on_complete(keep_sigaction=True)
      elif t.regs.rdi == signal.SIGABRT: # UninstallCrashFilter()
        v8sbx_violation = True
        break
      elif t.regs.rdi == signal.SIGPROF: # profiler, skip crash heuristics
        continue
      # if crashes hit from non-main thread, threads get terminated & ptrace hangs
      # fix this by forcing thread state as dead
      if t is not d.threads[0]:
        for tt in d.threads:
          if tt is not t:
            d._internal_debugger.set_thread_as_dead(tt.thread_id, 128 + t.regs.rdi, t.regs.rdi)
    elif (t := hit_thread(d, bp_lcov)):     # exec complete w/o crashing, disable mprotect breakpoint
      set_exit_status(EXIT_SUCCESS)   # this is needed to overwrite previous segv hits (e.g. wasm memory oob)
      on_complete()
    elif (t := hit_thread(d, bp_abort)):    # abort due to failing check
      set_exit_flag(EXIT_ABRT_OK)     # (SBX)CHECK(), unreachable(), etc.
      on_complete()
    # elif (t := hit_thread(d, bp_asan_on_error)):  # ASAN crash
    #   v8sbx_violation = True
    #   break
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
        if (not sp_maps and not sp_maps_nextpage) or (sp_maps and not ('rw-' in sp_maps[0].permissions or '---' in sp_maps[0].permissions)):
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
          # intentionally not using t.saved_ip here, we do not want the stack unwinder heuristics to kick in
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
      t, hit_insn = next(
        (
          (_t, insn) for insn, bp in zip(target_insns, target_insn_bps)
          if (_t := hit_thread(d, bp))
        ),
        (None, None)
      )
      if t is not None:
        # disassemble target instruction and resolve addresses
        try:
          if hit_insn not in addrgen_map:
            # we can directly try mutating destination register
            # in reality, that does not properly model the effects
            # e.g. #1: for `and eax, dword ptr [mem]` we cannot insert arbitrary `xor eax, imm32`
            # e.g. #2: for `movzx eax, byte ptr [mem]` we are only allowed to xor the lowest byte
            # e.g. #3: `cmp byte ptr [mem], 0` - where are we going to inject the fault?
            md = cs.Cs(cs.CS_ARCH_X86, cs.CS_MODE_64)
            md.detail = True

            inst = next(md.disasm(d.memory[hit_insn, 17], hit_insn, 1))
            mem_operands = [op for op in inst.operands if op.type == cs.CS_OP_MEM]
            assert len(mem_operands) == 1

            m = mem_operands[0].value.mem
            size = mem_operands[0].size
            base_reg = inst.reg_name(m.base)
            index_reg = inst.reg_name(m.index)
            scale_val = m.scale
            disp_val = m.disp

            # this shouldn't really be an in-sandbox access, but whatever.
            if base_reg == 'rip':
              disp_val += inst.size

            addrgen = lambda t, _br=base_reg, _ir=index_reg, _s=scale_val, _d=disp_val, _sz=size: ((
                (0 if _br is None else getattr(t.regs, _br)) +
                (0 if _ir is None else getattr(t.regs, _ir) * _s) +
                _d
              ), _sz
            )
            addrgen_map[hit_insn] = addrgen

          # resolve address - only corrupt when RW
          addr, size = addrgen_map[hit_insn](t)
          if is_rw(addr, target_maps, size):
            # read original memory
            mem_orig = d.memory[addr, size]
            
            # call fuzzer-supplied fault generation logic
            # note: we can set up a watchpoint at d.memory to automatically infer correlated hit_insn
            fault_state, (mem_pre, mem_post), do_revert = fault_fn(fault_state, hit_insn, addr, mem_orig, d.memory)

            # corrupt memory with generated fault
            if mem_pre is not None:
              d.memory[addr, size] = mem_pre

            # execute the instruction, loading value into host-observable state
            t.next()

            if mem_post is not None:    # set to next value if not none
              d.memory[addr, size] = mem_post
            elif do_revert:             # revert the corruption if requested
              d.memory[addr, size] = mem_orig
        except Exception as e:
          # this may legitimately hit for e.g. JIT-compiled code
          pass #print(f'[!] Debugger-Fuzzer exception while injecting fault: {repr(e)}')

  on_complete()
  report()
  d.kill()
  d.terminate()
  os._exit(runner_exit_code) 
