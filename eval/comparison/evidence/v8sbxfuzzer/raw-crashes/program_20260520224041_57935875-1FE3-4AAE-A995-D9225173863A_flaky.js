//
// BEGIN FUZZER GENERATED CODE
//

corrupt(Int32Array, 2788184098);
corrupt(Int32Array, 150968729);
new Int32Array();
new Uint8Array();
const v5 = new Uint8ClampedArray();
const v6 = new Uint8ClampedArray();
v6[895] = v6;
/o/yvms;
/a\We1[\xe2\x81\xa3]/yv;
function f9() {
}
f9();
corrupt(f9, 3461446905);
// WasmModule Code:
// BeginWasmModule
//     BeginWasmFunction ([.wasmf64] => .nothing) -> [v11]
//         v12 <- WasmJsCall([] => .wasmExternRef) v9 []
//     v13 <- EndWasmFunction
// v14 <- EndWasmModule
// 
const v14 = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([
    0x00, 0x61, 0x73, 0x6D, 0x01, 0x00, 0x00, 0x00, 0x01, 0x09,
    0x02, 0x60, 0x00, 0x01, 0x6F, 0x60, 0x01, 0x7C, 0x00, 0x02,
    0x17, 0x01, 0x07, 0x69, 0x6D, 0x70, 0x6F, 0x72, 0x74, 0x73,
    0x0B, 0x69, 0x6D, 0x70, 0x6F, 0x72, 0x74, 0x5F, 0x30, 0x5F,
    0x76, 0x39, 0x00, 0x00, 0x03, 0x02, 0x01, 0x01, 0x04, 0x01,
    0x00, 0x05, 0x01, 0x00, 0x06, 0x01, 0x00, 0x07, 0x06, 0x01,
    0x02, 0x77, 0x30, 0x00, 0x01, 0x09, 0x01, 0x00, 0x0A, 0x0A,
    0x01, 0x08, 0x01, 0x01, 0x6F, 0x10, 0x00, 0x21, 0x01, 0x0B,
])),
{ imports: {
    import_0_v9: f9,
} });
const v15 = v14.exports;
try { v15(); } catch (e) {}
corrupt(v5, 849769067);
corrupt(v5, 98220806);
v15.w0();

//
// BEGIN FUZZER HELPER CODE
//

// Corrupt the given object in a deterministic fashion (when using the same seed) and log the steps being performed.
function corrupt(obj, seed) {
    // In general, in this function memory contents is represented as (unsigned) BigInt, everything else (addresses, offsets, etc.) are Numbers.

    function assert(c) {
        if (!c) {
            throw new Error("Assertion failed!");
        }
    }

    const kHeapObjectTag = 0x1n;
    // V8 uses the two lowest bits as tag bits: 0x1 to indicate HeapObject vs Smi and 0x2 to indicate a weak reference.
    const kHeapObjectTagMask = 0x3n;
    // Offsets should be a multiple of 4, as that's the typical field size.
    const kOffsetAlignmentMask = ~0x3;

    // Helper class for accessing in-sandbox memory.
    class Memory {
        constructor() {
            let buffer = new Sandbox.MemoryView(0, 0x100000000);
            this.dataView = new DataView(buffer);
            this.taggedView = new Uint32Array(buffer);
        }

        read32(addr) {
            return BigInt(this.dataView.getUint32(addr, true));
        }

        write32(addr, value) {
            this.dataView.setUint32(addr, Number(value), true);
        }

        read16(addr) {
            return BigInt(this.dataView.getUint16(addr, true));
        }

        write16(addr, value) {
            this.dataView.setUint16(addr, Number(value), true);
        }

        read8(addr) {
            return BigInt(this.dataView.getUint8(addr));
        }

        write8(addr, value) {
            this.dataView.setUint8(addr, Number(value));
        }

        copyTagged(source, destination, size) {
            assert(size % 4 == 0);
            let toIndex = destination / 4;
            let startIndex = source / 4;
            let endIndex = (source + size) / 4;
            this.taggedView.copyWithin(toIndex, startIndex, endIndex);
        }
    }
    let memory = new Memory;

    // A worker thread that corrupts memory from the background.
    //
    // The main thread can post messages to this worker which contain
    // effectively (address, valueA, valueB) triples. This worker
    // will then permanently flip all the given addresses between
    // valueA and valueB. This for example makes it possible to find
    // double-fetch issues and similar bugs.
    function workerFunc() {
        let memory = new DataView(new Sandbox.MemoryView(0, 0x100000000));
        let work = [];
        let iteration = 0;

        onmessage = function(e) {
            if (work.length == 0) {
                // Time to start working.
                setTimeout(doWork);
            }
            work.push(e.data);
        }

        function corrupt(address, value, size) {
            switch (size) {
                case 8:
                    memory.setUint8(address, value);
                    break;
                case 16:
                    memory.setUint16(address, value, true);
                    break;
                case 32:
                    memory.setUint32(address, value, true);
                    break;
            }
        }

        function doWork() {
            iteration++;
            for (let item of work) {
                let value = (iteration % 2) == 0 ? item.valueA : item.valueB;
                corrupt(item.address, value, item.size);
            }
            // Schedule the next round of work.
            setTimeout(doWork);
        }
    }
    if (typeof this.memory_corruption_worker === 'undefined') {
        // Define as non-configurable and non-enumerable property.
        let worker = new Worker(workerFunc, {type: 'function'});
        Object.defineProperty(this, 'memory_corruption_worker', {value: worker});
    }

    // Simple, seedable PRNG based on a LCG.
    class RNG {
        m = 2 ** 32;
        a = 1664525;
        c = 1013904223;
        x;

        constructor(seed) {
            this.x = seed;
        }

        randomInt() {
            this.x = (this.x * this.a + this.c) % this.m;
            return this.x;
        }

        randomBigInt() {
            return BigInt(this.randomInt());
        }

        randomIntBelow(n) {
            return Math.floor(this.randomFloat() * n);
        }

        randomBigIntBelow(n) {
            return BigInt(this.randomIntBelow(Number(n)));
        }

        randomBigIntInHalfOpenRange(lower, upper) {
            assert(upper > lower);
            let diff = upper - lower;
            return lower + this.randomBigIntBelow(diff);
        }

        randomFloat() {
            return this.randomInt() / this.m;
        }

        probability(p) {
            return this.randomFloat() < p;
        }

        randomElement(array) {
            assert(array.length > 0);
            let randomIndex = this.randomIntBelow(array.length)
            return array[randomIndex];
        }
    }

    // Helper class implementing the various binary mutations.
    class Mutator {
        rng;

        constructor(rng) {
            this.rng = rng;
        }

        mutate(value, numBits) {
            assert(numBits <= 32);
            let allMutations = [this.#mutateBitflip, this.#mutateIncrement, this.#mutateReplace];
            let mutate = this.rng.randomElement(allMutations);
            return mutate.call(this, value, BigInt(numBits));
        }

        #mutateBitflip(value, numBits) {
            let bitPosition = this.rng.randomBigIntBelow(numBits);
            let bit = 1n << bitPosition;
            return value ^ bit;
        }

        #mutateIncrement(value, numBits) {
            let increment = this.#generateRandomBigInt(numBits);
            if (increment == 0n) increment = 1n;
            return (value + increment) & ((1n << numBits) - 1n);

        }

        #mutateReplace(value, numBits) {
            return this.#generateRandomBigInt(numBits);
        }

        #generateRandomBigInt(numBits) {
            // Generate a random integer, giving uniform weight to each order of magnitude (power-of-two).
            // In other words, this function is equally likely to generate an integer in the range [n, 2n) or [2n, 4n).
            let magnitude = this.rng.randomBigIntBelow(numBits + 1n);     // Between [0, numBits]
            let upper = 1n << magnitude;
            let lower = upper >> 1n;
            return this.rng.randomBigIntInHalfOpenRange(lower, upper);
        }
    }

    // Helper function to deterministically find a random neighbor object.
    //
    // This logic is designed to deal with a (somewhat) non-deterministic heap layout to ensure that test cases are reproducible.
    // In practice, it should most of the time find the same neighbor object if (a) that object is always allocated after the
    // start object, (b) is within the first N (currently 100) objects, and (c) is always the first neighbor of its instance type.
    //
    // This is achieved by iterating over the heap starting from the start object and computing a simple 16-bit hash value for each
    // object. At the end, we select the first object whose hash is closest to a random 16-bit integer taken from the rng (which
    // behaves deterministically). Note that we always take the first object if there are multiple object with the same instance
    // type. For finding later neighbors, we rely on the |corrupt| logic to recursively pick neighbor objects.
    function findRandomNeighborObject(addr, rng) {
        const N = 100;
        const kUint16Max = 0xffff;
        const kUnknownInstanceId = kUint16Max;

        // Simple hash function for 16-bit unsigned integers. See https://github.com/skeeto/hash-prospector
        function hash16(x) {
            assert(x >= 0 && x <= kUint16Max);
            x ^= x >> 8;
            x = (x * 0x88B5) & 0xffff;
            x ^= x >> 7;
            x = (x * 0xdB2d) & 0xffff;
            x ^= x >> 9;
            return x;
        }

        let query = rng.randomInt() & 0xffff;
        let currentWinner = addr;
        let currentBest = kUint16Max;

        for (let i = 0; i < N; i++) {
            addr += Sandbox.getSizeOfObjectAt(addr);
            let typeId = Sandbox.getInstanceTypeIdOfObjectAt(addr);
            if (typeId == kUnknownInstanceId) {
                // We found a corrupted object or went past the end of a page. No point in searching any further.
                break;
            }
            let hash = hash16(typeId);
            let score = Math.abs(hash - query);
            if (score < currentBest) {
                currentBest = score;
                currentWinner = addr;
            }
        }

        return currentWinner;
    }

    // Helper function to create a copy of the object at the given address and return the address of the copy.
    // This is for example useful when we would like to corrupt a read-only object: in that case, we can then instead
    // create a copy of the read-only object, install that into whichever object references is, then corrupt the copy.
    function copyObjectAt(source) {
        let size = Sandbox.getSizeOfObjectAt(source);
        // Simple way to get a placeholder object that's large enough: create a sequential string.
        // TODO(saelo): maybe add a method to the sandbox api to construct an object of the appropriate size.
        let placeholder = Array(size).fill("a").join("");
        let destination = Sandbox.getAddressOf(placeholder);
        memory.copyTagged(source, destination, size);
        return destination;
    }

    // Helper function implementing the object corruption logic.
    function corruptObjectAt(addr, rng, depth) {
        let indent = "  ".repeat(depth + 1);
        if (depth >= 10) {
            print(indent + "Too much recursion, bailing out.");
            return;
        }

        // We cannot corrupt read-only objects (or any objects referenced from them, as they must also be read-only).
        // This is simply an optimization, otherwise we would crash during the memory write below.
        if (!Sandbox.isWritableObjectAt(addr)) {
            print(indent + "Not corrupting read-only object");
            return;
        }

        let instanceType = Sandbox.getInstanceTypeOfObjectAt(addr);
        print(indent + "Corrupting object at 0x" + addr.toString(16) + " of type " + instanceType);

        // Some of the time, find a neighbor object to corrupt instead.
        // This allows the fuzzer to discover and corrupt objects that are not directly referenced from a visible JavaScript variable.
        if (rng.probability(0.25)) {
            let newAddr = findRandomNeighborObject(addr, rng);
            print(indent + "Recursively corrupting neighboring object at offset " + (newAddr - addr));
            return corruptObjectAt(newAddr, rng, depth + 1);
        }

        // Determine a random field to corrupt.
        let size = Sandbox.getSizeOfObjectAt(addr);
        let offset = (rng.randomInt() % size) & kOffsetAlignmentMask;

        // Check if the field currently contains a pointer to another object. In that case, (most of the time) corrupt that other object instead.
        let oldValue = memory.read32(addr + offset);
        let isLikelyPointer = (oldValue & kHeapObjectTag) == kHeapObjectTag;
        if (isLikelyPointer && rng.probability(0.75)) {
            let newAddr = Number(oldValue & ~kHeapObjectTagMask);
            if (Sandbox.isValidObjectAt(newAddr)) {
                print(indent + "Recursively corrupting object referenced through pointer at offset " + offset);
                if (!Sandbox.isWritableObjectAt(newAddr)) {
                    // We cannot corrupt the referenced object, so instead we create a copy of it and corrupt that instead.
                    newAddr = copyObjectAt(newAddr);
                    memory.write32(addr + offset, BigInt(newAddr) | kHeapObjectTag);
                    print(indent + "Referenced object is in read-only memory. Creating and corrupting a copy instead");
                }
                return corruptObjectAt(newAddr, rng, depth + 1);
            }
        }

        // Finally, corrupt the object!
        let numBitsToCorrupt = rng.randomElement([8, 16, 32]);
        let mutator = new Mutator(rng);
        let newValue;
        switch (numBitsToCorrupt) {
            case 8:
                offset += rng.randomIntBelow(4);
                oldValue = memory.read8(addr + offset);
                newValue = mutator.mutate(oldValue, 8);
                memory.write8(addr + offset, newValue);
                break;
            case 16:
                offset += rng.randomIntBelow(2) * 2;
                oldValue = memory.read16(addr + offset);
                newValue = mutator.mutate(oldValue, 16);
                memory.write16(addr + offset, newValue);
                break;
            case 32:
                oldValue = memory.read32(addr + offset);
                newValue = mutator.mutate(oldValue, 32);
                memory.write32(addr + offset, newValue);
                break;
        }

        assert(oldValue >= 0 && oldValue < (1n << BigInt(numBitsToCorrupt)));
        assert(newValue >= 0 && newValue < (1n << BigInt(numBitsToCorrupt)));

        print(indent + "Corrupted " + numBitsToCorrupt + "-bit field at offset " + offset + ". Old value: 0x" + oldValue.toString(16) + ", new value: 0x" + newValue.toString(16));

        // With low probability, keep flipping this value between the old and new value on a background worker thread.
        if (rng.probability(0.10)) {
            print(indent + "Will keep flipping this field between old and new value on background worker");
            this.memory_corruption_worker.postMessage({address: addr + offset, valueA: Number(oldValue), valueB: Number(newValue), size: numBitsToCorrupt});
        }
    }

    let addr;
    try {
        addr = Sandbox.getAddressOf(obj);
    } catch (e) {
        // Presumably, |obj| is a Smi, not a HeapObject.
        return;
    }

    print("Corrupting memory starting from object at 0x" + addr.toString(16) + " with RNG seed " + seed);
    corruptObjectAt(addr, new RNG(seed), 0);
}
// CRASH INFO
// ==========
// TERMSIG: 6
// STDERR:
// ==== JS stack trace =========================================
// 
//     0: BuiltinExitFrame [builtin: ConsoleTrace] trace(this=0x6e28003a6a41 <console map = 0x6e28003a685d>#0#,0x6e28003bd889 <JSFunction f17 (sfi = 0x6e28003bc4f9)>#1#)
//     1: f17 [0x6e28003bd889] [fuzzcode.js:16] [bytecode=0x7efe0004f619 offset=47](this=0x6e28003a347d <JSGlobalProxy>#2#)
//     2: /* anonymous */ [0x6e28003bd6f1] [fuzzcode.js:18] [bytecode=0x7efe0004dd85 offset=172](this=0x6e28003a347d <JSGlobalProxy>#2#)
//     3: InternalFrame [pc: 0x58a2e2ce169c]
//     4: EntryFrame [pc: 0x58a2e2ce13eb]
// =====================
// 
// =================================================================
// ==287566==ERROR: AddressSanitizer: heap-buffer-overflow on address 0x71ba2d76636c at pc 0x58a2e15ef655 bp 0x7ffc0993db70 sp 0x7ffc0993db68
// READ of size 4 at 0x71ba2d76636c thread T0
//     #0 0x58a2e15ef654  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x4e8c654) (BuildId: 42a5516f89359752)
//     #1 0x58a2e15edba5  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x4e8aba5) (BuildId: 42a5516f89359752)
//     #2 0x58a2e15fc519  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x4e99519) (BuildId: 42a5516f89359752)
//     #3 0x58a2e15f29e9  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x4e8f9e9) (BuildId: 42a5516f89359752)
//     #4 0x58a2e15e1003  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x4e7e003) (BuildId: 42a5516f89359752)
//     #5 0x58a2e15df1b0  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x4e7c1b0) (BuildId: 42a5516f89359752)
//     #6 0x58a2e1924419  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x51c1419) (BuildId: 42a5516f89359752)
//     #7 0x58a2e0e1e97b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x46bb97b) (BuildId: 42a5516f89359752)
//     #8 0x58a2e0d8cb9f  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x4629b9f) (BuildId: 42a5516f89359752)
//     #9 0x58a2e0d527da  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x45ef7da) (BuildId: 42a5516f89359752)
//     #10 0x58a2e0d6ebb1  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x460bbb1) (BuildId: 42a5516f89359752)
//     #11 0x58a2e2aee547  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x638b547) (BuildId: 42a5516f89359752)
//     #12 0x58a2e026ffab  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x3b0cfab) (BuildId: 42a5516f89359752)
//     #13 0x58a2dfef602e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x379302e) (BuildId: 42a5516f89359752)
//     #14 0x58a2e2d8f6c8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662c6c8) (BuildId: 42a5516f89359752)
//     #15 0x58a2e2d8664b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662364b) (BuildId: 42a5516f89359752)
//     #16 0x7ea3c71ea8da  (<unknown module>)
//     #17 0x58a2b8c0353f  (<unknown module>)
//     #18 0x58a2e2ce3a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//     #19 0x58a2e2ce169b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e69b) (BuildId: 42a5516f89359752)
//     #20 0x58a2e2ce13ea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e3ea) (BuildId: 42a5516f89359752)
//     #21 0x58a2de0b8c2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1955c2a) (BuildId: 42a5516f89359752)
//     #22 0x58a2de0bb4f8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19584f8) (BuildId: 42a5516f89359752)
//     #23 0x58a2ddbbdb00  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x145ab00) (BuildId: 42a5516f89359752)
//     #24 0x58a2dd974686  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1211686) (BuildId: 42a5516f89359752)
//     #25 0x58a2dd9aa2ff  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12472ff) (BuildId: 42a5516f89359752)
//     #26 0x58a2dd9b74a2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12544a2) (BuildId: 42a5516f89359752)
//     #27 0x58a2dd9b69bf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12539bf) (BuildId: 42a5516f89359752)
//     #28 0x58a2dd9bb1d8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12581d8) (BuildId: 42a5516f89359752)
//     #29 0x736a2d4c11c9  (/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//     #30 0x736a2d4c128a  (/lib/x86_64-linux-gnu/libc.so.6+0x2a28a) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//     #31 0x58a2dd865029  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1102029) (BuildId: 42a5516f89359752)
// 
// Address 0x71ba2d76636c is a wild pointer inside of access range of size 0x000000000004.
// SUMMARY: AddressSanitizer: heap-buffer-overflow (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x4e8c654) (BuildId: 42a5516f89359752) 
// Shadow bytes around the buggy address:
//   0x71ba2d766080: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x71ba2d766100: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x71ba2d766180: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x71ba2d766200: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x71ba2d766280: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
// =>0x71ba2d766300: fa fa fa fa fa fa fa fa fa fa fa fa fa[fa]fa fa
//   0x71ba2d766380: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x71ba2d766400: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x71ba2d766480: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x71ba2d766500: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x71ba2d766580: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
// Shadow byte legend (one shadow byte represents 8 application bytes):
//   Addressable:           00
//   Partially addressable: 01 02 03 04 05 06 07 
//   Heap left redzone:       fa
//   Freed heap region:       fd
//   Stack left redzone:      f1
//   Stack mid redzone:       f2
//   Stack right redzone:     f3
//   Stack after return:      f5
//   Stack use after scope:   f8
//   Global redzone:          f9
//   Global init order:       f6
//   Poisoned by user:        f7
//   Container overflow:      fc
//   Array cookie:            ac
//   Intra object redzone:    bb
//   ASan internal:           fe
//   Left alloca redzone:     ca
//   Right alloca redzone:    cb
// ==287566==ABORTING
// 
// ## V8 sandbox violation detected!
// STDOUT:
// Corrupting memory starting from object at 0x3a6310 with RNG seed 2788184098
//   Corrupting object at 0x3a6310 of type INT32_TYPED_ARRAY_CONSTRUCTOR_TYPE
//   Recursively corrupting object referenced through pointer at offset 4
//     Corrupting object at 0x3a6330 of type PROPERTY_ARRAY_TYPE
//     Corrupted 8-bit field at offset 13. Old value: 0x0, new value: 0x80
// Corrupting memory starting from object at 0x3a6310 with RNG seed 150968729
//   Corrupting object at 0x3a6310 of type INT32_TYPED_ARRAY_CONSTRUCTOR_TYPE
//   Recursively corrupting object referenced through pointer at offset 16
//   Referenced object is in read-only memory. Creating and corrupting a copy instead
//     Corrupting object at 0x8a9e8 of type SHARED_FUNCTION_INFO_TYPE
//     Corrupted 32-bit field at offset 8. Old value: 0x528, new value: 0x8000528
// Corrupting memory starting from object at 0x3bd888 with RNG seed 3461446905
//   Corrupting object at 0x3bd888 of type JS_FUNCTION_TYPE
//   Corrupted 32-bit field at offset 16. Old value: 0x3bc4f9, new value: 0x3bc84c
// Corrupting memory starting from object at 0x8b294 with RNG seed 849769067
//   Corrupting object at 0x8b294 of type JS_TYPED_ARRAY_TYPE
//   Corrupted 16-bit field at offset 36. Old value: 0x0, new value: 0x11a
// Corrupting memory starting from object at 0x8b294 with RNG seed 98220806
//   Corrupting object at 0x8b294 of type JS_TYPED_ARRAY_TYPE
//   Corrupted 8-bit field at offset 43. Old value: 0x7, new value: 0x18
// FUZZER ARGS: /work/FuzzilliSbx/fuzzilli/.build/x86_64-unknown-linux-gnu/release/FuzzilliCli --profile=v8Sandbox --wasm /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --instanceType=leaf --connectTo=127.0.0.1:10001
// TARGET ARGS: /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --expose-gc --omit-quit --allow-natives-syntax --fuzzing --jit-fuzzing --sandbox-fuzzing --disable-in-process-stack-traces
// CONTRIBUTORS: 
// EXECUTION TIME: 62ms
