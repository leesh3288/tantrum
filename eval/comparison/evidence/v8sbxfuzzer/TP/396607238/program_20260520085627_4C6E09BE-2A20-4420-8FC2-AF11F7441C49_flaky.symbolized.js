//
// BEGIN FUZZER GENERATED CODE
//

function F3(a5, a6) {
    if (!new.target) { throw 'must be called with new'; }
    this.b = a5;
    this.g = a6;
}
new F3("symbol", "symbol");
const v8 = new F3("toString", "268435456");
corrupt(v8, 704513358);
corrupt(v8, 1562278272);
corrupt(v8, 1931374904);
const v9 = new F3("toString", "268435456");
function f11() {
    return "toString";
}
function f15() {
    corrupt(f15, 475522122);
    corrupt(f15, 3613751413);
    corrupt(f15, 4021547451);
}
const v24 = -10 | -10;
corrupt(-1n, 2276640376);
corrupt(-1n, 2124453478);
const v26 = v24 / 9;
let v29 = 515;
const v30 = v29++;
const v32 = new Uint32Array(v29);
v32.fill(47845);
const v35 = new Uint32Array(8);
let v40 = -1;
corrupt(v9, 2476697548);
corrupt(v9, 1365965255);
corrupt(v9, 597770683);
-47845;
const v42 = v40++;
Math.log(9);
Math.log1p(47845);
corrupt(Float32Array, 962551933);
corrupt(Float32Array, 3776412703);
corrupt(Float32Array, 3197443877);
const v45 = Math.asinh(536870912);
v42 ?? 47845;
const v47 = new Float32Array(257);
Int16Array.prototype = Int16Array;
const v50 = new Int16Array(8);
let v51;
try { v51 = v50.at("5"); } catch (e) {}
-12 >>> -12;
function f54() {
    return f54;
}
function f55(a56, a57) {
    return f55;
    corrupt(v51, 1142723600);
}
try { f55(f15, "0"); } catch (e) {}
function f60() {
    return v24;
}
f60.name;
let v62 = [255,Int16Array,255,255,255];
[v62,f60,f60,v62];
corrupt(Uint32Array, 1793720642);
corrupt(Uint32Array, 4045352281);
const v64 = [-1000000000000.0,-367.81301734010196,-476.74454452527516,-2.6076772957175923e+306,1.7976931348623157e+308,0.11176331082589741,Infinity,1000000.0];
corrupt(v8, 2526066746);
corrupt(v8, 2085285964);
corrupt(v8, 3186958983);
v64[7] = v64;
corrupt(Math, 3423963563);
corrupt(Math, 1291886362);
function f65(a66) {
    return f65;
}
const v67 = {};
const v68 = [1.0,717.7714105703308,0.778223271588524,286.12109897992036,-845.4818071696901];
const v69 = [1e-15,1.087803616083844e+307,-150107.33810405293,47.532558382078605,-4.3503475785542914e+306,201661.62952944753,1.0];
const v70 = [-0.2469024020647197];
const v71 = [v69,v70,v69,v69,v68];
const v72 = [v70];
f15[0];
function F74(a76, a77, a78) {
    if (!new.target) { throw 'must be called with new'; }
}
let v79 = 16;
v79 >> v79;
function f81(a82, a83, a84) {
    return v79.search(v72);
}
const v88 = new BigUint64Array();
const v103 = {
    f: -12,
    maxByteLength: 255,
    valueOf() {
        return f60;
    },
    get f() {
        corrupt(v51, 555706430);
        corrupt(v51, 2936907200);
        corrupt(v51, 892445420);
        const v92 = {};
        v92.f = v92;
        const v94 = new Proxy(this, v92);
        const v95 = v94?.c;
        try { new v95(Proxy, JSON, f81); } catch (e) {}
        try { JSON.stringify(v94); } catch (e) {}
        return v35;
    },
    get c() {
        constructor().Realm.createAllowCrossRealmAccess();
        return v51;
    },
    g: v30,
    a: false,
    d: 15,
    b: 15,
    [v45]: v67,
};
const v104 = v103?.c;
try { new v104(257, 8, F74); } catch (e) {}
const v106 = { ...v103 };
Object.defineProperty(v32, 1073741825, { writable: true, configurable: true, enumerable: true, get: f81, set: f65 });
corrupt(v32, 1150551120);
corrupt(v32, 140025694);
corrupt(v32, 608733351);
v71[268435439];
f54 = f55;
Object.defineProperty(v47, 2147483647, { writable: true, configurable: true, enumerable: true, set: f65 });
corrupt(v35, 2477283125);
corrupt(v35, 3890362646);
({"length":v62,} = v32);
const t134 = 2354;
t134[1367] = 2354;
const v109 = [4,-61572,9,1957989437,1073741824,128,-2];
v109.toReversed();
v109[15];
class C112 {
}
const v114 = new Map();
const v115 = v114.has(v26);
corrupt(f65, 1214778691);
corrupt(f65, 165394189);
v115 || v115;
function f117(a118, a119) {
    return a119;
}
const v120 = f117(2354, v64);
function f121(a122, a123, a124) {
    return F74;
}
f117(v120);
Uint32Array.bind(v88);
corrupt(v68, 740395397);
corrupt(v68, 3946976853);
corrupt(v68, 728345318);
function f128() {
    return v114;
}
for (let [i132, i133] = (() => {
        v79--;
        return [0, 10];
    })();
    i132;
    (() => {
        function f136() {
        }
    })()) {
}

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
// ==566183==ERROR: AddressSanitizer: container-overflow on address 0x6ff78a62a6b8 at pc 0x64c2064bb195 bp 0x7ffeed9ae9d0 sp 0x7ffeed9ae9c8
// READ of size 4 at 0x6ff78a62a6b8 thread T0
//     #0 0x64c2064bb194  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1239194) (BuildId: 42a5516f89359752)
//         v8::Worker::PostMessage(std::__Cr::unique_ptr<v8::SerializationData, std::__Cr::default_delete<v8::SerializationData>>)
//         ./../../third_party/libc++/src/include/__atomic/support/c11.h:81:10
//     #1 0x64c2064ba34c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x123834c) (BuildId: 42a5516f89359752)
//         v8::Shell::WorkerPostMessage(v8::FunctionCallbackInfo<v8::Value> const&)
//         ./../../src/d8/d8.cc:3277:13
//     #2 0x64c20b80486d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658286d) (BuildId: 42a5516f89359752)
//         Builtins_CallApiCallbackGeneric
//         setup-isolate-deserialize.cc:0:0
//     #3 0x64c20b802a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #4 0x64c20b802a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #5 0x64c20b802a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #6 0x64c20b802a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #7 0x64c20b802a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #8 0x64c20b80069b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e69b) (BuildId: 42a5516f89359752)
//         Builtins_JSEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #9 0x64c20b8003ea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e3ea) (BuildId: 42a5516f89359752)
//         Builtins_JSEntry
//         setup-isolate-deserialize.cc:0:0
//     #10 0x64c206bd7c2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1955c2a) (BuildId: 42a5516f89359752)
//         v8::internal::(anonymous namespace)::Invoke(v8::internal::Isolate*, v8::internal::(anonymous namespace)::InvokeParams const&)
//         ./../../src/execution/simulator.h:191:12
//     #11 0x64c206bda4f8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19584f8) (BuildId: 42a5516f89359752)
//         v8::internal::Execution::CallScript(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::JSFunction>, v8::internal::DirectHandle<v8::internal::Object>, v8::internal::DirectHandle<v8::internal::Object>)
//         ./../../src/execution/execution.cc:536:10
//     #12 0x64c2066dcb00  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x145ab00) (BuildId: 42a5516f89359752)
//         v8::Script::Run(v8::Local<v8::Context>, v8::Local<v8::Data>)
//         ./../../src/api/api.cc:2155:7
//     #13 0x64c206493686  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1211686) (BuildId: 42a5516f89359752)
//         v8::Shell::ExecuteString(v8::Isolate*, v8::Local<v8::String>, v8::Local<v8::String>, v8::Shell::ReportExceptions, v8::Global<v8::Value>*)
//         ./../../src/d8/d8.cc:1013:44
//     #14 0x64c2064c92ff  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12472ff) (BuildId: 42a5516f89359752)
//         v8::SourceGroup::Execute(v8::Isolate*)
//         ./../../src/d8/d8.cc:4879:10
//     #15 0x64c2064d64a2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12544a2) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMainIsolate(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5886:37
//     #16 0x64c2064d59bf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12539bf) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMain(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5795:18
//     #17 0x64c2064da1d8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12581d8) (BuildId: 42a5516f89359752)
//         v8::Shell::Main(int, char**)
//         ./../../src/d8/d8.cc:6649:18
//     #18 0x72d78b1df1c9  (/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #19 0x72d78b1df28a  (/lib/x86_64-linux-gnu/libc.so.6+0x2a28a) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #20 0x64c206384029  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1102029) (BuildId: 42a5516f89359752)
//         _start
//         ??:0:0
// 
// 0x6ff78a62a6b8 is located 184 bytes inside of 200-byte region [0x6ff78a62a600,0x6ff78a62a6c8)
// allocated by thread T0 here:
//     #0 0x64c20645d10d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x11db10d) (BuildId: 42a5516f89359752)
//         operator new(unsigned long)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_new_delete.cpp:86:3
//     #1 0x64c20649e450  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x121c450) (BuildId: 42a5516f89359752)
//         v8::(anonymous namespace)::InitializeModuleEmbedderData(v8::Local<v8::Context>)
//         ./../../third_party/libc++/src/include/__new/allocate.h:35:10
//     #2 0x64c2064ab309  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1229309) (BuildId: 42a5516f89359752)
//         v8::Shell::CreateRealm(v8::FunctionCallbackInfo<v8::Value> const&, int, v8::MaybeLocal<v8::Value>)
//         ./../../src/d8/d8.cc:2306:3
//     #3 0x64c2064ac204  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x122a204) (BuildId: 42a5516f89359752)
//         v8::Shell::RealmCreateAllowCrossRealmAccess(v8::FunctionCallbackInfo<v8::Value> const&)
//         ./../../src/d8/d8.cc:2338:7
//     #4 0x64c20b80486d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658286d) (BuildId: 42a5516f89359752)
//         Builtins_CallApiCallbackGeneric
//         setup-isolate-deserialize.cc:0:0
//     #5 0x64c26b7c00cc  (<unknown module>)
//     #6 0x64c20b8b1301  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662f301) (BuildId: 42a5516f89359752)
//         Builtins_GetPropertyWithReceiver
//         setup-isolate-deserialize.cc:0:0
//     #7 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #8 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #9 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #10 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #11 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #12 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #13 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #14 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #15 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #16 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #17 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #18 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #19 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #20 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #21 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #22 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #23 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #24 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #25 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #26 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #27 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #28 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #29 0x64c20b92e37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
// 
// HINT: if you don't care about these errors you may set ASAN_OPTIONS=detect_container_overflow=0.
// If you suspect a false positive see also: https://github.com/google/sanitizers/wiki/AddressSanitizerContainerOverflow.
// SUMMARY: AddressSanitizer: container-overflow (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1239194) (BuildId: 42a5516f89359752) 
// Shadow bytes around the buggy address:
//   0x6ff78a62a400: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x6ff78a62a480: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x6ff78a62a500: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x6ff78a62a580: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x6ff78a62a600: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
// =>0x6ff78a62a680: 00 00 00 00 00 00 01[fc]00 fa fa fa fa fa fa fa
//   0x6ff78a62a700: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x6ff78a62a780: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x6ff78a62a800: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x6ff78a62a880: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x6ff78a62a900: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
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
// ==566183==ABORTING
// 
// ## V8 sandbox violation detected!
// STDOUT:
// Corrupting memory starting from object at 0x144d07c with RNG seed 704513358
//   Corrupting object at 0x144d07c of type JS_OBJECT_TYPE
//   Recursively corrupting neighboring object at offset 1216
//     Corrupting object at 0x144d53c of type FILLER_TYPE
//     Recursively corrupting neighboring object at offset 1148
//       Corrupting object at 0x144d9b8 of type FOREIGN_TYPE
//       Corrupted 16-bit field at offset 4. Old value: 0x180, new value: 0x931
//       Will keep flipping this field between old and new value on background worker
// FUZZER ARGS: /work/FuzzilliSbx/fuzzilli/.build/x86_64-unknown-linux-gnu/release/FuzzilliCli --profile=v8Sandbox --wasm /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --instanceType=leaf --connectTo=127.0.0.1:10001
// TARGET ARGS: /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --expose-gc --omit-quit --allow-natives-syntax --fuzzing --jit-fuzzing --sandbox-fuzzing --disable-in-process-stack-traces
// CONTRIBUTORS: 
// EXECUTION TIME: 65ms
