#!/usr/bin/env python3

from multiprocessing import Pool, cpu_count
from subprocess import check_output, CalledProcessError, TimeoutExpired, STDOUT
from pathlib import Path
import re
from functools import partial

PIN_PATH = '../preprocessor/pin/pin'
TRACER_PATH = '../preprocessor/pin/v8sbx-tracer/obj-intel64/v8sbx-tracer.so'

TARGET_D8 = '/work/v8-build/out/fuzzing-build/d8'
TESTS_LIST = './tests.txt'

DEFAULT_FLAGS = [
  #'--no-abort-on-contradictory-flags',
  #'--single-threaded',
  #'--allow-natives-syntax',
  #'--expose-gc',
  #'--sandbox-testing',
  #'--trace-turbo-path=nonexistent',
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

TIMEOUT = 60
ENV = {
  # SbxBrk fuzzer/v8fuzz/src/modes/shared.rs
  'ASAN_OPTIONS': 'symbolize=0,abort_on_error=true',
  'LD_LIBRARY_PATH': '/work/fuzzer/target/release',
  'LD_BIND_NOW': '1',
}

R_FLAGS = re.compile(r'^\s*//\s*flags\s*:\s*(.+)$', flags=re.I|re.M)

# Note: SbxBrk tests won't have any flags anyways
def get_all_flags(fn):
    return [] # sum((x.strip().split() for x in R_FLAGS.findall(open(fn, 'rt').read())), [])

def run(fn, suffix=None):
  assert suffix
  flags = get_all_flags(fn)
  pfn = Path(fn)
  fn_trace = str(pfn.with_name(pfn.name + suffix))
  try:
    cmd = ['setarch', '-R', PIN_PATH, '-t', TRACER_PATH, '-o', fn_trace, '--', TARGET_D8]
    cmd += DEFAULT_FLAGS
    cmd += flags
    cmd += [fn]
    #print(' '.join(f"{k}='{v}'" for k, v in ENV.items()) + ' ' + ' '.join(cmd))
    res = check_output(
      cmd,
      timeout=TIMEOUT, stderr=STDOUT,
      env=ENV,
    )
    print(f'[ OK ] {fn}')
    return 0    # success
  except (CalledProcessError, TimeoutExpired) as e:
    res = e.output
    if res is None:
      res = b'[DEBUG] TIMEOUT!'

    if b'Contradictory value for readonly flag' in res:
      print(f'[SKIP] {fn}')
      return 2    # failure: readonly flag (build config)

    print(f'[FAIL] {fn}')
    #print(res)

    if b'contradictory flags' not in res and (b'Received signal' in res or b'CHECK' in res or b'Check failed' in res) and b'v8_flags.fuzzing' not in res:
      print('[!] ======================== CRASH DETECTED ========================')
      print(res.decode())
      print('[!] ================================================================')
      return 3    # failure: fatal error or hard crash

    return 1    # failure: unknown

if __name__ == '__main__':
    with open(TESTS_LIST, 'rt') as f:
      fns = [fn.strip() for fn in f.readlines()]

    # initial baseline run
    with Pool(cpu_count() // 2) as pool:
      baseline_1 = pool.map(partial(run, suffix='.1.trace'), fns)

    assert len(baseline_1) == len(fns)
    succ_1, fail_1, skip_1, crash_1 = [baseline_1.count(i) for i in range(4)]

    print(f'[*] Result: {succ_1} success, {fail_1} fail, {skip_1} skip, {crash_1} crash ({succ_1 / (len(fns) - skip_1) * 100:.2f}%)')

    # optionally execute flakiness check. this is currently implicitly handled by the orchestrator.
    exit()

    # print(f'[*] =================== Checking flaky testcases ===================')
    # # flaky test check
    # with Pool(30) as pool:
    #   baseline_2 = pool.map(partial(run, suffix='.2.trace'), fns)
    
    # assert len(baseline_2) == len(fns)
    # baseline_flaky = list(a != b for a, b in zip(baseline_1, baseline_2))
    # baseline_same = list(-1 if flaky else res for flaky, res in zip(baseline_flaky, baseline_1))

    # succ, fail, skip, crash = [baseline_same.count(i) for i in range(4)]
    # flaky = baseline_flaky.count(True)

    # # [*] Result: 783 success, 0 fail, 12 skip, 0 flaky (100.00%)
    # print(f'[*] Result: {succ} success, {fail} fail, {skip} skip, {crash} crash, {flaky} flaky ({succ / (len(fns) - skip) * 100:.2f}%)')

    # # print flaky tests
    # for i, is_flaky in enumerate(baseline_flaky):
    #   if is_flaky:
    #     print(f'[FLAK] {fns[i]}')
