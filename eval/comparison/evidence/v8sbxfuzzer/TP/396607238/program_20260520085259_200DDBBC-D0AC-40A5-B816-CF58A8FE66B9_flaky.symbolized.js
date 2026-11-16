//
// BEGIN FUZZER GENERATED CODE
//

const v0 = [];
const v3 = new SharedArrayBuffer(2018);
corrupt(SharedArrayBuffer, 3744541744);
corrupt(SharedArrayBuffer, 1863391664);
corrupt(SharedArrayBuffer, 1048762327);
function F6(a8, a9, a10, a11) {
    if (!new.target) { throw 'must be called with new'; }
    const v15 = ("undefined").constructor.fromCharCode(1, 2275, 64213);
    corrupt(v15, 4061792615);
    corrupt(v15, 2806962931);
    v15.normalize().normalize();
}
const v19 = new Date();
corrupt(v3, 2362875017);
class C23 extends Date {
    #h;
    f;
    constructor(a25, a26) {
        super(-1.2538627820733455e+308);
        v0[268435440] = -1.2538627820733455e+308;
        super[this] = a26;
        corrupt(C23, 294987839);
        this[3.6168603240311217e+307];
        corrupt(v3, 2020987109);
        corrupt(v3, 2581882555);
        v0[65537] = v0;
    }
    h;
}
new C23(-1.2538627820733455e+308, 3.6168603240311217e+307);
const v29 = new C23(-1.2538627820733455e+308, -1.2538627820733455e+308);
new C23(-1.2538627820733455e+308, -1.2538627820733455e+308);
let v31 = 13;
v31--;
corrupt(Date, 1973013699);
const v33 = v31--;
corrupt(v19, 1174090009);
corrupt(v19, 1392191704);
corrupt(v19, 562209855);
const v35 = `
    /a(?:b)xa\ud808\udf45*/yums;
`;
corrupt(v29, 3605101710);
const v39 = Array(122);
const v41 = ({ __proto__: v39 }).pop();
/\cj\cJ\ci\cI\ck\cK[\cZ]/yudgm;
const v46 = { maxByteLength: 65536 };
corrupt(SharedArrayBuffer, 149522450);
corrupt(SharedArrayBuffer, 2062799733);
const v48 = { maxByteLength: 1073741824 };
const v51 = Array();
function f53() {
    const v57 = {
        __proto__: 1000000.0,
        e: -4096,
        ...-4096,
        h: -4096,
        [-2.0]: -2.0,
        ...1000000.0,
        g: -2.0,
        b: -2.0,
        [-4096]: 1000000.0,
        a: -2.0,
    };
    v57.b = v57;
    corrupt(v57, 1272624176);
    corrupt(v57, 2393718261);
    corrupt(v57, 1392165013);
    return v57;
}
corrupt(v46, 2735610650);
f53();
corrupt(v46, 3955373315);
corrupt(v46, 737078935);
function f59() {
    function f61(a62) {
    }
    function f63(a64, a65, a66) {
        const v68 = f61 * 731899471;
        v68 ** v68;
        const v72 = new Date();
        function f73(a74) {
            this(1073741825, f73);
            return 2018;
        }
        v72.toString = f73;
        corrupt(a64, 2565085815);
        corrupt(a64, 921133642);
    }
    corrupt(Float32Array, 3786555958);
    corrupt(Float32Array, 1157364095);
    f63();
    try { v51(); } catch (e) {}
    class C79 {
        static #o(a81) {
        }
        constructor(a83, a84, a85, a86) {
            Date.UTC(a84, a83, super.b, 1073741824, a84);
        }
    }
    f61();
}
f59();
f59();
%OptimizeMaglevOnNextCall(f59);
f59();
const v99 = String.fromCodePoint(v31);
const v101 = Array(v33);
v101[8697] = v99;
corrupt(v41, 819982527);
corrupt(v41, 953299875);
corrupt(v41, 278247605);
JSON.parse(JSON.stringify(v101));

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
// ==3862848==ERROR: AddressSanitizer: container-overflow on address 0x755314a96838 at pc 0x5dbd1b78c195 bp 0x7ffc21b0f8d0 sp 0x7ffc21b0f8c8
// READ of size 4 at 0x755314a96838 thread T0
//     #0 0x5dbd1b78c194  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1239194) (BuildId: 42a5516f89359752)
//         v8::Worker::PostMessage(std::__Cr::unique_ptr<v8::SerializationData, std::__Cr::default_delete<v8::SerializationData>>)
//         ./../../third_party/libc++/src/include/__atomic/support/c11.h:81:10
//     #1 0x5dbd1b78b34c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x123834c) (BuildId: 42a5516f89359752)
//         v8::Shell::WorkerPostMessage(v8::FunctionCallbackInfo<v8::Value> const&)
//         ./../../src/d8/d8.cc:3277:13
//     #2 0x5dbd20ad586d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658286d) (BuildId: 42a5516f89359752)
//         Builtins_CallApiCallbackGeneric
//         setup-isolate-deserialize.cc:0:0
//     #3 0x5dbd20ad3a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #4 0x5dbd20ad3a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #5 0x5dbd20ad3a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #6 0x5dbd20ad3a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #7 0x5dbd20ad169b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e69b) (BuildId: 42a5516f89359752)
//         Builtins_JSEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #8 0x5dbd20ad13ea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e3ea) (BuildId: 42a5516f89359752)
//         Builtins_JSEntry
//         setup-isolate-deserialize.cc:0:0
//     #9 0x5dbd1bea8c2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1955c2a) (BuildId: 42a5516f89359752)
//         v8::internal::(anonymous namespace)::Invoke(v8::internal::Isolate*, v8::internal::(anonymous namespace)::InvokeParams const&)
//         ./../../src/execution/simulator.h:191:12
//     #10 0x5dbd1beab4f8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19584f8) (BuildId: 42a5516f89359752)
//         v8::internal::Execution::CallScript(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::JSFunction>, v8::internal::DirectHandle<v8::internal::Object>, v8::internal::DirectHandle<v8::internal::Object>)
//         ./../../src/execution/execution.cc:536:10
//     #11 0x5dbd1b9adb00  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x145ab00) (BuildId: 42a5516f89359752)
//         v8::Script::Run(v8::Local<v8::Context>, v8::Local<v8::Data>)
//         ./../../src/api/api.cc:2155:7
//     #12 0x5dbd1b764686  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1211686) (BuildId: 42a5516f89359752)
//         v8::Shell::ExecuteString(v8::Isolate*, v8::Local<v8::String>, v8::Local<v8::String>, v8::Shell::ReportExceptions, v8::Global<v8::Value>*)
//         ./../../src/d8/d8.cc:1013:44
//     #13 0x5dbd1b79a2ff  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12472ff) (BuildId: 42a5516f89359752)
//         v8::SourceGroup::Execute(v8::Isolate*)
//         ./../../src/d8/d8.cc:4879:10
//     #14 0x5dbd1b7a74a2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12544a2) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMainIsolate(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5886:37
//     #15 0x5dbd1b7a69bf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12539bf) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMain(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5795:18
//     #16 0x5dbd1b7ab1d8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12581d8) (BuildId: 42a5516f89359752)
//         v8::Shell::Main(int, char**)
//         ./../../src/d8/d8.cc:6649:18
//     #17 0x78331568b1c9  (/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #18 0x78331568b28a  (/lib/x86_64-linux-gnu/libc.so.6+0x2a28a) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #19 0x5dbd1b655029  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1102029) (BuildId: 42a5516f89359752)
//         _start
//         ??:0:0
// 
// 0x755314a96838 is located 184 bytes inside of 200-byte region [0x755314a96780,0x755314a96848)
// allocated by thread T0 here:
//     #0 0x5dbd1b72e10d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x11db10d) (BuildId: 42a5516f89359752)
//         operator new(unsigned long)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_new_delete.cpp:86:3
//     #1 0x5dbd1b76f450  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x121c450) (BuildId: 42a5516f89359752)
//         v8::(anonymous namespace)::InitializeModuleEmbedderData(v8::Local<v8::Context>)
//         ./../../third_party/libc++/src/include/__new/allocate.h:35:10
//     #2 0x5dbd1b77c309  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1229309) (BuildId: 42a5516f89359752)
//         v8::Shell::CreateRealm(v8::FunctionCallbackInfo<v8::Value> const&, int, v8::MaybeLocal<v8::Value>)
//         ./../../src/d8/d8.cc:2306:3
//     #3 0x5dbd1b77d204  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x122a204) (BuildId: 42a5516f89359752)
//         v8::Shell::RealmCreateAllowCrossRealmAccess(v8::FunctionCallbackInfo<v8::Value> const&)
//         ./../../src/d8/d8.cc:2338:7
//     #4 0x5dbd20ad5972  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6582972) (BuildId: 42a5516f89359752)
//         Builtins_CallApiCallbackOptimizedNoProfiling
//         setup-isolate-deserialize.cc:0:0
//     #5 0x5dbd80b407dd  (<unknown module>)
//     #6 0x5dbd20b82301  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662f301) (BuildId: 42a5516f89359752)
//         Builtins_GetPropertyWithReceiver
//         setup-isolate-deserialize.cc:0:0
//     #7 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #8 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #9 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #10 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #11 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #12 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #13 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #14 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #15 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #16 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #17 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #18 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #19 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #20 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #21 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #22 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #23 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #24 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #25 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #26 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #27 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #28 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
//     #29 0x5dbd20bff37b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x66ac37b) (BuildId: 42a5516f89359752)
//         Builtins_ProxyGetProperty
//         setup-isolate-deserialize.cc:0:0
// 
// HINT: if you don't care about these errors you may set ASAN_OPTIONS=detect_container_overflow=0.
// If you suspect a false positive see also: https://github.com/google/sanitizers/wiki/AddressSanitizerContainerOverflow.
// SUMMARY: AddressSanitizer: container-overflow (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1239194) (BuildId: 42a5516f89359752) 
// Shadow bytes around the buggy address:
//   0x755314a96580: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x755314a96600: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x755314a96680: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x755314a96700: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x755314a96780: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
// =>0x755314a96800: 00 00 00 00 00 00 01[fc]00 fa fa fa fa fa fa fa
//   0x755314a96880: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x755314a96900: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x755314a96980: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x755314a96a00: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x755314a96a80: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
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
// ==3862848==ABORTING
// 
// ## V8 sandbox violation detected!
// STDOUT:
// Corrupting memory starting from object at 0x37bcfb0 with RNG seed 3744541744
//   Corrupting object at 0x37bcfb0 of type JS_FUNCTION_TYPE
//   Recursively corrupting object referenced through pointer at offset 0
//     Corrupting object at 0x37bcf14 of type MAP_TYPE
//     Recursively corrupting neighboring object at offset 208
//       Corrupting object at 0x37bcfe4 of type MAP_TYPE
//       Corrupted 32-bit field at offset 36. Old value: 0x0, new value: 0x2b30393
// Corrupting memory starting from object at 0x37bcfb0 with RNG seed 1863391664
//   Corrupting object at 0x37bcfb0 of type JS_FUNCTION_TYPE
//   Recursively corrupting neighboring object at offset 132
//     Corrupting object at 0x37bd034 of type DESCRIPTOR_ARRAY_TYPE
//     Corrupted 16-bit field at offset 20. Old value: 0x159c, new value: 0x179c
// Corrupting memory starting from object at 0x37bcfb0 with RNG seed 1048762327
//   Corrupting object at 0x37bcfb0 of type JS_FUNCTION_TYPE
//   Corrupted 32-bit field at offset 0. Old value: 0x37bcf15, new value: 0xab65
// Corrupting memory starting from object at 0x14d3c5c with RNG seed 2362875017
//   Corrupting object at 0x14d3c5c of type JS_ARRAY_BUFFER_TYPE
//   Recursively corrupting neighboring object at offset 2392
//     Corrupting object at 0x14d45b4 of type FOREIGN_TYPE
//     Corrupted 16-bit field at offset 4. Old value: 0x1b00, new value: 0xb00
//     Will keep flipping this field between old and new value on background worker
// FUZZER ARGS: /work/FuzzilliSbx/fuzzilli/.build/x86_64-unknown-linux-gnu/release/FuzzilliCli --profile=v8Sandbox --wasm /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --instanceType=leaf --connectTo=127.0.0.1:10001
// TARGET ARGS: /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --expose-gc --omit-quit --allow-natives-syntax --fuzzing --jit-fuzzing --sandbox-fuzzing --disable-in-process-stack-traces
// CONTRIBUTORS: 
// EXECUTION TIME: 92ms
