//
// BEGIN FUZZER GENERATED CODE
//

class C1 {
    static #toString(a3, a4, a5, a6) {
        return 1073741825;
    }
    toString(a8, a9) {
        corrupt(1073741825, 3550281337);
        corrupt(1073741825, 1458091347);
    }
}
function f10(a11, a12) {
}
function f13() {
}
function f14(a15) {
}
class C16 {
}
function F17() {
    if (!new.target) { throw 'must be called with new'; }
}
class C19 {
}
function f20(a21, a22) {
    return C16;
}
function f23() {
    function f24(a25) {
    }
    const v26 = /9[\cA]/gms;
    corrupt(f24, 992439086);
    class C28 extends v26.constructor {
    }
    // WasmModule Code:
    // BeginWasmModule
    //     BeginWasmFunction ([] => .nothing) -> []
    //         v29 <- Consti64 '1000'
    //         v30 <- WasmJsCall([.wasmi64] => .wasmExternRef) v24 [v29]
    //     v31 <- EndWasmFunction
    // v32 <- EndWasmModule
    // 
    const v32 = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([
        0x00, 0x61, 0x73, 0x6D, 0x01, 0x00, 0x00, 0x00, 0x01, 0x09,
        0x02, 0x60, 0x01, 0x7E, 0x01, 0x6F, 0x60, 0x00, 0x00, 0x02,
        0x18, 0x01, 0x07, 0x69, 0x6D, 0x70, 0x6F, 0x72, 0x74, 0x73,
        0x0C, 0x69, 0x6D, 0x70, 0x6F, 0x72, 0x74, 0x5F, 0x30, 0x5F,
        0x76, 0x32, 0x34, 0x00, 0x00, 0x03, 0x02, 0x01, 0x01, 0x04,
        0x01, 0x00, 0x05, 0x01, 0x00, 0x06, 0x01, 0x00, 0x07, 0x06,
        0x01, 0x02, 0x77, 0x30, 0x00, 0x01, 0x09, 0x01, 0x00, 0x0A,
        0x13, 0x01, 0x11, 0x02, 0x01, 0x7E, 0x01, 0x6F, 0x42, 0xE8,
        0x07, 0x21, 0x00, 0x20, 0x00, 0x10, 0x00, 0x21, 0x01, 0x0B,
    ])),
    { imports: {
        import_0_v24: f24,
    } });
    v32.exports.w0();
}
f23();

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
// ==3907772==ERROR: AddressSanitizer: heap-buffer-overflow on address 0x74340fd90384 at pc 0x60c75c953655 bp 0x7ffe8131a450 sp 0x7ffe8131a448
// READ of size 4 at 0x74340fd90384 thread T0
//     #0 0x60c75c953654  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x4e8c654) (BuildId: 42a5516f89359752)
//         v8::internal::compiler::OperandGeneratorT<v8::internal::compiler::TurboshaftAdapter>::UseLocation(v8::internal::compiler::turboshaft::OpIndex, v8::internal::LinkageLocation)
//         ./../../src/compiler/backend/instruction-selector.cc:526:26
//     #1 0x60c75c951ba5  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x4e8aba5) (BuildId: 42a5516f89359752)
//         v8::internal::compiler::InstructionSelectorT<v8::internal::compiler::TurboshaftAdapter>::InitializeCallBuffer(v8::internal::compiler::turboshaft::OpIndex, v8::internal::compiler::CallBufferT<v8::internal::compiler::TurboshaftAdapter>*, v8::base::Flags<v8::internal::compiler::InstructionSelectorT<v8::internal::compiler::TurboshaftAdapter>::CallBufferFlag, int, int>, int)
//         ./../../src/compiler/backend/instruction-selector.cc:1692:31
//     #2 0x60c75c960519  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x4e99519) (BuildId: 42a5516f89359752)
//         v8::internal::compiler::InstructionSelectorT<v8::internal::compiler::TurboshaftAdapter>::VisitCall(v8::internal::compiler::turboshaft::OpIndex, v8::internal::compiler::turboshaft::Block*)
//         ./../../src/compiler/backend/instruction-selector.cc:2653:3
//     #3 0x60c75c9569e9  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x4e8f9e9) (BuildId: 42a5516f89359752)
//         v8::internal::compiler::InstructionSelectorT<v8::internal::compiler::TurboshaftAdapter>::VisitNode(v8::internal::compiler::turboshaft::OpIndex)
//         ./../../src/compiler/backend/instruction-selector.cc:5374:9
//     #4 0x60c75c945003  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x4e7e003) (BuildId: 42a5516f89359752)
//         v8::internal::compiler::InstructionSelectorT<v8::internal::compiler::TurboshaftAdapter>::VisitBlock(v8::internal::compiler::turboshaft::Block*)
//         ./../../src/compiler/backend/instruction-selector.cc:1969:7
//     #5 0x60c75c9431b0  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x4e7c1b0) (BuildId: 42a5516f89359752)
//         v8::internal::compiler::InstructionSelectorT<v8::internal::compiler::TurboshaftAdapter>::SelectInstructions()
//         ./../../src/compiler/backend/instruction-selector.cc:152:5
//     #6 0x60c75cc88419  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x51c1419) (BuildId: 42a5516f89359752)
//         v8::internal::compiler::turboshaft::InstructionSelectionPhase::Run(v8::internal::compiler::turboshaft::PipelineData*, v8::internal::Zone*, v8::internal::compiler::CallDescriptor const*, v8::internal::compiler::Linkage*, v8::internal::CodeTracer*)
//         ./../../src/compiler/turboshaft/instruction-selection-phase.cc:359:55
//     #7 0x60c75c18297b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x46bb97b) (BuildId: 42a5516f89359752)
//         auto v8::internal::compiler::turboshaft::Pipeline::Run<v8::internal::compiler::turboshaft::InstructionSelectionPhase, v8::internal::compiler::CallDescriptor*&, v8::internal::compiler::Linkage*&, v8::internal::CodeTracer*&>(v8::internal::compiler::CallDescriptor*&, v8::internal::compiler::Linkage*&, v8::internal::CodeTracer*&)
//         ./../../src/compiler/turboshaft/pipelines.h:82:27
//     #8 0x60c75c0f0b9f  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x4629b9f) (BuildId: 42a5516f89359752)
//         v8::internal::compiler::turboshaft::Pipeline::SelectInstructions(v8::internal::compiler::Linkage*)
//         ./../../src/compiler/turboshaft/pipelines.h:301:48
//     #9 0x60c75c0b67da  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x45ef7da) (BuildId: 42a5516f89359752)
//         v8::internal::compiler::(anonymous namespace)::GenerateCodeFromTurboshaftGraph(bool, v8::internal::compiler::Linkage*, v8::internal::compiler::turboshaft::Pipeline&, v8::internal::compiler::PipelineImpl*, std::__Cr::shared_ptr<v8::internal::compiler::OsrHelper>)
//         ./../../src/compiler/pipeline.cc:522:30
//     #10 0x60c75c0d2bb1  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x460bbb1) (BuildId: 42a5516f89359752)
//         v8::internal::compiler::Pipeline::GenerateCodeForWasmNativeStubFromTurboshaft(v8::internal::Signature<v8::internal::wasm::CanonicalValueType> const*, v8::internal::wasm::WrapperCompilationInfo, char const*, v8::internal::AssemblerOptions const&, v8::internal::compiler::SourcePositionTable*)
//         ./../../src/compiler/pipeline.cc:3432:26
//     #11 0x60c75de52547  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x638b547) (BuildId: 42a5516f89359752)
//         v8::internal::compiler::CompileWasmImportCallWrapper(v8::internal::wasm::ImportCallKind, v8::internal::Signature<v8::internal::wasm::CanonicalValueType> const*, bool, int, v8::internal::wasm::Suspend)
//         ./../../src/compiler/wasm-compiler.cc:8470:17
//     #12 0x60c75b5d3fab  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x3b0cfab) (BuildId: 42a5516f89359752)
//         v8::internal::wasm::WasmImportWrapperCache::CompileWasmImportCallWrapper(v8::internal::Isolate*, v8::internal::wasm::ImportCallKind, v8::internal::Signature<v8::internal::wasm::CanonicalValueType> const*, v8::internal::wasm::CanonicalTypeIndex, bool, int, v8::internal::wasm::Suspend)
//         ./../../src/wasm/wasm-import-wrapper-cache.cc:155:34
//     #13 0x60c75b25a02e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x379302e) (BuildId: 42a5516f89359752)
//         v8::internal::Runtime_TierUpWasmToJSWrapper(int, unsigned long*, v8::internal::Isolate*)
//         ./../../src/runtime/runtime-wasm.cc:744:24
//     #14 0x60c75e0f36c8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662c6c8) (BuildId: 42a5516f89359752)
//         Builtins_WasmCEntry
//         setup-isolate-deserialize.cc:0:0
//     #15 0x60c75e0ea64b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662364b) (BuildId: 42a5516f89359752)
//         Builtins_WasmToJsWrapperCSA
//         setup-isolate-deserialize.cc:0:0
//     #16 0x7ebbdbe3d947  (<unknown module>)
//     #17 0x60c75e0e9cd7  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6622cd7) (BuildId: 42a5516f89359752)
//         Builtins_JSToWasmWrapperAsm
//         setup-isolate-deserialize.cc:0:0
//     #18 0x60c75e1cc2af  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x67052af) (BuildId: 42a5516f89359752)
//         Builtins_JSToWasmWrapper
//         setup-isolate-deserialize.cc:0:0
//     #19 0x60c75e047a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #20 0x60c75e047a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//         Builtins_InterpreterEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #21 0x60c75e04569b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e69b) (BuildId: 42a5516f89359752)
//         Builtins_JSEntryTrampoline
//         setup-isolate-deserialize.cc:0:0
//     #22 0x60c75e0453ea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e3ea) (BuildId: 42a5516f89359752)
//         Builtins_JSEntry
//         setup-isolate-deserialize.cc:0:0
//     #23 0x60c75941cc2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1955c2a) (BuildId: 42a5516f89359752)
//         v8::internal::(anonymous namespace)::Invoke(v8::internal::Isolate*, v8::internal::(anonymous namespace)::InvokeParams const&)
//         ./../../src/execution/simulator.h:191:12
//     #24 0x60c75941f4f8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19584f8) (BuildId: 42a5516f89359752)
//         v8::internal::Execution::CallScript(v8::internal::Isolate*, v8::internal::DirectHandle<v8::internal::JSFunction>, v8::internal::DirectHandle<v8::internal::Object>, v8::internal::DirectHandle<v8::internal::Object>)
//         ./../../src/execution/execution.cc:536:10
//     #25 0x60c758f21b00  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x145ab00) (BuildId: 42a5516f89359752)
//         v8::Script::Run(v8::Local<v8::Context>, v8::Local<v8::Data>)
//         ./../../src/api/api.cc:2155:7
//     #26 0x60c758cd8686  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1211686) (BuildId: 42a5516f89359752)
//         v8::Shell::ExecuteString(v8::Isolate*, v8::Local<v8::String>, v8::Local<v8::String>, v8::Shell::ReportExceptions, v8::Global<v8::Value>*)
//         ./../../src/d8/d8.cc:1013:44
//     #27 0x60c758d0e2ff  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12472ff) (BuildId: 42a5516f89359752)
//         v8::SourceGroup::Execute(v8::Isolate*)
//         ./../../src/d8/d8.cc:4879:10
//     #28 0x60c758d1b4a2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12544a2) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMainIsolate(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5886:37
//     #29 0x60c758d1a9bf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12539bf) (BuildId: 42a5516f89359752)
//         v8::Shell::RunMain(v8::Isolate*, bool)
//         ./../../src/d8/d8.cc:5795:18
//     #30 0x60c758d1f1d8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12581d8) (BuildId: 42a5516f89359752)
//         v8::Shell::Main(int, char**)
//         ./../../src/d8/d8.cc:6649:18
//     #31 0x75e40e9c61c9  (/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #32 0x75e40e9c628a  (/lib/x86_64-linux-gnu/libc.so.6+0x2a28a) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//         ??
//         ??:0:0
//     #33 0x60c758bc9029  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1102029) (BuildId: 42a5516f89359752)
//         _start
//         ??:0:0
// 
// Address 0x74340fd90384 is a wild pointer inside of access range of size 0x000000000004.
// SUMMARY: AddressSanitizer: heap-buffer-overflow (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x4e8c654) (BuildId: 42a5516f89359752) 
// Shadow bytes around the buggy address:
//   0x74340fd90100: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x74340fd90180: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x74340fd90200: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x74340fd90280: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x74340fd90300: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
// =>0x74340fd90380:[fa]fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x74340fd90400: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x74340fd90480: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x74340fd90500: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x74340fd90580: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x74340fd90600: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
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
// ==3907772==ABORTING
// 
// ## V8 sandbox violation detected!
// STDOUT:
// Corrupting memory starting from object at 0x40024 with RNG seed 992439086
//   Corrupting object at 0x40024 of type JS_FUNCTION_TYPE
//   Corrupted 8-bit field at offset 16. Old value: 0x11, new value: 0x31
// FUZZER ARGS: /work/FuzzilliSbx/fuzzilli/.build/x86_64-unknown-linux-gnu/release/FuzzilliCli --profile=v8Sandbox --wasm /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --instanceType=leaf --connectTo=127.0.0.1:10001
// TARGET ARGS: /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --expose-gc --omit-quit --allow-natives-syntax --fuzzing --jit-fuzzing --sandbox-fuzzing --disable-in-process-stack-traces
// CONTRIBUTORS: 
// EXECUTION TIME: 77ms
