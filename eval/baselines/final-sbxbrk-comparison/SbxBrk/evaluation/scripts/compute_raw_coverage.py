#!/bin/env python3
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "psutil",
#     "tqdm",
# ]
# [tool.uv]
# exclude-newer = "2025-08-11T00:00:00Z"
# ///
import argparse
import enum
import os
from random import shuffle
import typing as t
from tqdm import tqdm
from pathlib import Path
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
import utils

v8_path = utils.get_and_check_sbxbrk_v8_fuzzing_shell_path()
assert v8_path.exists(), f"Failed to find {v8_path}"

afl_showmap_path = Path("/work/AFLplusplus/afl-showmap")
assert afl_showmap_path.exists(), f"Failed to find {afl_showmap_path}, you need to build AFL++ first."

class Fuzzer(enum.Enum):
    FuzzilliSbx = "FuzzilliSbx"
    SbxBrk = "SbxBrk"

    def __str__(self):
        return self.value

def compute_coverage_single(fuzzer: Fuzzer, input: Path):
    coverage_map = input.with_suffix(".afl_map.txt")

    if coverage_map.exists():
        return

    cmd = [
        afl_showmap_path.as_posix(),
        "-o",
        coverage_map.as_posix(),
        "-t",
        "5000",
        "-e", # not hit cnts
        "-s", # no classify
        "--",
        v8_path.as_posix(),
    ] + utils.V8_fuzzing_shell_args()

    env = {
        "ASAN_OPTIONS": "symbolize=0:abort_on_error=0,exitcode=66,detect_leaks=0",
        "LD_LIBRARY_PATH": "/work/fuzzer/target/release",
        "AFL_MAP_SIZE": "10000000", # TODO: make dynamic AFL_MAP_SIZE
        "FUZZER_NO_EARLY_EXIT": "1",
    }
    if fuzzer == Fuzzer.SbxBrk:
        env["INPUT"] = input.as_posix()
    else:
        cmd.append(input.as_posix())

    try:
        ret = subprocess.run(
            cmd,
            timeout=None,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.STDOUT,
            check=True,
            env=env,
        )
    except subprocess.TimeoutExpired:
        # we are still using the coverage
        pass
    except subprocess.CalledProcessError as e:
        # Ignore ASan crashes (66), script parsing error (1)
        if e.returncode in [66, 1]:
            pass
        else:
            raise e from Exception(
                f"Error while processing {input} (stdout: {e.stdout})"
            )

    if not coverage_map.exists():
        return input, None

    stat = coverage_map.stat()
    if stat.st_size == 0:
        return input, None


def main():
    main_parser = argparse.ArgumentParser(
        prog="afl_cov",
        description="Compute the coverage for SbxBrk or FuzzilliSbx using the same AFL++ instrumented binary. This script will save a .afl_map.txt file alongside each found input.",
    )

    main_parser.add_argument(
        "--fuzzer",
        required=True,
        choices=[c for c in Fuzzer],
        type=Fuzzer,
        help="Select the kind of fuzzer inputs to look for.",
    )

    main_parser.add_argument(
        "--purge",
        action="store_true",
        default=False,
        help="Delete all results of a previous run. This will rerun the coverage computation for all found .inputs.",
    )

    main_parser.add_argument(
        "--jobs",
        type=int,
        default=None,
        help="Number of CPUs to use in parallel. Per default all cores are used.",
    )

    main_parser.add_argument(
        "input_dir",
        type=Path,
        nargs="+",
        help=f"Path that is recursively searched for unprocessed inputs. For {Fuzzer.FuzzilliSbx.value} these are .js files, while for {Fuzzer.SbxBrk.value}, .ron files are processed.",
    )

    args = main_parser.parse_args()
    fuzzer: Fuzzer = args.fuzzer
    purge: bool = args.purge
    jobs: t.Optional[int] = args.jobs
    input_dirs: t.List[Path] = args.input_dir

    if purge:
        print("[+] Purging old *.afl_map.txt files")
        for dir in input_dirs:
            files = set(dir.rglob("*.afl_map.txt"))
            for f in files:
                f.unlink()

    ncpus = os.cpu_count()
    assert ncpus
    if not jobs:
        jobs = ncpus
    pool = ThreadPoolExecutor(jobs)

    for d in input_dirs:
        if fuzzer == Fuzzer.SbxBrk:
            inputs = list(d.rglob("*.ron"))
        elif fuzzer == Fuzzer.FuzzilliSbx:
            inputs = list(d.rglob("*.js"))
        else:
            assert False, f"{fuzzer}"

        shuffle(inputs)
        print(f"[+] Found {len(inputs)} inputs.")
        inputs = inputs[:]
        inputs.sort()

        print(f"[+] Processing {d}...")

        pending_jobs = []
        for i in inputs:
            j = pool.submit(compute_coverage_single, fuzzer, i)
            pending_jobs.append(j)

        for _ in tqdm(as_completed(pending_jobs), total=len(pending_jobs)):  # type: ignore
            pass

    print("[+] Done")

if __name__ == "__main__":
    main()
