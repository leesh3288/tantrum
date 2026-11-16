# Crashlog

Crash logs from vulnerability discovery.

## Reproduction

- Extract `./tantrum-dev/mjsunit.tar.gz` within `./tantrum-dev/test`.
- Saved replay commands are marked `# REPRO:` in `repro-info.txt`.
- Run each saved command with `./tantrum-dev` as the current working directory.


## Symbolization

The [dependency installer](../../deps/install_deps.sh) applies the symbolization fix in [libdebug.patch](../../deps/libdebug.patch).

