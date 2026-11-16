#!/usr/bin/env bash

max_jobs=$(( $(nproc) / 2 ))
max_jobs=$(( max_jobs > 0 ? max_jobs : 1 ))

# Snapshot file list before any repro files are created
mapfile -t files < <(ls logs/*.txt 2>/dev/null)
total=${#files[@]}

if (( total == 0 )); then
    echo "No log files found in logs/"
    exit 0
fi

echo "=== Starting repro runs: $total files, max $max_jobs parallel jobs ==="

for f in "${files[@]}"; do
    base="$(basename "$f" .txt)"
    repro_name="REPRO_${base}"
    repro_file="logs/${repro_name}.txt"
    started=$((started + 1))

    echo "[START $started/$total] $f -> $repro_name"

    (
        if python3 tantrum_repro_no_abort.py "$f" "$repro_name"; then
            echo "[DONE  $repro_name] succeeded"
        else
            echo "[FAIL  $repro_name] exit code $?"
        fi

        # Post-process if the repro file was created
        if [[ -f "$repro_file" ]]; then
            # Extract everything before the first "[*] ===== testcase ====="
            header=$(awk '/^\[\*\] ===== testcase =====/{exit} {print}' "$f")

            if [[ -n "$header" ]]; then
                # Prepend header to the repro file
                tmp=$(mktemp)
                { printf '%s\n' "$header"; cat "$repro_file"; } > "$tmp"
                mv "$tmp" "$repro_file"
            fi

            # Mark original log as done
            mv "$f" "${f}.done"
            echo "[POST  $repro_name] prepended header, renamed $f -> ${f}.done"
        fi
    ) &

    while (( $(jobs -rp | wc -l) >= max_jobs )); do
        sleep 0.1
    done
done

wait

echo "=== All $total repro runs finished ==="
