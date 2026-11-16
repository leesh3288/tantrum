#!/bin/env bash

# may fail for AMD
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor >/dev/null

set -eu
echo core | sudo tee /proc/sys/kernel/core_pattern >/dev/null
echo 0 | sudo tee /proc/sys/fs/suid_dumpable >/dev/null
echo 1 | sudo tee /proc/sys/kernel/perf_event_paranoid >/dev/null
echo 1 | sudo tee /proc/sys/kernel/shm_rmid_forced >/dev/null