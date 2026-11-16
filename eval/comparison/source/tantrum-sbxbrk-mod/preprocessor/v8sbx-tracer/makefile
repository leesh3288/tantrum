#
# Copyright (C) 2012-2013 Intel Corporation.
# SPDX-License-Identifier: MIT
#

# If the tool is built out of the kit, PIN_ROOT must be specified in the make invocation and point to the kit root.
PIN_ROOT ?= ..
CONFIG_ROOT := $(PIN_ROOT)/source/tools/Config

TARGET = intel64
OBJDIR = obj-$(TARGET)

include $(CONFIG_ROOT)/makefile.config
include makefile.rules
include $(TOOLS_ROOT)/Config/makefile.default.rules
