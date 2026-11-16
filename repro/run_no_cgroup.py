from pathlib import Path
import runpy
import sys
import types


def main() -> None:
    script = Path(sys.argv[1]).resolve()
    log = Path(sys.argv[2]).resolve()

    def create_cgroup(_name: str, _limit_bytes: int) -> None:
        return None

    def attach(_cgroup: None, _pid: int) -> None:
        return None

    def reap(_cgroup: None) -> None:
        return None

    def remove_cgroup(_name: str) -> bool:
        return True

    shim = types.ModuleType("cgrp")
    shim.create_cgroup = create_cgroup
    shim.attach = attach
    shim.reap = reap
    shim.remove_cgroup = remove_cgroup
    sys.modules["cgrp"] = shim

    sys.path.insert(0, str(script.parent))
    sys.argv = [str(script), str(log)]
    runpy.run_path(str(script), run_name="__main__")


if __name__ == "__main__":
    main()
