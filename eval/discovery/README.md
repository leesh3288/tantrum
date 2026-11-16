# Vulnerability discovery

| Paper label | Issue ID | Crash logs |
| --- | --- | --- |
| Bug #0 | b/390639820 | `crashlog/Bug0-ArrayPrototypeSort-builtins-fn-corruption/` |
| Bug #1 | b/390816209 | `crashlog/Bug1-MessageTemplate-enum-switch-oob/` |
| Bug #2 | b/390993097 | `crashlog/Bug2-BytecodeBuilder-async-confusion/` |
| Bug #3 | b/393395932 | `crashlog/Bug3-AstValueFactory-GetString-bounded-wildcopy/` |
| Bug #4 | b/394350433 | `crashlog/Bug4-WasmToJsWrapper-Turboshaft-params-overflow/` |
| Bug #5 | b/394635429 | `crashlog/Bug5-RegExp-double-parse-capture-oob/` |
| Bug #6 | b/395659804 | `crashlog/Bug6-OSR-DeoptimizationData-confusion/` |
| Bug #7 | b/395895382 | `crashlog/Bug7-ReduceCallOrConstructWithArrayLikeOrSpread-oob/` |
| Bug #8 | b/403600260 | `crashlog/Bug8-Maglev-TryBuildAndAllocateJSGenerator-uninit-switch/` |
| Bug #9 | b/435630464 | `crashlog/Bug9-b435630464/` |
| Bug #10 | b/441949792 | `crashlog/Bug10-PushBoundArguments-dfetch/` |

## Replay

Install the [backend dependencies](../../backend/README.md#setup) first.

For the `tantrum-dev` replays, work from `eval/discovery/tantrum-dev/` and extract the test suite:

```sh
mkdir -p test
tar -xzf mjsunit.tar.gz -C test
```

Run each recorded `# REPRO:` command from its `repro-info.txt` in that directory.

For the Bug #9 JSAtomicsCondition variant and Bug #10, first follow the [backend setup](../../backend/README.md). Then, from `backend/tantrum/`:

```sh
mkdir -p logs
python3 tantrum_repro.py ../../eval/discovery/crashlog/Bug9-b435630464/historical-JSAtomicsCondition/v8sbx-fuzz-5906-67843.txt
python3 tantrum_repro.py ../../eval/discovery/crashlog/Bug10-PushBoundArguments-dfetch/v8sbx-prune-1915-0x55555bd34e00-1.txt
```

The Bug #9 logs use `--harmony-struct`. See [SOURCE-README.md](SOURCE-README.md#symbolization) for symbolization notes.
