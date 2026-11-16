#!/usr/bin/env python3

import os, signal, time
from pathlib import Path

CGROUP_ROOT = Path("/sys/fs/cgroup")


def is_cgroups_v2() -> bool:
  return CGROUP_ROOT.joinpath("cgroup.controllers").exists()


def ensure_memory_controller() -> None:
  subtree_ctl = CGROUP_ROOT / "cgroup.subtree_control"
  if b"+memory" not in subtree_ctl.read_bytes():
    subtree_ctl.write_text("+memory\n")


def create_cgroup(name: str, limit_bytes: int) -> str:
  cg = CGROUP_ROOT / name
  cg.mkdir(exist_ok=True)
  (cg / "memory.max").write_text(f"{limit_bytes}\n")
  return str(cg)


def attach(cg: str, pid: int) -> None:
  (Path(cg) / "cgroup.procs").write_text(f"{pid}\n")


def reap(cg: str) -> None:
  procs = Path(cg) / "cgroup.procs"
  for pid in [int(p) for p in procs.read_text().split()]:
    try:
      os.kill(pid, signal.SIGKILL)
    except OSError:   # includes ProcessLookupError
      pass


def remove_cgroup(name: str) -> bool:
  cg = (CGROUP_ROOT / name)
  if not cg.exists():
    return True
  # attempt at most three times to give kernel some time to reap dying processes
  for _ in range(3):
    try:
      cg.rmdir()
      return True
    except OSError:
      time.sleep(0.1)
  return False
