# Preprocessor

The preprocessor records writable sandbox reads for each test case.

1. Download Intel PIN kit from https://software.intel.com/sites/landingpage/pintool/downloads/pin-external-3.31-98869-gfa6f126a8-gcc-linux.tar.gz
   - `wget https://software.intel.com/sites/landingpage/pintool/downloads/pin-external-3.31-98869-gfa6f126a8-gcc-linux.tar.gz`
2. Build `v8sbx-tracer/v8sbx-tracer.cpp`
   - `tar xvf pin-external-3.31-98869-gfa6f126a8-gcc-linux.tar.gz && mv pin-external-3.31-98869-gfa6f126a8-gcc-linux pin`
   - `cp -r v8sbx-tracer pin/` 
   - `cd pin/v8sbx-tracer; chmod +x ./build.sh; ./build.sh; cd ../../`
   - `ls pin/v8sbx-tracer/obj-intel64/v8sbx-tracer*.so`
      - You should see two files, the default preprocesor and the ablation study preprocessor (`-nofilter` variant)
3. Run `scan-accesses.py` with hardcoded paths set correctly (`PIN_PATH`, `TRACER_PATH`, `TARGET_D8`, `TESTS_LIST`)
   - All of the paths should already be set if you run the script from working directory as `../tantrum` (where `tests.txt` and the fuzzer script lives), thus executing the following suffices:
     - `cd ../tantrum`
     - `tar xvf c59dbe20-eval-mjsunit.tar.gz`
     - `python3 ../preprocessor/scan-accesses.py`
       - This generates `*.js.1.trace` sandbox trace files.

## Ablation Study

4. Execute the three steps above to acquire the sandbox trace files used for fuzzing.
5. Run `scan-accesses-nofilter.py` from `../tantrum`:
   - `python3 ../preprocessor/scan-accesses-nofilter.py`
     - This generates `*.js.2.trace` with memory-read counts by instruction pointer and access type. The matching `*.js.1.trace` supplies the writable-sandbox-read count used as the tracing limit.
6. Run `nofilter-stats.py` from `../tantrum` to aggregate `*.js.2.trace`:
   - `python3 ../preprocessor/nofilter-stats.py`
     - This reports unique load instructions and total loads by access type.
     - Access types are represented as bitfields:
       - Bit 0: Load address within sandbox
       - Bit 1: Load address within writable sandbox
         - Set together with Bit 0
       - Bit 2: Access from engine init & helper script init
     - Type `3` denotes post-init reads from writable sandbox memory, which the standard sandbox trace records.
