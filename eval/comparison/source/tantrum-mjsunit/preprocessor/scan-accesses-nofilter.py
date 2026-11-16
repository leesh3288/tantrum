#!/usr/bin/env python3

from multiprocessing import Pool, cpu_count
from subprocess import check_output, CalledProcessError, TimeoutExpired, STDOUT
from pathlib import Path
import re
from functools import partial
import struct

PIN_PATH = '../preprocessor/pin/pin'
TRACER_PATH = '../preprocessor/pin/v8sbx-tracer/obj-intel64/v8sbx-tracer-nofilter.so'

TARGET_D8 = './builds/c59dbe20-eval/d8'
TESTS_LIST = './tests.txt'

DEFAULT_FLAGS = [
  '--no-abort-on-contradictory-flags',
  '--single-threaded',
  '--allow-natives-syntax',
  '--expose-gc',
  '--sandbox-testing',
  '--trace-turbo-path=nonexistent',
  '--predictable',
]

TIMEOUT = 60

R_FLAGS = re.compile(r'^\s*//\s*flags\s*:\s*(.+)$', flags=re.I|re.M)

### orchestrator ###
def u64(b):
  return struct.unpack('<Q', b)[0]


# tracemap worker
# _get_tracemap but only the total counts, while taking into account the inst>>47 check
def get_tracecnt(fn, suffix=None):
  assert suffix
  try:
    trace_raw = open(fn + suffix, 'rb').read()
    assert trace_raw[-4:] == b'#eof'
    assert (len(trace_raw) - 4) % 0x10 == 0
  except:
    return 0

  ctr = 0
  for i in range(0, len(trace_raw) - 4, 0x10):
    # read trace (inst_addr 8b, v8sbx_offset 4b, nth_total_read 3b, read_bytes 1b)
    trace_inst = u64(trace_raw[i:i+0x8])
    if (trace_inst >> 47) != 0:
      break
    ctr += 1

  return ctr

### orchestrator ###


def get_all_flags(fn):
  return sum((x.strip().split() for x in R_FLAGS.findall(open(fn, 'rt').read())), [])


def run(fn, suffix=None, suffix_baseline=None):
  assert suffix
  assert suffix_baseline

  # simulate the trace load as done by orchestrator
  tracecnt = get_tracecnt(fn, suffix_baseline)
  if tracecnt == 0:
    print(f'[ZERO] {fn}: zero tracecnt')
    return 3

  flags = get_all_flags(fn)
  pfn = Path(fn)
  fn_trace = str(pfn.with_name(pfn.name + suffix))
  try:
    res = check_output(
      ['setarch', '-R', PIN_PATH, '-t', TRACER_PATH, '-o', fn_trace, '-c', str(tracecnt), '--', TARGET_D8] +
      DEFAULT_FLAGS + flags + ['./test/mjsunit/mjsunit.js', fn],
      timeout=TIMEOUT*3, stderr=STDOUT
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
    print(res)

    return 1    # failure: unknown


if __name__ == '__main__':
    with open(TESTS_LIST, 'rt') as f:
      fns = [fn.strip() for fn in f.readlines()]

    # initial baseline run
    # *.1.trace: default
    # *.2.trace: nofilter for ablation test
    with Pool(cpu_count() // 2) as pool:
      baseline_1 = pool.map(partial(run, suffix='.2.trace', suffix_baseline='.1.trace'), fns)

    assert len(baseline_1) == len(fns)
    succ_1, fail_1, skip_1, zero_1 = [baseline_1.count(i) for i in range(4)]

    print(f'[*] Result: {succ_1} success, {fail_1} fail, {skip_1} skip, {zero_1} zero-crashcnt ({succ_1 / (len(fns) - skip_1) * 100:.2f}%)')

    # optionally execute flakiness check. this is currently implicitly handled by the orchestrator.
    exit()
