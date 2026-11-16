# V8SbxFuzzer comparison

The comparison uses the `v8Sandbox` profile in `FuzzilliSbx/fuzzilli/`, based on Fuzzilli `f31876f`, with V8 `4715559`.

## Build

On x86-64 Linux, from this directory, extract the corpus and build the Docker environment:

```sh
mkdir -p evaluation/js_files/eval_corpus
tar -xzf ../final-sbxbrk-comparison/shared-eval-corpus-fzil.tar.gz -C evaluation/js_files/eval_corpus
bash env/build.sh
docker run -it --privileged --tmpfs /tmp:exec --shm-size=64G \
  --ulimit msgqueue=2097152000 \
  -v "$PWD:/work" -w /work v8-heap-sandbox-artifact-env:latest bash
```

Inside the container, build the supplied Fuzzilli source and V8:

```sh
cd /work/FuzzilliSbx
bash build_fuzzilli.sh
bash build_v8.sh
```

## Run

The 24-hour experiment uses 48 workers:

```sh
cd /work/evaluation/scripts
/home/user/.local/bin/uv run run_v8sandbox.py \
  --import-corpus ../js_files/eval_corpus/fzil \
  --jobs 48 --timeout 1d --storage /work/results/v8sbxfuzzer
```

Use a new storage directory for each run. The runner starts Fuzzilli with `--profile=v8Sandbox --wasm`, pins workers to CPUs, and writes logs and crash programs under the storage directory.
