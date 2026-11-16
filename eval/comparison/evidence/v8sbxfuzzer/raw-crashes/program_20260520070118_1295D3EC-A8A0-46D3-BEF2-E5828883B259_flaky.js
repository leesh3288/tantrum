//
// BEGIN FUZZER GENERATED CODE
//

// If a sample with this instrumentation crashes, it may need the `fuzzilli` function to reproduce the crash.
if (typeof fuzzilli === 'undefined') fuzzilli = function() {};

const Probe = (function() {
    //
    // "Import" the common runtime-assisted mutator code. This will make various utility functions available.
    //
        // Note: runtime instrumentation code must generally assume that any operation performed on any object coming from the "outside", may raise an exception, for example due to triggering a Proxy trap.
    // Further, it must also assume that the environment has been modified arbitrarily. For example, the Array.prototype[@@iterator] may have been set to an invalid value, so using `for...of` syntax could trigger an exception.

    // Load all necessary routines and objects into local variables as they may be overwritten by the program.
    // We generally want to avoid triggerring observable side-effects, such as storing or loading
    // properties. For that reason, we prefer to use builtins like Object.defineProperty.

    const ProxyConstructor = Proxy;
    const BigIntConstructor = BigInt;
    const SetConstructor = Set;

    const ObjectPrototype = Object.prototype;

    const getOwnPropertyNames = Object.getOwnPropertyNames;
    const getPrototypeOf = Object.getPrototypeOf;
    const setPrototypeOf = Object.setPrototypeOf;
    const stringify = JSON.stringify;
    const hasOwnProperty = Object.hasOwn;
    const defineProperty = Object.defineProperty;
    const propertyValues = Object.values;
    const parseInteger = parseInt;
    const NumberIsInteger = Number.isInteger;
    const isNaN = Number.isNaN;
    const isFinite = Number.isFinite;
    const truncate = Math.trunc;
    const apply = Reflect.apply;
    const construct = Reflect.construct;
    const ReflectGet = Reflect.get;
    const ReflectSet = Reflect.set;
    const ReflectHas = Reflect.has;

    // Bind methods to local variables. These all expect the 'this' object as first parameter.
    const concat = Function.prototype.call.bind(Array.prototype.concat);
    const findIndex = Function.prototype.call.bind(Array.prototype.findIndex);
    const includes = Function.prototype.call.bind(Array.prototype.includes);
    const shift = Function.prototype.call.bind(Array.prototype.shift);
    const pop = Function.prototype.call.bind(Array.prototype.pop);
    const push = Function.prototype.call.bind(Array.prototype.push);
    const filter = Function.prototype.call.bind(Array.prototype.filter);
    const execRegExp = Function.prototype.call.bind(RegExp.prototype.exec);
    const stringSlice = Function.prototype.call.bind(String.prototype.slice);
    const toUpperCase = Function.prototype.call.bind(String.prototype.toUpperCase);
    const numberToString = Function.prototype.call.bind(Number.prototype.toString);
    const bigintToString = Function.prototype.call.bind(BigInt.prototype.toString);
    const stringStartsWith = Function.prototype.call.bind(String.prototype.startsWith);
    const setAdd = Function.prototype.call.bind(Set.prototype.add);
    const setHas = Function.prototype.call.bind(Set.prototype.has);

    const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER;
    const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

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
            if (!isInteger(this.x)) throw "RNG state is not an Integer!"
            return this.x;
        }
        randomFloat() {
            return this.randomInt() / this.m;
        }
        probability(p) {
            return this.randomFloat() < p;
        }
        reseed(seed) {
            this.x = seed;
        }
    }

    // When creating empty arrays to which elements are later added, use a custom array type that has a null prototype. This way, the arrays are not
    // affected by changes to the Array.prototype that could interfere with array builtins (e.g. indexed setters or a modified .constructor property).
    function EmptyArray() {
        let array = [];
        setPrototypeOf(array, null);
        return array;
    }

    //
    // Misc. helper functions.
    //
    // Type check helpers. These are less error-prone than manually using typeof and comparing against a string.
    function isObject(v) {
        return typeof v === 'object';
    }
    function isFunction(v) {
        return typeof v === 'function';
    }
    function isString(v) {
        return typeof v === 'string';
    }
    function isNumber(v) {
        return typeof v === 'number';
    }
    function isBigint(v) {
        return typeof v === 'bigint';
    }
    function isSymbol(v) {
        return typeof v === 'symbol';
    }
    function isBoolean(v) {
        return typeof v === 'boolean';
    }
    function isUndefined(v) {
        return typeof v === 'undefined';
    }

    // Helper function to determine if a value is an integer, and within [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER].
    function isInteger(n) {
        return isNumber(n) && NumberIsInteger(n) && n>= MIN_SAFE_INTEGER && n <= MAX_SAFE_INTEGER;
    }

    // Helper function to determine if a string is "simple". We only include simple strings for property/method names or string literals.
    // A simple string is basically a valid, property name with a maximum length.
    const simpleStringRegExp = /^[0-9a-zA-Z_$]+$/;
    function isSimpleString(s) {
        if (!isString(s)) throw "Non-string argument to isSimpleString: " + s;
        return s.length < 50 && execRegExp(simpleStringRegExp, s) !== null;
    }

    // Helper function to determine if a string is numeric and its numeric value representable as an integer.
    function isNumericString(s) {
        if (!isString(s)) return false;
        let number = parseInteger(s);
        return number >= MIN_SAFE_INTEGER && number <= MAX_SAFE_INTEGER && numberToString(number) === s;
    }

    // Helper function to determine whether a property can be accessed without raising an exception.
    function tryAccessProperty(prop, obj) {
        try {
            obj[prop];
            return true;
        } catch (e) {
            return false;
        }
    }

    // Helper function to determine if a property exists on an object or one of its prototypes. If an exception is raised, false is returned.
    function tryHasProperty(prop, obj) {
        try {
            return prop in obj;
        } catch (e) {
            return false;
        }
    }

    // Helper function to load a property from an object. If an exception is raised, undefined is returned.
    function tryGetProperty(prop, obj) {
        try {
            return obj[prop];
        } catch (e) {
            return undefined;
        }
    }

    // Helper function to obtain the own properties of an object. If that raises an exception (e.g. on a Proxy object), an empty array is returned.
    function tryGetOwnPropertyNames(obj) {
        try {
            return getOwnPropertyNames(obj);
        } catch (e) {
            return new Array();
        }
    }

    // Helper function to fetch the prototype of an object. If that raises an exception (e.g. on a Proxy object), null is returned.
    function tryGetPrototypeOf(obj) {
        try {
            return getPrototypeOf(obj);
        } catch (e) {
            return null;
        }
    }

    // Helper function to that creates a wrapper function for the given function which will call it in a try-catch and return false on exception.
    function wrapInTryCatch(f) {
        return function() {
            try {
                return apply(f, this, arguments);
            } catch (e) {
                return false;
            }
        };
    }

    //
    // Basic random number generation utility functions.
    //

    // Initially the rng is seeded randomly, specific mutators can reseed() the rng if they need deterministic behavior.
    // See the explore operation in JsOperations.swift for an example.
    let rng = new RNG(truncate(Math.random() * 2**32));

    function probability(p) {
        if (p < 0 || p > 1) throw "Argument to probability must be a number between zero and one";
        return rng.probability(p);
    }

    function randomIntBetween(start, end) {
        if (!isInteger(start) || !isInteger(end)) throw "Arguments to randomIntBetween must be integers";
        return (rng.randomInt() % (end - start)) + start;
    }

    function randomFloat() {
        return rng.randomFloat();
    }

    function randomBigintBetween(start, end) {
        if (!isBigint(start) || !isBigint(end)) throw "Arguments to randomBigintBetween must be bigints";
        if (!isInteger(Number(start)) || !isInteger(Number(end))) throw "Arguments to randomBigintBetween must be representable as regular intergers";
        return BigIntConstructor(randomIntBetween(Number(start), Number(end)));
    }

    function randomIntBelow(n) {
        if (!isInteger(n)) throw "Argument to randomIntBelow must be an integer";
        return rng.randomInt() % n;
    }

    function randomElement(array) {
        return array[randomIntBelow(array.length)];
    }

    // Action constants.
    const PROPERTY_LOAD = "loads";
    const PROPERTY_STORE = "stores";

    // Property access outcomes.
    const PROPERTY_NOT_FOUND = 0;
    const PROPERTY_FOUND = 1;

    //
    // Result recording and reporting.
    //
    let results = { __proto__: null };

    function reportError(msg) {
        fuzzilli('FUZZILLI_PRINT', 'PROBING_ERROR: ' + msg);
    }

    function reportResults() {
        fuzzilli('FUZZILLI_PRINT', 'PROBING_RESULTS: ' + stringify(results));
    }

    // Record a property action performed on a probe.
    // |target| is expected to be the original prototype of the probe object. It is used to determine whether the accessed property exists anywhere in the prototype chain of the probe.
    function recordAction(action, id, target, key) {
        let outcome = PROPERTY_NOT_FOUND;
        if (ReflectHas(target, key)) {
            outcome = PROPERTY_FOUND;
        }

        let keyString = key;
        if (typeof keyString !== 'string') {
            try {
                keyString = key.toString();
                if (typeof keyString !== 'string') throw 'not a string';
            } catch(e) {
                // Got some "weird" property key. Ignore it.
                return;
            }
        }

        if (!isSimpleString(keyString) && !isNumericString(keyString) && !isSymbol(key)) {
            // Cannot deal with this property name. Ignore it.
            return;
        }

        if (isSymbol(key) && !stringStartsWith(keyString, 'Symbol(Symbol.')) {
            // We can only deal with well-known symbols (e.g. "Symbol(Symbol.toPrimitive)"), and this isn't one. Ignore it.
            return;
        }

        if (!hasOwnProperty(results, id)) {
            results[id] = { [PROPERTY_LOAD]: { __proto__: null }, [PROPERTY_STORE]: { __proto__: null } };
        }

        // If the same action is performed on the same probe multiple times, we keep the last result.
        results[id][action][keyString] = outcome;
    }

    function recordActionWithErrorHandling(action, id, target, key) {
        try {
            recordAction(action, id, target, key);
        } catch(e) {
            reportError(e);
        }
    }

    //
    // Probe implementation.
    //
    function probe(id, value) {
        let originalPrototype, newPrototype;
        let handler = {
            get(target, key, receiver) {
                // Special logic to deal with programs that fetch the prototype of an object after it was turned into a probe.
                // In that case, the probe Proxy would leak to the script, potentially causing incorrect behaviour. To deal with that,
                // we (1) return the original prototype when __proto__ is loaded (but this can be "bypassed" through Object.getPrototypeOf)
                // and (2) attempt to detect property accesses on the prototype itself (instead of on the probe) and handle those separately.
                if (key === '__proto__' && receiver === value) return originalPrototype;
                if (receiver === newPrototype) return ReflectGet(target, key);
                recordActionWithErrorHandling(PROPERTY_LOAD, id, target, key);
                return ReflectGet(target, key, receiver);
            },
            set(target, key, value, receiver) {
                if (receiver === newPrototype) return ReflectSet(target, key, value);
                recordActionWithErrorHandling(PROPERTY_STORE, id, target, key);
                return ReflectSet(target, key, value, receiver);
            },
            has(target, key) {
                // Treat this as a load.
                recordActionWithErrorHandling(PROPERTY_LOAD, id, target, key);
                return ReflectHas(target, key);
            },
        };

        try {
            // This can fail, e.g. due to "Cannot convert undefined or null to object" or if the object is non-extensible. In that case, do nothing.
            originalPrototype = getPrototypeOf(value);
            newPrototype = new ProxyConstructor(originalPrototype, handler);
            setPrototypeOf(value, newPrototype);
        } catch (e) {}
    }

    function probeWithErrorHandling(id, value) {
        try {
            probe(id, value);
        } catch(e) {
            reportError(e);
        }
    }

    return {
        probe: probeWithErrorHandling,
        reportResults: reportResults
    };
})();

function f0() {
}
[536870889,-256,-49469,9007199254740990,27352,-1,7];
[-2147483649,128,8094,5,1073741824,9007199254740990,64696];
[-9007199254740990,9007199254740990,-1986595097,-70804566,15,-9007199254740990,-174308731,-580830272,16];
[-690.1722021166013,0.9454631120691877,9.811582874466499,2.2250738585072014e-308,Infinity];
[0.0];
[0.29125951150895657,2.220446049250313e-16,-4.329568614864345,4.0,-1000000000000.0];
/[a\S]/yum;
/2\ud808\udf45*/ig;
/UW/dvg;
/a(?=b)c/yvs;
/(?!a)?a*/idgm;
/\u0034\u{12345}/yidvgs;
constructor();
function f18(a19) {
    for (let [i22, i23] = (() => {
            Probe.probe("v20", 0);
            Probe.probe("v21", 10);
            return [0, 10];
        })();
        (() => {
            const v24 = i22 < i23;
            Probe.probe("v24", v24);
            Probe.probe("v25", "0b");
            function f26() {
                this.Atomics.pause();
                return f26;
            }
            Probe.probe("v26", f26);
            const v30 = f26();
            f26();
            %OptimizeMaglevOnNextCall(v30);
            f26();
            Probe.probe("v33", -6);
            (-6) ** "0b";
            return v24;
        })();
        (() => {
            Probe.probe("v35", i22);
            Probe.probe("v36", i23);
            i22++;
            i23--;
        })()) {
        Probe.probe("v40", i23);
        i23++;
    }
    return a19;
}
f18();
f18();
async function* f44(a45, a46) {
    Probe.probe("v45", a45);
    return a45;
}
const v49 = { maxByteLength: 3556 };
Probe.probe("v50", 11);
const v51 = new ArrayBuffer(11, v49);
Probe.probe("v52", BigInt64Array);
new BigInt64Array(v51);
let v54 = /a{0}[\c~]NCzja\Bbfoo(?!bar)baz*/ydgm;
Probe.probe("v54", v54);
function f55() {
    ++v54;
    v54 = 4;
    return v54;
}
Probe.probe("v55", f55);
f55();
function f59() {
    function f60(a61, a62, a63) {
        return a62;
    }
    Probe.probe("v60", f60);
    Probe.probe("v64", Worker);
    const v67 = new Worker(f60, { type: "function" });
    Probe.probe("v67", v67);
    v67.getMessage(f60, f59);
    return Worker;
}
Probe.probe("v59", f59);
f59();
f59();
f59();
%OptimizeMaglevOnNextCall(f55);
f44();
Probe.reportResults();


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
// ==3494416==ERROR: AddressSanitizer: heap-use-after-free on address 0x799a7f7e71e8 at pc 0x57ba43e94c6b bp 0x7fff7b357f00 sp 0x7fff7b357ef8
// WRITE of size 8 at 0x799a7f7e71e8 thread T0
//     #0 0x57ba43e94c6a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c0dc6a) (BuildId: 42a5516f89359752)
//     #1 0x57ba43f1b901  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c94901) (BuildId: 42a5516f89359752)
//     #2 0x57ba43f18281  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c91281) (BuildId: 42a5516f89359752)
//     #3 0x57ba43e0e56c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b8756c) (BuildId: 42a5516f89359752)
//     #4 0x57ba43e0c295  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b85295) (BuildId: 42a5516f89359752)
//     #5 0x57ba43e5946c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bd246c) (BuildId: 42a5516f89359752)
//     #6 0x57ba43e58a92  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bd1a92) (BuildId: 42a5516f89359752)
//     #7 0x57ba45f9f092  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x3d18092) (BuildId: 42a5516f89359752)
//     #8 0x57ba43dfd1f6  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b761f6) (BuildId: 42a5516f89359752)
//     #9 0x57ba43e04210  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b7d210) (BuildId: 42a5516f89359752)
//     #10 0x57ba434be759  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237759) (BuildId: 42a5516f89359752)
//     #11 0x57ba434be270  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237270) (BuildId: 42a5516f89359752)
//     #12 0x57ba43799bbf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1512bbf) (BuildId: 42a5516f89359752)
//     #13 0x57ba4379782d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x151082d) (BuildId: 42a5516f89359752)
//     #14 0x57ba437956ce  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x150e6ce) (BuildId: 42a5516f89359752)
//     #15 0x57ba488b32b5  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662c2b5) (BuildId: 42a5516f89359752)
//     #16 0x57ba488083b2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x65813b2) (BuildId: 42a5516f89359752)
//     #17 0x57ba489b6726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//     #18 0x57ba48807a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//     #19 0x57ba48807a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//     #20 0x57ba4880569b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e69b) (BuildId: 42a5516f89359752)
//     #21 0x57ba488053ea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e3ea) (BuildId: 42a5516f89359752)
//     #22 0x57ba43bdcc2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1955c2a) (BuildId: 42a5516f89359752)
//     #23 0x57ba43bdf4f8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19584f8) (BuildId: 42a5516f89359752)
//     #24 0x57ba436e1b00  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x145ab00) (BuildId: 42a5516f89359752)
//     #25 0x57ba43498686  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1211686) (BuildId: 42a5516f89359752)
//     #26 0x57ba434ce2ff  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12472ff) (BuildId: 42a5516f89359752)
//     #27 0x57ba434db4a2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12544a2) (BuildId: 42a5516f89359752)
//     #28 0x57ba434da9bf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12539bf) (BuildId: 42a5516f89359752)
//     #29 0x57ba434df1d8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12581d8) (BuildId: 42a5516f89359752)
//     #30 0x7b4a7e7e61c9  (/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//     #31 0x7b4a7e7e628a  (/lib/x86_64-linux-gnu/libc.so.6+0x2a28a) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//     #32 0x57ba43389029  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1102029) (BuildId: 42a5516f89359752)
// 
// 0x799a7f7e71e8 is located 232 bytes inside of 8576-byte region [0x799a7f7e7100,0x799a7f7e9280)
// freed by thread T64 (WorkerThread) here:
//     #0 0x57ba4346296d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x11db96d) (BuildId: 42a5516f89359752)
//     #1 0x57ba440237cc  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9c7cc) (BuildId: 42a5516f89359752)
//     #2 0x57ba440235cd  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9c5cd) (BuildId: 42a5516f89359752)
//     #3 0x57ba43e35344  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bae344) (BuildId: 42a5516f89359752)
//     #4 0x57ba43c36330  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19af330) (BuildId: 42a5516f89359752)
//     #5 0x57ba43c350a1  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19ae0a1) (BuildId: 42a5516f89359752)
//     #6 0x57ba434d27a7  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124b7a7) (BuildId: 42a5516f89359752)
//     #7 0x57ba434d152c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a52c) (BuildId: 42a5516f89359752)
//     #8 0x57ba436a0243  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1419243) (BuildId: 42a5516f89359752)
//     #9 0x57ba43426106  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x119f106) (BuildId: 42a5516f89359752)
// 
// previously allocated by thread T64 (WorkerThread) here:
//     #0 0x57ba4346210d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x11db10d) (BuildId: 42a5516f89359752)
//     #1 0x57ba44025ffa  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9effa) (BuildId: 42a5516f89359752)
//     #2 0x57ba44058bb6  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd1bb6) (BuildId: 42a5516f89359752)
//     #3 0x57ba44059407  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd2407) (BuildId: 42a5516f89359752)
//     #4 0x57ba4405aeb2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd3eb2) (BuildId: 42a5516f89359752)
//     #5 0x57ba43e303a7  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1ba93a7) (BuildId: 42a5516f89359752)
//     #6 0x57ba43c45508  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19be508) (BuildId: 42a5516f89359752)
//     #7 0x57ba43c48b4c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19c1b4c) (BuildId: 42a5516f89359752)
//     #8 0x57ba45247253  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x2fc0253) (BuildId: 42a5516f89359752)
//     #9 0x57ba43748056  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x14c1056) (BuildId: 42a5516f89359752)
//     #10 0x57ba43748700  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x14c1700) (BuildId: 42a5516f89359752)
//     #11 0x57ba434d1777  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a777) (BuildId: 42a5516f89359752)
//     #12 0x57ba434d152c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a52c) (BuildId: 42a5516f89359752)
//     #13 0x57ba436a0243  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1419243) (BuildId: 42a5516f89359752)
//     #14 0x57ba43426106  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x119f106) (BuildId: 42a5516f89359752)
// 
// Thread T64 (WorkerThread) created by T0 here:
//     #0 0x57ba4340cb41  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1185b41) (BuildId: 42a5516f89359752)
//     #1 0x57ba4369ffca  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1418fca) (BuildId: 42a5516f89359752)
//     #2 0x57ba434beb9a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237b9a) (BuildId: 42a5516f89359752)
//     #3 0x57ba434be314  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237314) (BuildId: 42a5516f89359752)
//     #4 0x57ba43799bbf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1512bbf) (BuildId: 42a5516f89359752)
//     #5 0x57ba4379782d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x151082d) (BuildId: 42a5516f89359752)
//     #6 0x57ba437956ce  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x150e6ce) (BuildId: 42a5516f89359752)
//     #7 0x57ba488b32b5  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662c2b5) (BuildId: 42a5516f89359752)
//     #8 0x57ba488083b2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x65813b2) (BuildId: 42a5516f89359752)
//     #9 0x57ba489b6726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//     #10 0x57ba48807a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//     #11 0x57ba48807a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//     #12 0x57ba4880569b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e69b) (BuildId: 42a5516f89359752)
//     #13 0x57ba488053ea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e3ea) (BuildId: 42a5516f89359752)
//     #14 0x57ba43bdcc2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1955c2a) (BuildId: 42a5516f89359752)
//     #15 0x57ba43bdf4f8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19584f8) (BuildId: 42a5516f89359752)
//     #16 0x57ba436e1b00  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x145ab00) (BuildId: 42a5516f89359752)
//     #17 0x57ba43498686  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1211686) (BuildId: 42a5516f89359752)
//     #18 0x57ba434ce2ff  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12472ff) (BuildId: 42a5516f89359752)
//     #19 0x57ba434db4a2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12544a2) (BuildId: 42a5516f89359752)
//     #20 0x57ba434da9bf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12539bf) (BuildId: 42a5516f89359752)
//     #21 0x57ba434df1d8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12581d8) (BuildId: 42a5516f89359752)
//     #22 0x7b4a7e7e61c9  (/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//     #23 0x7b4a7e7e628a  (/lib/x86_64-linux-gnu/libc.so.6+0x2a28a) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//     #24 0x57ba43389029  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1102029) (BuildId: 42a5516f89359752)
// 
// SUMMARY: AddressSanitizer: heap-use-after-free (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c0dc6a) (BuildId: 42a5516f89359752) 
// Shadow bytes around the buggy address:
//   0x799a7f7e6f00: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x799a7f7e6f80: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x799a7f7e7000: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x799a7f7e7080: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x799a7f7e7100: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
// =>0x799a7f7e7180: fd fd fd fd fd fd fd fd fd fd fd fd fd[fd]fd fd
//   0x799a7f7e7200: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x799a7f7e7280: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x799a7f7e7300: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x799a7f7e7380: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x799a7f7e7400: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
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
// ==3494416==ABORTING
// 
// ## V8 sandbox violation detected!
// STDOUT:
// 
// FUZZER ARGS: /work/FuzzilliSbx/fuzzilli/.build/x86_64-unknown-linux-gnu/release/FuzzilliCli --profile=v8Sandbox --wasm /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --instanceType=leaf --connectTo=127.0.0.1:10001
// TARGET ARGS: /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --expose-gc --omit-quit --allow-natives-syntax --fuzzing --jit-fuzzing --sandbox-fuzzing --disable-in-process-stack-traces
// CONTRIBUTORS: 
// EXECUTION TIME: 94ms
