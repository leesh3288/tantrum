#!/bin/env bash

set -eu

if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <root-folder>"
    exit 1
fi
readonly root_dir="$1"

if [[ ! -d "$root_dir" ]]; then
    echo "[!] Folder $root_dir does not seem to exist"
    exit 1
fi

if ! find "$root_dir" -name crashes -type d >/dev/null; then
    echo "[+] Failed to find any 'crashes' folder, are you sure you picked a root folder of a fuzzing run?"
    exit 1
fi

readonly reports_dir="$root_dir/reports"
readonly inputs_dir="$root_dir/inputs"
readonly interval=600
readonly timeout_val=5s

mkdir -p "$root_dir"
mkdir -p "$reports_dir"
mkdir -p "$inputs_dir"

export ASAN_OPTIONS="symbolize=1:abort_on_error=1:print_cmdline=1:exitcode=138:allocator_may_return_null=1"
export LD_LIBRARY_PATH=/work/fuzzer/target/release
export LOG_LEVEL=trace

tmp_file=$(mktemp)

while true; do

    find "$root_dir" -name crashes -type d -print0 | shuf -z | while read -d $'\0' crashes_folder
    do
        echo "[+] Processing crashes in $crashes_folder"
        find "$crashes_folder" -type f -iname "*.ron" -print0 | shuf -z | while read -d $'\0' file
        do
            hash=$(cat "$file" | md5sum | cut -d ' ' -f 1)
            input_file="$inputs_dir/${hash}.ron"

            if [[ ! -f "$file" ]]; then
                echo "[+] Ignoring $file since the file does not exists"
                continue
            fi

            echo "[+] Processing $file -> $input_file"
            if [[ -f $input_file ]]; then
                echo "[+] Already processed, skipping..."
                continue
            fi

            cp -a "$file" "$input_file"
            report_file="$reports_dir/${hash}.report"

            export INPUT="$input_file"
            set +e
            (
            trap 'exit 77' INT
            timeout -k $timeout_val "$timeout_val" /work/v8-build/out/fuzzing-build/d8 \
                --fuzzing --sandbox-fuzzing --single-threaded --allow-natives-syntax --expose-gc 2>&1 | tail -n 100000 > "$tmp_file"
            ret=${PIPESTATUS[0]}
            exit $ret
            )
            ret=$?
            set -e
            echo "[+] Exit code : $ret"

            if [[ $ret -eq 77 ]]; then
                echo "[+] Got SIGINT, terminating"
                exit 1
            fi

            if [[ ($ret -ge 128 && $ret -lt 160)]]; then
                signal=$((ret - 128))
                signal_name=$(kill -l $signal)

                echo "[+] Crash found!"
                echo "[+] Signal: $signal_name ($signal)"

                echo "// Input       : $input_file" > "$report_file"
                echo "// Exit reason : $signal_name ($signal) (ret=$ret)" >> "$report_file"
                cat "$tmp_file" >> "$report_file"
                touch -r "$file" "$report_file"
            fi
        done
    done

    echo "[+] Sleeping for $interval seconds before replaying again."
    sleep ${interval}s
done
