//
// BEGIN FUZZER GENERATED CODE
//

function f0() {
    function f1(a2, a3, a4) {
        const v5 = `
            /wP\u{12345}\u{23456}/ivgs;
        `;
        /(?!(a))\1/yiv.exec(v5);
        return a4;
    }
    try { f1.bind(f0); } catch (e) {}
    const v13 = new Worker(f1, { type: "function" });
    const v14 = v13?.terminateAndWait;
    v14.length;
    let v16;
    try { v16 = new v14(); } catch (e) {}
    v16 ?? v16;
    let v21;
    try { v21 = ("undefined").codePointAt(-2147483649); } catch (e) {}
    v21 ?? v21;
    const v44 = {
        __proto__: -2147483649,
        n(a24, a25) {
            a24?.[a24];
            new Map();
            // WasmModule Code:
            // BeginWasmModule
            //     v29 <- WasmDefineMemory [6,41742],
            //     BeginWasmFunction ([.wasmf32, .wasmi32, .wasmi32, .wasmf64, .wasmi32] => .nothing) -> [v30, v31, v32, v33, v34]
            //         v35 <- Consti32 '5'
            //         v36 <- WasmMemoryLoad 'I64LoadMem32S' v29[v35 + 352756]
            //         v37 <- WasmSignExtend32Intoi64 v36
            //     v38 <- EndWasmFunction
            // v39 <- EndWasmModule
            // 
            const v39 = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([
                0x00, 0x61, 0x73, 0x6D, 0x01, 0x00, 0x00, 0x00, 0x01, 0x09,
                0x01, 0x60, 0x05, 0x7D, 0x7F, 0x7F, 0x7C, 0x7F, 0x00, 0x03,
                0x02, 0x01, 0x00, 0x04, 0x01, 0x00, 0x05, 0x06, 0x01, 0x01,
                0x06, 0x8E, 0xC6, 0x02, 0x06, 0x01, 0x00, 0x07, 0x06, 0x01,
                0x02, 0x77, 0x30, 0x00, 0x00, 0x09, 0x01, 0x00, 0x0A, 0x1C,
                0x01, 0x1A, 0x03, 0x01, 0x7F, 0x01, 0x7E, 0x01, 0x7E, 0x41,
                0x05, 0x21, 0x05, 0x20, 0x05, 0x34, 0x00, 0xF4, 0xC3, 0x15,
                0x21, 0x06, 0x20, 0x06, 0xC4, 0x21, 0x07, 0x0B,
            ])));
            class C40 {
                static a = -2147483649;
                static ["undefined"] = 2.2250738585072014e-308;
                static h;
            }
            new C40();
            new C40();
            new C40();
            return -2147483649;
        },
        3: -2147483649,
    };
    return v44;
}
const v45 = f0();
const v46 = f0();
const v47 = f0();
function f48(a49, a50) {
    a50[3] = a50;
    const v51 = a49[3];
    v51 << v51;
    a50[3] = a50;
    const v59 = {
        get e() {
            v46[Symbol.unscopables] = this;
            v46[536870887] = v45;
            [-1264977986,-1786040727,-256,536870912,-1913732205,-65535];
            [59600,-9007199254740990,22186,13920];
            return [20612,970782218,10000,268435439];
        },
        h: v45,
        c: a50,
        ...v47,
        a: a49,
    };
    v59.e;
    return v59;
}
f48.arguments = f48;
const v61 = f48(v47, v46);
const v62 = f48(v45, v46);
v62[3] = v62;
v62[3] = v62;
function f63() {
}
// WasmModule Code:
// BeginWasmModule
//     BeginWasmFunction ([.wasmf64] => .nothing) -> [v64]
//         WasmBeginTry ([.wasmf64, .wasmf64, .wasmf64, .wasmf64, .wasmf64] => .nothing) [v64, v64, v64, v64, v64] -> L:v65 [v66, v67, v68, v69, v70]
//             v71 <- WasmJsCall([] => .wasmFuncRef) v63 []
//         WasmBeginCatchAll [] -> L:v72
//         WasmEndTry []
//         WasmBeginTry ([.wasmf64, .wasmf64, .wasmf64] => .wasmi64) [v64, v64, v64] -> L:v73 [v74, v75, v76]
//             v77 <- WasmJsCall([] => .wasmFuncRef) v63 []
//             v78 <- Consti64 '-2147483649'
//         WasmBeginCatchAll [v78] -> L:v79
//             v80 <- Consti64 '268435440'
//         v81 <- WasmEndTry [v80]
//     v82 <- EndWasmFunction
// v83 <- EndWasmModule
// 
const v83 = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([
    0x00, 0x61, 0x73, 0x6D, 0x01, 0x00, 0x00, 0x00, 0x01, 0x18,
    0x04, 0x60, 0x05, 0x7C, 0x7C, 0x7C, 0x7C, 0x7C, 0x00, 0x60,
    0x03, 0x7C, 0x7C, 0x7C, 0x01, 0x7E, 0x60, 0x00, 0x01, 0x70,
    0x60, 0x01, 0x7C, 0x00, 0x02, 0x2F, 0x02, 0x07, 0x69, 0x6D,
    0x70, 0x6F, 0x72, 0x74, 0x73, 0x0C, 0x69, 0x6D, 0x70, 0x6F,
    0x72, 0x74, 0x5F, 0x30, 0x5F, 0x76, 0x36, 0x33, 0x00, 0x02,
    0x07, 0x69, 0x6D, 0x70, 0x6F, 0x72, 0x74, 0x73, 0x0C, 0x69,
    0x6D, 0x70, 0x6F, 0x72, 0x74, 0x5F, 0x31, 0x5F, 0x76, 0x36,
    0x33, 0x00, 0x02, 0x03, 0x02, 0x01, 0x03, 0x04, 0x01, 0x00,
    0x05, 0x01, 0x00, 0x06, 0x01, 0x00, 0x07, 0x06, 0x01, 0x02,
    0x77, 0x30, 0x00, 0x02, 0x09, 0x01, 0x00, 0x0A, 0x64, 0x01,
    0x62, 0x0D, 0x01, 0x7C, 0x01, 0x7C, 0x01, 0x7C, 0x01, 0x7C,
    0x01, 0x7C, 0x01, 0x70, 0x01, 0x7C, 0x01, 0x7C, 0x01, 0x7C,
    0x01, 0x70, 0x01, 0x7E, 0x01, 0x7E, 0x01, 0x7E, 0x20, 0x00,
    0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x20, 0x00, 0x06, 0x00,
    0x21, 0x01, 0x21, 0x02, 0x21, 0x03, 0x21, 0x04, 0x21, 0x05,
    0x10, 0x00, 0x21, 0x06, 0x19, 0x0B, 0x20, 0x00, 0x20, 0x00,
    0x20, 0x00, 0x06, 0x01, 0x21, 0x07, 0x21, 0x08, 0x21, 0x09,
    0x10, 0x00, 0x21, 0x0A, 0x42, 0xFF, 0xFF, 0xFF, 0xFF, 0x77,
    0x21, 0x0B, 0x20, 0x0B, 0x19, 0x42, 0xF0, 0xFF, 0xFF, 0xFF,
    0x00, 0x21, 0x0C, 0x20, 0x0C, 0x0B, 0x21, 0x0D, 0x0B,
])),
{ imports: {
    import_0_v63: f63,
    import_1_v63: f63,
} });
const v84 = v45.exports;
v84 ?? v84;
const v86 = f48(v45, v61);
const v87 = [268435456,730400977,7,-2147483647,4096,-1073741824,14,7,-390440541];
let v88;
try { v88 = v87.flat(); } catch (e) {}
try { v88.findLastIndex(v86); } catch (e) {}
([-4294967295])[0];
const v94 = { maxByteLength: 257 };
let v95 = 257;
v95++;
const v97 = new SharedArrayBuffer(v95, v94);
try { Int32Array.toString(); } catch (e) {}
const v100 = new Int32Array(v97);
v100[31];
v100.constructor = f63;
const v102 = [-11975,-60047,-1,16402,-128,-21910,-1134981940];
const v103 = [f0];
[f0,v102,v87];
[v86,v102,v103];
Array.b = Array;
const v107 = Array(Array);
let v108;
try { v108 = v107.flat(); } catch (e) {}
try { v108.fill(v108); } catch (e) {}
function f110(a111, a112) {
    const v113 = a112 ?? a112;
    v113 ?? v113;
    let v115;
    try { v115 = a111.findIndex(f110, f110, a112); } catch (e) {}
    v115 ?? v115;
    Date.name[1];
    const v121 = new Date(9007199254740992);
    try { v121.getUTCDay(); } catch (e) {}
    let v123;
    try { v123 = v121.setFullYear(9007199254740992, v61, 9007199254740992); } catch (e) {}
    Uint16Array.prototype = Uint16Array;
    let v125;
    try { v125 = Uint16Array.call(Array); } catch (e) {}
    v125 ?? v125;
    function f127(a128, a129) {
        a129 ?? a129;
        function f131(a132, a133) {
            a132 ?? a132;
            a133 ?? a133;
            const v136 = {
                b: Uint16Array,
                c: a128,
                a: a132,
                e: 9007199254740992,
                [v123]: Uint16Array,
            };
            v136.c = v136;
            return a129;
        }
        const v137 = f131();
        v137 ?? v137;
        const v139 = f131(f131, v137);
        const v140 = v139 ?? v139;
        v140 ?? v140;
        return f127;
    }
    const v142 = f127();
    v142.d = v142;
    const v143 = f127();
    try { v143(SharedArrayBuffer, SharedArrayBuffer); } catch (e) {}
    v143.caller;
    return a111;
}
corrupt(v107, 2545066311);
const v146 = f110(v107);
v146[0] = v146;
const v147 = f110();
v147 ?? v147;
function f149(a150, a151, a152) {
    a150.d = a150;
    a151 ?? a151;
    return a151;
}
const v154 = f149(f149);
v154 ?? v154;
class C156 {
    static 5;
    static p(a158, a159) {
        this.f;
        this.e;
        new BigInt64Array(2);
        new Float64Array(500);
        const v170 = new Int8Array(512);
        return v170;
    }
    valueOf(a172, a173) {
        // WasmModule Code:
        // BeginWasmModule
        //     BeginWasmFunction ([.wasmi32, .wasmi32, .wasmf32, .wasmi32] => .wasmi64) -> [v174, v175, v176, v177]
        //         v178 <- Wasmi32CompareOp v174 le_u v174
        //     v179 <- EndWasmFunction
        // v180 <- EndWasmModule
        // 
        const v180 = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([
            0x00, 0x61, 0x73, 0x6D, 0x01, 0x00, 0x00, 0x00, 0x01, 0x09,
            0x01, 0x60, 0x04, 0x7F, 0x7F, 0x7D, 0x7F, 0x01, 0x7E, 0x03,
            0x02, 0x01, 0x00, 0x04, 0x01, 0x00, 0x05, 0x01, 0x00, 0x06,
            0x01, 0x00, 0x07, 0x06, 0x01, 0x02, 0x77, 0x30, 0x00, 0x00,
            0x09, 0x01, 0x00, 0x0A, 0x0D, 0x01, 0x0B, 0x01, 0x01, 0x7F,
            0x20, 0x00, 0x20, 0x00, 0x4D, 0x21, 0x04, 0x0B,
        ])));
    }
}
const v181 = new C156();
const v182 = v181?.constructor;
try { new v182(); } catch (e) {}
const v184 = v181?.constructor;
v184.length = v184;
let v185;
try { v185 = new v184(); } catch (e) {}
const v186 = v185?.constructor;
try { new v186(); } catch (e) {}

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
// ==1589117==ERROR: AddressSanitizer: heap-use-after-free on address 0x76b0f52af1e8 at pc 0x59c0ea498c6b bp 0x7ffc57ca8500 sp 0x7ffc57ca84f8
// WRITE of size 8 at 0x76b0f52af1e8 thread T0
//     #0 0x59c0ea498c6a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c0dc6a) (BuildId: 42a5516f89359752)
//         v8::internal::ConcurrentMarking::FlushMemoryChunkData()
//         ./../../third_party/libc++/src/include/__atomic/support/c11.h:181:10
//     #1 0x59c0ea51f901  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c94901) (BuildId: 42a5516f89359752)
//         v8::internal::MarkCompactCollector::MarkLiveObjects()
//         ./../../src/heap/mark-compact.cc:790:34
//     #2 0x59c0ea51c281  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c91281) (BuildId: 42a5516f89359752)
//         v8::internal::MarkCompactCollector::CollectGarbage()
//         ./../../src/heap/mark-compact.cc:488:3
//     #3 0x59c0ea41256c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b8756c) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::MarkCompact()
//         ./../../src/heap/heap.cc:2629:29
//     #4 0x59c0ea410295  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b85295) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::PerformGarbageCollection(v8::internal::GarbageCollector, v8::internal::GarbageCollectionReason, char const*)
//         ./../../src/heap/heap.cc:2250:5
//     #5 0x59c0ea45d46c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bd246c) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags)::$_1::operator()() const
//         ./../../src/heap/heap.cc:1664:7
//     #6 0x59c0ea45ca92  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bd1a92) (BuildId: 42a5516f89359752)
//         void heap::base::Stack::SetMarkerAndCallbackImpl<v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags)::$_1>(heap::base::Stack*, void*, void const*)
//         ./../../src/heap/base/stack.h:167:5
//     #7 0x59c0ec5a3092  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x3d18092) (BuildId: 42a5516f89359752)
//         PushAllRegistersAndIterateStack
//         push_registers_asm.cc:0:0
//     #8 0x59c0ea4011f6  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b761f6) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags)
//         ./../../src/heap/base/stack.h:73:7
//     #9 0x59c0ea3da531  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b4f531) (BuildId: 42a5516f89359752)
//         v8::internal::HeapAllocator::AllocateRawWithLightRetrySlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment)
//         ./../../src/heap/heap-allocator.cc:136:12
//     #10 0x59c0ea3dd881  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b52881) (BuildId: 42a5516f89359752)
//         v8::internal::HeapAllocator::AllocateRawWithRetryOrFailSlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment)
//         ./../../src/heap/heap-allocator.cc:148:7
//     #11 0x59c0ea34e087  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1ac3087) (BuildId: 42a5516f89359752)
//         v8::internal::Factory::AllocateRaw(int, v8::internal::AllocationType, v8::internal::AllocationAlignment)
//         ./../../src/heap/heap-allocator-inl.h:232:16
//     #12 0x59c0ea31c9c9  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1a919c9) (BuildId: 42a5516f89359752)
//         v8::internal::FactoryBase<v8::internal::Factory>::AllocateRawWithImmortalMap(int, v8::internal::AllocationType, v8::internal::Tagged<v8::internal::Map>, v8::internal::AllocationAlignment)
//         ./../../src/heap/factory-base.cc:1293:18
//     #13 0x59c0ea36b086  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1ae0086) (BuildId: 42a5516f89359752)
//         v8::internal::Factory::NewCell(v8::internal::Tagged<v8::internal::Smi>)
//         ./../../src/heap/factory.cc:2138:36
//     #14 0x59c0eb0d4c96  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x2849c96) (BuildId: 42a5516f89359752)
//         v8::internal::Map::GetOrCreatePrototypeChainValidityCell(v8::internal::DirectHandle<v8::internal::Map>, v8::internal::Isolate*)
//         ./../../src/objects/map.cc:2458:43
//     #15 0x59c0eaed5b55  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x264ab55) (BuildId: 42a5516f89359752)
//         v8::internal::KeyedStoreIC::StoreElementHandler(v8::internal::DirectHandle<v8::internal::Map>, v8::internal::KeyedAccessStoreMode, v8::internal::MaybeDirectHandle<v8::internal::Union<v8::internal::Smi, v8::internal::Cell>>)
//         ./../../src/ic/ic.cc:2463:9
//     #16 0x59c0eaed4468  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x2649468) (BuildId: 42a5516f89359752)
//         v8::internal::KeyedStoreIC::UpdateStoreElement(v8::internal::Handle<v8::internal::Map>, v8::internal::KeyedAccessStoreMode, v8::internal::Handle<v8::internal::Map>)
//         ./../../src/ic/ic.cc:2273:30
//     #17 0x59c0eaed8fa7  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x264dfa7) (BuildId: 42a5516f89359752)
//         v8::internal::KeyedStoreIC::Store(v8::internal::Handle<v8::internal::Union<v8::internal::Smi, v8::internal::HeapNumber, v8::internal::BigInt, v8::internal::String, v8::internal::Symbol, v8::internal::Boolean, v8::internal::Null, v8::internal::Undefined, v8::internal::JSReceiver>>, v8::internal::Handle<v8::internal::Object>, v8::internal::Handle<v8::internal::Object>)
//         ./../../src/ic/ic.cc:2696:11
//     #18 0x59c0eaeead44  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x265fd44) (BuildId: 42a5516f89359752)
//         v8::internal::Runtime_KeyedStoreIC_Miss(int, unsigned long*, v8::internal::Isolate*)
//         ./../../src/ic/ic.cc:3132:5
//     #19 0x59c0eeeb7375  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662c375) (BuildId: 42a5516f89359752)
//         Builtins_CEntry_Return1_ArgvOnStack_NoBuiltinExit
//         setup-isolate-deserialize.cc:0:0
//     #20 0x59c0eefaf98e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672498e) (BuildId: 42a5516f89359752)
//         Builtins_SetKeyedPropertyHandler
//         setup-isolate-deserialize.cc:0:0
//     #21 0x59c0eee0ba80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #22 0x59c0eee0ba80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #23 0x59c0eee0969b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e69b) (BuildId: 42a5516f89359752)
//         Builtins_JSEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #24 0x59c0eee093ea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e3ea) (BuildId: 42a5516f89359752)
//         Builtins_JSEntry
//         setup-isolate-deserialize.cc:0:0
//     #25 0x59c0ea1e0c2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1955c2a) (BuildId: 42a5516f89359752)
//         v8::internal::(anonymous namespace)::Invoke(v8::internal::Isolate*, v8::internal::(anonymous namespace)::InvokeParams const&)
//         ./../../src/execution/simulator.h:191:12
//     #26 0x59c0ea1e34f8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19584f8) (BuildId: 42a5516f89359752)
//         v8::internal::Execution::CallScript(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::JSFunction>, v8::internal::DirectHandle<v8::internal::Object>, v8::internal::DirectHandle<v8::internal::Object>)
//         ./../../src/execution/execution.cc:536:10
//     #27 0x59c0e9ce5b00  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x145ab00) (BuildId: 42a5516f89359752)
//         v8::Script::Run(v8::Local<v8::Context>, v8::Local<v8::Data>)
//         ./../../src/api/api.cc:2155:7
//     #28 0x59c0e9a9c686  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1211686) (BuildId: 42a5516f89359752)
//         v8::Shell::ExecuteString(v8::Isolate*, v8::Local<v8::String>, v8::Local<v8::String>, v8::Shell::ReportExceptions, v8::Global<v8::Value>*)
//         ./../../src/d8/d8.cc:1013:44
//     #29 0x59c0e9ad22ff  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12472ff) (BuildId: 42a5516f89359752)
//         v8::SourceGroup::Execute(v8::Isolate*)
//         ./../../src/d8/d8.cc:4879:10
//     #30 0x59c0e9adf4a2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12544a2) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMainIsolate(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5886:37
//     #31 0x59c0e9ade9bf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12539bf) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMain(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5795:18
//     #32 0x59c0e9ae31d8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12581d8) (BuildId: 42a5516f89359752)
//         v8::Shell::Main(int, char**)
//         ./../../src/d8/d8.cc:6649:18
//     #33 0x7860f1a4e1c9  (/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #34 0x7860f1a4e28a  (/lib/x86_64-linux-gnu/libc.so.6+0x2a28a) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #35 0x59c0e998d029  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1102029) (BuildId: 42a5516f89359752)
//         _start
//         ??:0:0
// 
// 0x76b0f52af1e8 is located 232 bytes inside of 8576-byte region [0x76b0f52af100,0x76b0f52b1280)
// freed by thread T79 (WorkerThread) here:
//     #0 0x59c0e9a6696d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x11db96d) (BuildId: 42a5516f89359752)
//         operator delete(void*)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_new_delete.cpp:143:3
//     #1 0x59c0ea6277cc  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9c7cc) (BuildId: 42a5516f89359752)
//         v8::internal::MemoryAllocator::Pool::ReleasePooledChunks()
//         ./../../src/heap/memory-allocator.cc:94:5
//     #2 0x59c0ea6275cd  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9c5cd) (BuildId: 42a5516f89359752)
//         v8::internal::MemoryAllocator::TearDown()
//         ./../../src/heap/memory-allocator.cc:69:11
//     #3 0x59c0ea439344  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bae344) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::TearDown()
//         ./../../src/heap/heap.cc:6191:23
//     #4 0x59c0ea23a330  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19af330) (BuildId: 42a5516f89359752)
//         v8::internal::Isolate::Deinit()
//         ./../../src/execution/isolate.cc:4496:9
//     #5 0x59c0ea2390a1  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19ae0a1) (BuildId: 42a5516f89359752)
//         v8::internal::Isolate::Delete(v8::internal::Isolate*)
//         ./../../src/execution/isolate.cc:4093:12
//     #6 0x59c0e9ad67a7  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124b7a7) (BuildId: 42a5516f89359752)
//         v8::Worker::ExecuteInThread()
//         ./../../src/d8/d8.cc:5380:13
//     #7 0x59c0e9ad552c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a52c) (BuildId: 42a5516f89359752)
//         v8::Worker::WorkerThread::Run()
//         ./../../src/d8/d8.cc:5086:11
//     #8 0x59c0e9ca4243  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1419243) (BuildId: 42a5516f89359752)
//         v8::base::ThreadEntry(void*)
//         ./../../src/base/platform/platform.h:626:5
//     #9 0x59c0e9a2a106  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x119f106) (BuildId: 42a5516f89359752)
//         asan_thread_start(void*)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_interceptors.cpp:239:28
// 
// previously allocated by thread T79 (WorkerThread) here:
//     #0 0x59c0e9a6610d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x11db10d) (BuildId: 42a5516f89359752)
//         operator new(unsigned long)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_new_delete.cpp:86:3
//     #1 0x59c0ea629ffa  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9effa) (BuildId: 42a5516f89359752)
//         v8::internal::MemoryAllocator::AllocatePage(v8::internal::MemoryAllocator::AllocationMode, v8::internal::Space*, v8::internal::Executability)
//         ./../../src/heap/memory-allocator.cc:429:16
//     #2 0x59c0ea65cbb6  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd1bb6) (BuildId: 42a5516f89359752)
//         v8::internal::SemiSpace::AllocateFreshPage()
//         ./../../src/heap/new-spaces.cc:145:56
//     #3 0x59c0ea65d407  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd2407) (BuildId: 42a5516f89359752)
//         v8::internal::SemiSpace::Commit()
//         ./../../src/heap/new-spaces.cc:79:12
//     #4 0x59c0ea65eeb2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd3eb2) (BuildId: 42a5516f89359752)
//         v8::internal::SemiSpaceNewSpace::SemiSpaceNewSpace(v8::internal::Heap*, unsigned long, unsigned long)
//         ./../../src/heap/new-spaces.cc:454:18
//     #5 0x59c0ea4343a7  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1ba93a7) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::SetUpSpaces(v8::internal::LinearAllocationArea&, v8::internal::LinearAllocationArea&)
//         ./../../third_party/libc++/src/include/__memory/unique_ptr.h:765:30
//     #6 0x59c0ea249508  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19be508) (BuildId: 42a5516f89359752)
//         v8::internal::Isolate::Init(v8::internal::SnapshotData*, v8::internal::SnapshotData*, v8::internal::SnapshotData*, bool)
//         ./../../src/execution/isolate.cc:5572:9
//     #7 0x59c0ea24cb4c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19c1b4c) (BuildId: 42a5516f89359752)
//         v8::internal::Isolate::InitWithSnapshot(v8::internal::SnapshotData*, v8::internal::SnapshotData*, v8::internal::SnapshotData*, bool)
//         ./../../src/execution/isolate.cc:5201:10
//     #8 0x59c0eb84b253  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x2fc0253) (BuildId: 42a5516f89359752)
//         v8::internal::Snapshot::Initialize(v8::internal::Isolate*)
//         ./../../src/snapshot/snapshot.cc:198:19
//     #9 0x59c0e9d4c056  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x14c1056) (BuildId: 42a5516f89359752)
//         v8::Isolate::Initialize(v8::Isolate*, v8::Isolate::CreateParams const&)
//         ./../../src/api/api.cc:10163:8
//     #10 0x59c0e9d4c700  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x14c1700) (BuildId: 42a5516f89359752)
//         v8::Isolate::New(v8::Isolate::CreateParams const&)
//         ./../../src/api/api.cc:10202:3
//     #11 0x59c0e9ad5777  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a777) (BuildId: 42a5516f89359752)
//         v8::Worker::ExecuteInThread()
//         ./../../src/d8/d8.cc:5253:14
//     #12 0x59c0e9ad552c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a52c) (BuildId: 42a5516f89359752)
//         v8::Worker::WorkerThread::Run()
//         ./../../src/d8/d8.cc:5086:11
//     #13 0x59c0e9ca4243  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1419243) (BuildId: 42a5516f89359752)
//         v8::base::ThreadEntry(void*)
//         ./../../src/base/platform/platform.h:626:5
//     #14 0x59c0e9a2a106  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x119f106) (BuildId: 42a5516f89359752)
//         asan_thread_start(void*)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_interceptors.cpp:239:28
// 
// Thread T79 (WorkerThread) created by T0 here:
//     #0 0x59c0e9a10b41  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1185b41) (BuildId: 42a5516f89359752)
//         ___interceptor_pthread_create
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_interceptors.cpp:250:3
//     #1 0x59c0e9ca3fca  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1418fca) (BuildId: 42a5516f89359752)
//         v8::base::Thread::Start()
//         ./../../src/base/platform/platform-posix.cc:1263:14
//     #2 0x59c0e9ac2b9a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237b9a) (BuildId: 42a5516f89359752)
//         v8::Worker::StartWorkerThread(v8::Isolate*, std::__Cr::shared_ptr<v8::Worker>, v8::base::Thread::Priority)
//         ./../../src/d8/d8.cc:5070:16
//     #3 0x59c0e9ac2314  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237314) (BuildId: 42a5516f89359752)
//         v8::Shell::WorkerNew(v8::FunctionCallbackInfo<v8::Value> const&)
//         ./../../src/d8/d8.cc:3247:10
//     #4 0x59c0e9d9dbbf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1512bbf) (BuildId: 42a5516f89359752)
//         v8::internal::FunctionCallbackArguments::CallOrConstruct(v8::internal::Tagged<v8::internal::FunctionTemplateInfo>, bool)
//         ./../../src/api/api-arguments-inl.h:95:3
//     #5 0x59c0e9d9b82d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x151082d) (BuildId: 42a5516f89359752)
//         v8::internal::MaybeHandle<v8::internal::Object> v8::internal::(anonymous namespace)::HandleApiCallHelper<true>(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::HeapObject>, v8::internal::DirectHandle<v8::internal::FunctionTemplateInfo>, v8::internal::DirectHandle<v8::internal::Object>, unsigned long*, int)
//         ./../../src/builtins/builtins-api.cc:109:16
//     #6 0x59c0e9d996ce  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x150e6ce) (BuildId: 42a5516f89359752)
//         v8::internal::Builtin_Impl_HandleApiConstruct(v8::internal::BuiltinArguments, v8::internal::Isolate*)
//         ./../../src/builtins/builtins-api.cc:140:3
//     #7 0x59c0eeeb72b5  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662c2b5) (BuildId: 42a5516f89359752)
//         Builtins_CEntry_Return1_ArgvOnStack_BuiltinExit
//         setup-isolate-deserialize.cc:0:0
//     #8 0x59c0eee0c3b2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x65813b2) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #9 0x59c0eefba726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #10 0x59c0eee0ba80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #11 0x59c0eee0ba80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #12 0x59c0eee0969b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e69b) (BuildId: 42a5516f89359752)
//         Builtins_JSEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #13 0x59c0eee093ea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e3ea) (BuildId: 42a5516f89359752)
//         Builtins_JSEntry
//         setup-isolate-deserialize.cc:0:0
//     #14 0x59c0ea1e0c2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1955c2a) (BuildId: 42a5516f89359752)
//         v8::internal::(anonymous namespace)::Invoke(v8::internal::Isolate*, v8::internal::(anonymous namespace)::InvokeParams const&)
//         ./../../src/execution/simulator.h:191:12
//     #15 0x59c0ea1e34f8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19584f8) (BuildId: 42a5516f89359752)
//         v8::internal::Execution::CallScript(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::JSFunction>, v8::internal::DirectHandle<v8::internal::Object>, v8::internal::DirectHandle<v8::internal::Object>)
//         ./../../src/execution/execution.cc:536:10
//     #16 0x59c0e9ce5b00  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x145ab00) (BuildId: 42a5516f89359752)
//         v8::Script::Run(v8::Local<v8::Context>, v8::Local<v8::Data>)
//         ./../../src/api/api.cc:2155:7
//     #17 0x59c0e9a9c686  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1211686) (BuildId: 42a5516f89359752)
//         v8::Shell::ExecuteString(v8::Isolate*, v8::Local<v8::String>, v8::Local<v8::String>, v8::Shell::ReportExceptions, v8::Global<v8::Value>*)
//         ./../../src/d8/d8.cc:1013:44
//     #18 0x59c0e9ad22ff  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12472ff) (BuildId: 42a5516f89359752)
//         v8::SourceGroup::Execute(v8::Isolate*)
//         ./../../src/d8/d8.cc:4879:10
//     #19 0x59c0e9adf4a2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12544a2) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMainIsolate(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5886:37
//     #20 0x59c0e9ade9bf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12539bf) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMain(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5795:18
//     #21 0x59c0e9ae31d8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12581d8) (BuildId: 42a5516f89359752)
//         v8::Shell::Main(int, char**)
//         ./../../src/d8/d8.cc:6649:18
//     #22 0x7860f1a4e1c9  (/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #23 0x7860f1a4e28a  (/lib/x86_64-linux-gnu/libc.so.6+0x2a28a) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #24 0x59c0e998d029  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1102029) (BuildId: 42a5516f89359752)
//         _start
//         ??:0:0
// 
// SUMMARY: AddressSanitizer: heap-use-after-free (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c0dc6a) (BuildId: 42a5516f89359752) 
// Shadow bytes around the buggy address:
//   0x76b0f52aef00: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x76b0f52aef80: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x76b0f52af000: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x76b0f52af080: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x76b0f52af100: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
// =>0x76b0f52af180: fd fd fd fd fd fd fd fd fd fd fd fd fd[fd]fd fd
//   0x76b0f52af200: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x76b0f52af280: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x76b0f52af300: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x76b0f52af380: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x76b0f52af400: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
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
// ==1589117==ABORTING
// 
// ## V8 sandbox violation detected!
// STDOUT:
// 
// FUZZER ARGS: /work/FuzzilliSbx/fuzzilli/.build/x86_64-unknown-linux-gnu/release/FuzzilliCli --profile=v8Sandbox --wasm /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --instanceType=leaf --connectTo=127.0.0.1:10001
// TARGET ARGS: /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --expose-gc --omit-quit --allow-natives-syntax --fuzzing --jit-fuzzing --sandbox-fuzzing --disable-in-process-stack-traces
// CONTRIBUTORS: ClassDefinitionGenerator, ObjectBuilderFunctionGenerator, ObjectLiteralPrototypeGenerator, InputMutator (loose), ElementAssignmentGenerator, ComputedPropertyRetrievalGenerator, SpliceMutator, ArrayGenerator, ObjectLiteralGetterGenerator, WellKnownPropertyStoreGenerator, IntArrayGenerator, ClassStaticPropertyGenerator, ExplorationMutator, ClassStaticComputedPropertyGenerator, ObjectLiteralPropertyGenerator, ObjectLiteralMethodGenerator, ObjectLiteralCopyPropertiesGenerator, ObjectLiteralElementGenerator
// EXECUTION TIME: 183ms
