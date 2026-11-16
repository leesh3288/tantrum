#!/bin/bash

make clean
make
mkdir -p obj-intel64
make obj-intel64/v8sbx-tracer.so
make obj-intel64/v8sbx-tracer-nofilter.so
