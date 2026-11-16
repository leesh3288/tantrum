# Evaluation Tooling
This folder contains scripts and seed files necessary to reproduce the evaluation experiments presented in the paper. Before running any experiment, the fuzzer, the target (V8) and FuzzilliSbx must be built (see [Preparation](#Preparation) below). Each of the scripts provided in [./scripts](./scripts) is intended to be used inside the Docker-based development environment described in the [parent module](https://github.com/SbxBrk/SbxBrk/blob/main/README.md). Please note that the scripts are using [uv](https://github.com/astral-sh/uv) for dependency management and should therefore be executed using `uv run <script>`, which will automatically pull any dependencies needed.

In the following, the reproduction experiments are explained in detail. Please read all sections from top to bottom, since information mentioned in the previous section is not necessarily repeated in the latter.

> [!NOTE]
> Throughout the paper's evaluation, we executed SbxBrk and FuzzilliSbx once, and used the resulting data to determine the number of bugs found and the coverage.
> We used a server equipped with AMD EPYC 9654 CPUs (totaling 192 physical cores / 384 logic cores) and 768 GB of RAM. On this server, we ran 384 fuzzer instances of each fuzzer for three days and 10 repetitions, resulting in 276.480 CPU hours of work per fuzzer.
Since running such experiments is typically infeasible for individuals, we split the evaluation into a bug experiment and a coverage experiment that both aim to provide steps to generate results that align with those found in the paper, without requiring a large amount of computational resources.

> [!WARNING]
> The provided script allocates one physical core per fuzzer instance using CPU pinning via [`sched_setaffinity`](https://man7.org/linux/man-pages/man2/sched_setaffinity.2.html). Each script will check if there are enough available physical CPU cores that are not pinned and will refuse to run if there are not.

## Citation
If you use SbxBrk in your research, please cite our paper:
```bibtex
@inproceedings{10.1145/3719027.3765027,
  author = {Bars, Nils and Bernhard, Lukas and Schloegel, Moritz and Holz, Thorsten},
  title = {Empirical Security Analysis of Software-based Fault Isolation through Controlled Fault Injection},
  year = {2025},
  isbn = {9798400715259},
  publisher = {Association for Computing Machinery},
  address = {New York, NY, USA},
  url = {https://doi.org/10.1145/3719027.3765027},
  doi = {10.1145/3719027.3765027},
  booktitle = {Proceedings of the 2025 ACM SIGSAC Conference on Computer and Communications Security},
  pages = {2639–2652},
  numpages = {14},
  keywords = {browser security, fuzzing, software-based fault isolation},
  location = {Taipei, Taiwan},
  series = {CCS '25}
}
```

## Preparation
Make sure that you build all components as described in the top-level `README.md` file.

The provided fuzzer expects that the system is configured in a certain way, optimized for fuzzing. This configuration must be applied manually by running the `./scripts/prepare_system.sh` script before performing any fuzzing.

## Bug Experiment
The goal of this experiment is to show that our fuzzer is capable of finding at least the six unique bugs we found when comparing to FuzzilliSbx (c.f. Section 5.2 Comparison with Baseline). This experiment can be performed in two different configurations with differing resource requirements.

> [!NOTE]
> Since we did not perform any bisecting on the bugs, there is no information on when a bug was introduced into V8 and can therefore be triggered. Thus, even if providing a seed file that contains the vulnerable code, it does not guarantee that all bugs can be triggered for a particular revision. Also, note that for finding **all** bugs, a considerable amount of computational resources have been used.

### #1 Reduced Resource Requirements (768 CPU hours) (recommended)
In this version of the experiment, the seed set of JavaScript files is limited to those that are known to contain bugs. For instance, for bug [#389970331](https://issues.chromium.org/u/2/issues/389970331), which was triggered when a specifically crafted `String` was converted to a `BigInt`, the seed set contains the file below, which uses the corresponding functionality to narrow the search space of the fuzzer:
```js
const v6 = new Int32Array(256);
const v = v6.join(1111111111111);
BigInt(v);
```

This condensed seed set can be found at [js_files/bug_seed_files](js_files/bug_seed_files) and contains a stripped-down version of all reproducers we submitted as part of the respective bug report.

Using this seed set, we have been able to rediscover 6+ bugs (including all those found when comparing against FuzzilliSbx, c.f. Table 1) using 32 cores and a timelimit of 24 hours. Reducing the resource even further may still work, but it causes fewer bugs to be discovered. Also, please note that fuzzing results are subject to nondeterminism, and bugs found in one run may never be found in another.

#### Starting the fuzzer
To run this experiment (without a timeout), use the following command:
```sh
uv run run_sbxbrk.py --jobs 32 --import-corpus ../js_files/bug_seed_files --storage bug_experiment_reduced
```
It can be stopped anytime by hitting ctrl+c. Also, using, e.g., `--timeout 5d`, a timeout can be specified if needed. Make sure to run the command in a `tmux` session if needed.

#### Replaying the crashes
During fuzzing and after termination of the fuzzers, all found crashes are located at  `<storage>/fuzzer-*/crashes` in the folder passed via the `--storage` flag. Each of these crashes can be manually replayed by setting the `INPUT` environment variable to the path of a crash file and afterwards running the V8 shell:
```sh
# Make sure that the V8 shell finds our fuzzer runtime.
export LD_LIBRARY_PATH="/work/fuzzer/target/release"
export INPUT=<root>/fuzzer-<n>/crashes/<crash-file>

# Make ASan print nice backtraces.
export ASAN_OPTIONS="symbolize=1:abort_on_error=1"

/work/v8-build/out/fuzzing-build/d8 --fuzzing --sandbox-fuzzing --single-threaded --allow-natives-syntax --expose-gc
```

Instead of manual replay, the `replay_crashes.sh` script can be used. This script takes the storage folder (passed above via `--storage`) as the only positional argument and replays all crashes found.
```sh
./replay_crashes.sh <storage>
```
After completion, this process is repeated every 600 seconds and terminated when the script is stopped. For all successfully replayed crashes, a report is generated in the `<storage-folder>/reports` directory. This report contains an ASan report and the path to the replayed crash file. In case a more detailed analysis of a crash is desired, the crash can be debugged using, e.g., `gdb` or `rr` and the manual replay mode explained above.
To determine which bug has been found, it is typically sufficient to compare the stack trace in a report (located in the `reports` folder) with those found alongside the bug reports in the Google bug tracker. Please note that some reports may show an OOB read instead of an OOB write, which is due to ASan terminating the target before the actual write happens.


### #2 Normal Resource Requirements (276.480 CPU hours)
The process of conducting this version of the experiment is exactly the same as the one above, except that the full, uncondensed seed set (`js_files/eval_corpus/js`) is used as the starting point. Thus, for running this experiment, the command is as follows:
```sh
uv run run_sbxbrk.py --jobs 384 --timeout 3d --import-corpus ../js_files/eval_corpus/js --storage bug_experiment_full-1
```
Note that this would have to be run 10 times in total to get meaningful results comparable to the ones presented in the paper. Make sure to run the command in a `tmux` session if needed.

> [!NOTE]
> In case you have the resource to perform this version of the experiment, you may reuse the generated data throughout the coverage experiment introduced below.



## Coverage Experiment
During the evaluation, the coverage of SbxBrk and FuzzilliSbx was measured (c.f. Section 5.2 and Figure 2). Similar to the previous experiment, this experiment comes in two flavors that differ in their computational resource requirements. In both cases, the goal is to execute SbxBrk and FuzzilliSbx and then compute the achieved coverage over time.


### #1 Reduced Resource Requirements (2304 CPU hours) (recommended)
In order to start the coverage evaluation for SbxBrk, you can use the script introduced previously.
```sh
uv run run_sbxbrk.py --jobs 16 --timeout 3d --dropout 0.9 --import-corpus ../js_files/eval_corpus/js --storage sbxbrk_coverage_experiment_reduced-1
```

For FuzzilliSbx you can start one coverage evaluation run as shown below:
```sh
uv run run_fuzzillisbx.py --jobs 16 --timeout 3d --import-corpus ../js_files/eval_corpus/fzil --storage fuzzillisbx_coverage_experiment_reduced-1
```

Ensure you run the command in a `tmux` session if necessary.
To achieve better statistical properties, these runs should be repeated multiple times for each fuzzer. This can be achieved by, e.g., wrapping the commands in a for loop.
```sh
for((i=0;i<10;i++)); do
    uv run run_sbxbrk.py --jobs 32 --timeout 1d --import-corpus ../js_files/eval_corpus/js --storage sbxbrk_coverage_experiment_reduced-$i
    uv run run_fuzzillisbx.py --jobs 32 --timeout 1d --import-corpus ../js_files/eval_corpus/fzil --storage fuzzillisbx_coverage_experiment_reduced-$i
done
```

#### Computing the coverage
In order to compute the coverage for a run that terminated, the `compute_raw_coverage.py` can be used. This script processes each found input via `afl-showmap`. Alongside each found file, another file with a `.afl_map.txt` suffix is stored that contains the edges covered by the respective file.

For starting the coverage computation, the following commands are used:
```sh
# To compute the coverage for an SbxBrk run that
# was stored in the `sbxbrk_coverage_experiment_reduced-1` folder.
uv run compute_raw_coverage.py --fuzzer SbxBrk --job 32  sbxbrk_coverage_experiment_reduced-1

# To compute the coverage for a FuzzilliSbx run that
# was stored in the `fuzzillisbx_coverage_experiment_reduced-1` folder.
uv run compute_raw_coverage.py --fuzzer FuzzilliSbx --job 32  fuzzillisbx_coverage_experiment_reduced-1
```

When the raw coverage has been computed, the next step is to convert the raw data into coverage over time via the `process_raw_coverage.py` script:
```sh
# The `--storage` and `--input-dir` typically take the same folder.
# The passed folder must contain raw coverage data computed in the previous step.

# For SbxBrk
uv run process_raw_coverage.py --storage sbxbrk_coverage_experiment_reduced-1 --input-dir sbxbrk_coverage_experiment_reduced-1

# For FuzzilliSbx
uv run process_raw_coverage.py --storage fuzzillisbx_coverage_experiment_reduced-1 --input-dir fuzzillisbx_coverage_experiment_reduced-1
```

#### Plotting the coverage
Eventually, the coverage graphs can be plotted using the command below. If there are multiple runs, the `--add-*` flags can be repeated for each run.
```sh
uv run plot.py --add-sbxbrk-storage sbxbrk_coverage_experiment_reduced-1 --add-fuzzillisbx-storage fuzzillisbx_coverage_experiment_reduced-1 --storage coverage_graphs --purge
```

The plot should look similar to Figure 2 in the paper.



### #2 Normal Resource Requirements (552.960 CPU hours)
The version of the experiment uses the same scripts as the one with reduced resource requirements, except that the number of cores and the timeouts differ. Each of the commands would need to be executed ten times using a different `--storage` folder each. However, using less than 10 repetitions should be sufficient to observe the same trend as in the paper.

To start the evaluation for SbxBrk, the command is the following:
```sh
uv run run_sbxbrk.py --jobs 384 --timeout 3d --import-corpus ../js_files/eval_corpus/js --storage sbxbrk_coverage_experiment_full-1
```

For FuzzilliSbx, the command is as follows:
```sh
uv run run_fuzzillisbx.py --jobs 384 --timeout 3d --import-corpus ../js_files/eval_corpus/fzil --storage fuzzillisbx_coverage_experiment_full-1
```

After finishing a run, the coverage can be computed as explained in the experiment above.