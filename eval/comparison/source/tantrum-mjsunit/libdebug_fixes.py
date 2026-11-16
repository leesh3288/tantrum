#!/usr/bin/env python3

# list of libdebug monkey-patching that we need to do, aside from the internal patches
# these can also be incorporated into internal patches if needed

# if the backing path exists, libdebug assumes it to be a elf file which breaks on elf parsing
# biggest problem is with shared memories (/dev/shm/) as they actually do exist in the filesystem
# https://github.com/libdebug/libdebug/blob/cfbcc3e502b747ea95e155cb2f3df85c82e89695/libdebug/native/symbols/debug_sym_parser.cpp#L78

from libdebug.native import libdebug_debug_sym_parser
from dataclasses import dataclass

@dataclass
class ElfInfo:
  symbols: list
  build_id: str
  debuglink: str

_original_read_elf_info = libdebug_debug_sym_parser.read_elf_info
def read_elf_info(path, debug_info_level):
  if path.startswith('/dev/shm/') or path.startswith('anon_') or path.startswith('['):
    return ElfInfo([], '', '')
  return _original_read_elf_info(path, debug_info_level)
libdebug_debug_sym_parser.read_elf_info = read_elf_info
