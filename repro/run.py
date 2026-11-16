"""Replay the saved Tantrum crash records bundled in the Docker image."""

import argparse
from datetime import datetime, timezone
import os
from pathlib import Path
import shlex
import shutil
import signal
import subprocess
import sys
import tempfile


ROOT = Path(os.environ.get("TANTRUM_REPRO_ROOT", "/work/replay"))
RESULTS = Path(os.environ.get("TANTRUM_REPRO_RESULTS", "/results"))
SHIM = Path(__file__).with_name("run_no_cgroup.py")
BUGS = (0, 2, 3, 4, 5, 6, 7, 8, 9, 10)
COMPARISON = {
    "native-x8": ("native", "native-x8.txt", "Detected via heuristics: pc-control"),
    "native-d8": ("native", "native-d8.txt", "V8 sandbox violation"),
    "mjsunit-x8": ("mjsunit", "mjsunit-x8.txt", "V8 sandbox violation"),
}


def command_for(case: str) -> tuple[list[str], Path, Path, str]:
    if case in COMPARISON:
        variant, filename, marker = COMPARISON[case]
        cwd = ROOT / "comparison" / variant
        log = ROOT / "comparison" / "evidence" / filename
        command = [sys.executable, str(SHIM), str(cwd / "tantrum_repro.py"), str(log)]
        return command, cwd, cwd / "logs/repro.txt", marker

    number = int(case)
    if number in (9, 10):
        cwd = ROOT / "backend"
        relative_log = (
            "Bug9-b435630464/historical-JSAtomicsCondition/v8sbx-fuzz-5906-67843.txt"
            if number == 9
            else "Bug10-PushBoundArguments-dfetch/v8sbx-prune-1915-0x55555bd34e00-1.txt"
        )
        log = ROOT / "crashlog" / relative_log
        command = [sys.executable, str(SHIM), str(cwd / "tantrum_repro.py"), str(log)]
        marker = (
            "V8 sandbox violation"
            if number == 9
            else "Detected via heuristics: pc-control"
        )
        return command, cwd, cwd / "logs/repro.txt", marker

    info_files = list((ROOT / "crashlog").glob(f"Bug{number}-*/repro-info.txt"))
    if len(info_files) != 1:
        raise RuntimeError(f"expected one repro-info.txt for Bug #{number}, found {len(info_files)}")
    lines = info_files[0].read_text().splitlines()
    recorded = [line[len("# REPRO: "):] for line in lines if line.startswith("# REPRO: ")]
    if len(recorded) != 1:
        raise RuntimeError(f"expected one recorded replay command for Bug #{number}")
    command = shlex.split(recorded[0])
    if command[0] != "python3" or "repro" not in command:
        raise RuntimeError(f"recorded command for Bug #{number} is not a replay command")
    command[0] = sys.executable
    cwd = ROOT / "discovery"
    return command, cwd, cwd / "repro.txt", "V8 sandbox violation"


def run_case(case: str, output: Path, timeout: int) -> bool:
    command, cwd, report, marker = command_for(case)
    if not cwd.is_dir():
        raise RuntimeError(f"missing replay directory: {cwd}")
    previous_mtime = report.stat().st_mtime_ns if report.exists() else None
    log_file = output / f"{case}.log"
    timed_out = False

    with log_file.open("wb") as stream:
        process = subprocess.Popen(
            command,
            cwd=cwd,
            stdout=stream,
            stderr=subprocess.STDOUT,
            start_new_session=True,
        )
        try:
            exit_code = process.wait(timeout=timeout)
        except subprocess.TimeoutExpired:
            timed_out = True
            try:
                os.killpg(process.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            exit_code = process.wait()

    report_file = output / f"{case}.report.txt"
    if report.exists() and report.stat().st_mtime_ns != previous_mtime:
        shutil.copy2(report, report_file)
    report_text = report_file.read_text(errors="replace") if report_file.exists() else ""
    matched = not timed_out and marker in report_text
    status = "PASS" if matched else "FAIL"
    print(f"{case}: {status} (exit {exit_code})")
    print(f"  log: {log_file}")
    if report_file.exists():
        print(f"  report: {report_file}")
    if timed_out:
        print(f"  timed out after {timeout}s")
    elif not matched:
        print(f"  expected marker: {marker}")
    return matched


def main() -> int:
    parser = argparse.ArgumentParser(description="Replay saved Tantrum crash records")
    parser.add_argument("case", nargs="?", default="all")
    parser.add_argument("--timeout", type=int, default=120, help="seconds per case")
    args = parser.parse_args()
    if args.timeout <= 0:
        parser.error("--timeout must be positive")

    if args.case == "list":
        print("Bugs:", " ".join(map(str, BUGS)))
        print("Comparison samples:", " ".join(COMPARISON))
        return 0
    if args.case == "all":
        cases = tuple(map(str, BUGS))
    elif args.case == "comparison-all":
        cases = tuple(COMPARISON)
    elif args.case in COMPARISON or args.case in tuple(map(str, BUGS)):
        cases = (args.case,)
    else:
        parser.error(f"unknown case: {args.case}")

    RESULTS.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    output = Path(tempfile.mkdtemp(prefix=f"run-{timestamp}-", dir=RESULTS))
    print(f"Results: {output}", flush=True)
    passed = True
    for case in cases:
        try:
            if not run_case(case, output, args.timeout):
                passed = False
        except Exception as exc:
            passed = False
            print(f"{case}: ERROR ({exc})")
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
