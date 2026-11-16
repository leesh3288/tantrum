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


import os
import shutil
import signal
import subprocess
from sys import exc_info
import time
import utils
from utils import log
import argparse
from pathlib import Path
import typing as t

def main():
    root = utils.evaluation_root()

    main_parser = argparse.ArgumentParser(
        prog="run_sbxbrk",
        description="Helper script to run SbxBrk.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )

    main_parser.add_argument(
        "--import-corpus",
        type=Path,
        required=True,
        help="The folder that contains the corpus initially imported.",
    )

    main_parser.add_argument(
        "--jobs",
        type=utils.range_limited_int(),
        default=32,
        help="The number fuzzer processes.",
    )

    main_parser.add_argument(
        "--dropout",
        type=utils.range_limited_float(0.0, 1.0),
        help="The number fuzzer processes.",
    )

    main_parser.add_argument(
        "--storage",
        type=Path,
        required=True,
        help="The folder where the results are stored.",
    )

    main_parser.add_argument(
        "--purge",
        action="store_true",
        help="Delete the folder passed via --storage without asking.",
    )

    main_parser.add_argument(
        "--timeout",
        type=utils.parse_time_str_as_s,
        default=None,
        help="Timeout before terminating all fuzzers.",
    )

    args = main_parser.parse_args()
    dropout = args.dropout

    storage: Path = args.storage
    if storage.exists():
        if args.purge:
            shutil.rmtree(storage)
        else:
            log.error(
                f"Storage folder {storage.as_posix()} already exists. Please delete it first."
            )
            exit(1)

    storage.mkdir(parents=True)
    log_folder = storage / "logs"
    log_folder.mkdir(parents=True)
    log_file = log_folder / "log.txt"
    utils.enable_file_logging(log_file)

    log.info(f"Storing log at {log_file}")

    fuzzer_path = utils.get_and_check_sbxbrk_path()
    v8_shell_path = utils.get_and_check_sbxbrk_v8_fuzzing_shell_path()

    unpinned_cores = utils.get_unpinned_cores_and_print_stats()
    # make .pop() taking cores in ascending order.
    unpinned_cores.sort(reverse=True)

    if len(unpinned_cores) < args.jobs:
        log.error("There are not enough unpinned cores left, please kill the running processes or wait until they terminate.")
        exit(1)

    log.info("Starting fuzzers")

    def fuzzer_cmd(id: int):
        cmd = []
        cmd += ["taskset", "-c", str(unpinned_cores.pop())]
        cmd += [
            fuzzer_path.as_posix(),
            "fuzz",
            "--purge",
            "--log-level", "info",
            "--timeout", "2000",
            "--work-dir", f"{storage}/fuzzer-{id}",
            "--seed-dir", args.import_corpus.as_posix()]
        if dropout is not None:
            cmd += ["--dropout-fraction", str(dropout)]
        cmd += [f"-- {v8_shell_path.as_posix()} {" ".join(utils.V8_fuzzing_shell_args())}",
            f"2>&1 | rotatelogs -n 2 {log_folder.as_posix()}/fuzzer_{id}.txt 32M"]
        return " ".join(cmd)

    jobs: list[subprocess.Popen[str]] = []

    def check_all_jobs_alive():
        for jid, j in enumerate(jobs):
            if j.poll() is not None:
                log.error(f"Job {jid} terminated prematurely, check its logs at {log_folder.as_posix()}")

    try:
        for jid in range(args.jobs):
            log.info(f"Starting fuzzer job with id #{jid}")
            cmd = fuzzer_cmd(jid)
            log.info(f"Command: {cmd}")
            p = subprocess.Popen(cmd, shell=True, encoding='utf8', preexec_fn=os.setsid)
            jobs.append(p)
        log.info(f"Results are stored at {storage.as_posix()}")
        log.info(f"Logs are stored at {log_folder.as_posix()}")
        log.info("All jobs started. Hit ctrl+c to terminate.")
        if args.timeout:
            log.info(f"Timeout is set to {args.timeout} seconds and will cause automatic termination.")
            deadline = time.monotonic() + float(args.timeout)
            while time.monotonic() < deadline:
                time.sleep(10)
                check_all_jobs_alive()
            log.info("Timeout passed, terminating...")
        else:
            while True:
                time.sleep(10)
                check_all_jobs_alive()
    except KeyboardInterrupt:
        log.info("Stop was requested, killing jobs...")
    except:
        log.error(f"Unexpected error, check the log folder {log_folder.as_posix()}", exc_info=True)

    for jid, j in enumerate(jobs):
        try:
            log.info(f"Stopping job #{jid}")
            pid = j.pid
            os.killpg(os.getpgid(pid), signal.SIGTERM)
            j.wait()
        except Exception as e:
            log.info(f"Error while stopping job #{jid}: {e}")
            pass

if __name__ == "__main__":
    main()
