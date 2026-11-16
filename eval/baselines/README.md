# Baselines

## V8SbxFuzzer comparison

Follow [final-v8sbxfuzzer/README.md](final-v8sbxfuzzer/README.md) to build and run the V8SbxFuzzer port used in the 24-hour comparison.

## SbxBrk comparison

We use the public SbxBrk artifact and its evaluation configuration. Follow [SbxBrk's setup instructions](https://github.com/SbxBrk/SbxBrk#setup) to build its environment, AFL++, fuzzer, and V8, then complete its [evaluation preparation](https://github.com/SbxBrk/evaluation#preparation).

The shared evaluation corpus is split by input format:

| Archive | Inputs |
| --- | ---: |
| `final-sbxbrk-comparison/shared-eval-corpus-js.tar.gz` | 27,195 JavaScript files |
| `final-sbxbrk-comparison/shared-eval-corpus-fzil.tar.gz` | 27,271 Fuzzilli files |

Set `sbxbrk_checkout` to the absolute path of your complete SbxBrk checkout. From `final-sbxbrk-comparison/`, copy the supplied evaluation scripts and extract the corpora into that checkout:

```sh
cp -R SbxBrk/evaluation/scripts/. "${sbxbrk_checkout:?}/evaluation/scripts/"
mkdir -p "$sbxbrk_checkout/evaluation/js_files/eval_corpus"
tar -xzf shared-eval-corpus-js.tar.gz -C "$sbxbrk_checkout/evaluation/js_files/eval_corpus"
tar -xzf shared-eval-corpus-fzil.tar.gz -C "$sbxbrk_checkout/evaluation/js_files/eval_corpus"
```

Inside the SbxBrk container, run the 24-hour comparison with 48 workers and dropout `0.9`:

```sh
cd /work/evaluation/scripts
uv run run_sbxbrk.py --jobs 48 --timeout 1d --dropout 0.9 \
  --import-corpus ../js_files/eval_corpus/js --storage sbxbrk-comparison
```

Use a new storage directory for each run. The separate `bug_seed_files/` inputs belong to SbxBrk's reduced-resource bug experiment.
