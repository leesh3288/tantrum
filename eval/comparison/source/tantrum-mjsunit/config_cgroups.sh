#!/bin/bash

mkdir -p /sys/fs/cgroup/init.scope
for pid in $(cat /sys/fs/cgroup/cgroup.procs); do
  echo "$pid" > /sys/fs/cgroup/init.scope/cgroup.procs 2>/dev/null || true
done
echo "+memory" > /sys/fs/cgroup/cgroup.subtree_control
