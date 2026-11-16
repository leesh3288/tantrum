# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "psutil",
# ]
# [tool.uv]
# exclude-newer = "2025-08-11T00:00:00Z"
# ///
from collections import defaultdict
from contextlib import closing
import errno
import logging
import os
import re
import signal
import socket
from sys import exc_info
from tabnanny import check
import threading
import typing as t
from pathlib import Path
import subprocess
from dataclasses import dataclass
import psutil

DEFAULT_FORMATTER = logging.Formatter(
    "[%(asctime)s][%(name)s][%(levelname)s][%(filename)s:%(lineno)d]: %(message)s"
)
MAIN_LOGGER = logging.getLogger()

def get_logger() -> logging.Logger:
    return MAIN_LOGGER

def setup_root_logger():
    MAIN_LOGGER.setLevel(logging.DEBUG)
    handler = logging.StreamHandler()
    handler.setFormatter(DEFAULT_FORMATTER)
    MAIN_LOGGER.addHandler(handler)

    return MAIN_LOGGER

def enable_file_logging(path: Path):
    handler = logging.FileHandler(path)
    handler.setLevel(logging.DEBUG)
    handler.setFormatter(DEFAULT_FORMATTER)
    get_logger().addHandler(handler)

setup_root_logger()
log = get_logger()

def evaluation_root() -> Path:
    return Path(__file__).parent.parent.resolve()

def range_limited_int(lower_limit: int = 1) -> t.Callable[[str], int]:
    def check(val: str):
        r = int(val)
        assert r >= lower_limit
        return r

    return check

def range_limited_float(lower_limit: t.Optional[float] = 0.0, upper_limit: t.Optional[float] = None) -> t.Callable[[str], float]:
    def check(val: str):
        r = float(val)
        if lower_limit:
            assert r >= lower_limit
        if upper_limit:
            assert r <= upper_limit
        return r

    return check

def parse_time_str_as_s(val: str) -> int:
    m = re.match(r"^(?P<fac>[1-9][0-9]*)(?P<suffix>s|m|d)$", val)
    assert m, "Invalid time: {val}"
    suffix_to_scalar = {
        "s": 1,
        "m": 60,
        "h": 3600,
        "d": 3600 * 24,
    }
    return suffix_to_scalar[m.group("suffix")] * int(m.group("fac"))  # type: ignore


def V8_fuzzing_shell_env() -> t.Dict[str, str]:
    return {
        "LD_LIBRARY_PATH": "/work/fuzzer/target/release"
    }

def V8_fuzzing_shell_args() -> list[str]:
    return [
        "--fuzzing", "--sandbox-fuzzing", "--single-threaded", "--allow-natives-syntax", "--expose-gc"
    ]

def get_and_check_v8_fuzzing_shell_path(shell_path: Path) -> Path:
    """
    Check if the V8 shell is working as intended.
    """

    if not shell_path.exists():
        log.error(f"Shell could not be found at {shell_path.as_posix()}. Please build it first.")
        exit(1)

    env = V8_fuzzing_shell_env()
    cmd = f"""echo "print('works');" | {shell_path.as_posix()} {" ".join(V8_fuzzing_shell_args())}"""
    log.info(f"Testing d8 shell using the following command: {cmd}")
    try:
        log.info("#### SHELL OUTPUT START ####")
        subprocess.check_call(cmd, shell=True, env=env)
    except:
        log.error("Failed to execute V8 shell. Please make sure you have build the shell and the fuzzer.", exc_info=True)
        exit(1)
    finally:
        log.info("#### SHELL OUTPUT END ####")

    log.info("V8 fuzzing shell seems to work as intended.")
    return shell_path

def get_and_check_sbxbrk_v8_fuzzing_shell_path():
    return get_and_check_v8_fuzzing_shell_path(Path("/work/v8-build/out/fuzzing-build/d8"))

def get_and_check_fuzzilli_v8_fuzzing_shell_path():
    return get_and_check_v8_fuzzing_shell_path(Path("/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8"))

def get_and_check_sbxbrk_path(fuzzer_path: Path = Path("/work/fuzzer/target/release/v8fuzz")) -> Path:
    log.info("Checking if fuzzer is working.")
    if not fuzzer_path.exists():
        log.error(f"Failed to find fuzzer at {fuzzer_path.as_posix()}. Please build the fuzzer first.")
        exit(1)

    cmd = f"{fuzzer_path.as_posix()} --help"
    try:
        log.info("#### FUZZER OUTPUT START ####")
        subprocess.check_call(cmd, shell=True, stdout=subprocess.DEVNULL)
    except:
        log.error("Failed to run fuzzer.", exc_info=True)
        exit(1)
    finally:
        log.info("#### FUZZER OUTPUT END ####")

    log.info("Fuzzer seems to work as intended.")
    return fuzzer_path

def get_and_check_fuzzillisbx_path(fuzzer_path: Path = Path("/work/FuzzilliSbx/fuzzilli/.build/x86_64-unknown-linux-gnu/release/FuzzilliCli")) -> Path:
    log.info("Checking if fuzzer is working.")
    if not fuzzer_path.exists():
        log.error(f"Failed to find fuzzer at {fuzzer_path.as_posix()}. Please build the fuzzer first.")
        exit(1)

    cmd = f"{fuzzer_path.as_posix()} --help"
    try:
        log.info("#### FUZZER OUTPUT START ####")
        subprocess.check_call(cmd, shell=True, stdout=subprocess.DEVNULL)
    except:
        log.error("Failed to run fuzzer.", exc_info=True)
        exit(1)
    finally:
        log.info("#### FUZZER OUTPUT END ####")

    log.info("Fuzzer seems to work as intended.")
    return fuzzer_path

@dataclass
class CoreInfo:
    core_id: int
    has_pinned_process: bool
    pinned_pids: t.List[int]
    avg_util_percent: float


def cpu_core_pinning_and_util(window_seconds: int = 5, physical_core_only: bool = True) -> t.List[CoreInfo]:
    ncores = psutil.cpu_count(logical=not physical_core_only) or 1
    pinned_by_core: t.Dict[int, t.List[int]] = defaultdict(list)

    # Detect processes pinned to a single core at the START of the window
    for proc in psutil.process_iter(attrs=["pid"]):
        try:
            aff = proc.cpu_affinity()  # Not implemented on some platforms
        except (psutil.AccessDenied, psutil.NoSuchProcess, NotImplementedError):
            continue
        # skip if no process in pinned or it is pinned to all logic cores (default)
        if aff and len(aff) != psutil.cpu_count(logical=True):
            for pinned_core in aff:
                pinned_by_core[pinned_core].append(proc.info["pid"])

    # This will block for `window_seconds` to measure the utilization.
    per_core_utils = psutil.cpu_percent(interval=window_seconds, percpu=True)

    results: t.List[CoreInfo] = []
    for core_id in range(ncores):
        util = per_core_utils[core_id] if core_id < len(per_core_utils) else 0.0
        pids = pinned_by_core[core_id]
        results.append(
            CoreInfo(
                core_id=core_id,
                has_pinned_process=len(pids) > 0,
                pinned_pids=pids,
                avg_util_percent=util,
            )
        )
    return results


def get_unpinned_cores_and_print_stats(physical_core_only: bool = True) -> t.List[int]:
    expected_process_names = ["d8", "v8fuzz", "FuzzilliCli"]
    ncores = psutil.cpu_count(logical=not physical_core_only) or 1
    info = cpu_core_pinning_and_util(physical_core_only)
    pinned_cores: t.List[CoreInfo] = []
    unpinned_cores: t.List[CoreInfo] = []

    for c in info:
        if c.has_pinned_process:
            pinned_cores.append(c)
        else:
            unpinned_cores.append(c)
    assert (len(pinned_cores) + len(unpinned_cores)) == ncores

    log.info(f"System got #{ncores} {("(logical)", "(physical)")[physical_core_only]} cores.")
    log.info(f"#{len(pinned_cores)} cores have at least one pinned processe.")
    log.info(f"#{len(unpinned_cores)} have no pinned processes.")

    if len(pinned_cores) > 0:
        log.info("Found the following pinned processes:")
        for pinfo in pinned_cores:
            processes_name = []
            for pid in pinfo.pinned_pids:
                try:
                    p = psutil.Process(pid)
                    pname = p.name()
                    processes_name.append(pname)
                    log.info(f"name: {pname:<16} pid: {pid:<16} core: #{pinfo.core_id:<16}")
                    if pname not in expected_process_names:
                        log.warning("This process has an unexpected name any may not belong to this evaluation.")
                except psutil.NoSuchProcess:
                    # processes may already vanished
                    pass
            # if we have d8 pinned to a core without any fuzzer being pinned as well, this is an orphan.
            if all([pname == "d8" for pname in processes_name]):
                log.warning("Found orphan d8 process, going to kill it.")
                for pid in pinfo.pinned_pids:
                    try:
                        os.kill(pid, signal.SIGKILL.value)
                    except ProcessLookupError:
                        # process vanished already
                        pass


    return [pinfo.core_id for pinfo in unpinned_cores]


def is_tcp_port_in_use(port: int, host: str = "localhost", timeout: float = 0.5) -> bool:
    if not (0 <= int(port) <= 65535):
        raise ValueError("port must be between 0 and 65535")

    # If we're checking the local machine, binding is the cleanest test.
    local_hosts = {"localhost", "127.0.0.1", "::1"}
    if host in local_hosts:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind((host if host != "localhost" else "127.0.0.1", port))
                # If bind() succeeds, nobody else owns the port.
                return False
            except OSError as e:
                if e.errno == errno.EADDRINUSE:
                    return True  # Definitely in use
                if e.errno == errno.EACCES:
                    # Might be a privileged port; fall back to a quick connect test.
                    try:
                        with closing(socket.create_connection((host, port), timeout)):
                            return True
                    except OSError:
                        return False
                # Unexpected error -> assume not in use (or re-raise if you prefer)
                return False

    # Remote (or non-local) host: try connecting (open/listening => in use).
    try:
        with closing(socket.create_connection((host, port), timeout)):
            return True
    except OSError:
        return False

def find_next_free_port(start_port: int, num_tries: int = 256, host: str = "localhost") -> int | None:
    for port in range(start_port, start_port+num_tries):
        if not is_tcp_port_in_use(port, host):
            return port
    return None


if __name__ == "__main__":
    get_unpinned_cores_and_print_stats()
