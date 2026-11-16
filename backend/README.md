# Running Tantrum

This backend uses V8 `c59dbe20` and its `mjsunit` test suite. We tested it on Ubuntu Server 24.04, x86-64. Run as root in a dedicated VM or disposable environment with cgroups v2 and at least two logical CPUs.

## Setup

Install Python 3.11 or later, `zstd`, and `wget`. From the repository root, install the dependencies, including `libdebug==0.9.0`:

```sh
cd deps
sh install_deps.sh
cd ..
```

Build the Intel PIN 3.31 preprocessor following [preprocessor/README.md](preprocessor/README.md), starting from `backend/preprocessor/`.

## Fuzzing

From the repository root:

```sh
cd backend/tantrum
zstd -dc builds/c59dbe20-eval/d8.zst > builds/c59dbe20-eval/d8
chmod +x builds/c59dbe20-eval/d8
tar -xzf c59dbe20-eval-mjsunit.tar.gz
python3 ../preprocessor/scan-accesses.py
python3 tantrum_orchestrator.py
```

The preprocessor writes `*.js.1.trace` beside the tests listed in `tests.txt`. The orchestrator uses these traces to select fault-injection sites and writes crash reports to `logs/`.

The included `known_bugs.json` is empty, matching the coverage evaluation.

For replay with `tantrum_repro.py`, create `logs/` first. See the [discovery replay instructions](../eval/discovery/README.md).

## Preprocessing ablation

Use `scan-accesses-nofilter.py` to collect memory loads up to the corresponding sandbox trace's endpoint, then `nofilter-stats.py` to count them by access type. Follow the [ablation instructions](preprocessor/README.md#ablation-study).
