# Coverage comparison

The comparison uses V8 `4715559` and Fuzzilli `f31876f`. SbxBrk, Tantrum+SbxBrk, Tantrum-native, and V8SbxFuzzer use the [SbxBrk evaluation corpus](../baselines/README.md). Tantrum+Mjsunit adds V8's `mjsunit` suite.

## Coverage figure

From `eval/comparison/`, with Python 3.11+ and Matplotlib:

```sh
MPLBACKEND=Agg python3 coverage/plot_five.py
```

This writes `coverage/coverage_5way.pdf`, `.png`, and `.svg` from these inputs:

| Curve | Input |
| --- | --- |
| SbxBrk | `coverage/data/sbxbrk-ts_to_num_covered_edged.json` |
| Tantrum+SbxBrk | `coverage/data/tantrum-on-sbxbrk.tar.gz`, member `tantrum/tantrum_orchestrator_log.log` |
| Tantrum-native | `coverage/data/tantrum-native-exp.tar.gz`, member `tantrum_orchestrator_log.log` |
| Tantrum+Mjsunit | `coverage/data/tantrum-merged-exp.tar.gz`, member `tantrum_orchestrator_log.log` |
| V8SbxFuzzer | `coverage/data/v8sbxfuzzer-ts_to_num_covered_edged.json` |

Only observations up to 24 hours are used. Curves ending earlier are extended linearly using their last two samples. Printed coverage values are the last observations before extension.

To collect coverage for a new baseline run, use [compute_raw_coverage.py](../baselines/final-sbxbrk-comparison/SbxBrk/evaluation/scripts/compute_raw_coverage.py) and [process_raw_coverage.py](../baselines/final-sbxbrk-comparison/SbxBrk/evaluation/scripts/process_raw_coverage.py). They process the generated inputs and per-input `.afl_map.txt` edge maps into coverage JSON.

## Crash logs

| Configuration | Logs | Bugs found |
| --- | --- | ---: |
| Tantrum-native | `evidence/tantrum-native/TP/` | 8 |
| SbxBrk | `evidence/sbxbrk/TP/` and `evidence/sbxbrk/FN/` | 8 |
| V8SbxFuzzer | `evidence/v8sbxfuzzer/TP/` | 3 |

`TP/390568183-390816209/` corresponds to b/390816209.

`evidence/tantrum-mjsunit/TP/` includes the three additional bugs found with the expanded corpus: b/386565139, b/388616182, and b/435630464. V8SbxFuzzer's raw crash programs are in `evidence/v8sbxfuzzer/raw-crashes/`.

Worker logs are in `logs/sbxbrk-worker-logs.tar.gz` and `logs/v8sbxfuzzer-worker-logs.tar.gz`. SbxBrk crash reports are in `logs/sbxbrk-raw-reports.tar.gz`. The Tantrum orchestrator logs are in the coverage archives listed above.

## Tantrum configurations

| Source directory | Corpus | Target path |
| --- | --- | --- |
| `source/tantrum-sbxbrk-mod/` | SbxBrk evaluation corpus | `/work/v8-build/out/fuzzing-build/d8` |
| `source/tantrum-native/` | 27,195 SbxBrk JS inputs | `/work/v8-build/out/fair-build/d8` |
| `source/tantrum-mjsunit/` | The same 27,195 inputs plus 7,390 `mjsunit` tests | `/work/v8-build/out/fair-build/d8` |

The Mjsunit preprocessor and fuzzer read per-test `// Flags:` comments and load `mjsunit.js` before each Mjsunit test.

## Prepare d8

The target bundle contains `d8`, its runtime data files, and the `mjsunit` tests.

On Linux, from `eval/comparison/`:

```sh
mkdir -p /work/v8-build
tar -xzf target/d8-4715559d4f-native-build-bundle.tar.gz -C /work/v8-build
```

To rebuild `d8`, follow the [native build instructions](target/native-build/README.md).

For Tantrum+SbxBrk, build SbxBrk's instrumented `fuzzing-build/d8` using the [SbxBrk setup](../baselines/README.md#sbxbrk-comparison).

## Run a Tantrum configuration

Install the [backend dependencies](../../backend/README.md#setup), then NumPy:

```sh
python3 -m pip install --break-system-packages numpy
```

From `eval/comparison/`, extract the shared corpus to the path used by `tests.txt`:

```sh
mkdir -p /work/evaluation/js_files/eval_corpus
tar -xzf ../baselines/final-sbxbrk-comparison/shared-eval-corpus-js.tar.gz -C /work/evaluation/js_files/eval_corpus
```

Build the PIN tracer in the chosen configuration's `preprocessor/` directory, following steps 1–2 of its README. In that configuration's `preprocessor/scan-accesses.py`, set these paths for running from the configuration directory:

```python
PIN_PATH = './preprocessor/pin/pin'
TRACER_PATH = './preprocessor/pin/v8sbx-tracer/obj-intel64/v8sbx-tracer.so'
```

For Tantrum+Mjsunit, also link the test suite from `source/tantrum-mjsunit/`:

```sh
mkdir -p test
ln -s /work/v8-build/test/mjsunit test/mjsunit
```

From the chosen configuration directory, preprocess and start the fuzzer:

```sh
python3 preprocessor/scan-accesses.py
python3 tantrum_orchestrator.py
```

## Replay

Replay scripts read the input and executable paths from each log's `Input:` and `CMD:` lines.

Some saved crash-analysis logs use `x8`, a copy of `d8` modified with [patch_load.py](source/tantrum-native/patch_load.py). For those replays, from `eval/comparison/` on Linux with GNU binutils (`readelf` and `nm`):

```sh
python3 source/tantrum-native/patch_load.py /work/v8-build/out/fair-build/d8 /work/v8-build/out/fair-build/x8
```

The patcher suppresses ASan load reports. On the bundled build, it also disables some destination checks in `__asan_memcpy` and `__asan_memmove`.
