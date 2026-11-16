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


from ctypes import util
import math
import os
import shutil
import signal
import subprocess
import time
import utils
from utils import log
import argparse
from pathlib import Path
import typing as t
import enum

(MAX_LEAFS_PER_INTERMEDIATE) = 16
START_PORT_SEARCH_RANGE = 10000

class InstanceType(enum.Enum):
    ROOT = "root"
    INTERMEDIATE = "intermediate"
    LEAF = "leaf"

def main():
    root = utils.evaluation_root()

    main_parser = argparse.ArgumentParser(
        prog="run_fuzzillisbx",
        description="Helper script to run FuzzilliSbx.",
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
    fuzzer_folder = storage / "result"
    utils.enable_file_logging(log_file)

    log.info(f"Storing log at {log_file}")

    fuzzer_path = Path("/work/FuzzilliSbx/fuzzilli/.build/x86_64-unknown-linux-gnu/release/FuzzilliCli"); assert fuzzer_path.exists(), fuzzer_path
    v8_shell_path = utils.get_and_check_fuzzilli_v8_fuzzing_shell_path()

    unpinned_cores = utils.get_unpinned_cores_and_print_stats()
    # make .pop() taking cores in ascending order.
    unpinned_cores.sort(reverse=True)

    if len(unpinned_cores) < args.jobs:
        log.error("There are not enough unpinned cores left, please kill the running processes or wait until they terminate.")
        exit(1)

    log.info("Starting fuzzers")

    # subtract the root node.
    jobs_left = args.jobs - 1
    # MAX_LEAFS_PER_INTERMEDIATE - 1 leafs per intermediate
    num_intermediate_nodes = math.ceil(jobs_left / ((MAX_LEAFS_PER_INTERMEDIATE)))
    jobs_left -= num_intermediate_nodes
    num_leaf_nodes = jobs_left
    assert args.jobs == (1 + num_intermediate_nodes + num_leaf_nodes)

    log.info(f"Starting #1 root node, #{num_intermediate_nodes} intermediate nodes and #{num_leaf_nodes} leaf nodes")

    ports_to_allocate = 1 + num_intermediate_nodes
    allocated_ports = []

    log.info("Allocating ports for synchronization")
    last_allocated_port = START_PORT_SEARCH_RANGE
    for _ in range(ports_to_allocate):
        last_allocated_port = utils.find_next_free_port(last_allocated_port + 1)
        if not last_allocated_port:
            log.error("Failed to allocate port. Please check if there are orphan network applications.")
            exit(1)
        allocated_ports.append(last_allocated_port)

    log.info(f"Allocated the following port: {allocated_ports}.")
    root_port = allocated_ports.pop()
    intermediate_ports = allocated_ports
    unused_intermediate_ports = allocated_ports.copy()

    def fuzzer_cmd(id: int, ty: InstanceType):
        cmd = []
        cmd += ["taskset", "-c", str(unpinned_cores.pop())]
        cmd += [
            fuzzer_path.as_posix(),
                 "--profile=v8Sandbox",
                 "--wasm",
                 v8_shell_path.as_posix(),
        ]

        if ty == InstanceType.ROOT:
            cmd += [
                "--corpusImportMode=full",
                 f"--importCorpus={args.import_corpus.as_posix()}",
                 f"--storagePath={fuzzer_folder.as_posix()}",
                 f"--bindTo=127.0.0.1:{root_port}",
                 "--instanceType=root",
                 "--exportStatistics",
                 "--statisticsExportInterval=10",
            ]
        elif ty == InstanceType.INTERMEDIATE:
            cmd += [
                "--instanceType=intermediate",
                f"--connectTo=127.0.0.1:{root_port}",
                f"--bindTo=127.0.0.1:{unused_intermediate_ports.pop()}",
            ]
        elif ty == InstanceType.LEAF:
            cmd += [
                "--instanceType=leaf",
                f"--connectTo=127.0.0.1:{intermediate_ports[id%len(intermediate_ports)]}",
            ]
        else:
            assert False, f"{ty}"

        cmd += [f"2>&1 | rotatelogs -n 2 {log_folder.as_posix()}/fuzzer_{id}.txt 32M"]

        return " ".join(cmd)

    cmds = []

    root_id = 0
    next_id = root_id
    root_cmd = fuzzer_cmd(next_id, InstanceType.ROOT)
    next_id += 1
    cmds.append(root_cmd)

    for _id in range(next_id, next_id+num_intermediate_nodes):
        cmd = fuzzer_cmd(_id, InstanceType.INTERMEDIATE)
        cmds.append(cmd)
    next_id += num_intermediate_nodes

    for _id in range(next_id, next_id+num_leaf_nodes):
        cmd = fuzzer_cmd(_id, InstanceType.LEAF)
        cmds.append(cmd)

    print(cmds)


    jobs: list[subprocess.Popen[str]] = []
    def check_all_jobs_alive():
        for jid, j in enumerate(jobs):
            if j.poll() is not None:
                if jid != root_id:
                    # leafs and intermediates tend to fail to connect when stating up. Thus we restart them here.
                    log.info(f"Non-root instance #{jid} terminated too early. This may happend during start up. Restarting the instance.")
                    cmd = cmds[jid]
                    p = subprocess.Popen(cmd, shell=True, encoding='utf8', preexec_fn=os.setsid)
                    jobs[jid] = p
                else:
                    log.error(f"Job {jid} terminated prematurely, check its logs at {log_folder.as_posix()}")

    try:
        for jid, cmd in enumerate(cmds):
            log.info(f"Starting job #{jid}")
            log.info(f"Command: {cmd}")
            p = subprocess.Popen(cmd, shell=True, encoding='utf8', preexec_fn=os.setsid)
            jobs.append(p)
            time.sleep(1)
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
        log.error(f"Unexpected error, check the log folder {log_folder.as_posix()}")

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
