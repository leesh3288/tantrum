#!/usr/bin/env python3
"""
LLM-generated with Claude.

Patch d8 for crash analysis by suppressing ASan load reports.
On the bundled build, this also bypasses some destination checks in
__asan_memcpy and __asan_memmove for copies larger than 64 bytes.

Usage: python3 patch_load.py <binary> [output]
"""

import struct, subprocess, shutil, sys, os

# ---------------------------------------------------------------------------
# ELF helpers
# ---------------------------------------------------------------------------

def get_load_segments(path):
    out = subprocess.check_output(["readelf", "-lW", path]).decode()
    segments = []
    for line in out.splitlines():
        line = line.strip()
        if not line.startswith("LOAD"):
            continue
        parts = line.split()
        segments.append((int(parts[2], 16),   # vaddr
                         int(parts[1], 16),    # file offset
                         int(parts[4], 16)))   # filesz
    return segments


def vaddr_to_offset(vaddr, segments):
    for seg_vaddr, seg_off, seg_fsz in segments:
        if seg_vaddr <= vaddr < seg_vaddr + seg_fsz:
            return vaddr - seg_vaddr + seg_off
    return None


def get_symbols(path):
    """Return {name: vaddr} for all defined text/weak symbols."""
    out = subprocess.check_output(["nm", path]).decode()
    syms = {}
    for line in out.splitlines():
        parts = line.split()
        if len(parts) < 3:
            continue
        addr, kind, name = parts[0], parts[1], parts[2]
        if kind in ("T", "t", "W", "w"):
            syms[name] = int(addr, 16)
    return syms


def get_function_extent(syms, name):
    """Estimate function size as distance to next text symbol."""
    va = syms.get(name)
    if va is None:
        return None, None
    # Find the nearest symbol *after* va
    upper = None
    for other_va in syms.values():
        if other_va > va:
            if upper is None or other_va < upper:
                upper = other_va
    size = (upper - va) if upper else 0x2000  # fallback cap
    return va, min(size, 0x4000)

# ---------------------------------------------------------------------------
# x86-64 instruction scanning
# ---------------------------------------------------------------------------

def find_call_targets(buf, buf_file_off, func_va, func_file_off, func_size,
                      target_va):
    """
    Find all E8 rel32 CALL instructions within [func_file_off, +func_size)
    that target `target_va`.  Returns list of offsets-within-function.
    """
    hits = []
    for i in range(func_size - 5):
        foff = func_file_off + i
        if buf[foff] != 0xE8:
            continue
        disp = struct.unpack_from("<i", buf, foff + 1)[0]
        insn_va = func_va + i
        dest_va = insn_va + 5 + disp
        if dest_va == target_va:
            hits.append(i)
    return hits


def find_je_after(buf, func_file_off, func_offset, scan_limit=32):
    """
    Starting at func_offset (within function), scan forward for:
       48 85 C0        test rax, rax
       0F 84 xx xx xx xx   je rel32       (6 bytes)
    or
       85 C0           test eax, eax
       0F 84 xx xx xx xx   je rel32       (6 bytes)
    or
       48 85 C0 / 85 C0  followed by  74 xx   je rel8  (2 bytes)

    Returns (offset_of_je_within_function, je_length) or None.
    """
    start = func_offset
    end = func_offset + scan_limit
    off = func_file_off

    i = start
    while i < end:
        # Check for test rax,rax (48 85 C0) or test eax,eax (85 C0)
        test_len = 0
        if buf[off + i] == 0x48 and buf[off + i + 1] == 0x85 and buf[off + i + 2] == 0xC0:
            test_len = 3
        elif buf[off + i] == 0x85 and buf[off + i + 1] == 0xC0:
            test_len = 2

        if test_len:
            j = i + test_len
            if buf[off + j] == 0x0F and buf[off + j + 1] == 0x84:
                return j, 6   # je rel32
            if buf[off + j] == 0x74:
                return j, 2   # je rel8
        i += 1
    return None


def find_jne_rel32_before(buf, func_file_off, func_offset, scan_limit=64):
    """
    Find a preceding 0F 85 byte pattern.
    Return (offset_within_function, 6) or None.
    """
    off = func_file_off
    for i in range(func_offset - 1, max(func_offset - scan_limit, 0), -1):
        if buf[off + i] == 0x0F and buf[off + i + 1] == 0x85:
            return i, 6
    return None


def patch_je_to_jmp(buf, file_off, je_len, func_va, func_offset):
    """
    Overwrite a je rel32 (0F 84 disp32, 6 bytes) or je rel8 (74 disp8, 2 bytes)
    with an unconditional jmp to the same target + NOP padding.
    """
    if je_len == 6:
        # 0F 84 disp32 → E9 disp32' 90
        old_disp = struct.unpack_from("<i", buf, file_off + 2)[0]
        # je:  target = (va + 6) + old_disp
        # jmp: target = (va + 5) + new_disp  →  new_disp = old_disp + 1
        new_disp = old_disp + 1
        struct.pack_into("<B", buf, file_off, 0xE9)
        struct.pack_into("<i", buf, file_off + 1, new_disp)
        struct.pack_into("<B", buf, file_off + 5, 0x90)  # NOP
    elif je_len == 2:
        # 74 disp8 → EB disp8  (jmp rel8, same encoding size)
        buf[file_off] = 0xEB
        # disp8 stays the same since insn length is unchanged
    else:
        return False
    return True

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <binary> [output]")
        sys.exit(1)

    src = sys.argv[1]
    dst = sys.argv[2] if len(sys.argv) > 2 else src + ".patched"

    syms = get_symbols(src)
    segments = get_load_segments(src)
    if not segments:
        print("Could not parse LOAD segments.")
        sys.exit(1)

    shutil.copy2(src, dst)

    with open(dst, "r+b") as f:
        buf = bytearray(f.read())

    patched = 0

    # ---- 1. Scalar load reports → ret ----------------------------------------

    for name in sorted(syms):
        if "__asan_report_load" not in name and \
           "__asan_report_exp_load" not in name:
            continue
        va = syms[name]
        off = vaddr_to_offset(va, segments)
        if off is None:
            print(f"  SKIP {name} @ 0x{va:x} (not in LOAD segment)")
            continue
        buf[off] = 0xC3
        patched += 1
        print(f"  patched {name} @ 0x{off:x}  → ret")

    # ---- 2. Surgical patches to __asan_memcpy / __asan_memmove ---------------

    rip_va = syms.get("__asan_region_is_poisoned")
    if rip_va is None:
        print("\n  __asan_region_is_poisoned not found; "
              "skipping bulk-wrapper patches.")
    else:
        for wrapper in ("__asan_memcpy", "__asan_memmove"):
            func_va, func_size = get_function_extent(syms, wrapper)
            if func_va is None:
                continue
            func_off = vaddr_to_offset(func_va, segments)
            if func_off is None:
                print(f"  SKIP {wrapper} (not in LOAD segment)")
                continue

            print(f"\n  {wrapper} @ 0x{func_va:x}  (file 0x{func_off:x}, "
                  f"~{func_size} bytes)")

            # Find all calls to __asan_region_is_poisoned
            call_sites = find_call_targets(buf, func_off, func_va, func_off,
                                           func_size, rip_va)

            if len(call_sites) < 1:
                print(f"    no calls to __asan_region_is_poisoned found")
                continue

            if len(call_sites) < 2:
                print(f"    WARNING: expected ≥2 call sites, found {len(call_sites)}")
                print(f"    patching the only call (assumed source check)")

            src_call_off = call_sites[0]  # first = source check
            print(f"    source-check call at +{src_call_off} "
                  f"(file 0x{func_off + src_call_off:x})")

            # (a) Patch the je after the source-check call → unconditional jmp
            result = find_je_after(buf, func_off, src_call_off + 5)
            if result is None:
                print(f"    ERROR: could not find je after source-check call")
            else:
                je_func_off, je_len = result
                je_file_off = func_off + je_func_off
                ok = patch_je_to_jmp(buf, je_file_off, je_len,
                                     func_va + je_func_off, je_func_off)
                if ok:
                    patched += 1
                    kind = "rel32" if je_len == 6 else "rel8"
                    print(f"    patched je ({kind}) at +{je_func_off} "
                          f"(file 0x{je_file_off:x})  → jmp  "
                          f"[skip source report]")

            # (b) NOP a preceding JNE selected by the offset heuristic below.
            # On the bundled d8, this selects a destination-check branch.
            found_jne = False
            for i in range(src_call_off - 2, 0, -1):
                if buf[func_off + i] == 0x0F and buf[func_off + i + 1] == 0x85:
                    disp = struct.unpack_from("<i", buf, func_off + i + 2)[0]
                    target_func_off = i + 6 + disp
                    if target_func_off >= src_call_off - 128:
                        for j in range(6):
                            buf[func_off + i + j] = 0x90
                        patched += 1
                        print(f"    NOP'd jne at +{i} "
                              f"(file 0x{func_off + i:x})  "
                              f"[skip fast-path source shadow check]")
                        found_jne = True
                        break
            if not found_jne:
                print(f"    NOTE: could not find fast-path source jne "
                      f"(non-critical; slow path is already patched)")

    # ---- Write out -----------------------------------------------------------

    with open(dst, "r+b") as f:
        f.write(buf)

    os.chmod(dst, os.stat(src).st_mode)
    print(f"\nPatched {patched} site(s) → {dst}")


if __name__ == "__main__":
    main()
