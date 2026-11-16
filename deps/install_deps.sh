#!/bin/sh

sysctl -w 'kernel.core_pattern=|/bin/false'
apt update && DEBIAN_FRONTEND=noninteractive apt install -y python3 python3-dev libdwarf-dev libelf-dev libiberty-dev linux-headers-generic libc6-dbg python3-pip vim gdb build-essential
python3 -m pip install --break-system-packages libdebug==0.9.0 capstone tqdm
patch -p1 -d /usr/local/lib/python3*/dist-packages/libdebug < libdebug.patch
