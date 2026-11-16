# Preprocessor

The preprocessor collects sandbox traces for each test case.

1. Download Intel PIN kit from https://software.intel.com/sites/landingpage/pintool/downloads/pin-external-3.31-98869-gfa6f126a8-gcc-linux.tar.gz
   - `wget https://software.intel.com/sites/landingpage/pintool/downloads/pin-external-3.31-98869-gfa6f126a8-gcc-linux.tar.gz`
2. Build `v8sbx-tracer/v8sbx-tracer.cpp`
   - `tar xvf pin-external-3.31-98869-gfa6f126a8-gcc-linux.tar.gz && mv pin-external-3.31-98869-gfa6f126a8-gcc-linux pin`
   - `cp -r v8sbx-tracer pin/` 
   - `cd pin/v8sbx-tracer; chmod +x ./build.sh; ./build.sh; cd ../../`
   - `ls pin/v8sbx-tracer/obj-intel64/v8sbx-tracer*.so`
      - You should see two files, the default preprocesor and the ablation study preprocessor (`-nofilter` variant)

For preprocessing and fuzzing, follow the [comparison instructions](../../../README.md#run-a-tantrum-configuration).
