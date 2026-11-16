#!/bin/env bash

set -eu

if [[ ! -d "fuzzilli" ]]; then
    (
    git clone https://github.com/googleprojectzero/fuzzilli.git
    cd fuzzilli
    git checkout f31876fff984ef7050adcdbe7f4c8bb3255ed8d0
    git apply ../fuzzilli.patch
    )
fi

cd fuzzilli
swift build -c release
