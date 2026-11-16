//
// BEGIN FUZZER GENERATED CODE
//

const v4 = 256 >= "size";
const v6 = new Uint16Array(256);
v6[9] = v6;
Float64Array.e = Float64Array;
const v9 = new Float64Array(v4);
new BigInt64Array(2520);
[-20088,1012582655];
[10,-8,-3602,10000,512,-1131591079,1073741824,-585097711,-9007199254740991,-9007199254740990];
[2147483648,-4096,-5,23052933];
function f16(a17, a18, a19) {
    function f20() {
        /\ud808\udf45*/yidvm;
        /xyz{1,}^xxx$/yvg;
        return a19;
    }
    ("p").search("p");
    return f20;
}
const t22 = "function";
t22[7] = "function";
new Worker(f16, { type: "function" });
v9.getMessage();

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
// ==3678730==ERROR: AddressSanitizer: heap-use-after-free on address 0x7d34b096d1e8 at pc 0x5a556a409c6b bp 0x7fff4d24f920 sp 0x7fff4d24f918
// WRITE of size 8 at 0x7d34b096d1e8 thread T0
//     #0 0x5a556a409c6a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c0dc6a) (BuildId: 42a5516f89359752)
//         v8::internal::ConcurrentMarking::FlushMemoryChunkData()
//         ./../../third_party/libc++/src/include/__atomic/support/c11.h:181:10
//     #1 0x5a556a490901  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c94901) (BuildId: 42a5516f89359752)
//         v8::internal::MarkCompactCollector::MarkLiveObjects()
//         ./../../src/heap/mark-compact.cc:790:34
//     #2 0x5a556a48d281  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c91281) (BuildId: 42a5516f89359752)
//         v8::internal::MarkCompactCollector::CollectGarbage()
//         ./../../src/heap/mark-compact.cc:488:3
//     #3 0x5a556a38356c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b8756c) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::MarkCompact()
//         ./../../src/heap/heap.cc:2629:29
//     #4 0x5a556a381295  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b85295) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::PerformGarbageCollection(v8::internal::GarbageCollector, v8::internal::GarbageCollectionReason, char const*)
//         ./../../src/heap/heap.cc:2250:5
//     #5 0x5a556a3ce46c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bd246c) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags)::$_1::operator()() const
//         ./../../src/heap/heap.cc:1664:7
//     #6 0x5a556a3cda92  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bd1a92) (BuildId: 42a5516f89359752)
//         void heap::base::Stack::SetMarkerAndCallbackImpl<v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags)::$_1>(heap::base::Stack*, void*, void const*)
//         ./../../src/heap/base/stack.h:167:5
//     #7 0x5a556c514092  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x3d18092) (BuildId: 42a5516f89359752)
//         PushAllRegistersAndIterateStack
//         push_registers_asm.cc:0:0
//     #8 0x5a556a3721f6  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b761f6) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags)
//         ./../../src/heap/base/stack.h:73:7
//     #9 0x5a556a34b531  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b4f531) (BuildId: 42a5516f89359752)
//         v8::internal::HeapAllocator::AllocateRawWithLightRetrySlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment)
//         ./../../src/heap/heap-allocator.cc:136:12
//     #10 0x5a556a34e881  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b52881) (BuildId: 42a5516f89359752)
//         v8::internal::HeapAllocator::AllocateRawWithRetryOrFailSlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment)
//         ./../../src/heap/heap-allocator.cc:148:7
//     #11 0x5a556a2bf087  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1ac3087) (BuildId: 42a5516f89359752)
//         v8::internal::Factory::AllocateRaw(int, v8::internal::AllocationType, v8::internal::AllocationAlignment)
//         ./../../src/heap/heap-allocator-inl.h:232:16
//     #12 0x5a556a2b4b4a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1ab8b4a) (BuildId: 42a5516f89359752)
//         v8::internal::Handle<v8::internal::FixedArray> v8::internal::TaggedArrayBase<v8::internal::FixedArray, v8::internal::TaggedArrayShape, v8::internal::HeapObjectLayout>::Allocate<v8::internal::Isolate>(v8::internal::Isolate*, int, std::__Cr::optional<v8::internal::PerThreadAssertScopeEmpty<false, (v8::internal::PerThreadAssertType)1, (v8::internal::PerThreadAssertType)2>>*, v8::internal::AllocationType)
//         ./../../src/heap/factory-base.cc:1293:18
//     #13 0x5a556a2a0e71  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1aa4e71) (BuildId: 42a5516f89359752)
//         v8::internal::FactoryBase<v8::internal::Factory>::SmiToString(v8::internal::Tagged<v8::internal::Smi>, v8::internal::NumberCacheMode)
//         ./../../src/objects/fixed-array-inl.h:299:24
//     #14 0x5a556a23626a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1a3a26a) (BuildId: 42a5516f89359752)
//         v8::internal::CallPrinter::PrintLiteral(v8::internal::DirectHandle<v8::internal::Object>, bool)
//         ./../../src/ast/prettyprinter.cc:641:32
//     #15 0x5a556a23e8a0  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1a428a0) (BuildId: 42a5516f89359752)
//         v8::internal::CallPrinter::VisitCompareOperation(v8::internal::CompareOperation*)
//         ./../../src/ast/prettyprinter.h:73:3
//     #16 0x5a556a239edf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1a3dedf) (BuildId: 42a5516f89359752)
//         v8::internal::CallPrinter::VisitAssignment(v8::internal::Assignment*)
//         ./../../src/ast/prettyprinter.h:73:3
//     #17 0x5a556a240508  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1a44508) (BuildId: 42a5516f89359752)
//         v8::internal::CallPrinter::VisitNoStackOverflowCheck(v8::internal::AstNode*)
//         ./../../src/ast/prettyprinter.h:73:3
//     #18 0x5a556a240a83  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1a44a83) (BuildId: 42a5516f89359752)
//         v8::internal::CallPrinter::VisitNoStackOverflowCheck(v8::internal::AstNode*)
//         ./../../src/ast/prettyprinter.h:73:3
//     #19 0x5a556a231c59  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1a35c59) (BuildId: 42a5516f89359752)
//         v8::internal::CallPrinter::Print(v8::internal::FunctionLiteral*, int)
//         ./../../src/ast/prettyprinter.h:73:3
//     #20 0x5a556a22c609  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1a30609) (BuildId: 42a5516f89359752)
//         v8::internal::(anonymous namespace)::RenderCallSite(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::Object>, v8::internal::MessageLocation*, v8::internal::CallPrinter::ErrorHint*)
//         ./../../src/execution/messages.cc:897:36
//     #21 0x5a556a22fc30  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1a33c30) (BuildId: 42a5516f89359752)
//         v8::internal::ErrorUtils::NewCalledNonCallableError(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::Object>)
//         ./../../src/execution/messages.cc:988:7
//     #22 0x5a556b664499  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x2e68499) (BuildId: 42a5516f89359752)
//         v8::internal::Runtime_ThrowCalledNonCallable(int, unsigned long*, v8::internal::Isolate*)
//         ./../../src/runtime/runtime-internal.cc:512:8
//     #23 0x5a556ee28375  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662c375) (BuildId: 42a5516f89359752)
//         Builtins_CEntry_Return1_ArgvOnStack_NoBuiltinExit
//         setup-isolate-deserialize.cc:0:0
//     #24 0x5a556ed71acd  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6575acd) (BuildId: 42a5516f89359752)
//         Builtins_Call_ReceiverIsAny
//         setup-isolate-deserialize.cc:0:0
//     #25 0x5a556ed7ca80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #26 0x5a556ed7a69b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e69b) (BuildId: 42a5516f89359752)
//         Builtins_JSEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #27 0x5a556ed7a3ea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e3ea) (BuildId: 42a5516f89359752)
//         Builtins_JSEntry
//         setup-isolate-deserialize.cc:0:0
//     #28 0x5a556a151c2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1955c2a) (BuildId: 42a5516f89359752)
//         v8::internal::(anonymous namespace)::Invoke(v8::internal::Isolate*, v8::internal::(anonymous namespace)::InvokeParams const&)
//         ./../../src/execution/simulator.h:191:12
//     #29 0x5a556a1544f8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19584f8) (BuildId: 42a5516f89359752)
//         v8::internal::Execution::CallScript(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::JSFunction>, v8::internal::DirectHandle<v8::internal::Object>, v8::internal::DirectHandle<v8::internal::Object>)
//         ./../../src/execution/execution.cc:536:10
//     #30 0x5a5569c56b00  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x145ab00) (BuildId: 42a5516f89359752)
//         v8::Script::Run(v8::Local<v8::Context>, v8::Local<v8::Data>)
//         ./../../src/api/api.cc:2155:7
//     #31 0x5a5569a0d686  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1211686) (BuildId: 42a5516f89359752)
//         v8::Shell::ExecuteString(v8::Isolate*, v8::Local<v8::String>, v8::Local<v8::String>, v8::Shell::ReportExceptions, v8::Global<v8::Value>*)
//         ./../../src/d8/d8.cc:1013:44
//     #32 0x5a5569a432ff  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12472ff) (BuildId: 42a5516f89359752)
//         v8::SourceGroup::Execute(v8::Isolate*)
//         ./../../src/d8/d8.cc:4879:10
//     #33 0x5a5569a504a2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12544a2) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMainIsolate(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5886:37
//     #34 0x5a5569a4f9bf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12539bf) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMain(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5795:18
//     #35 0x5a5569a541d8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12581d8) (BuildId: 42a5516f89359752)
//         v8::Shell::Main(int, char**)
//         ./../../src/d8/d8.cc:6649:18
//     #36 0x7ee4b03bd1c9  (/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #37 0x7ee4b03bd28a  (/lib/x86_64-linux-gnu/libc.so.6+0x2a28a) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #38 0x5a55698fe029  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1102029) (BuildId: 42a5516f89359752)
//         _start
//         ??:0:0
// 
// 0x7d34b096d1e8 is located 232 bytes inside of 8576-byte region [0x7d34b096d100,0x7d34b096f280)
// freed by thread T52 (WorkerThread) here:
//     #0 0x5a55699d796d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x11db96d) (BuildId: 42a5516f89359752)
//         operator delete(void*)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_new_delete.cpp:143:3
//     #1 0x5a556a5987cc  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9c7cc) (BuildId: 42a5516f89359752)
//         v8::internal::MemoryAllocator::Pool::ReleasePooledChunks()
//         ./../../src/heap/memory-allocator.cc:94:5
//     #2 0x5a556a5985cd  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9c5cd) (BuildId: 42a5516f89359752)
//         v8::internal::MemoryAllocator::TearDown()
//         ./../../src/heap/memory-allocator.cc:69:11
//     #3 0x5a556a3aa344  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bae344) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::TearDown()
//         ./../../src/heap/heap.cc:6191:23
//     #4 0x5a556a1ab330  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19af330) (BuildId: 42a5516f89359752)
//         v8::internal::Isolate::Deinit()
//         ./../../src/execution/isolate.cc:4496:9
//     #5 0x5a556a1aa0a1  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19ae0a1) (BuildId: 42a5516f89359752)
//         v8::internal::Isolate::Delete(v8::internal::Isolate*)
//         ./../../src/execution/isolate.cc:4093:12
//     #6 0x5a5569a477a7  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124b7a7) (BuildId: 42a5516f89359752)
//         v8::Worker::ExecuteInThread()
//         ./../../src/d8/d8.cc:5380:13
//     #7 0x5a5569a4652c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a52c) (BuildId: 42a5516f89359752)
//         v8::Worker::WorkerThread::Run()
//         ./../../src/d8/d8.cc:5086:11
//     #8 0x5a5569c15243  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1419243) (BuildId: 42a5516f89359752)
//         v8::base::ThreadEntry(void*)
//         ./../../src/base/platform/platform.h:626:5
//     #9 0x5a556999b106  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x119f106) (BuildId: 42a5516f89359752)
//         asan_thread_start(void*)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_interceptors.cpp:239:28
// 
// previously allocated by thread T52 (WorkerThread) here:
//     #0 0x5a55699d710d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x11db10d) (BuildId: 42a5516f89359752)
//         operator new(unsigned long)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_new_delete.cpp:86:3
//     #1 0x5a556a59affa  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9effa) (BuildId: 42a5516f89359752)
//         v8::internal::MemoryAllocator::AllocatePage(v8::internal::MemoryAllocator::AllocationMode, v8::internal::Space*, v8::internal::Executability)
//         ./../../src/heap/memory-allocator.cc:429:16
//     #2 0x5a556a5cdbb6  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd1bb6) (BuildId: 42a5516f89359752)
//         v8::internal::SemiSpace::AllocateFreshPage()
//         ./../../src/heap/new-spaces.cc:145:56
//     #3 0x5a556a5ce407  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd2407) (BuildId: 42a5516f89359752)
//         v8::internal::SemiSpace::Commit()
//         ./../../src/heap/new-spaces.cc:79:12
//     #4 0x5a556a5cfeb2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd3eb2) (BuildId: 42a5516f89359752)
//         v8::internal::SemiSpaceNewSpace::SemiSpaceNewSpace(v8::internal::Heap*, unsigned long, unsigned long)
//         ./../../src/heap/new-spaces.cc:454:18
//     #5 0x5a556a3a53a7  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1ba93a7) (BuildId: 42a5516f89359752)
//         v8::internal::Heap::SetUpSpaces(v8::internal::LinearAllocationArea&, v8::internal::LinearAllocationArea&)
//         ./../../third_party/libc++/src/include/__memory/unique_ptr.h:765:30
//     #6 0x5a556a1ba508  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19be508) (BuildId: 42a5516f89359752)
//         v8::internal::Isolate::Init(v8::internal::SnapshotData*, v8::internal::SnapshotData*, v8::internal::SnapshotData*, bool)
//         ./../../src/execution/isolate.cc:5572:9
//     #7 0x5a556a1bdb4c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19c1b4c) (BuildId: 42a5516f89359752)
//         v8::internal::Isolate::InitWithSnapshot(v8::internal::SnapshotData*, v8::internal::SnapshotData*, v8::internal::SnapshotData*, bool)
//         ./../../src/execution/isolate.cc:5201:10
//     #8 0x5a556b7bc253  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x2fc0253) (BuildId: 42a5516f89359752)
//         v8::internal::Snapshot::Initialize(v8::internal::Isolate*)
//         ./../../src/snapshot/snapshot.cc:198:19
//     #9 0x5a5569cbd056  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x14c1056) (BuildId: 42a5516f89359752)
//         v8::Isolate::Initialize(v8::Isolate*, v8::Isolate::CreateParams const&)
//         ./../../src/api/api.cc:10163:8
//     #10 0x5a5569cbd700  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x14c1700) (BuildId: 42a5516f89359752)
//         v8::Isolate::New(v8::Isolate::CreateParams const&)
//         ./../../src/api/api.cc:10202:3
//     #11 0x5a5569a46777  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a777) (BuildId: 42a5516f89359752)
//         v8::Worker::ExecuteInThread()
//         ./../../src/d8/d8.cc:5253:14
//     #12 0x5a5569a4652c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a52c) (BuildId: 42a5516f89359752)
//         v8::Worker::WorkerThread::Run()
//         ./../../src/d8/d8.cc:5086:11
//     #13 0x5a5569c15243  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1419243) (BuildId: 42a5516f89359752)
//         v8::base::ThreadEntry(void*)
//         ./../../src/base/platform/platform.h:626:5
//     #14 0x5a556999b106  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x119f106) (BuildId: 42a5516f89359752)
//         asan_thread_start(void*)
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_interceptors.cpp:239:28
// 
// Thread T52 (WorkerThread) created by T0 here:
//     #0 0x5a5569981b41  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1185b41) (BuildId: 42a5516f89359752)
//         ___interceptor_pthread_create
//         /b/s/w/ir/cache/builder/src/third_party/llvm/compiler-rt/lib/asan/asan_interceptors.cpp:250:3
//     #1 0x5a5569c14fca  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1418fca) (BuildId: 42a5516f89359752)
//         v8::base::Thread::Start()
//         ./../../src/base/platform/platform-posix.cc:1263:14
//     #2 0x5a5569a33b9a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237b9a) (BuildId: 42a5516f89359752)
//         v8::Worker::StartWorkerThread(v8::Isolate*, std::__Cr::shared_ptr<v8::Worker>, v8::base::Thread::Priority)
//         ./../../src/d8/d8.cc:5070:16
//     #3 0x5a5569a33314  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237314) (BuildId: 42a5516f89359752)
//         v8::Shell::WorkerNew(v8::FunctionCallbackInfo<v8::Value> const&)
//         ./../../src/d8/d8.cc:3247:10
//     #4 0x5a5569d0ebbf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1512bbf) (BuildId: 42a5516f89359752)
//         v8::internal::FunctionCallbackArguments::CallOrConstruct(v8::internal::Tagged<v8::internal::FunctionTemplateInfo>, bool)
//         ./../../src/api/api-arguments-inl.h:95:3
//     #5 0x5a5569d0c82d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x151082d) (BuildId: 42a5516f89359752)
//         v8::internal::MaybeHandle<v8::internal::Object> v8::internal::(anonymous namespace)::HandleApiCallHelper<true>(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::HeapObject>, v8::internal::DirectHandle<v8::internal::FunctionTemplateInfo>, v8::internal::DirectHandle<v8::internal::Object>, unsigned long*, int)
//         ./../../src/builtins/builtins-api.cc:109:16
//     #6 0x5a5569d0a6ce  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x150e6ce) (BuildId: 42a5516f89359752)
//         v8::internal::Builtin_Impl_HandleApiConstruct(v8::internal::BuiltinArguments, v8::internal::Isolate*)
//         ./../../src/builtins/builtins-api.cc:140:3
//     #7 0x5a556ee282b5  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662c2b5) (BuildId: 42a5516f89359752)
//         Builtins_CEntry_Return1_ArgvOnStack_BuiltinExit
//         setup-isolate-deserialize.cc:0:0
//     #8 0x5a556ed7d3b2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x65813b2) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterPushArgsThenFastConstructFunction
//         setup-isolate-deserialize.cc:0:0
//     #9 0x5a556ef2b726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//         Builtins_ConstructHandler
//         setup-isolate-deserialize.cc:0:0
//     #10 0x5a556ed7ca80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #11 0x5a556ed7a69b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e69b) (BuildId: 42a5516f89359752)
//         Builtins_JSEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #12 0x5a556ed7a3ea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e3ea) (BuildId: 42a5516f89359752)
//         Builtins_JSEntry
//         setup-isolate-deserialize.cc:0:0
//     #13 0x5a556a151c2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1955c2a) (BuildId: 42a5516f89359752)
//         v8::internal::(anonymous namespace)::Invoke(v8::internal::Isolate*, v8::internal::(anonymous namespace)::InvokeParams const&)
//         ./../../src/execution/simulator.h:191:12
//     #14 0x5a556a1544f8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19584f8) (BuildId: 42a5516f89359752)
//         v8::internal::Execution::CallScript(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::JSFunction>, v8::internal::DirectHandle<v8::internal::Object>, v8::internal::DirectHandle<v8::internal::Object>)
//         ./../../src/execution/execution.cc:536:10
//     #15 0x5a5569c56b00  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x145ab00) (BuildId: 42a5516f89359752)
//         v8::Script::Run(v8::Local<v8::Context>, v8::Local<v8::Data>)
//         ./../../src/api/api.cc:2155:7
//     #16 0x5a5569a0d686  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1211686) (BuildId: 42a5516f89359752)
//         v8::Shell::ExecuteString(v8::Isolate*, v8::Local<v8::String>, v8::Local<v8::String>, v8::Shell::ReportExceptions, v8::Global<v8::Value>*)
//         ./../../src/d8/d8.cc:1013:44
//     #17 0x5a5569a432ff  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12472ff) (BuildId: 42a5516f89359752)
//         v8::SourceGroup::Execute(v8::Isolate*)
//         ./../../src/d8/d8.cc:4879:10
//     #18 0x5a5569a504a2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12544a2) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMainIsolate(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5886:37
//     #19 0x5a5569a4f9bf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12539bf) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMain(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5795:18
//     #20 0x5a5569a541d8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12581d8) (BuildId: 42a5516f89359752)
//         v8::Shell::Main(int, char**)
//         ./../../src/d8/d8.cc:6649:18
//     #21 0x7ee4b03bd1c9  (/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #22 0x7ee4b03bd28a  (/lib/x86_64-linux-gnu/libc.so.6+0x2a28a) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #23 0x5a55698fe029  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1102029) (BuildId: 42a5516f89359752)
//         _start
//         ??:0:0
// 
// SUMMARY: AddressSanitizer: heap-use-after-free (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c0dc6a) (BuildId: 42a5516f89359752) 
// Shadow bytes around the buggy address:
//   0x7d34b096cf00: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x7d34b096cf80: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x7d34b096d000: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x7d34b096d080: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x7d34b096d100: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
// =>0x7d34b096d180: fd fd fd fd fd fd fd fd fd fd fd fd fd[fd]fd fd
//   0x7d34b096d200: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x7d34b096d280: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x7d34b096d300: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x7d34b096d380: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x7d34b096d400: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
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
// ==3678730==ABORTING
// 
// ## V8 sandbox violation detected!
// STDOUT:
// 
// FUZZER ARGS: /work/FuzzilliSbx/fuzzilli/.build/x86_64-unknown-linux-gnu/release/FuzzilliCli --profile=v8Sandbox --wasm /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --instanceType=leaf --connectTo=127.0.0.1:10003
// TARGET ARGS: /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --expose-gc --omit-quit --allow-natives-syntax --fuzzing --jit-fuzzing --sandbox-fuzzing --disable-in-process-stack-traces
// CONTRIBUTORS: ExplorationMutator, InputMutator (loose), IntArrayGenerator, StringGenerator, TypedArrayGenerator
// EXECUTION TIME: 52ms
