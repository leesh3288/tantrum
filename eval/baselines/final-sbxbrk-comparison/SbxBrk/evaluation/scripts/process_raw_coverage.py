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
from asyncio import as_completed
from collections import defaultdict
import os
from random import shuffle
import typing as t
import re
import json
from tqdm import tqdm
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed
from datetime import datetime
from dataclasses import dataclass, asdict
import gzip
from utils import log

cov_file_suffix = ".afl_map.txt"

def compute_edges_covered_single(coverage_file: Path) -> t.Set[int]:
    ret = set()
    content = coverage_file.read_text()

    fpath = None
    for l in content.splitlines():
        try:
            edge, _hit_cnt = l.split(":")
            ret.add(int(edge))
        except Exception as e:
            print(f"[!] {coverage_file} seems to be corrupted: {e}")
            return ret

    return ret

def compute_edges_covered(coverage_files: t.List[Path]) -> t.Tuple[int]:
    ret = set()
    for f in coverage_files:
        ret |= compute_edges_covered_single(f)
    return tuple(ret)


def main():
    main_parser = argparse.ArgumentParser(
        prog="eval",
        description="Helper script that processes FuzzilliSbx .locv files and creates a coverage over time and a list of all covered lines (path, #line) as .json files.",
    )

    main_parser.add_argument(
        "--purge",
        action="store_true",
        default=False,
        help="Delete the .json files from a previous run from the storage. No other files will be touched.",
    )

    main_parser.add_argument(
        "--jobs",
        type=int,
        default=None,
        help="Number of CPUs to use in parallel. Per default all cores are used.",
    )

    main_parser.add_argument(
        "--end-ts",
        type=int,
        default=3600*24*3,
        help="Coverage found after more than this much seconds are ignored.",
    )

    main_parser.add_argument(
        "--substract",
        default=None,
        type=Path,
        help="Ignored coverage for lines that are contained in the provided path to an covered_edges_details.json file.",
    )

    main_parser.add_argument(
        "--storage",
        type=Path,
        help="Path where the coverage report in form of .json files are stored.",
    )

    main_parser.add_argument(
        "--input-dir",
        type=Path,
        required=True,
        nargs="+",
        help="Path to directory containing the data of a single fuzzing run that have been already converted to .lcov files.",
    )

    args = main_parser.parse_args()
    purge: bool = args.purge
    storage: Path = args.storage
    jobs = args.jobs
    end_ts: t.Optional[int] = args.end_ts
    substraction_file: t.Optional[Path] = args.substract


    ignored_covered_edges = set()
    if substraction_file:
        ignored_covered_edges = set(int(e) for e in json.loads(substraction_file.read_text()))

    coverage_over_time_report_file = storage / "ts_to_num_covered_edged.json"
    covered_edges_details_report_file = storage / "covered_edged_details.json"

    if purge:
        if coverage_over_time_report_file.exists():
            coverage_over_time_report_file.unlink()
        if covered_edges_details_report_file.exists():
            covered_edges_details_report_file.unlink()
    elif coverage_over_time_report_file.exists() or covered_edges_details_report_file.exists():
        log.warning(f"[!] Found existing .json files at {storage}. Please delete or pass --purge.")
        exit(1)
    storage.mkdir(exist_ok=True)

    input_dirs: t.List[Path] = args.input_dir

    log.info(f"[+] Searching {len(input_dirs)} directories for coverage files.")
    input_afl_map_files = set()
    for dir in tqdm(input_dirs):
        input_afl_map_files |= set(dir.rglob(f"*{cov_file_suffix}"))
    input_afl_map_files = list(input_afl_map_files)
    input_afl_map_files = input_afl_map_files[:]
    input_afl_map_files.sort()

    nfiles = len(input_afl_map_files)
    if nfiles == 0:
        log.warning("[+] No coverage files found. Please run compute_raw_coverage.py first.")
        exit(1)
    log.info(f"[+] Processing {nfiles} coverage files.")


    log.info(f"[+] Mapping coverage files to timestamps.")
    # First we compute a mapping input to datetime it was created.
    fpath_to_date: t.Dict[Path, datetime] = {}
    for f in tqdm(input_afl_map_files):
        fname = f.name
        if fname.startswith("program_"):
            # program_20250406131320_C4638B00-A7C8-43CF-9A63-6F45846E4751.lcov
            match = re.match(
                r"program_(?P<year>[0-9][0-9][0-9][0-9])(?P<month>[0-9][0-9])(?P<day>[0-9][0-9])(?P<hh>[0-9][0-9])(?P<mm>[0-9][0-9])(?P<ss>[0-9][0-9]).*",
                fname,
            )
            assert match
            d = datetime(
                int(match.group("year")),
                int(match.group("month")),
                int(match.group("day")),
                int(match.group("hh")),
                int(match.group("mm")),
                int(match.group("ss")),
            )
            fpath_to_date[f] = d
        else:
            match = re.match(
                r"(?P<id>[0-9]+):(?P<unix>[0-9]+).*",
                fname,
            )
            assert match
            d = datetime.fromtimestamp(int(match.group("unix")))
            fpath_to_date[f] = d

    del input_afl_map_files
    dates = list(fpath_to_date.values())
    dates.sort()

    # This is the coverage record, i.e., the start time of the fuzzing run.
    start_date: datetime = dates[0]

    log.info("[+] Grouping files by second.")
    second_to_fpaths = defaultdict(list)
    for fpath, date in fpath_to_date.items():
        seconds_since_start = date - start_date
        seconds_since_start = int(seconds_since_start.total_seconds())
        if end_ts is not None and seconds_since_start > end_ts:
            continue
        assert seconds_since_start >= 0
        second_to_fpaths[seconds_since_start].append(fpath)

    del fpath_to_date

    # Shuffle the dict to make runtime prediction more accurate.
    # In the beginning typically more coverage found, thus these seconds tend
    # to have more entries.
    tmp = list(second_to_fpaths.items())
    shuffle(tmp)
    second_to_fpaths = dict(tmp)

    avg_files_per_second = sum([len(e) for e in second_to_fpaths.values()]) / len(second_to_fpaths)
    log.info(f"[+] {len(second_to_fpaths)} seconds have on average {avg_files_per_second:.02f} coverage records")

    ncpus = os.cpu_count()
    assert ncpus
    if not jobs:
        jobs = ncpus

    log.info(f"[+] Scheduling jobs on {jobs} cores.")
    executor = ProcessPoolExecutor(jobs)
    job_to_second = {}
    for second, fpaths in second_to_fpaths.items():
        j = executor.submit(compute_edges_covered, fpaths)
        job_to_second[j] = second


    log.info(f"[+] Processing {len(job_to_second)} seconds that have at least one coverage record")
    second_to_covered_edges_set_unsorted: t.Dict[int, t.Tuple[int]] = defaultdict()
    for j in tqdm(as_completed(job_to_second.keys()), total=len(job_to_second)):
        second = job_to_second[j]
        second_to_covered_edges_set_unsorted[second] = j.result()

    # Compute ts -> #lines mapping and write it to disk.
    log.info("[+] Computing second -> #covered edged mapping")
    second_to_covered_edged_cnt = {}
    total_covered_edges = set()
    second_to_covered_edges_tuple_sorted = sorted(second_to_covered_edges_set_unsorted.items(), key=lambda e: e[0])
    del second_to_covered_edges_set_unsorted

    for idx, (second, covered_edges) in enumerate(second_to_covered_edges_tuple_sorted):
        total_covered_edges |= (set(covered_edges) - ignored_covered_edges)
        second_to_covered_edged_cnt[second] = len(total_covered_edges)
        del second_to_covered_edges_tuple_sorted[idx]

    coverage_over_time_report_file.write_text(json.dumps(second_to_covered_edged_cnt))
    covered_edges_details_report_file.write_text(json.dumps(list(total_covered_edges)))

    log.info("[+] Done")


if __name__ == "__main__":
    main()
