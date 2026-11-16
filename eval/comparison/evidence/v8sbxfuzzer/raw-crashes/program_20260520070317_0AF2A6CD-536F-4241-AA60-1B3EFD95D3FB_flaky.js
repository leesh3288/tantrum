//
// BEGIN FUZZER GENERATED CODE
//

new Float32Array(8);
new BigUint64Array(92);
new Uint16Array(0);
function f12() {
    function f13(a14, a15, a16) {
        return a15;
    }
    function f17(a18, a19) {
        [4096,13,1024,129,1199911847,10,-11,9];
        const v21 = {};
        const v23 = { __proto__: null };
        ({ __proto__: v23 }).a;
        function f26(a27) {
            return f17(f17);
        }
        v21.get = f26;
        Symbol.match;
        Math.atan(-2.0806123675316774e+307);
        function f34(a35, a36) {
            function f37() {
                return a35;
            }
            return 8;
        }
        f34(a19, f17);
        const v40 = new Proxy(Proxy, v21);
        v40[3];
        return Infinity;
    }
    const v85 = {
        type: "function",
        type: "function",
        n() {
            const v45 = f12 ^ this;
            const v49 = Math.asinh(this);
            const v50 = 92 << this;
            const v51 = +1.10446993050792e+308;
            Math.tanh(f12);
            const v53 = v51 && this;
            const v54 = v45 || v45;
            function F55(a57, a58, a59, a60) {
                if (!new.target) { throw 'must be called with new'; }
                let [v61,v62,v63] = a59;
                const v65 = new WeakMap();
                v65 % a57;
                a59 >= v61;
                this.c = a60;
                this.b = a58;
                this.d = v54;
                function f68() {
                    let v69 = 11;
                    const v70 = v69++;
                    with (v69) {
                    }
                    return v70;
                }
            }
            new F55(v50, v53, v49, f12);
            function f72() {
                return f72;
            }
            function f73() {
                return f72;
            }
            class C74 extends f72 {
                static #b;
                3858 = f73;
            }
            new F55(29437, 29437, v53, v50);
            new F55(29437, v51, v45, f12);
            this[v54];
            Object.defineProperty(super[f12], "d", { writable: true, set: f12 });
            new Uint32Array(3695);
            function F82() {
                if (!new.target) { throw 'must be called with new'; }
                this.b = 1073741824;
            }
            return this;
        },
    };
    const v86 = new Worker(f13, v85);
    v86.getMessage(f13, f12);
    return Worker;
}
f12();
f12();
%OptimizeMaglevOnNextCall(f12);
f12();

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
// ==6885==ERROR: AddressSanitizer: heap-use-after-free on address 0x7cc8fb3ff9e8 at pc 0x63efea0fec6b bp 0x7ffe9a5c8040 sp 0x7ffe9a5c8038
// WRITE of size 8 at 0x7cc8fb3ff9e8 thread T0
//     #0 0x63efea0fec6a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c0dc6a) (BuildId: 42a5516f89359752)
//     #1 0x63efea185901  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c94901) (BuildId: 42a5516f89359752)
//     #2 0x63efea182281  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c91281) (BuildId: 42a5516f89359752)
//     #3 0x63efea07856c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b8756c) (BuildId: 42a5516f89359752)
//     #4 0x63efea076295  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b85295) (BuildId: 42a5516f89359752)
//     #5 0x63efea0c346c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bd246c) (BuildId: 42a5516f89359752)
//     #6 0x63efea0c2a92  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bd1a92) (BuildId: 42a5516f89359752)
//     #7 0x63efec209092  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x3d18092) (BuildId: 42a5516f89359752)
//     #8 0x63efea0671f6  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b761f6) (BuildId: 42a5516f89359752)
//     #9 0x63efea06e210  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b7d210) (BuildId: 42a5516f89359752)
//     #10 0x63efe9728759  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237759) (BuildId: 42a5516f89359752)
//     #11 0x63efe9728270  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237270) (BuildId: 42a5516f89359752)
//     #12 0x63efe9a03bbf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1512bbf) (BuildId: 42a5516f89359752)
//     #13 0x63efe9a0182d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x151082d) (BuildId: 42a5516f89359752)
//     #14 0x63efe99ff6ce  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x150e6ce) (BuildId: 42a5516f89359752)
//     #15 0x63efeeb1d2b5  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662c2b5) (BuildId: 42a5516f89359752)
//     #16 0x63efeea6e9e4  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657d9e4) (BuildId: 42a5516f89359752)
//     #17 0x63efc4dc0312  (<unknown module>)
//     #18 0x63efeea71a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//     #19 0x63efeea6f69b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e69b) (BuildId: 42a5516f89359752)
//     #20 0x63efeea6f3ea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e3ea) (BuildId: 42a5516f89359752)
//     #21 0x63efe9e46c2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1955c2a) (BuildId: 42a5516f89359752)
//     #22 0x63efe9e494f8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19584f8) (BuildId: 42a5516f89359752)
//     #23 0x63efe994bb00  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x145ab00) (BuildId: 42a5516f89359752)
//     #24 0x63efe9702686  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1211686) (BuildId: 42a5516f89359752)
//     #25 0x63efe97382ff  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12472ff) (BuildId: 42a5516f89359752)
//     #26 0x63efe97454a2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12544a2) (BuildId: 42a5516f89359752)
//     #27 0x63efe97449bf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12539bf) (BuildId: 42a5516f89359752)
//     #28 0x63efe97491d8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12581d8) (BuildId: 42a5516f89359752)
//     #29 0x7e78f9d2a1c9  (/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//     #30 0x7e78f9d2a28a  (/lib/x86_64-linux-gnu/libc.so.6+0x2a28a) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//     #31 0x63efe95f3029  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1102029) (BuildId: 42a5516f89359752)
// 
// 0x7cc8fb3ff9e8 is located 232 bytes inside of 8576-byte region [0x7cc8fb3ff900,0x7cc8fb401a80)
// freed by thread T64 (WorkerThread) here:
//     #0 0x63efe96cc96d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x11db96d) (BuildId: 42a5516f89359752)
//     #1 0x63efea28d7cc  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9c7cc) (BuildId: 42a5516f89359752)
//     #2 0x63efea28d5cd  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9c5cd) (BuildId: 42a5516f89359752)
//     #3 0x63efea09f344  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bae344) (BuildId: 42a5516f89359752)
//     #4 0x63efe9ea0330  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19af330) (BuildId: 42a5516f89359752)
//     #5 0x63efe9e9f0a1  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19ae0a1) (BuildId: 42a5516f89359752)
//     #6 0x63efe973c7a7  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124b7a7) (BuildId: 42a5516f89359752)
//     #7 0x63efe973b52c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a52c) (BuildId: 42a5516f89359752)
//     #8 0x63efe990a243  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1419243) (BuildId: 42a5516f89359752)
//     #9 0x63efe9690106  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x119f106) (BuildId: 42a5516f89359752)
// 
// previously allocated by thread T64 (WorkerThread) here:
//     #0 0x63efe96cc10d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x11db10d) (BuildId: 42a5516f89359752)
//     #1 0x63efea28fffa  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9effa) (BuildId: 42a5516f89359752)
//     #2 0x63efea2c2bb6  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd1bb6) (BuildId: 42a5516f89359752)
//     #3 0x63efea2c3407  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd2407) (BuildId: 42a5516f89359752)
//     #4 0x63efea2c4eb2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd3eb2) (BuildId: 42a5516f89359752)
//     #5 0x63efea09a3a7  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1ba93a7) (BuildId: 42a5516f89359752)
//     #6 0x63efe9eaf508  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19be508) (BuildId: 42a5516f89359752)
//     #7 0x63efe9eb2b4c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19c1b4c) (BuildId: 42a5516f89359752)
//     #8 0x63efeb4b1253  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x2fc0253) (BuildId: 42a5516f89359752)
//     #9 0x63efe99b2056  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x14c1056) (BuildId: 42a5516f89359752)
//     #10 0x63efe99b2700  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x14c1700) (BuildId: 42a5516f89359752)
//     #11 0x63efe973b777  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a777) (BuildId: 42a5516f89359752)
//     #12 0x63efe973b52c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a52c) (BuildId: 42a5516f89359752)
//     #13 0x63efe990a243  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1419243) (BuildId: 42a5516f89359752)
//     #14 0x63efe9690106  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x119f106) (BuildId: 42a5516f89359752)
// 
// Thread T64 (WorkerThread) created by T0 here:
//     #0 0x63efe9676b41  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1185b41) (BuildId: 42a5516f89359752)
//     #1 0x63efe9909fca  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1418fca) (BuildId: 42a5516f89359752)
//     #2 0x63efe9728b9a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237b9a) (BuildId: 42a5516f89359752)
//     #3 0x63efe9728314  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237314) (BuildId: 42a5516f89359752)
//     #4 0x63efe9a03bbf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1512bbf) (BuildId: 42a5516f89359752)
//     #5 0x63efe9a0182d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x151082d) (BuildId: 42a5516f89359752)
//     #6 0x63efe99ff6ce  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x150e6ce) (BuildId: 42a5516f89359752)
//     #7 0x63efeeb1d2b5  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662c2b5) (BuildId: 42a5516f89359752)
//     #8 0x63efeea723b2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x65813b2) (BuildId: 42a5516f89359752)
//     #9 0x63efeec20726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//     #10 0x63efeea71a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//     #11 0x63efeea71a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//     #12 0x63efeea6f69b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e69b) (BuildId: 42a5516f89359752)
//     #13 0x63efeea6f3ea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e3ea) (BuildId: 42a5516f89359752)
//     #14 0x63efe9e46c2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1955c2a) (BuildId: 42a5516f89359752)
//     #15 0x63efe9e494f8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19584f8) (BuildId: 42a5516f89359752)
//     #16 0x63efe994bb00  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x145ab00) (BuildId: 42a5516f89359752)
//     #17 0x63efe9702686  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1211686) (BuildId: 42a5516f89359752)
//     #18 0x63efe97382ff  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12472ff) (BuildId: 42a5516f89359752)
//     #19 0x63efe97454a2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12544a2) (BuildId: 42a5516f89359752)
//     #20 0x63efe97449bf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12539bf) (BuildId: 42a5516f89359752)
//     #21 0x63efe97491d8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12581d8) (BuildId: 42a5516f89359752)
//     #22 0x7e78f9d2a1c9  (/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//     #23 0x7e78f9d2a28a  (/lib/x86_64-linux-gnu/libc.so.6+0x2a28a) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//     #24 0x63efe95f3029  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1102029) (BuildId: 42a5516f89359752)
// 
// SUMMARY: AddressSanitizer: heap-use-after-free (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c0dc6a) (BuildId: 42a5516f89359752) 
// Shadow bytes around the buggy address:
//   0x7cc8fb3ff700: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x7cc8fb3ff780: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x7cc8fb3ff800: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x7cc8fb3ff880: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x7cc8fb3ff900: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
// =>0x7cc8fb3ff980: fd fd fd fd fd fd fd fd fd fd fd fd fd[fd]fd fd
//   0x7cc8fb3ffa00: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x7cc8fb3ffa80: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x7cc8fb3ffb00: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x7cc8fb3ffb80: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x7cc8fb3ffc00: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
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
// ==6885==ABORTING
// 
// ## V8 sandbox violation detected!
// STDOUT:
// 
// FUZZER ARGS: /work/FuzzilliSbx/fuzzilli/.build/x86_64-unknown-linux-gnu/release/FuzzilliCli --profile=v8Sandbox --wasm /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --instanceType=leaf --connectTo=127.0.0.1:10001
// TARGET ARGS: /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --expose-gc --omit-quit --allow-natives-syntax --fuzzing --jit-fuzzing --sandbox-fuzzing --disable-in-process-stack-traces
// CONTRIBUTORS: FloatGenerator, CodeGenMutator, SpliceMutator, TypedArrayGenerator, TrivialFunctionGenerator, PlainFunctionGenerator, InputMutator (loose)
// EXECUTION TIME: 67ms
