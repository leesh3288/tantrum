#!/bin/env bash

set -eu

if [[ ! -d "v8" ]]; then
    (
    mkdir v8
    cd v8
    fetch v8
    cd v8
    git checkout 4715559d4fe2ce6e2c0f6de3c966347b6da6a489
    gclient sync -D
    ./build/install-build-deps.sh
    )
fi

cd v8/v8

gn gen out/fuzzbuild --args="
    symbol_level=2
    use_dwarf5=true
    v8_enable_memory_corruption_api=true
    v8_enable_sandbox=true
    is_asan=true
    is_debug=false
    dcheck_always_on=false
    v8_static_library=true
    v8_fuzzilli=true
    sanitizer_coverage_flags=\"trace-pc-guard\"
    target_cpu=\"x64\"
    "

ninja -C ./out/fuzzbuild d8
