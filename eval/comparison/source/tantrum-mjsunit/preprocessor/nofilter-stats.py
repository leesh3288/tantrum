#!/usr/bin/env python3

from functools import partial
from multiprocessing import Pool, cpu_count
from tqdm import tqdm
import struct

TESTS_LIST = './tests.txt'

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

def u64(b):
  return struct.unpack('<Q', b)[0]

def run(fn, suffix=None):
  assert suffix

  # fetch data
  try:
    with open(fn + suffix, 'rb') as f:
      map_dump = f.read()
    assert map_dump[-4:] == b'#eof'
    assert (len(map_dump) - 4) % 0x10 == 0

    inst_cnt = {}
    for i in range(0, len(map_dump) - 4, 0x10):
        # read trace (inst_addr | (flag<<48) 8b, cnt 8b)
        encoded_inst = u64(map_dump[i:i+0x8])
        hit_cnt = u64(map_dump[i+0x8:i+0x10])
        inst_cnt[encoded_inst] = hit_cnt
    return inst_cnt
  except FileNotFoundError: # TCs that failed trace collection
    return None
  except Exception as e:    # TCs that exceeded timeout may trigger assertions
    print(f'[!] {repr(e)} thrown while analyzing {fn}')
    return None


def run_multi(fns_idx, suffix=None):
  assert suffix
  fns, idx = fns_idx
  load_cnt = 0
  part = {}
  for fn in tqdm(fns, position=(idx & 0xf)):
    run_part = run(fn, suffix)
    if run_part is not None:
      load_cnt += 1
      part = merge_stats(part, run_part)
  return part, load_cnt


if __name__ == '__main__':
    with open(TESTS_LIST, 'rt') as f:
      fns = [fn.strip() for fn in f.readlines()]

    worker_cnt = cpu_count()
    fns_work_unit = [fns[i::worker_cnt] for i in range(worker_cnt)]

    with Pool(worker_cnt) as pool:
      wkr_results = pool.map(partial(run_multi, suffix='.2.trace'), zip(fns_work_unit, range(worker_cnt)))

    print('\n'*0x20)
    print('[*] Merging results.')
    total_execs = 0
    total_inst_cnt = {}
    for wkr_result, wkr_loads in wkr_results:
      total_inst_cnt = merge_stats(total_inst_cnt, wkr_result)
      total_execs += wkr_loads

    ### Load type bitfields
    ## SANDBOX           = 1<<0,   // in-sandbox
    ## WRITABLE_SANDBOX  = 1<<1,   // writable in-sandbox, only valid with SANDBOX
    ## INIT              = 1<<2,   // loads triggered while initializing (pre-script entry)
    # 0: out-of-sandbox, post-init
    # 1: in-sandbox RO, post-init
    # 2: INVALID
    # 3: in-sandbox RW, post-init => only type tracked by original preprocessor!
    # 4: out-of-sandbox, pre-init
    # 5: in-sandbox RO, pre-init
    # 6: INVALID
    # 7: in-sandbox RW, pre-init

    # k = inst | (type<<48)
    # v = count
    total_inst_set = set()
    uniq_insts = [0] * 8    # unique insts per load type
    total_cnts = [0] * 8    # total loads per load type
    for k, v in total_inst_cnt.items():
      inst = k & ((1<<48)-1)
      access_type = k >> 48
      assert 0 <= access_type < 8
      total_inst_set.add(inst)
      uniq_insts[access_type] += 1
      total_cnts[access_type] += v

    print(f'Testcase count: {total_execs}')
    print(f'Total Unique Insts: {len(total_inst_set)}')
    print('        Type' + ''.join(f' | {i:13d}' for i in range(8)))
    print('Unique Insts' + ''.join(f' | {uniq_insts[i]:13d}' for i in range(8)))
    print(' Total Loads' + ''.join(f' | {total_cnts[i]:13d}' for i in range(8)))
