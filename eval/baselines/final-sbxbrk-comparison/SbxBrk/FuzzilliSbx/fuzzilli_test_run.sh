#!/bin/env bash

set -eu

./fuzzilli/.build/release/FuzzilliCli \
    --profile=v8 \
    --jobs=16 \
    --wasm \
    --overwrite \
    --shareOfHeapCorruptions=0.9 \
    --storagePath="$PWD/test-run-storage" \
    $PWD/v8/v8/out/fuzzbuild/d8
