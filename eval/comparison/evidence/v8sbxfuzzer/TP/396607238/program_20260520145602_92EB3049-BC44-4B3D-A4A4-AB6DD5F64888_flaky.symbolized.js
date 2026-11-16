//
// BEGIN FUZZER GENERATED CODE
//

const v2 = new Float32Array(1133);
corrupt(v2, 791443381);
let v3 = 1151;
v3++;
Uint8Array.e = Uint8Array;
new Uint8Array(v3);
1545 % 1545;
const v10 = new BigUint64Array(1545);
[-0.0,3.2347813688417684e+307,1.7976931348623157e+308,0.2219348773430707,-1.7896117828411674e+308,1.0,1.0];
[-4.488085972043123,NaN,641.4364680884173,1000000000.0,-381223.2805476679,-8.053698924436123e+307,0.9792224832472103,-1.1035546465230155e+308,5.586600382049552];
const v13 = [523408.0450598092,-2.220446049250313e-16,-5.0,-1e-15,0.0,0.10567471735511536];
corrupt(v10, 3408956707);
602028.9348398938 >>> 602028.9348398938;
class C19 {
    constructor(a21, a22) {
        const v23 = this?.constructor;
        try { new v23(v13, this); } catch (e) {}
        a21 ?? a21;
        a22 ?? a22;
        function f27(a28) {
            const v31 = +610.6863605505821;
            corrupt(this, 155829170);
            corrupt(this, 3579230126);
            corrupt(this, 2901122904);
            -1000000000.0 % -1000000000.0;
            function f33(a34, a35, a36) {
                function F37() {
                    if (!new.target) { throw 'must be called with new'; }
                    function f39(a40, a41, a42) {
                        corrupt(f39, 1865949838);
                        return a36;
                    }
                    corrupt(a34, 3069738246);
                    f39();
                }
                const v44 = new F37();
                return v44;
            }
            const v45 = f33();
            const v46 = f33(f33, f33, v45);
            %OptimizeFunctionOnNextCall(f33);
            f33(f33, v45, v46);
            v31 % 1073741823;
        }
        new Worker(f27, { type: "function" });
    }
}
new C19();
new C19();
new C19();
function f59(a60, a61, a62) {
    function f63(a64) {
    }
    for (let v65 = 0; v65 < 5; v65++) {
        corrupt(f63, 3033596904);
        corrupt(ArrayBuffer, 2661720101);
        corrupt(ArrayBuffer, 3694147809);
        new Worker(f63, { type: "function" });
    }
    return f59;
}
try { f59(2.2250738585072014e-308, 2.2250738585072014e-308, 2.2250738585072014e-308); } catch (e) {}
try { ("function").endsWith(1133); } catch (e) {}
const v75 = new Worker(f59, { type: "function" });
v75.getMessage(v75);

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
// ==3951108==ERROR: AddressSanitizer: heap-use-after-free on address 0x74ea1a4c29e8 at pc 0x6297495c7c6b bp 0x7ffd5cec1560 sp 0x7ffd5cec1558
// WRITE of size 8 at 0x74ea1a4c29e8 thread T0
//     #0 0x6297495c7c6a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c0dc6a) (BuildId: 42a5516f89359752)
//         v8::internal::ConcurrentMarking::FlushMemoryChunkData()
//         ./../../third_party/libc++/src/include/__atomic/support/c11.h:181:10
//     #1 0x62974964e901  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c94901) (BuildId: 42a5516f89359752)
//         v8::internal::MarkCompactCollector::MarkLiveObjects()
//         ./../../src/heap/mark-compact.cc:790:34
//     #2 0x62974964b281  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c91281) (BuildId: 42a5516f89359752)
//         v8::internal::MarkCompactCollector::CollectGarbage()
//         ./../../src/heap/mark-compact.cc:488:3
//     #3 0x62974954156c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b8756c) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::MarkCompact()
//         ./../../src/heap/heap.cc:2629:29
//     #4 0x62974953f295  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b85295) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::PerformGarbageCollection(v8::internal::GarbageCollector, v8::internal::GarbageCollectionReason, char const*)
//         ./../../src/heap/heap.cc:2250:5
//     #5 0x62974958c46c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bd246c) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags)::$_1::operator()() const
//         ./../../src/heap/heap.cc:1664:7
//     #6 0x62974958ba92  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bd1a92) (BuildId: 42a5516f89359752)
//         void heap::base::Stack::SetMarkerAndCallbackImpl<v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags)::$_1>(heap::base::Stack*, void*, void const*)
//         ./../../src/heap/base/stack.h:167:5
//     #7 0x62974b6d2092  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x3d18092) (BuildId: 42a5516f89359752)
//         PushAllRegistersAndIterateStack
//         push_registers_asm.cc:0:0
//     #8 0x6297495301f6  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b761f6) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags)
//         ./../../src/heap/base/stack.h:73:7
//     #9 0x629749537210  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b7d210) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::HandleExternalMemoryInterrupt()
//         ./../../src/heap/heap.cc:1476:28
//     #10 0x629748bf1759  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237759) (BuildId: 42a5516f89359752)
//         v8::internal::Managed<v8::Worker>::From(v8::internal::Isolate*, unsigned long, std::__Cr::shared_ptr<v8::Worker>, v8::internal::AllocationType)
//         ./../../src/objects/managed-inl.h:33:42
//     #11 0x629748bf1270  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237270) (BuildId: 42a5516f89359752)
//         v8::Shell::WorkerNew(v8::FunctionCallbackInfo<v8::Value> const&)
//         ./../../src/d8/d8.cc:3242:9
//     #12 0x629748eccbbf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1512bbf) (BuildId: 42a5516f89359752)
//         v8::internal::FunctionCallbackArguments::CallOrConstruct(v8::internal::Tagged<v8::internal::FunctionTemplateInfo>, bool)
//         ./../../src/api/api-arguments-inl.h:95:3
//     #13 0x629748eca82d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x151082d) (BuildId: 42a5516f89359752)
//         v8::internal::MaybeHandle<v8::internal::Object> v8::internal::(anonymous namespace)::HandleApiCallHelper<true>(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::HeapObject>, v8::internal::DirectHandle<v8::internal::FunctionTemplateInfo>, v8::internal::DirectHandle<v8::internal::Object>, unsigned long*, int)
//         ./../../src/builtins/builtins-api.cc:109:16
//     #14 0x629748ec86ce  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x150e6ce) (BuildId: 42a5516f89359752)
//         v8::internal::Builtin_Impl_HandleApiConstruct(v8::internal::BuiltinArguments, v8::internal::Isolate*)
//         ./../../src/builtins/builtins-api.cc:140:3
//     #15 0x62974dfe62b5  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662c2b5) (BuildId: 42a5516f89359752)
//         Builtins_CEntry_Return1_ArgvOnStack_BuiltinExit
//         setup-isolate-deserialize.cc:0:0
//     #16 0x62974df3b3b2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x65813b2) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #17 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #18 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #19 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #20 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #21 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #22 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #23 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #24 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #25 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #26 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #27 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #28 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #29 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #30 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #31 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #32 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #33 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #34 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #35 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #36 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #37 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #38 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #39 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #40 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #41 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #42 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #43 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #44 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #45 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #46 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #47 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #48 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #49 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #50 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #51 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #52 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #53 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #54 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #55 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #56 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #57 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #58 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #59 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #60 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #61 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #62 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #63 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #64 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #65 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #66 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #67 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #68 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #69 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #70 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #71 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #72 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #73 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #74 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #75 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #76 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #77 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #78 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #79 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #80 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #81 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #82 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #83 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #84 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #85 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #86 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #87 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #88 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #89 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #90 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #91 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #92 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #93 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #94 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #95 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #96 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #97 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #98 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #99 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #100 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #101 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #102 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #103 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #104 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #105 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #106 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #107 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #108 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #109 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #110 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #111 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #112 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #113 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #114 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #115 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #116 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #117 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #118 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #119 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #120 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #121 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #122 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #123 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #124 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #125 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #126 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #127 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #128 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #129 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #130 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #131 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #132 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #133 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #134 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #135 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #136 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #137 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #138 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #139 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #140 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #141 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #142 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #143 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #144 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #145 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #146 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #147 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #148 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #149 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #150 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #151 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #152 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #153 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #154 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #155 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #156 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #157 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #158 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #159 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #160 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #161 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #162 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #163 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #164 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #165 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #166 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #167 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #168 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #169 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #170 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #171 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #172 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #173 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #174 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #175 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #176 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #177 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #178 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #179 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #180 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #181 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #182 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #183 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #184 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #185 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #186 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #187 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #188 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #189 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #190 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #191 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #192 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #193 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #194 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #195 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #196 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #197 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #198 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #199 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #200 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #201 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #202 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #203 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #204 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #205 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #206 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #207 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #208 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #209 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #210 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #211 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #212 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #213 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #214 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #215 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #216 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #217 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #218 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #219 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #220 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #221 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #222 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #223 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #224 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #225 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #226 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #227 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #228 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #229 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #230 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #231 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #232 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #233 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #234 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #235 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #236 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #237 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #238 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #239 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #240 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #241 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #242 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #243 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #244 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #245 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #246 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #247 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #248 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #249 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #250 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #251 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #252 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #253 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #254 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
// 
// 0x74ea1a4c29e8 is located 232 bytes inside of 8576-byte region [0x74ea1a4c2900,0x74ea1a4c4a80)
// freed by thread T63 (WorkerThread) here:
//     #0 0x629748b9596d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x11db96d) (BuildId: 42a5516f89359752)
//         operator delete(void*)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_new_delete.cpp:143:3
//     #1 0x6297497567cc  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9c7cc) (BuildId: 42a5516f89359752)
//         v8::internal::MemoryAllocator::Pool::ReleasePooledChunks()
//         ./../../src/heap/memory-allocator.cc:94:5
//     #2 0x6297497565cd  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9c5cd) (BuildId: 42a5516f89359752)
//         v8::internal::MemoryAllocator::TearDown()
//         ./../../src/heap/memory-allocator.cc:69:11
//     #3 0x629749568344  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bae344) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::TearDown()
//         ./../../src/heap/heap.cc:6191:23
//     #4 0x629749369330  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19af330) (BuildId: 42a5516f89359752)
//         v8::internal::Isolate::Deinit()
//         ./../../src/execution/isolate.cc:4496:9
//     #5 0x6297493680a1  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19ae0a1) (BuildId: 42a5516f89359752)
//         v8::internal::Isolate::Delete(v8::internal::Isolate*)
//         ./../../src/execution/isolate.cc:4093:12
//     #6 0x629748c057a7  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124b7a7) (BuildId: 42a5516f89359752)
//         v8::Worker::ExecuteInThread()
//         ./../../src/d8/d8.cc:5380:13
//     #7 0x629748c0452c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a52c) (BuildId: 42a5516f89359752)
//         v8::Worker::WorkerThread::Run()
//         ./../../src/d8/d8.cc:5086:11
//     #8 0x629748dd3243  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1419243) (BuildId: 42a5516f89359752)
//         v8::base::ThreadEntry(void*)
//         ./../../src/base/platform/platform.h:626:5
//     #9 0x629748b59106  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x119f106) (BuildId: 42a5516f89359752)
//         asan_thread_start(void*)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_interceptors.cpp:239:28
// 
// previously allocated by thread T63 (WorkerThread) here:
//     #0 0x629748b9510d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x11db10d) (BuildId: 42a5516f89359752)
//         operator new(unsigned long)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_new_delete.cpp:86:3
//     #1 0x629749758ffa  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9effa) (BuildId: 42a5516f89359752)
//         v8::internal::MemoryAllocator::AllocatePage(v8::internal::MemoryAllocator::AllocationMode, v8::internal::Space*, v8::internal::Executability)
//         ./../../src/heap/memory-allocator.cc:429:16
//     #2 0x62974978bbb6  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd1bb6) (BuildId: 42a5516f89359752)
//         v8::internal::SemiSpace::AllocateFreshPage()
//         ./../../src/heap/new-spaces.cc:145:56
//     #3 0x62974978c407  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd2407) (BuildId: 42a5516f89359752)
//         v8::internal::SemiSpace::Commit()
//         ./../../src/heap/new-spaces.cc:79:12
//     #4 0x62974978deb2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd3eb2) (BuildId: 42a5516f89359752)
//         v8::internal::SemiSpaceNewSpace::SemiSpaceNewSpace(v8::internal::Heap*, unsigned long, unsigned long)
//         ./../../src/heap/new-spaces.cc:454:18
//     #5 0x6297495633a7  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1ba93a7) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::SetUpSpaces(v8::internal::LinearAllocationArea&, v8::internal::LinearAllocationArea&)
//         ./../../third_party/libc++/src/include/__memory/unique_ptr.h:765:30
//     #6 0x629749378508  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19be508) (BuildId: 42a5516f89359752)
//         v8::internal::Isolate::Init(v8::internal::SnapshotData*, v8::internal::SnapshotData*, v8::internal::SnapshotData*, bool)
//         ./../../src/execution/isolate.cc:5572:9
//     #7 0x62974937bb4c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19c1b4c) (BuildId: 42a5516f89359752)
//         v8::internal::Isolate::InitWithSnapshot(v8::internal::SnapshotData*, v8::internal::SnapshotData*, v8::internal::SnapshotData*, bool)
//         ./../../src/execution/isolate.cc:5201:10
//     #8 0x62974a97a253  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x2fc0253) (BuildId: 42a5516f89359752)
//         v8::internal::Snapshot::Initialize(v8::internal::Isolate*)
//         ./../../src/snapshot/snapshot.cc:198:19
//     #9 0x629748e7b056  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x14c1056) (BuildId: 42a5516f89359752)
//         v8::Isolate::Initialize(v8::Isolate*, v8::Isolate::CreateParams const&)
//         ./../../src/api/api.cc:10163:8
//     #10 0x629748e7b700  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x14c1700) (BuildId: 42a5516f89359752)
//         v8::Isolate::New(v8::Isolate::CreateParams const&)
//         ./../../src/api/api.cc:10202:3
//     #11 0x629748c04777  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a777) (BuildId: 42a5516f89359752)
//         v8::Worker::ExecuteInThread()
//         ./../../src/d8/d8.cc:5253:14
//     #12 0x629748c0452c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a52c) (BuildId: 42a5516f89359752)
//         v8::Worker::WorkerThread::Run()
//         ./../../src/d8/d8.cc:5086:11
//     #13 0x629748dd3243  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1419243) (BuildId: 42a5516f89359752)
//         v8::base::ThreadEntry(void*)
//         ./../../src/base/platform/platform.h:626:5
//     #14 0x629748b59106  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x119f106) (BuildId: 42a5516f89359752)
//         asan_thread_start(void*)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_interceptors.cpp:239:28
// 
// Thread T63 (WorkerThread) created by T0 here:
//     #0 0x629748b3fb41  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1185b41) (BuildId: 42a5516f89359752)
//         ___interceptor_pthread_create
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_interceptors.cpp:250:3
//     #1 0x629748dd2fca  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1418fca) (BuildId: 42a5516f89359752)
//         v8::base::Thread::Start()
//         ./../../src/base/platform/platform-posix.cc:1263:14
//     #2 0x629748bf1b9a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237b9a) (BuildId: 42a5516f89359752)
//         v8::Worker::StartWorkerThread(v8::Isolate*, std::__Cr::shared_ptr<v8::Worker>, v8::base::Thread::Priority)
//         ./../../src/d8/d8.cc:5070:16
//     #3 0x629748bf1314  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237314) (BuildId: 42a5516f89359752)
//         v8::Shell::WorkerNew(v8::FunctionCallbackInfo<v8::Value> const&)
//         ./../../src/d8/d8.cc:3247:10
//     #4 0x629748eccbbf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1512bbf) (BuildId: 42a5516f89359752)
//         v8::internal::FunctionCallbackArguments::CallOrConstruct(v8::internal::Tagged<v8::internal::FunctionTemplateInfo>, bool)
//         ./../../src/api/api-arguments-inl.h:95:3
//     #5 0x629748eca82d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x151082d) (BuildId: 42a5516f89359752)
//         v8::internal::MaybeHandle<v8::internal::Object> v8::internal::(anonymous namespace)::HandleApiCallHelper<true>(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::HeapObject>, v8::internal::DirectHandle<v8::internal::FunctionTemplateInfo>, v8::internal::DirectHandle<v8::internal::Object>, unsigned long*, int)
//         ./../../src/builtins/builtins-api.cc:109:16
//     #6 0x629748ec86ce  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x150e6ce) (BuildId: 42a5516f89359752)
//         v8::internal::Builtin_Impl_HandleApiConstruct(v8::internal::BuiltinArguments, v8::internal::Isolate*)
//         ./../../src/builtins/builtins-api.cc:140:3
//     #7 0x62974dfe62b5  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662c2b5) (BuildId: 42a5516f89359752)
//         Builtins_CEntry_Return1_ArgvOnStack_BuiltinExit
//         setup-isolate-deserialize.cc:0:0
//     #8 0x62974df3b3b2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x65813b2) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #9 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #10 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #11 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #12 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #13 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #14 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #15 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #16 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #17 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #18 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #19 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #20 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #21 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #22 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #23 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #24 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #25 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #26 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #27 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #28 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #29 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #30 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #31 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #32 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #33 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #34 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #35 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #36 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #37 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #38 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #39 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #40 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #41 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #42 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #43 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #44 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #45 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #46 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #47 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #48 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #49 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #50 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #51 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #52 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #53 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #54 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #55 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #56 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #57 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #58 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #59 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #60 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #61 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #62 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #63 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #64 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #65 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #66 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #67 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #68 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #69 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #70 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #71 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #72 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #73 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #74 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #75 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #76 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #77 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #78 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #79 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #80 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #81 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #82 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #83 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #84 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #85 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #86 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #87 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #88 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #89 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #90 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #91 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #92 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #93 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #94 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #95 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #96 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #97 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #98 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #99 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #100 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #101 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #102 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #103 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #104 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #105 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #106 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #107 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #108 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #109 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #110 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #111 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #112 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #113 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #114 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #115 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #116 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #117 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #118 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #119 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #120 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #121 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #122 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #123 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #124 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #125 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #126 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #127 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #128 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #129 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #130 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #131 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #132 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #133 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #134 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #135 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #136 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #137 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #138 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #139 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #140 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #141 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #142 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #143 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #144 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #145 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #146 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #147 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #148 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #149 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #150 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #151 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #152 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #153 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #154 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #155 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #156 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #157 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #158 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #159 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #160 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #161 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #162 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #163 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #164 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #165 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #166 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #167 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #168 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #169 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #170 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #171 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #172 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #173 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #174 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #175 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #176 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #177 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #178 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #179 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #180 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #181 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #182 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #183 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #184 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #185 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #186 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #187 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #188 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #189 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #190 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #191 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #192 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #193 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #194 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #195 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #196 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #197 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #198 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #199 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #200 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #201 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #202 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #203 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #204 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #205 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #206 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #207 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #208 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #209 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #210 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #211 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #212 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #213 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #214 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #215 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #216 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #217 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #218 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #219 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #220 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #221 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #222 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #223 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #224 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #225 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #226 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #227 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #228 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #229 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #230 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #231 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #232 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #233 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #234 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #235 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #236 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #237 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #238 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #239 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #240 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #241 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #242 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #243 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #244 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #245 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #246 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #247 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #248 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #249 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #250 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #251 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #252 0x62974e0e9726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #253 0x62974df3aa80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #254 0x62974df3b28e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
// 
// SUMMARY: AddressSanitizer: heap-use-after-free (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c0dc6a) (BuildId: 42a5516f89359752) 
// Shadow bytes around the buggy address:
//   0x74ea1a4c2700: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x74ea1a4c2780: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x74ea1a4c2800: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x74ea1a4c2880: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x74ea1a4c2900: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
// =>0x74ea1a4c2980: fd fd fd fd fd fd fd fd fd fd fd fd fd[fd]fd fd
//   0x74ea1a4c2a00: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x74ea1a4c2a80: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x74ea1a4c2b00: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x74ea1a4c2b80: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x74ea1a4c2c00: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
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
// ==3951108==ABORTING
// 
// ## V8 sandbox violation detected!
// STDOUT:
// Corrupting memory starting from object at 0x70d5c with RNG seed 791443381
//   Corrupting object at 0x70d5c of type JS_TYPED_ARRAY_TYPE
//   Recursively corrupting neighboring object at offset 264
//     Corrupting object at 0x70e64 of type BLOCK_CONTEXT_TYPE
//     Corrupted 8-bit field at offset 10. Old value: 0x68, new value: 0x48
// Corrupting memory starting from object at 0x7296c with RNG seed 3408956707
//   Corrupting object at 0x7296c of type JS_TYPED_ARRAY_TYPE
//   Corrupted 8-bit field at offset 42. Old value: 0x0, new value: 0x5f
// FUZZER ARGS: /work/FuzzilliSbx/fuzzilli/.build/x86_64-unknown-linux-gnu/release/FuzzilliCli --profile=v8Sandbox --wasm /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --instanceType=leaf --connectTo=127.0.0.1:10002
// TARGET ARGS: /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --expose-gc --omit-quit --allow-natives-syntax --fuzzing --jit-fuzzing --sandbox-fuzzing --disable-in-process-stack-traces
// CONTRIBUTORS: 
// EXECUTION TIME: 136ms
