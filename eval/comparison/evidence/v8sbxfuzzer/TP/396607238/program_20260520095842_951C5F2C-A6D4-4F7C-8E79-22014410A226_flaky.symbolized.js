//
// BEGIN FUZZER GENERATED CODE
//

corrupt(1245829634n, 1792887967);
const v5 = `
    const v6 = /\u{12345}\u{23456}/idv;
    function f7() {
        f7.toLocaleString(f7, v6).replace(/Q0k/ug, /xyz{1,}^xxx$/yvg);
        return v5;
        corrupt(v6, 2239752553);
        corrupt(v6, 2023145041);
    }
    f7();
`;
function f20(a21, a22, a23, a24) {
    const v104 = {
        maxByteLength: -1725410267,
        valueOf(a26) {
            // WasmModule Code:
            // BeginWasmModule
            //     BeginWasmFunction ([.wasmf32, .wasmi32, .wasmi32, .wasmi32, .wasmf64] => .wasmf32) -> [v27, v28, v29, v30, v31]
            //         v32 <- WasmTruncateSatf64Toi64 v31 (unsigned)
            //         v33 <- WasmI64x2Splat v32
            //         v34 <- WasmSimd128FloatBinOp f32x4.mul v33 v33
            //     v35 <- EndWasmFunction
            // v36 <- EndWasmModule
            // 
            const v36 = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([
                0x00, 0x61, 0x73, 0x6D, 0x01, 0x00, 0x00, 0x00, 0x01, 0x0A,
                0x01, 0x60, 0x05, 0x7D, 0x7F, 0x7F, 0x7F, 0x7C, 0x01, 0x7D,
                0x03, 0x02, 0x01, 0x00, 0x04, 0x01, 0x00, 0x05, 0x01, 0x00,
                0x06, 0x01, 0x00, 0x07, 0x06, 0x01, 0x02, 0x77, 0x30, 0x00,
                0x00, 0x09, 0x01, 0x00, 0x0A, 0x20, 0x01, 0x1E, 0x03, 0x01,
                0x7E, 0x01, 0x7B, 0x01, 0x7B, 0x20, 0x04, 0xFC, 0x07, 0x21,
                0x05, 0x20, 0x05, 0xFD, 0x12, 0x21, 0x06, 0x20, 0x06, 0x20,
                0x06, 0xFD, 0xE6, 0x01, 0x01, 0x21, 0x07, 0x0B,
            ])));
            return v36;
        },
        b: -12,
        get c() {
            super[a23] = this;
            this.b = 1000;
            try { this.m(65537, -1725410267, this, 1000); } catch (e) {}
            let v40 = 4294967295;
            let v42 = --v40;
            ({}).constructor;
            { maxByteLength: 257 } - Math;
            const v49 = ++v42;
            const v50 = v42 && v40;
            !a21;
            v50 | v49;
            function F53(a55, a56) {
                if (!new.target) { throw 'must be called with new'; }
                // WasmModule Code:
                // BeginWasmModule
                //     v57 <- WasmDefineMemory [6,41742],
                //     BeginWasmFunction ([.wasmf32, .wasmi32, .wasmi32, .wasmf64, .wasmi32] => .nothing) -> [v58, v59, v60, v61, v62]
                //         v63 <- Constf64 '0.0'
                //         v64 <- Constf32 '-1.0'
                //         v65 <- Constf32 '3.0'
                //         v66 <- Constf64 '9.647505363572954'
                //         v67 <- Constf64 '-2.220446049250313e-16'
                //         v68 <- Consti32 '0'
                //         WasmBeginLoop ([.wasmi32, .wasmf64, .wasmf32, .wasmf64, .wasmf64, .wasmf32] => .wasmi64) [v68, v67, v65, v63, v67, v64] -> L:v69 [v70, v71, v72, v73, v74, v75]
                //             v76 <- Constf64 '128.0'
                //             WasmBeginTry ([.wasmf64, .wasmf64, .wasmf64, .wasmi32, .wasmf32] => .nothing) [v76, v76, v66, v62, v64] -> L:v77 [v78, v79, v80, v81, v82]
                //                 v83 <- WasmTruncateSatf32Toi32 v82 (signed)
                //             WasmBeginCatchAll [] -> L:v84
                //             WasmEndTry []
                //             v85 <- WasmTruncatef64Toi64 v76 (signed)
                //             v86 <- Wasmi32BinOp v70 Rotl v59
                //             v87 <- Consti32 '1'
                //             v88 <- Wasmi32BinOp v70 Rotr v87
                //             v89 <- Consti32 '5'
                //             v90 <- WasmMemoryLoad 'I64LoadMem16S' v57[v89 + 8]
                //             WasmBeginTry ([.wasmi64, .wasmi32] => .wasmi32) [v90, v89] -> L:v91 [v92, v93]
                //                 v94 <- Consti64 '13942'
                //                 v95 <- Wasmi64CompareOp v90 le_u v94
                //             WasmBeginCatchAll [v93] -> L:v96
                //             v97 <- WasmEndTry [v70]
                //             wasmBranchIf v68, v69, v71, v75, v66, v76, v65, v68
                //         v98 <- WasmEndLoop v85
                //     v99 <- EndWasmFunction
                // v100 <- EndWasmModule
                // 
                const v100 = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([
                    0x00, 0x61, 0x73, 0x6D, 0x01, 0x00, 0x00, 0x00, 0x01, 0x21,
                    0x04, 0x60, 0x06, 0x7F, 0x7C, 0x7D, 0x7C, 0x7C, 0x7D, 0x01,
                    0x7E, 0x60, 0x05, 0x7C, 0x7C, 0x7C, 0x7F, 0x7D, 0x00, 0x60,
                    0x02, 0x7E, 0x7F, 0x01, 0x7F, 0x60, 0x05, 0x7D, 0x7F, 0x7F,
                    0x7C, 0x7F, 0x00, 0x03, 0x02, 0x01, 0x03, 0x04, 0x01, 0x00,
                    0x05, 0x06, 0x01, 0x01, 0x06, 0x8E, 0xC6, 0x02, 0x06, 0x01,
                    0x00, 0x07, 0x06, 0x01, 0x02, 0x77, 0x30, 0x00, 0x00, 0x09,
                    0x01, 0x00, 0x0A, 0x95, 0x02, 0x01, 0x92, 0x02, 0x1F, 0x01,
                    0x7C, 0x01, 0x7D, 0x01, 0x7D, 0x01, 0x7C, 0x01, 0x7C, 0x01,
                    0x7F, 0x01, 0x7D, 0x01, 0x7C, 0x01, 0x7C, 0x01, 0x7D, 0x01,
                    0x7C, 0x01, 0x7F, 0x01, 0x7C, 0x01, 0x7D, 0x01, 0x7F, 0x01,
                    0x7C, 0x01, 0x7C, 0x01, 0x7C, 0x01, 0x7F, 0x01, 0x7E, 0x01,
                    0x7F, 0x01, 0x7F, 0x01, 0x7F, 0x01, 0x7F, 0x01, 0x7E, 0x01,
                    0x7F, 0x01, 0x7E, 0x01, 0x7E, 0x01, 0x7F, 0x01, 0x7F, 0x01,
                    0x7E, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
                    0x21, 0x05, 0x43, 0x00, 0x00, 0x80, 0xBF, 0x21, 0x06, 0x43,
                    0x00, 0x00, 0x40, 0x40, 0x21, 0x07, 0x44, 0x94, 0x0F, 0xB1,
                    0xD2, 0x85, 0x4B, 0x23, 0x40, 0x21, 0x08, 0x44, 0x00, 0x00,
                    0x00, 0x00, 0x00, 0x00, 0xB0, 0xBC, 0x21, 0x09, 0x41, 0x00,
                    0x21, 0x0A, 0x20, 0x0A, 0x20, 0x09, 0x20, 0x07, 0x20, 0x05,
                    0x20, 0x09, 0x20, 0x06, 0x03, 0x00, 0x21, 0x0B, 0x21, 0x0C,
                    0x21, 0x0D, 0x21, 0x0E, 0x21, 0x0F, 0x21, 0x10, 0x44, 0x00,
                    0x00, 0x00, 0x00, 0x00, 0x00, 0x60, 0x40, 0x21, 0x11, 0x20,
                    0x11, 0x20, 0x11, 0x20, 0x08, 0x20, 0x04, 0x20, 0x06, 0x06,
                    0x01, 0x21, 0x12, 0x21, 0x13, 0x21, 0x14, 0x21, 0x15, 0x21,
                    0x16, 0x20, 0x12, 0xFC, 0x00, 0x21, 0x17, 0x19, 0x0B, 0x20,
                    0x11, 0xB0, 0x21, 0x18, 0x20, 0x10, 0x20, 0x01, 0x77, 0x21,
                    0x19, 0x41, 0x01, 0x21, 0x1A, 0x20, 0x10, 0x20, 0x1A, 0x78,
                    0x21, 0x1B, 0x41, 0x05, 0x21, 0x1C, 0x20, 0x1C, 0x32, 0x00,
                    0x08, 0x21, 0x1D, 0x20, 0x1D, 0x20, 0x1C, 0x06, 0x02, 0x21,
                    0x1E, 0x21, 0x1F, 0x42, 0xF6, 0xEC, 0x00, 0x21, 0x20, 0x20,
                    0x1D, 0x20, 0x20, 0x58, 0x21, 0x21, 0x20, 0x1E, 0x19, 0x20,
                    0x10, 0x0B, 0x21, 0x22, 0x20, 0x0A, 0x20, 0x0F, 0x20, 0x0B,
                    0x20, 0x08, 0x20, 0x11, 0x20, 0x07, 0x20, 0x0A, 0x0D, 0x00,
                    0x1A, 0x1A, 0x1A, 0x1A, 0x1A, 0x1A, 0x20, 0x18, 0x0B, 0x21,
                    0x23, 0x0B,
                ])));
                v100.exports.w0();
            }
            corrupt(f20, 1635163227);
            corrupt(f20, 2339697988);
            new F53();
            return -9007199254740992n;
            corrupt(a21, 3957609767);
            corrupt(a21, 4034394384);
            corrupt(a21, 1602999348);
        },
    };
    return v104;
}
corrupt(1245829634n, 3668470241);
corrupt(1245829634n, 4066515502);
try { Reflect.set(); } catch (e) {}
Math.acos(-2.220446049250313e-16);
f20(-1725410267, -9007199254740992n, -1725410267, -9223372036854775807);
f20(-26539, -9007199254740992n, -12, 2147483648);
const v112 = f20(-1725410267, 4096n, -1725410267, -1725410267);
function F113(a115, a116) {
    if (!new.target) { throw 'must be called with new'; }
    // WasmModule Code:
    // BeginWasmModule
    //     v117 <- WasmDefineMemory [6,41742],
    //     BeginWasmFunction ([.wasmf32, .wasmi32, .wasmi32, .wasmf64, .wasmi32] => .nothing) -> [v118, v119, v120, v121, v122]
    //         v123 <- WasmSimdLoad LoadS128 v117 + 0
    //     v124 <- EndWasmFunction
    // v125 <- EndWasmModule
    // 
    const v125 = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([
        0x00, 0x61, 0x73, 0x6D, 0x01, 0x00, 0x00, 0x00, 0x01, 0x09,
        0x01, 0x60, 0x05, 0x7D, 0x7F, 0x7F, 0x7C, 0x7F, 0x00, 0x03,
        0x02, 0x01, 0x00, 0x04, 0x01, 0x00, 0x05, 0x06, 0x01, 0x01,
        0x06, 0x8E, 0xC6, 0x02, 0x06, 0x01, 0x00, 0x07, 0x06, 0x01,
        0x02, 0x77, 0x30, 0x00, 0x00, 0x09, 0x01, 0x00, 0x0A, 0x0E,
        0x01, 0x0C, 0x01, 0x01, 0x7B, 0x20, 0x02, 0xFD, 0x00, 0x00,
        0x00, 0x21, 0x05, 0x0B,
    ])));
    v125.exports.w0();
    function f128() {
        return f128;
    }
    corrupt(v112, 2349641633);
    corrupt(v112, 2696887511);
    const v132 = new Worker(f128, { type: "function" });
    try { v132.postMessage(); } catch (e) {}
}
new F113();
new F113();
new Uint16Array(1073741824);

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
// =================================================================
// ==2592999==ERROR: AddressSanitizer: heap-use-after-free on address 0x73a8bb09c1e8 at pc 0x61ae532fdc6b bp 0x7ffd2430d920 sp 0x7ffd2430d918
// WRITE of size 8 at 0x73a8bb09c1e8 thread T0
//     #0 0x61ae532fdc6a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c0dc6a) (BuildId: 42a5516f89359752)
//         v8::internal::ConcurrentMarking::FlushMemoryChunkData()
//         ./../../third_party/libc++/src/include/__atomic/support/c11.h:181:10
//     #1 0x61ae53384901  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c94901) (BuildId: 42a5516f89359752)
//         v8::internal::MarkCompactCollector::MarkLiveObjects()
//         ./../../src/heap/mark-compact.cc:790:34
//     #2 0x61ae53381281  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c91281) (BuildId: 42a5516f89359752)
//         v8::internal::MarkCompactCollector::CollectGarbage()
//         ./../../src/heap/mark-compact.cc:488:3
//     #3 0x61ae5327756c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b8756c) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::MarkCompact()
//         ./../../src/heap/heap.cc:2629:29
//     #4 0x61ae53275295  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b85295) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::PerformGarbageCollection(v8::internal::GarbageCollector, v8::internal::GarbageCollectionReason, char const*)
//         ./../../src/heap/heap.cc:2250:5
//     #5 0x61ae532c246c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bd246c) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags)::$_1::operator()() const
//         ./../../src/heap/heap.cc:1664:7
//     #6 0x61ae532c1a92  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bd1a92) (BuildId: 42a5516f89359752)
//         void heap::base::Stack::SetMarkerAndCallbackImpl<v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags)::$_1>(heap::base::Stack*, void*, void const*)
//         ./../../src/heap/base/stack.h:167:5
//     #7 0x61ae55408092  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x3d18092) (BuildId: 42a5516f89359752)
//         PushAllRegistersAndIterateStack
//         push_registers_asm.cc:0:0
//     #8 0x61ae532661f6  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b761f6) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags)
//         ./../../src/heap/base/stack.h:73:7
//     #9 0x61ae5326cde9  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b7cde9) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::HandleExternalMemoryInterrupt()
//         ./../../src/heap/heap.cc:1274:3
//     #10 0x61ae52c2176d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x153176d) (BuildId: 42a5516f89359752)
//         v8::internal::(anonymous namespace)::ConstructBuffer(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::JSFunction>, v8::internal::DirectHandle<v8::internal::JSReceiver>, v8::internal::DirectHandle<v8::internal::Object>, v8::internal::DirectHandle<v8::internal::Object>, v8::internal::InitializedFlag)
//         ./../../src/builtins/builtins-arraybuffer.cc:108:17
//     #11 0x61ae52c1beea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x152beea) (BuildId: 42a5516f89359752)
//         v8::internal::Builtin_Impl_ArrayBufferConstructor(v8::internal::BuiltinArguments, v8::internal::Isolate*)
//         ./../../src/builtins/builtins-arraybuffer.cc:158:10
//     #12 0x61ae57d1c2b5  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662c2b5) (BuildId: 42a5516f89359752)
//         Builtins_CEntry_Return1_ArgvOnStack_BuiltinExit
//         setup-isolate-deserialize.cc:0:0
//     #13 0x61ae57c6d9e4  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657d9e4) (BuildId: 42a5516f89359752)
//         Builtins_JSBuiltinsConstructStub
//         setup-isolate-deserialize.cc:0:0
//     #14 0x61ae57dd81e9  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66e81e9) (BuildId: 42a5516f89359752)
//         Builtins_CreateTypedArray
//         setup-isolate-deserialize.cc:0:0
//     #15 0x61ae57d07d2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6617d2a) (BuildId: 42a5516f89359752)
//         Builtins_TypedArrayConstructor
//         setup-isolate-deserialize.cc:0:0
//     #16 0x61ae57c713b2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x65813b2) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #17 0x61ae57e1f726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #18 0x61ae57c70a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #19 0x61ae57c6e69b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e69b) (BuildId: 42a5516f89359752)
//         Builtins_JSEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #20 0x61ae57c6e3ea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e3ea) (BuildId: 42a5516f89359752)
//         Builtins_JSEntry
//         setup-isolate-deserialize.cc:0:0
//     #21 0x61ae53045c2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1955c2a) (BuildId: 42a5516f89359752)
//         v8::internal::(anonymous namespace)::Invoke(v8::internal::Isolate*, v8::internal::(anonymous namespace)::InvokeParams const&)
//         ./../../src/execution/simulator.h:191:12
//     #22 0x61ae530484f8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19584f8) (BuildId: 42a5516f89359752)
//         v8::internal::Execution::CallScript(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::JSFunction>, v8::internal::DirectHandle<v8::internal::Object>, v8::internal::DirectHandle<v8::internal::Object>)
//         ./../../src/execution/execution.cc:536:10
//     #23 0x61ae52b4ab00  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x145ab00) (BuildId: 42a5516f89359752)
//         v8::Script::Run(v8::Local<v8::Context>, v8::Local<v8::Data>)
//         ./../../src/api/api.cc:2155:7
//     #24 0x61ae52901686  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1211686) (BuildId: 42a5516f89359752)
//         v8::Shell::ExecuteString(v8::Isolate*, v8::Local<v8::String>, v8::Local<v8::String>, v8::Shell::ReportExceptions, v8::Global<v8::Value>*)
//         ./../../src/d8/d8.cc:1013:44
//     #25 0x61ae529372ff  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12472ff) (BuildId: 42a5516f89359752)
//         v8::SourceGroup::Execute(v8::Isolate*)
//         ./../../src/d8/d8.cc:4879:10
//     #26 0x61ae529444a2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12544a2) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMainIsolate(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5886:37
//     #27 0x61ae529439bf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12539bf) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMain(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5795:18
//     #28 0x61ae529481d8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12581d8) (BuildId: 42a5516f89359752)
//         v8::Shell::Main(int, char**)
//         ./../../src/d8/d8.cc:6649:18
//     #29 0x7558b92741c9  (/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #30 0x7558b927428a  (/lib/x86_64-linux-gnu/libc.so.6+0x2a28a) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #31 0x61ae527f2029  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1102029) (BuildId: 42a5516f89359752)
//         _start
//         ??:0:0
// 
// 0x73a8bb09c1e8 is located 232 bytes inside of 8576-byte region [0x73a8bb09c100,0x73a8bb09e280)
// freed by thread T52 (WorkerThread) here:
//     #0 0x61ae528cb96d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x11db96d) (BuildId: 42a5516f89359752)
//         operator delete(void*)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_new_delete.cpp:143:3
//     #1 0x61ae5348c7cc  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9c7cc) (BuildId: 42a5516f89359752)
//         v8::internal::MemoryAllocator::Pool::ReleasePooledChunks()
//         ./../../src/heap/memory-allocator.cc:94:5
//     #2 0x61ae5348c5cd  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9c5cd) (BuildId: 42a5516f89359752)
//         v8::internal::MemoryAllocator::TearDown()
//         ./../../src/heap/memory-allocator.cc:69:11
//     #3 0x61ae5329e344  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bae344) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::TearDown()
//         ./../../src/heap/heap.cc:6191:23
//     #4 0x61ae5309f330  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19af330) (BuildId: 42a5516f89359752)
//         v8::internal::Isolate::Deinit()
//         ./../../src/execution/isolate.cc:4496:9
//     #5 0x61ae5309e0a1  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19ae0a1) (BuildId: 42a5516f89359752)
//         v8::internal::Isolate::Delete(v8::internal::Isolate*)
//         ./../../src/execution/isolate.cc:4093:12
//     #6 0x61ae5293b7a7  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124b7a7) (BuildId: 42a5516f89359752)
//         v8::Worker::ExecuteInThread()
//         ./../../src/d8/d8.cc:5380:13
//     #7 0x61ae5293a52c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a52c) (BuildId: 42a5516f89359752)
//         v8::Worker::WorkerThread::Run()
//         ./../../src/d8/d8.cc:5086:11
//     #8 0x61ae52b09243  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1419243) (BuildId: 42a5516f89359752)
//         v8::base::ThreadEntry(void*)
//         ./../../src/base/platform/platform.h:626:5
//     #9 0x61ae5288f106  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x119f106) (BuildId: 42a5516f89359752)
//         asan_thread_start(void*)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_interceptors.cpp:239:28
// 
// previously allocated by thread T52 (WorkerThread) here:
//     #0 0x61ae528cb10d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x11db10d) (BuildId: 42a5516f89359752)
//         operator new(unsigned long)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_new_delete.cpp:86:3
//     #1 0x61ae5348effa  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9effa) (BuildId: 42a5516f89359752)
//         v8::internal::MemoryAllocator::AllocatePage(v8::internal::MemoryAllocator::AllocationMode, v8::internal::Space*, v8::internal::Executability)
//         ./../../src/heap/memory-allocator.cc:429:16
//     #2 0x61ae534c1bb6  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd1bb6) (BuildId: 42a5516f89359752)
//         v8::internal::SemiSpace::AllocateFreshPage()
//         ./../../src/heap/new-spaces.cc:145:56
//     #3 0x61ae534c2407  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd2407) (BuildId: 42a5516f89359752)
//         v8::internal::SemiSpace::Commit()
//         ./../../src/heap/new-spaces.cc:79:12
//     #4 0x61ae534c3eb2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd3eb2) (BuildId: 42a5516f89359752)
//         v8::internal::SemiSpaceNewSpace::SemiSpaceNewSpace(v8::internal::Heap*, unsigned long, unsigned long)
//         ./../../src/heap/new-spaces.cc:454:18
//     #5 0x61ae532993a7  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1ba93a7) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::SetUpSpaces(v8::internal::LinearAllocationArea&, v8::internal::LinearAllocationArea&)
//         ./../../third_party/libc++/src/include/__memory/unique_ptr.h:765:30
//     #6 0x61ae530ae508  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19be508) (BuildId: 42a5516f89359752)
//         v8::internal::Isolate::Init(v8::internal::SnapshotData*, v8::internal::SnapshotData*, v8::internal::SnapshotData*, bool)
//         ./../../src/execution/isolate.cc:5572:9
//     #7 0x61ae530b1b4c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19c1b4c) (BuildId: 42a5516f89359752)
//         v8::internal::Isolate::InitWithSnapshot(v8::internal::SnapshotData*, v8::internal::SnapshotData*, v8::internal::SnapshotData*, bool)
//         ./../../src/execution/isolate.cc:5201:10
//     #8 0x61ae546b0253  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x2fc0253) (BuildId: 42a5516f89359752)
//         v8::internal::Snapshot::Initialize(v8::internal::Isolate*)
//         ./../../src/snapshot/snapshot.cc:198:19
//     #9 0x61ae52bb1056  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x14c1056) (BuildId: 42a5516f89359752)
//         v8::Isolate::Initialize(v8::Isolate*, v8::Isolate::CreateParams const&)
//         ./../../src/api/api.cc:10163:8
//     #10 0x61ae52bb1700  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x14c1700) (BuildId: 42a5516f89359752)
//         v8::Isolate::New(v8::Isolate::CreateParams const&)
//         ./../../src/api/api.cc:10202:3
//     #11 0x61ae5293a777  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a777) (BuildId: 42a5516f89359752)
//         v8::Worker::ExecuteInThread()
//         ./../../src/d8/d8.cc:5253:14
//     #12 0x61ae5293a52c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a52c) (BuildId: 42a5516f89359752)
//         v8::Worker::WorkerThread::Run()
//         ./../../src/d8/d8.cc:5086:11
//     #13 0x61ae52b09243  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1419243) (BuildId: 42a5516f89359752)
//         v8::base::ThreadEntry(void*)
//         ./../../src/base/platform/platform.h:626:5
//     #14 0x61ae5288f106  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x119f106) (BuildId: 42a5516f89359752)
//         asan_thread_start(void*)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_interceptors.cpp:239:28
// 
// Thread T52 (WorkerThread) created by T0 here:
//     #0 0x61ae52875b41  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1185b41) (BuildId: 42a5516f89359752)
//         ___interceptor_pthread_create
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_interceptors.cpp:250:3
//     #1 0x61ae52b08fca  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1418fca) (BuildId: 42a5516f89359752)
//         v8::base::Thread::Start()
//         ./../../src/base/platform/platform-posix.cc:1263:14
//     #2 0x61ae52927b9a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237b9a) (BuildId: 42a5516f89359752)
//         v8::Worker::StartWorkerThread(v8::Isolate*, std::__Cr::shared_ptr<v8::Worker>, v8::base::Thread::Priority)
//         ./../../src/d8/d8.cc:5070:16
//     #3 0x61ae52927314  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237314) (BuildId: 42a5516f89359752)
//         v8::Shell::WorkerNew(v8::FunctionCallbackInfo<v8::Value> const&)
//         ./../../src/d8/d8.cc:3247:10
//     #4 0x61ae52c02bbf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1512bbf) (BuildId: 42a5516f89359752)
//         v8::internal::FunctionCallbackArguments::CallOrConstruct(v8::internal::Tagged<v8::internal::FunctionTemplateInfo>, bool)
//         ./../../src/api/api-arguments-inl.h:95:3
//     #5 0x61ae52c0082d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x151082d) (BuildId: 42a5516f89359752)
//         v8::internal::MaybeHandle<v8::internal::Object> v8::internal::(anonymous namespace)::HandleApiCallHelper<true>(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::HeapObject>, v8::internal::DirectHandle<v8::internal::FunctionTemplateInfo>, v8::internal::DirectHandle<v8::internal::Object>, unsigned long*, int)
//         ./../../src/builtins/builtins-api.cc:109:16
//     #6 0x61ae52bfe6ce  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x150e6ce) (BuildId: 42a5516f89359752)
//         v8::internal::Builtin_Impl_HandleApiConstruct(v8::internal::BuiltinArguments, v8::internal::Isolate*)
//         ./../../src/builtins/builtins-api.cc:140:3
//     #7 0x61ae57d1c2b5  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662c2b5) (BuildId: 42a5516f89359752)
//         Builtins_CEntry_Return1_ArgvOnStack_BuiltinExit
//         setup-isolate-deserialize.cc:0:0
//     #8 0x61ae57c713b2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x65813b2) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #9 0x61ae57e1f726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #10 0x61ae57c70a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #11 0x61ae57c7128e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #12 0x61ae57e1f726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #13 0x61ae57c70a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #14 0x61ae57c6e69b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e69b) (BuildId: 42a5516f89359752)
//         Builtins_JSEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #15 0x61ae57c6e3ea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e3ea) (BuildId: 42a5516f89359752)
//         Builtins_JSEntry
//         setup-isolate-deserialize.cc:0:0
//     #16 0x61ae53045c2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1955c2a) (BuildId: 42a5516f89359752)
//         v8::internal::(anonymous namespace)::Invoke(v8::internal::Isolate*, v8::internal::(anonymous namespace)::InvokeParams const&)
//         ./../../src/execution/simulator.h:191:12
//     #17 0x61ae530484f8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19584f8) (BuildId: 42a5516f89359752)
//         v8::internal::Execution::CallScript(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::JSFunction>, v8::internal::DirectHandle<v8::internal::Object>, v8::internal::DirectHandle<v8::internal::Object>)
//         ./../../src/execution/execution.cc:536:10
//     #18 0x61ae52b4ab00  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x145ab00) (BuildId: 42a5516f89359752)
//         v8::Script::Run(v8::Local<v8::Context>, v8::Local<v8::Data>)
//         ./../../src/api/api.cc:2155:7
//     #19 0x61ae52901686  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1211686) (BuildId: 42a5516f89359752)
//         v8::Shell::ExecuteString(v8::Isolate*, v8::Local<v8::String>, v8::Local<v8::String>, v8::Shell::ReportExceptions, v8::Global<v8::Value>*)
//         ./../../src/d8/d8.cc:1013:44
//     #20 0x61ae529372ff  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12472ff) (BuildId: 42a5516f89359752)
//         v8::SourceGroup::Execute(v8::Isolate*)
//         ./../../src/d8/d8.cc:4879:10
//     #21 0x61ae529444a2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12544a2) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMainIsolate(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5886:37
//     #22 0x61ae529439bf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12539bf) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMain(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5795:18
//     #23 0x61ae529481d8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12581d8) (BuildId: 42a5516f89359752)
//         v8::Shell::Main(int, char**)
//         ./../../src/d8/d8.cc:6649:18
//     #24 0x7558b92741c9  (/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #25 0x7558b927428a  (/lib/x86_64-linux-gnu/libc.so.6+0x2a28a) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #26 0x61ae527f2029  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1102029) (BuildId: 42a5516f89359752)
//         _start
//         ??:0:0
// 
// SUMMARY: AddressSanitizer: heap-use-after-free (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c0dc6a) (BuildId: 42a5516f89359752) 
// Shadow bytes around the buggy address:
//   0x73a8bb09bf00: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x73a8bb09bf80: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x73a8bb09c000: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x73a8bb09c080: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x73a8bb09c100: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
// =>0x73a8bb09c180: fd fd fd fd fd fd fd fd fd fd fd fd fd[fd]fd fd
//   0x73a8bb09c200: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x73a8bb09c280: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x73a8bb09c300: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x73a8bb09c380: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x73a8bb09c400: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
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
// ==2592999==ABORTING
// 
// ## V8 sandbox violation detected!
// STDOUT:
// Corrupting memory starting from object at 0x340dec with RNG seed 1792887967
//   Corrupting object at 0x340dec of type BIG_INT_BASE_TYPE
//   Corrupted 8-bit field at offset 10. Old value: 0x41, new value: 0x42
// Corrupting memory starting from object at 0x340e08 with RNG seed 3668470241
//   Corrupting object at 0x340e08 of type BIG_INT_BASE_TYPE
//   Corrupted 16-bit field at offset 8. Old value: 0xda02, new value: 0xda22
// Corrupting memory starting from object at 0x340e24 with RNG seed 4066515502
//   Corrupting object at 0x340e24 of type BIG_INT_BASE_TYPE
//   Recursively corrupting neighboring object at offset 1632
//     Corrupting object at 0x341484 of type OBJECT_BOILERPLATE_DESCRIPTION_TYPE
//     Recursively corrupting object referenced through pointer at offset 16
//     Referenced object is in read-only memory. Creating and corrupting a copy instead
//       Corrupting object at 0x2ca004 of type INTERNALIZED_ONE_BYTE_STRING_TYPE
//       Corrupted 16-bit field at offset 0. Old value: 0x155, new value: 0x156
// Corrupting memory starting from object at 0x2cb054 with RNG seed 2349641633
//   Corrupting object at 0x2cb054 of type JS_OBJECT_TYPE
//   Corrupted 8-bit field at offset 10. Old value: 0x0, new value: 0x3b
// Corrupting memory starting from object at 0x2cb054 with RNG seed 2696887511
//   Corrupting object at 0x2cb054 of type JS_OBJECT_TYPE
//   Recursively corrupting object referenced through pointer at offset 4
//     Corrupting object at 0x2cb0bc of type NAME_DICTIONARY_TYPE
//     Corrupted 16-bit field at offset 156. Old value: 0x11, new value: 0x38
// Corrupting memory starting from object at 0x2cb054 with RNG seed 2349641633
//   Corrupting object at 0x2cb054 of type JS_OBJECT_TYPE
//   Corrupted 8-bit field at offset 10. Old value: 0x3b, new value: 0x76
// Corrupting memory starting from object at 0x2cb054 with RNG seed 2696887511
//   Corrupting object at 0x2cb054 of type JS_OBJECT_TYPE
//   Recursively corrupting object referenced through pointer at offset 4
//     Corrupting object at 0x2cb0bc of type NAME_DICTIONARY_TYPE
//     Corrupted 32-bit field at offset 156. Old value: 0x38, new value: 0x2f59
// FUZZER ARGS: /work/FuzzilliSbx/fuzzilli/.build/x86_64-unknown-linux-gnu/release/FuzzilliCli --profile=v8Sandbox --wasm /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --instanceType=leaf --connectTo=127.0.0.1:10003
// TARGET ARGS: /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --expose-gc --omit-quit --allow-natives-syntax --fuzzing --jit-fuzzing --sandbox-fuzzing --disable-in-process-stack-traces
// CONTRIBUTORS: 
// EXECUTION TIME: 114ms
