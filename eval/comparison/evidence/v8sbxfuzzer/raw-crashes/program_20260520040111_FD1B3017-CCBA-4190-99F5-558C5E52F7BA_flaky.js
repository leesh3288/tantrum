//
// BEGIN FUZZER GENERATED CODE
//

// If a sample with this instrumentation crashes, it may need the `fuzzilli` function to reproduce the crash.
if (typeof fuzzilli === 'undefined') fuzzilli = function() {};

const explore = (function() {
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


    //
    // "Import" the object introspection code. This is used to find properties and methods when exploring an object.
    //
        // Note: this code assumes that the common code from above has been included before.

    //
    // Object introspection.
    //

    //
    // Enumerate all properties on the given object and its prototypes.
    //
    // These include elements and methods (callable properties). Each property is assigned a "weight" which expresses roughly how "important"/"interesting" a property is:
    // a property that exists on a prototype is considered less interesting as it can probably be reached through other objects as well, so we prefer properties closer to the start object.
    //
    // The result is returned in an array like the following:
    // [
    //   length: <total number of properties>
    //   totalWeight: <combined weight of all properties>
    //   0, 1, ..., length - 1: { name: <property name/index>, weight: <weight as number> }
    // ]
    function enumeratePropertiesOf(o) {
        // Collect all properties, including those from prototypes, in this array.
        let properties = EmptyArray();

        // Give properties from prototypes a lower weight. Currently, the weight is halved for every new level of the prototype chain.
        let currentWeight = 1.0;
        properties.totalWeight = 0.0;
        function recordProperty(p) {
            push(properties, {name: p, weight: currentWeight});
            properties.totalWeight += currentWeight;
        }

        // Iterate over the prototype chain and record all properties.
        let obj = o;
        while (obj !== null) {
            // Special handling for array-like things: if the array is too large, skip this level and just include a couple random indices.
            // We need to be careful when accessing the length though: for TypedArrays, the length property is defined on the prototype but
            // must be accessed with the TypedArray as |this| value (not the prototype).
            let maybeLength = tryGetProperty('length', obj);
            if (isInteger(maybeLength) && maybeLength > 100) {
                for (let i = 0; i < 10; i++) {
                    let randomElement = randomIntBelow(maybeLength);
                    recordProperty(randomElement);
                }
            } else {
                // TODO do we want to also enumerate symbol properties here (using Object.getOwnPropertySymbols)? If we do, we should probable also add IL-level support for Symbols (i.e. a `LoadSymbol` instruction that ensures the symbol is in the global Symbol registry).
                let allOwnPropertyNames = tryGetOwnPropertyNames(obj);
                let allOwnElements = EmptyArray();
                for (let i = 0; i < allOwnPropertyNames.length; i++) {
                    let p = allOwnPropertyNames[i];
                    let index = parseInteger(p);
                    // TODO should we allow negative indices here as well?
                    if (index >= 0 && index <= MAX_SAFE_INTEGER && numberToString(index) === p) {
                        push(allOwnElements, index);
                    } else if (isSimpleString(p) && tryAccessProperty(p, o)) {
                        // Only include properties with "simple" names and only if they can be accessed on the original object without raising an exception.
                        recordProperty(p);
                    }
                }

                // Limit array-like objects to at most 10 random elements.
                for (let i = 0; i < 10 && allOwnElements.length > 0; i++) {
                    let index = randomIntBelow(allOwnElements.length);
                    recordProperty(allOwnElements[index]);
                    allOwnElements[index] = pop(allOwnElements);
                }
            }

            obj = tryGetPrototypeOf(obj);
            currentWeight /= 2.0;

            // Greatly reduce the property weights for the Object.prototype. These methods are always available and we can use more targeted mechanisms like CodeGenerators to call them if we want to.
            if (obj === ObjectPrototype) {
                // Somewhat arbitrarily reduce the weight as if there were another 3 levels.
                currentWeight /= 8.0;

                // However, if we've reached the Object prototype without any other properties (i.e. are inspecting an empty, plain object), then always return an empty list since these properties are not very intersting.
                if (properties.length == 0) {
                    return properties;
                }
            }
        }

        return properties;
    }

    //
    // Returns a random property available on the given object or one of its prototypes.
    //
    // This will return more "interesting" properties with a higher probability. In general, properties closer to the start object
    // are preferred over properties on prototypes (as these are likely shared with other objects).
    //
    // If no (interesting) property exists, null is returned. Otherwise, the key of the property is returned.
    function randomPropertyOf(o) {
        let properties = enumeratePropertiesOf(o);

        // We need at least one property to chose from.
        if (properties.length === 0) {
            return null;
        }

        // Now choose a random property. If a property has weight 2W, it will be selected with twice the probability of a property with weight W.
        let selectedProperty;
        let remainingWeight = randomFloat() * properties.totalWeight;
        for (let i = 0; i < properties.length; i++) {
            let candidate = properties[i];
            remainingWeight -= candidate.weight;
            if (remainingWeight < 0) {
                selectedProperty = candidate.name;
                break;
            }
        }

        // Sanity checking. This may fail for example if Proxies are involved. In that case, just fail here.
        if (!tryHasProperty(selectedProperty, o)) return null;

        return selectedProperty;
    }


    //
    // "Import" the Action implementation code.
    //
        // Note: this code assumes that the common code from above has been included before.

    //
    // List of all supported operations. Must be kept in sync with the ActionOperation enum.
    //
    const OP_CALL_FUNCTION = 'CALL_FUNCTION';
    const OP_CONSTRUCT = 'CONSTRUCT';
    const OP_CALL_METHOD = 'CALL_METHOD';
    const OP_CONSTRUCT_METHOD = 'CONSTRUCT_METHOD';
    const OP_GET_PROPERTY = 'GET_PROPERTY';
    const OP_SET_PROPERTY = 'SET_PROPERTY';
    const OP_DELETE_PROPERTY = 'DELETE_PROPERTY';

    const OP_ADD = 'ADD';
    const OP_SUB = 'SUB';
    const OP_MUL = 'MUL';
    const OP_DIV = 'DIV';
    const OP_MOD = 'MOD';
    const OP_INC = 'INC';
    const OP_DEC = 'DEC';
    const OP_NEG = 'NEG';

    const OP_LOGICAL_AND = 'LOGICAL_AND';
    const OP_LOGICAL_OR = 'LOGICAL_OR';
    const OP_LOGICAL_NOT = 'LOGICAL_NOT';
    const OP_NULL_COALESCE = 'NULL_COALESCE';

    const OP_BITWISE_AND = 'BITWISE_AND';
    const OP_BITWISE_OR = 'BITWISE_OR';
    const OP_BITWISE_XOR = 'BITWISE_XOR';
    const OP_LEFT_SHIFT = 'LEFT_SHIFT';
    const OP_SIGNED_RIGHT_SHIFT = 'SIGNED_RIGHT_SHIFT';
    const OP_UNSIGNED_RIGHT_SHIFT = 'UNSIGNED_RIGHT_SHIFT';
    const OP_BITWISE_NOT = 'BITWISE_NOT';

    const OP_COMPARE_EQUAL = 'COMPARE_EQUAL';
    const OP_COMPARE_STRICT_EQUAL = 'COMPARE_STRICT_EQUAL';
    const OP_COMPARE_NOT_EQUAL = 'COMPARE_NOT_EQUAL';
    const OP_COMPARE_STRICT_NOT_EQUAL = 'COMPARE_STRICT_NOT_EQUAL';
    const OP_COMPARE_GREATER_THAN = 'COMPARE_GREATER_THAN';
    const OP_COMPARE_LESS_THAN = 'COMPARE_LESS_THAN';
    const OP_COMPARE_GREATER_THAN_OR_EQUAL = 'COMPARE_GREATER_THAN_OR_EQUAL';
    const OP_COMPARE_LESS_THAN_OR_EQUAL = 'COMPARE_LESS_THAN_OR_EQUAL';
    const OP_TEST_IS_NAN = 'TEST_IS_NAN';
    const OP_TEST_IS_FINITE = 'TEST_IS_FINITE';

    const OP_SYMBOL_REGISTRATION = 'SYMBOL_REGISTRATION';

    //
    // Action constructors.
    //
    function Action(operation, inputs = EmptyArray()) {
        this.operation = operation;
        this.inputs = inputs;
        this.isGuarded = false;
    }

    // A guarded action is an action that is allowed to raise an exception.
    //
    // These are for example used for by the ExplorationMutator for function/method call
    // which may throw an exception if they aren't given the right arguments. In that case,
    // we may still want to keep the function call so that it can be mutated further to
    // hopefully eventually find the correct arguments. This is especially true if finding
    // the right arguments reqires the ProbingMutator to install the right properties on an
    // argument object, in which case the ExplorationMutator on its own would (likely) never
    // be able to generate a valid call, and so the function/method may be missed entirely.
    //
    // If a guarded action succeeds (doesn't raise an exception), it will be converted to
    // a regular action to limit the number of generated try-catch blocks.
    function GuardedAction(operation, inputs = EmptyArray()) {
        this.operation = operation;
        this.inputs = inputs;
        this.isGuarded = true;
    }

    // Special value to indicate that no action should be performed.
    const NO_ACTION = null;

    //
    // Action Input constructors.
    //
    // The inputs for actions are encoded as objects that specify both the type and the value of the input. They are basically enum values with associated values.
    // These must be kept compatible with the Action.Input enum in RuntimeAssistedMutator.swift as they have to be encodable to/decodable from that enum.
    //
    function ArgumentInput(index) {
        if (!isInteger(index)) throw "ArgumentInput index is not an integer: " + index;
        return { argument: { index } };
    }
    function SpecialInput(name) {
        if (!isString(name) || !isSimpleString(name)) throw "SpecialInput name is not a (simple) string: " + name;
        return { special: { name } };
    }
    function IntInput(value) {
        if (!isInteger(value)) throw "IntInput value is not an integer: " + value;
        return { int: { value } };
    }
    function FloatInput(value) {
        if (!isNumber(value) || !isFinite(value)) throw "FloatInput value is not a (finite) number: " + value;
        return { float: { value } };
    }
    function BigintInput(value) {
        if (!isBigint(value)) throw "BigintInput value is not a bigint: " + value;
        // Bigints can't be serialized by JSON.stringify, so store them as strings instead.
        return { bigint: { value: bigintToString(value) } };
    }
    function StringInput(value) {
        if (!isString(value) || !isSimpleString(value)) throw "StringInput value is not a (simple) string: " + value;
        return { string: { value } };
    }

    // Type checkers for Input objects. We use these instead of for example 'instanceof' since we allow Input
    // objects to be decoded from JSON, in which case they will not have the right .constructor property.
    function isArgumentInput(input) { return hasOwnProperty(input, 'argument'); }
    function isSpecialInput(input) { return hasOwnProperty(input, 'special'); }
    function isIntInput(input) { return hasOwnProperty(input, 'int'); }
    function isFloatInput(input) { return hasOwnProperty(input, 'float'); }
    function isBigintInput(input) { return hasOwnProperty(input, 'bigint'); }
    function isStringInput(input) { return hasOwnProperty(input, 'string'); }

    // Helper routines to extract the associated values from Input objects.
    function getArgumentInputIndex(input) { return input.argument.index; }
    function getSpecialInputName(input) { return input.special.name; }
    function getIntInputValue(input) { return input.int.value; }
    function getFloatInputValue(input) { return input.float.value; }
    function getBigintInputValue(input) { return BigIntConstructor(input.bigint.value); }
    function getStringInputValue(input) { return input.string.value; }

    // Handlers for executing actions.
    // These will receive the array of concrete inputs (i.e. JavaScript values) as first parameter and the current value of |this| as second parameter (which can be ignored if not needed).
    const ACTION_HANDLERS = {
      [OP_CALL_FUNCTION]: (inputs, currentThis) => { let f = shift(inputs); return apply(f, currentThis, inputs); },
      [OP_CONSTRUCT]: (inputs) => { let c = shift(inputs); return construct(c, inputs); },
      [OP_CALL_METHOD]: (inputs) => { let o = shift(inputs); let m = shift(inputs); return apply(o[m], o, inputs); },
      [OP_CONSTRUCT_METHOD]: (v, inputs) => { let o = shift(inputs); let m = shift(inputs); return construct(o[m], inputs); },
      [OP_GET_PROPERTY]: (inputs) => { let o = inputs[0]; let p = inputs[1]; return o[p]; },
      [OP_SET_PROPERTY]: (inputs) => { let o = inputs[0]; let p = inputs[1]; let v = inputs[2]; o[p] = v; },
      [OP_DELETE_PROPERTY]: (inputs) => { let o = inputs[0]; let p = inputs[1]; return delete o[p]; },
      [OP_ADD]: (inputs) => inputs[0] + inputs[1],
      [OP_SUB]: (inputs) => inputs[0] - inputs[1],
      [OP_MUL]: (inputs) => inputs[0] * inputs[1],
      [OP_DIV]: (inputs) => inputs[0] / inputs[1],
      [OP_MOD]: (inputs) => inputs[0] % inputs[1],
      [OP_INC]: (inputs) => inputs[0]++,
      [OP_DEC]: (inputs) => inputs[0]--,
      [OP_NEG]: (inputs) => -inputs[0],
      [OP_LOGICAL_AND]: (inputs) => inputs[0] && inputs[1],
      [OP_LOGICAL_OR]: (inputs) => inputs[0] || inputs[1],
      [OP_LOGICAL_NOT]: (inputs) => !inputs[0],
      [OP_NULL_COALESCE]: (inputs) => inputs[0] ?? inputs[1],
      [OP_BITWISE_AND]: (inputs) => inputs[0] & inputs[1],
      [OP_BITWISE_OR]: (inputs) => inputs[0] | inputs[1],
      [OP_BITWISE_XOR]: (inputs) => inputs[0] ^ inputs[1],
      [OP_LEFT_SHIFT]: (inputs) => inputs[0] << inputs[1],
      [OP_SIGNED_RIGHT_SHIFT]: (inputs) => inputs[0] >> inputs[1],
      [OP_UNSIGNED_RIGHT_SHIFT]: (inputs) => inputs[0] >>> inputs[1],
      [OP_BITWISE_NOT]: (inputs) => ~inputs[0],
      [OP_COMPARE_EQUAL]: (inputs) => inputs[0] == inputs[1],
      [OP_COMPARE_STRICT_EQUAL]: (inputs) => inputs[0] === inputs[1],
      [OP_COMPARE_NOT_EQUAL]: (inputs) => inputs[0] != inputs[1],
      [OP_COMPARE_STRICT_NOT_EQUAL]: (inputs) => inputs[0] !== inputs[1],
      [OP_COMPARE_GREATER_THAN]: (inputs) => inputs[0] > inputs[1],
      [OP_COMPARE_LESS_THAN]: (inputs) => inputs[0] < inputs[1],
      [OP_COMPARE_GREATER_THAN_OR_EQUAL]: (inputs) => inputs[0] >= inputs[1],
      [OP_COMPARE_LESS_THAN_OR_EQUAL]: (inputs) => inputs[0] <= inputs[1],
      [OP_TEST_IS_NAN]: (inputs) => Number.isNaN(inputs[0]),
      [OP_TEST_IS_FINITE]: (inputs) => Number.isFinite(inputs[0]),
      [OP_SYMBOL_REGISTRATION]: (inputs) => Symbol.for(inputs[0].description),
    };

    // Executes the given action.
    //
    // This will convert the inputs to concrete JavaScript values, then execute the operation with these inputs.
    // Executing an action may change its guarding state: if a guarded action executes without raising an exception,
    // it will be converted to an unguarded operation (as the guarding apears to not be needed). This way, we will
    // ultimately end up emitting fewer try-catch (or equivalent) constructs in the final JavaScript code generated
    // from these actions.
    //
    // Returns true if either the action succeeded without raising an exception or if the action is guarded, false otherwise.
    // The output of the action is stored in |context.output| upon successful execution.
    function execute(action, context) {
        if (action === NO_ACTION) {
            return true;
        }

        // Convert the action's inputs to the concrete JS values to use for executing the action.
        let concreteInputs = EmptyArray();
        for (let i = 0; i < action.inputs.length; i++) {
            let input = action.inputs[i];
            if (isArgumentInput(input)) {
                let index = getArgumentInputIndex(input);
                if (index >= context.arguments.length) throw "Invalid argument index: " + index;
                push(concreteInputs, context.arguments[index]);
            } else if (isSpecialInput(input)) {
                let name = getSpecialInputName(input);
                if (!hasOwnProperty(context.specialValues, name)) throw "Unknown special value: " + name;
                push(concreteInputs, context.specialValues[name]);
            } else if (isIntInput(input)) {
                push(concreteInputs, getIntInputValue(input));
            } else if (isFloatInput(input)) {
                push(concreteInputs, getFloatInputValue(input));
            } else if (isBigintInput(input)) {
                // These need special handling because BigInts cannot be serialized into JSON, so are stored as strings.
                push(concreteInputs, getBigintInputValue(input));
            } else if (isStringInput(input)) {
                push(concreteInputs, getStringInputValue(input));
            } else {
                throw "Unknown action input: " + stringify(input);
            }
        }

        let handler = ACTION_HANDLERS[action.operation];
        if (isUndefined(handler)) throw "Unhandled operation " + action.operation;

        try {
            context.output = handler(concreteInputs, context.currentThis);
            // If the action succeeded, mark it as non-guarded so that we don't emit try-catch blocks for it later on.
            // We could alternatively only do that if all executions succeeded, but it's probably fine to do it if at least one execution succeeded.
            if (action.isGuarded) action.isGuarded = false;
        } catch (e) {
            return action.isGuarded;
        }

        return true;
    }

    // JS Action Operation groups. See e.g. exploreNumber() for examples of how they are used.
    const SHIFT_OPS = [OP_LEFT_SHIFT, OP_SIGNED_RIGHT_SHIFT, OP_UNSIGNED_RIGHT_SHIFT];
    // Unsigned shift is not defined for bigints.
    const BIGINT_SHIFT_OPS = [OP_LEFT_SHIFT, OP_SIGNED_RIGHT_SHIFT];
    const BITWISE_OPS = [OP_BITWISE_OR, OP_BITWISE_AND, OP_BITWISE_XOR];
    const ARITHMETIC_OPS = [OP_ADD, OP_SUB, OP_MUL, OP_DIV, OP_MOD];
    const UNARY_OPS = [OP_INC, OP_DEC, OP_NEG, OP_BITWISE_NOT];
    const COMPARISON_OPS = [OP_COMPARE_EQUAL, OP_COMPARE_STRICT_EQUAL, OP_COMPARE_NOT_EQUAL, OP_COMPARE_STRICT_NOT_EQUAL, OP_COMPARE_GREATER_THAN, OP_COMPARE_LESS_THAN, OP_COMPARE_GREATER_THAN_OR_EQUAL, OP_COMPARE_LESS_THAN_OR_EQUAL];
    const BOOLEAN_BINARY_OPS = [OP_LOGICAL_AND, OP_LOGICAL_OR];
    const BOOLEAN_UNARY_OPS = [OP_LOGICAL_NOT];


    //
    // Global constants.
    //
    // Property names to use when defining new properties. Should be kept in sync with the equivalent set in JavaScriptEnvironment.swift
    const customPropertyNames = ["a", "b", "c", "d", "e", "f", "g", "h"];

    // Maximum number of parameters for function/method calls. Everything above this is consiered an invalid .length property of the function.
    const MAX_PARAMETERS = 10;

    // Well known integer/number values to use when generating random values.
    const WELL_KNOWN_INTEGERS = filter([-9223372036854775808, -9223372036854775807, -9007199254740992, -9007199254740991, -9007199254740990, -4294967297, -4294967296, -4294967295, -2147483649, -2147483648, -2147483647, -1073741824, -536870912, -268435456, -65537, -65536, -65535, -4096, -1024, -256, -128, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 16, 64, 127, 128, 129, 255, 256, 257, 512, 1000, 1024, 4096, 10000, 65535, 65536, 65537, 268435439, 268435440, 268435441, 536870887, 536870888, 536870889, 268435456, 536870912, 1073741824, 1073741823, 1073741824, 1073741825, 2147483647, 2147483648, 2147483649, 4294967295, 4294967296, 4294967297, 9007199254740990, 9007199254740991, 9007199254740992, 9223372036854775807], isInteger);
    const WELL_KNOWN_NUMBERS = concat(WELL_KNOWN_INTEGERS, [-1e6, -1e3, -5.0, -4.0, -3.0, -2.0, -1.0, -0.0, 0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 1e3, 1e6]);
    const WELL_KNOWN_BIGINTS = [-9223372036854775808n, -9223372036854775807n, -9007199254740992n, -9007199254740991n, -9007199254740990n, -4294967297n, -4294967296n, -4294967295n, -2147483649n, -2147483648n, -2147483647n, -1073741824n, -536870912n, -268435456n, -65537n, -65536n, -65535n, -4096n, -1024n, -256n, -128n, -2n, -1n, 0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 16n, 64n, 127n, 128n, 129n, 255n, 256n, 257n, 512n, 1000n, 1024n, 4096n, 10000n, 65535n, 65536n, 65537n, 268435439n, 268435440n, 268435441n, 536870887n, 536870888n, 536870889n, 268435456n, 536870912n, 1073741824n, 1073741823n, 1073741824n, 1073741825n, 2147483647n, 2147483648n, 2147483649n, 4294967295n, 4294967296n, 4294967297n, 9007199254740990n, 9007199254740991n, 9007199254740992n, 9223372036854775807n];


    //
    // Global state.
    //

    // The concrete argument values that will be used when executing the Action for the current exploration operation.
    let exploreArguments;

    // The input containing the value being explored. This should always be the first input to every Action created during exploration.
    let exploredValueInput;

    // Whether exploration is currently happening. This is required to detect recursive exploration, where for example a callback
    // triggered during property enumeration triggers further exploration calls. See explore().
    let currentlyExploring = false;


    //
    // Error and result reporting.
    //
    // Results (indexed by their ID) will be stored in here.
    const results = { __proto__: null };

    function reportError(msg) {
        fuzzilli('FUZZILLI_PRINT', 'EXPLORE_ERROR: ' + msg);
    }

    function recordFailure(id) {
        // Delete the property if it already exists (from recordAction).
        delete results[id];
        defineProperty(results, id, {__proto__: null, value: NO_ACTION});

        fuzzilli('FUZZILLI_PRINT', 'EXPLORE_FAILURE: ' + id);
    }

    function recordAction(id, action) {
        if (hasOwnProperty(results, id)) {
            throw "Duplicate action for " + id;
        }

        if (action === NO_ACTION) {
            // This is equivalent to a failure.
            return recordFailure(id);
        }

        action.id = id;

        // These are configurable as they may need to be overwritten (by recordFailure) in the future.
        defineProperty(results, id, {__proto__: null, value: action, configurable: true});

        fuzzilli('FUZZILLI_PRINT', 'EXPLORE_ACTION: ' + stringify(action));
    }

    function hasActionFor(id) {
        return hasOwnProperty(results, id);
    }

    function getActionFor(id) {
        return results[id];
    }

    //
    // Access to random inputs.
    //
    // These functions prefer to take an existing variable from the arguments to the Explore operations if it satistifes the specified criteria. Otherwise, they generate a new random value.
    // Testing whether an argument satisfies some criteria (e.g. be a value in a certain range) may trigger type conversions. This is expected as it may lead to interesting values being used.
    // These are grouped into a namespace object to make it more clear that they return an Input object (from one of the above constructors), rather than a value.
    //
    let Inputs = {
        randomArgument() {
            return new ArgumentInput(randomIntBelow(exploreArguments.length));
        },

        randomArguments(n) {
            let args = EmptyArray();
            for (let i = 0; i < n; i++) {
                push(args, new ArgumentInput(randomIntBelow(exploreArguments.length)));
            }
            return args;
        },

        randomArgumentForReplacing(propertyName, obj) {
            let curValue = tryGetProperty(propertyName, obj);
            if (isUndefined(curValue)) {
                return Inputs.randomArgument();
            }

            function isCompatible(arg) {
                let sameType = typeof curValue === typeof arg;
                if (sameType && isObject(curValue)) {
                    sameType = arg instanceof curValue.constructor;
                }
                return sameType;
            }

            let idx = findIndex(exploreArguments, wrapInTryCatch(isCompatible));
            if (idx != -1) return new ArgumentInput(idx);
            return Inputs.randomArgument();
        },

        randomInt() {
            let idx = findIndex(exploreArguments, isInteger);
            if (idx != -1) return new ArgumentInput(idx);
            return new IntInput(randomElement(WELL_KNOWN_INTEGERS));
        },

        randomNumber() {
            let idx = findIndex(exploreArguments, isNumber);
            if (idx != -1) return new ArgumentInput(idx);
            return new FloatInput(randomElement(WELL_KNOWN_NUMBERS));
        },

        randomBigint() {
            let idx = findIndex(exploreArguments, isBigint);
            if (idx != -1) return new ArgumentInput(idx);
            return new BigintInput(randomElement(WELL_KNOWN_BIGINTS));
        },

        randomIntBetween(start, end) {
            if (!isInteger(start) || !isInteger(end)) throw "Arguments to randomIntBetween must be integers";
            let idx = findIndex(exploreArguments, wrapInTryCatch((e) => NumberIsInteger(e) && (e >= start) && (e < end)));
            if (idx != -1) return new ArgumentInput(idx);
            return new IntInput(randomIntBetween(start, end));
        },

        randomBigintBetween(start, end) {
            if (!isBigint(start) || !isBigint(end)) throw "Arguments to randomBigintBetween must be bigints";
            if (!isInteger(Number(start)) || !isInteger(Number(end))) throw "Arguments to randomBigintBetween must be representable as regular integers";
            let idx = findIndex(exploreArguments, wrapInTryCatch((e) => (e >= start) && (e < end)));
            if (idx != -1) return new ArgumentInput(idx);
            return new BigintInput(randomBigintBetween(start, end));
        },

        randomNumberCloseTo(v) {
            if (!isFinite(v)) throw "Argument to randomNumberCloseTo is not a finite number: " + v;
            let idx = findIndex(exploreArguments, wrapInTryCatch((e) => (e >= v - 10) && (e <= v + 10)));
            if (idx != -1) return new ArgumentInput(idx);
            let step = randomIntBetween(-10, 10);
            let value = v + step;
            if (isInteger(value)) {
              return new IntInput(value);
            } else {
              return new FloatInput(v + step);
            }
        },

        randomBigintCloseTo(v) {
            if (!isBigint(v)) throw "Argument to randomBigintCloseTo is not a bigint: " + v;
            let idx = findIndex(exploreArguments, wrapInTryCatch((e) => (e >= v - 10n) && (e <= v + 10n)));
            if (idx != -1) return new ArgumentInput(idx);
            let step = randomBigintBetween(-10n, 10n);
            let value = v + step;
            return new BigintInput(value);
        }
    }

    // Heuristic to determine when a function should be invoked as a constructor. Used by the object and function exploration code.
    function shouldTreatAsConstructor(f) {
        let name = tryGetProperty('name', f);

        // If the function has no name (or a non-string name), it's probably a regular function (or something like an arrow function).
        if (!isString(name) || name.length < 1) {
            return probability(0.1);
        }

        // If the name is something like `f42`, it's probably a function defined by Fuzzilli. These can typicall be used as function or constructor, but prefer to call them as regular functions.
        if (name[0] === 'f' && !isNaN(parseInteger(stringSlice(name, 1)))) {
          return probability(0.2);
        }

        // Otherwise, the basic heuristic is that functions that start with an uppercase letter (e.g. Object, Uint8Array, etc.) are probably constructors (but not always, e.g. BigInt).
        // This is also compatible with Fuzzilli's lifting of classes, as they will look something like this: `class V3 { ...`.
        if (name[0] === toUpperCase(name[0])) {
          return probability(0.9);
        } else {
          return probability(0.1);
        }
    }

    //
    // Explore implementation for different basic types.
    //
    // These all return an Action object or the special NO_ACTION value (null).
    //
    function exploreObject(o) {
        if (o === null) {
            return exploreNullish(o);
        }

        // TODO: Add special handling for ArrayBuffers: most of the time, wrap these into a Uint8Array to be able to modify them.
        // TODO: Sometimes iterate over iterable objects (e.g. Arrays)?

        // Determine a random property, which can generally either be a method, an element, or a "regular" property.
        let propertyName = randomPropertyOf(o);

        // Determine the appropriate action to perform given the selected property.
        // If the property lookup failed (for whatever reason), we always define a new property.
        if (propertyName === null) {
            let propertyNameInput = new StringInput(randomElement(customPropertyNames));
            return new Action(OP_SET_PROPERTY, [exploredValueInput, propertyNameInput, Inputs.randomArgument()]);
        } else if (isInteger(propertyName)) {
            let propertyNameInput = new IntInput(propertyName);
            if (probability(0.5)) {
                return new Action(OP_GET_PROPERTY, [exploredValueInput, propertyNameInput]);
            } else {
                let newValue = Inputs.randomArgumentForReplacing(propertyName, o);
                return new Action(OP_SET_PROPERTY, [exploredValueInput, propertyNameInput, newValue]);
            }
        } else if (isString(propertyName)) {
            let propertyNameInput = new StringInput(propertyName);
            let propertyValue = tryGetProperty(propertyName, o);
            if (isFunction(propertyValue)) {
                // Perform a method call/construct.
                let numParameters = tryGetProperty('length', propertyValue);
                if (!isInteger(numParameters) || numParameters > MAX_PARAMETERS || numParameters < 0) return NO_ACTION;
                let inputs = EmptyArray();
                push(inputs, exploredValueInput);
                push(inputs, propertyNameInput);
                for (let i = 0; i < numParameters; i++) {
                    push(inputs, Inputs.randomArgument());
                }
                if (shouldTreatAsConstructor(propertyValue)) {
                  return new GuardedAction(OP_CONSTRUCT_METHOD, inputs);
                } else {
                  return new GuardedAction(OP_CALL_METHOD, inputs);
                }
            } else {
                // Perform a property access.
                // Besides getting and setting the property, we also sometimes define a new property instead.
                if (probability(1/3)) {
                    propertyNameInput = new StringInput(randomElement(customPropertyNames));
                    return new Action(OP_SET_PROPERTY, [exploredValueInput, propertyNameInput, Inputs.randomArgument()]);
                } else if (probability(0.5)) {
                    return new Action(OP_GET_PROPERTY, [exploredValueInput, propertyNameInput]);
                } else {
                    let newValue = Inputs.randomArgumentForReplacing(propertyName, o);
                    return new Action(OP_SET_PROPERTY, [exploredValueInput, propertyNameInput, newValue]);
                }
            }
        } else {
          throw "Got unexpected property name from Inputs.randomPropertyOf(): " + propertyName;
        }
    }

    function exploreFunction(f) {
        // Sometimes treat functions as objects.
        // This will cause interesting properties like 'arguments' or 'prototype' to be accessed, methods like 'apply' or 'bind' to be called, and methods on builtin constructors like 'Array', and 'Object' to be used.
        if (probability(0.5)) {
            return exploreObject(f);
        }

        // Otherwise, call or construct the function/constructor.
        let numParameters = tryGetProperty('length', f);
        if (!isInteger(numParameters) || numParameters > MAX_PARAMETERS || numParameters < 0) {
            numParameters = 0;
        }
        let inputs = EmptyArray();
        push(inputs, exploredValueInput);
        for (let i = 0; i < numParameters; i++) {
            push(inputs, Inputs.randomArgument());
        }
        let operation = shouldTreatAsConstructor(f) ? OP_CONSTRUCT : OP_CALL_FUNCTION;
        return new GuardedAction(operation, inputs);
    }

    function exploreString(s) {
        // Sometimes (rarely) compare the string against it's original value. Otherwise, treat the string as an object.
        // TODO: sometimes access a character of the string or iterate over it?
        if (probability(0.1) && isSimpleString(s)) {
            return new Action(OP_COMPARE_EQUAL, [exploredValueInput, new StringInput(s)]);
        } else {
            return exploreObject(new String(s));
        }
    }

    const ALL_NUMBER_OPERATIONS = concat(SHIFT_OPS, BITWISE_OPS, ARITHMETIC_OPS, UNARY_OPS);
    const ALL_NUMBER_OPERATIONS_AND_COMPARISONS = concat(ALL_NUMBER_OPERATIONS, COMPARISON_OPS);
    function exploreNumber(n) {
        // Somewhat arbitrarily give comparisons a lower probability when choosing the operation to perform.
        let operation = randomElement(probability(0.5) ? ALL_NUMBER_OPERATIONS : ALL_NUMBER_OPERATIONS_AND_COMPARISONS);

        let action = new Action(operation);
        push(action.inputs, exploredValueInput);
        if (includes(COMPARISON_OPS, operation)) {
            if (isNaN(n)) {
                // In that case, regular comparisons don't make sense, so just test for isNaN instead.
                action.operation = OP_TEST_IS_NAN;
            } else if (!isFinite(n)) {
                // Similar to the NaN case, just test for isFinite here.
                action.operation = OP_TEST_IS_FINITE;
            } else {
                push(action.inputs, Inputs.randomNumberCloseTo(n));
            }
        } else if (includes(SHIFT_OPS, operation)) {
            push(action.inputs, Inputs.randomIntBetween(1, 32));
        } else if (includes(BITWISE_OPS, operation)) {
            push(action.inputs, Inputs.randomInt());
        } else if (includes(ARITHMETIC_OPS, operation)) {
            if (isInteger(n)) {
                push(action.inputs, Inputs.randomInt());
            } else {
                push(action.inputs, Inputs.randomNumber());
            }
        }
        return action;
    }

    const ALL_BIGINT_OPERATIONS = concat(BIGINT_SHIFT_OPS, BITWISE_OPS, ARITHMETIC_OPS, UNARY_OPS);
    const ALL_BIGINT_OPERATIONS_AND_COMPARISONS = concat(ALL_BIGINT_OPERATIONS, COMPARISON_OPS);
    function exploreBigint(b) {
        // Somewhat arbitrarily give comparisons a lower probability when choosing the operation to perform.
        let operation = randomElement(probability(0.5) ? ALL_BIGINT_OPERATIONS : ALL_BIGINT_OPERATIONS_AND_COMPARISONS);

        let action = new Action(operation);
        push(action.inputs, exploredValueInput);
        if (includes(COMPARISON_OPS, operation)) {
            push(action.inputs, Inputs.randomBigintCloseTo(b));
        } else if (includes(BIGINT_SHIFT_OPS, operation)) {
            push(action.inputs, Inputs.randomBigintBetween(1n, 128n));
        } else if (includes(BITWISE_OPS, operation) || includes(ARITHMETIC_OPS, operation)) {
            push(action.inputs, Inputs.randomBigint());
        }
        return action;
    }

    function exploreSymbol(s) {
        // Lookup or insert the symbol into the global symbol registry. This will also allow static typing of the output.
        return new Action(OP_SYMBOL_REGISTRATION, [exploredValueInput]);
    }

    const ALL_BOOLEAN_OPERATIONS = concat(BOOLEAN_BINARY_OPS, BOOLEAN_UNARY_OPS);
    function exploreBoolean(b) {
        let operation = randomElement(ALL_BOOLEAN_OPERATIONS);

        let action = new Action(operation);
        push(action.inputs, exploredValueInput);
        if (includes(BOOLEAN_BINARY_OPS, operation)) {
            // It probably doesn't make sense to hardcode boolean constants, so always use an existing argument.
            push(action.inputs, Inputs.randomArgument());
        }
        return action;
    }

    function exploreNullish(v) {
        // Best thing we can do with nullish values is a NullCoalescing (??) operation.
        return new Action(OP_NULL_COALESCE, [exploredValueInput, Inputs.randomArgument()])
    }

    // Explores the given value and returns an action to perform on it.
    function exploreValue(id, v) {
        if (isObject(v)) {
            return exploreObject(v);
        } else if (isFunction(v)) {
            return exploreFunction(v);
        } else if (isString(v)) {
            return exploreString(v);
        } else if (isNumber(v)) {
            return exploreNumber(v);
        } else if (isBigint(v)) {
            return exploreBigint(v);
        } else if (isSymbol(v)) {
            return exploreSymbol(v);
        } else if (isBoolean(v)) {
            return exploreBoolean(v);
        } else if (isUndefined(v)) {
            return exploreNullish(v);
        } else {
            throw "Unexpected value type: " + typeof v;
        }
    }

    //
    // Exploration entrypoint.
    //
    function explore(id, v, currentThis, args, rngSeed) {
        rng.reseed(rngSeed);

        // The given arguments may be used as inputs for the action.
        if (isUndefined(args) || args.length < 1) throw "Exploration requires at least one additional argument";

        // We may get here recursively for example if a Proxy is being explored which triggers further explore calls during e.g. property enumeration.
        // Probably the best way to deal with these cases is to just bail out from recursive explorations.
        if (currentlyExploring) return;
        currentlyExploring = true;

        // Set the global state for this explore operation.
        exploreArguments = args;
        exploredValueInput = new SpecialInput("exploredValue");

        // Check if we already have a result for this id, and if so repeat the same action again. Otherwise, explore.
        let action;
        if (hasActionFor(id)) {
            action = getActionFor(id);
        } else {
            action = exploreValue(id, v);
            recordAction(id, action);
        }

        // Now perform the selected action.
        let context = { arguments: args, specialValues: { "exploredValue": v }, currentThis: currentThis };
        let success = execute(action, context);

        // If the action failed, mark this explore operation as failing (which will set the action to NO_ACTION) so it won't be retried again.
        if (!success) {
            recordFailure(id);
        }

        currentlyExploring = false;
    }

    function exploreWithErrorHandling(id, v, thisValue, args, rngSeed) {
        try {
            explore(id, v, thisValue, args, rngSeed);
        } catch (e) {
            let line = tryHasProperty('line', e) ? tryGetProperty('line', e) : tryGetProperty('lineNumber', e);
            if (isNumber(line)) {
                reportError("In line " + line + ": " + e);
            } else {
                reportError(e);
            }
        }
    }

    return exploreWithErrorHandling;
})();

const v1 = new Set();
explore("v3", -536870912, this, [Set, -536870912, -256, v1], 3491596058);
const v4 = -536870912 + -536870912;
explore("v5", -12, this, [-536870912, -12, v1, -256, Set], 4294907072);
class C6 {
    #n(a8) {
        explore("v7", this, this, [this, -12, C6, a8, -536870912], 4294964174);
        explore("v8", a8, this, [v1, a8, this, -536870912, -256], 2432174651);
        let v9;
        try { v9 = this.o(Set, a8); } catch (e) {}
        explore("v9", v9, this, [v4, this, -536870912, a8, v1], 2147483647);
        try {
            super.ownKeys();
        } catch(e11) {
        }
        super.g = -12;
        return a8;
    }
    #b = -256;
    [-256] = -256;
    [-2];
    [Set] = -256;
}
let v12;
try { v12 = C6.call(-256); } catch (e) {}
explore("v12", v12, this, [Set, v1, C6, -536870912, -256], 4294967295);
const v13 = new C6();
explore("v13", v13, this, [C6, -536870912, v4, v12, -12], 9);
const v14 = new C6();
const v15 = v14?.constructor;
let v16;
try { v16 = new v15(); } catch (e) {}
const v17 = new C6();
explore("v17", v17, this, [Set, -536870912, v17, v14, v15], 4294967295);
const v18 = v17?.constructor;
explore("v18", v18, this, [v16, C6, Set, -536870912, v4], 129);
let v19;
try { v19 = new v18(); } catch (e) {}
explore("v19", v19, this, [v18, v19, v17, v15, v4], 10);
const v20 = [-42470,3,-2];
const v21 = [-16,52789];
let v22;
try { v22 = v21.lastIndexOf(Set); } catch (e) {}
const v23 = [382912400];
const v24 = [1024,8,-63617,354961322,513767424,-1,536870889];
const v25 = [-1077852927,-3,-14516,1024,1298];
let v26;
try { v26 = v25.some(v25); } catch (e) {}
explore("v26", v26, this, [v23, v20, Set, v26, v25], 4294967285);
const v27 = [-1,6,-1,16,-38235];
class C28 {
    constructor(a30) {
        explore("v30", a30, this, [this, v20, v16, v14, a30], 29270);
        function f31() {
            function f33(a34) {
            }
            this.onmessage = f33;
            const v35 = %WasmArray();
            explore("v35", v35, this, [v35, C28, v25, -536870912, -256], 1);
        }
        explore("v37", "function", this, [this, C6, v22, "function", Worker], 4294967295);
        const v39 = new Worker(f31, { type: "function" });
        explore("v39", v39, this, [v15, v20, v39, this, v4], 4294966272);
        try { v39.terminateAndWait(); } catch (e) {}
    }
}
const v42 = new WeakSet();
let v43;
try { v43 = v42.delete(v20); } catch (e) {}
let v44;
try { v44 = v42.delete(); } catch (e) {}
explore("v44", v44, this, [v43, WeakSet, v44, v20, Set], 3);
function f45() {
    explore("v46", Math, this, [-536870912, Math, f45, v18, v23], 4294901759);
    const v47 = !v44;
    explore("v47", v47, this, [Math, v47, v26, v44, v18], 1);
    Math.acosh();
    v44 | v47;
    return v47;
}
f45();
%PrepareFunctionForOptimization(f45);
%OptimizeFunctionOnNextCall(f45);
const v51 = f45();
v51 && v51;
const v53 = new C28();
let v54;
try { v54 = v53.toString(); } catch (e) {}
explore("v54", v54, this, [v44, v16, v53, v42, v1], 0);
const v55 = new C28();
const v56 = v55?.__lookupSetter__;
explore("v56", v56, this, [v19, WeakSet, v56, -256, v24], 4294967168);
try { new v56(v13); } catch (e) {}
const v58 = new C28();
explore("v58", v58, this, [v19, v55, WeakSet, v22, v27], 3626685126);
explore("v59", -5, this, [v20, -256, -5, v19, v54], 2147483648);
async function* f60(a61, a62) {
    explore("v61", a61, this, [a62, v55, v44, a61, v56], 127);
    yield* -5;
}
const v63 = f60();
explore("v63", v63, this, [v22, v63, v44, v4, v54], 3221225472);
let v64;
try { v64 = v63.return(f60); } catch (e) {}
explore("v64", v64, this, [v26, f45, v64, v15, v23], 1);
f60();
%OptimizeFunctionOnNextCall(f60);
f60();

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
// ==3515330==ERROR: AddressSanitizer: heap-use-after-free on address 0x7bc4a5bdb1e8 at pc 0x5b091cd65c6b bp 0x7ffd36bdafe0 sp 0x7ffd36bdafd8
// WRITE of size 8 at 0x7bc4a5bdb1e8 thread T0
//     #0 0x5b091cd65c6a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c0dc6a) (BuildId: 42a5516f89359752)
//     #1 0x5b091cdec901  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c94901) (BuildId: 42a5516f89359752)
//     #2 0x5b091cde9281  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c91281) (BuildId: 42a5516f89359752)
//     #3 0x5b091ccdf56c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b8756c) (BuildId: 42a5516f89359752)
//     #4 0x5b091ccdd295  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b85295) (BuildId: 42a5516f89359752)
//     #5 0x5b091cd2a46c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bd246c) (BuildId: 42a5516f89359752)
//     #6 0x5b091cd29a92  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bd1a92) (BuildId: 42a5516f89359752)
//     #7 0x5b091ee70092  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x3d18092) (BuildId: 42a5516f89359752)
//     #8 0x5b091ccce1f6  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b761f6) (BuildId: 42a5516f89359752)
//     #9 0x5b091ccd5210  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1b7d210) (BuildId: 42a5516f89359752)
//     #10 0x5b091c38f759  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237759) (BuildId: 42a5516f89359752)
//     #11 0x5b091c38f270  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237270) (BuildId: 42a5516f89359752)
//     #12 0x5b091c66abbf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1512bbf) (BuildId: 42a5516f89359752)
//     #13 0x5b091c66882d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x151082d) (BuildId: 42a5516f89359752)
//     #14 0x5b091c6666ce  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x150e6ce) (BuildId: 42a5516f89359752)
//     #15 0x5b09217842b5  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662c2b5) (BuildId: 42a5516f89359752)
//     #16 0x5b09216d93b2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x65813b2) (BuildId: 42a5516f89359752)
//     #17 0x5b0921887726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//     #18 0x5b09216d8a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//     #19 0x5b09216d928e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//     #20 0x5b0921887726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//     #21 0x5b09216d8a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//     #22 0x5b09216d669b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e69b) (BuildId: 42a5516f89359752)
//     #23 0x5b09216d63ea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e3ea) (BuildId: 42a5516f89359752)
//     #24 0x5b091caadc2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1955c2a) (BuildId: 42a5516f89359752)
//     #25 0x5b091cab04f8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19584f8) (BuildId: 42a5516f89359752)
//     #26 0x5b091c5b2b00  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x145ab00) (BuildId: 42a5516f89359752)
//     #27 0x5b091c369686  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1211686) (BuildId: 42a5516f89359752)
//     #28 0x5b091c39f2ff  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12472ff) (BuildId: 42a5516f89359752)
//     #29 0x5b091c3ac4a2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12544a2) (BuildId: 42a5516f89359752)
//     #30 0x5b091c3ab9bf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12539bf) (BuildId: 42a5516f89359752)
//     #31 0x5b091c3b01d8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12581d8) (BuildId: 42a5516f89359752)
//     #32 0x7d74a3fcb1c9  (/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//     #33 0x7d74a3fcb28a  (/lib/x86_64-linux-gnu/libc.so.6+0x2a28a) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//     #34 0x5b091c25a029  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1102029) (BuildId: 42a5516f89359752)
// 
// 0x7bc4a5bdb1e8 is located 232 bytes inside of 8576-byte region [0x7bc4a5bdb100,0x7bc4a5bdd280)
// freed by thread T64 (WorkerThread) here:
//     #0 0x5b091c33396d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x11db96d) (BuildId: 42a5516f89359752)
//     #1 0x5b091cef47cc  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9c7cc) (BuildId: 42a5516f89359752)
//     #2 0x5b091cef45cd  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9c5cd) (BuildId: 42a5516f89359752)
//     #3 0x5b091cd06344  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1bae344) (BuildId: 42a5516f89359752)
//     #4 0x5b091cb07330  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19af330) (BuildId: 42a5516f89359752)
//     #5 0x5b091cb060a1  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19ae0a1) (BuildId: 42a5516f89359752)
//     #6 0x5b091c3a37a7  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124b7a7) (BuildId: 42a5516f89359752)
//     #7 0x5b091c3a252c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a52c) (BuildId: 42a5516f89359752)
//     #8 0x5b091c571243  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1419243) (BuildId: 42a5516f89359752)
//     #9 0x5b091c2f7106  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x119f106) (BuildId: 42a5516f89359752)
// 
// previously allocated by thread T64 (WorkerThread) here:
//     #0 0x5b091c33310d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x11db10d) (BuildId: 42a5516f89359752)
//     #1 0x5b091cef6ffa  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1d9effa) (BuildId: 42a5516f89359752)
//     #2 0x5b091cf29bb6  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd1bb6) (BuildId: 42a5516f89359752)
//     #3 0x5b091cf2a407  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd2407) (BuildId: 42a5516f89359752)
//     #4 0x5b091cf2beb2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1dd3eb2) (BuildId: 42a5516f89359752)
//     #5 0x5b091cd013a7  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1ba93a7) (BuildId: 42a5516f89359752)
//     #6 0x5b091cb16508  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19be508) (BuildId: 42a5516f89359752)
//     #7 0x5b091cb19b4c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19c1b4c) (BuildId: 42a5516f89359752)
//     #8 0x5b091e118253  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x2fc0253) (BuildId: 42a5516f89359752)
//     #9 0x5b091c619056  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x14c1056) (BuildId: 42a5516f89359752)
//     #10 0x5b091c619700  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x14c1700) (BuildId: 42a5516f89359752)
//     #11 0x5b091c3a2777  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a777) (BuildId: 42a5516f89359752)
//     #12 0x5b091c3a252c  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x124a52c) (BuildId: 42a5516f89359752)
//     #13 0x5b091c571243  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1419243) (BuildId: 42a5516f89359752)
//     #14 0x5b091c2f7106  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x119f106) (BuildId: 42a5516f89359752)
// 
// Thread T64 (WorkerThread) created by T0 here:
//     #0 0x5b091c2ddb41  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1185b41) (BuildId: 42a5516f89359752)
//     #1 0x5b091c570fca  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1418fca) (BuildId: 42a5516f89359752)
//     #2 0x5b091c38fb9a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237b9a) (BuildId: 42a5516f89359752)
//     #3 0x5b091c38f314  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1237314) (BuildId: 42a5516f89359752)
//     #4 0x5b091c66abbf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1512bbf) (BuildId: 42a5516f89359752)
//     #5 0x5b091c66882d  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x151082d) (BuildId: 42a5516f89359752)
//     #6 0x5b091c6666ce  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x150e6ce) (BuildId: 42a5516f89359752)
//     #7 0x5b09217842b5  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x662c2b5) (BuildId: 42a5516f89359752)
//     #8 0x5b09216d93b2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x65813b2) (BuildId: 42a5516f89359752)
//     #9 0x5b0921887726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//     #10 0x5b09216d8a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//     #11 0x5b09216d928e  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x658128e) (BuildId: 42a5516f89359752)
//     #12 0x5b0921887726  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x672f726) (BuildId: 42a5516f89359752)
//     #13 0x5b09216d8a80  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x6580a80) (BuildId: 42a5516f89359752)
//     #14 0x5b09216d669b  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e69b) (BuildId: 42a5516f89359752)
//     #15 0x5b09216d63ea  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x657e3ea) (BuildId: 42a5516f89359752)
//     #16 0x5b091caadc2a  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1955c2a) (BuildId: 42a5516f89359752)
//     #17 0x5b091cab04f8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x19584f8) (BuildId: 42a5516f89359752)
//     #18 0x5b091c5b2b00  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x145ab00) (BuildId: 42a5516f89359752)
//     #19 0x5b091c369686  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1211686) (BuildId: 42a5516f89359752)
//     #20 0x5b091c39f2ff  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12472ff) (BuildId: 42a5516f89359752)
//     #21 0x5b091c3ac4a2  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12544a2) (BuildId: 42a5516f89359752)
//     #22 0x5b091c3ab9bf  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12539bf) (BuildId: 42a5516f89359752)
//     #23 0x5b091c3b01d8  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x12581d8) (BuildId: 42a5516f89359752)
//     #24 0x7d74a3fcb1c9  (/lib/x86_64-linux-gnu/libc.so.6+0x2a1c9) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//     #25 0x7d74a3fcb28a  (/lib/x86_64-linux-gnu/libc.so.6+0x2a28a) (BuildId: 8e9fd827446c24067541ac5390e6f527fb5947bb)
//     #26 0x5b091c25a029  (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1102029) (BuildId: 42a5516f89359752)
// 
// SUMMARY: AddressSanitizer: heap-use-after-free (/work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8+0x1c0dc6a) (BuildId: 42a5516f89359752) 
// Shadow bytes around the buggy address:
//   0x7bc4a5bdaf00: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x7bc4a5bdaf80: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x7bc4a5bdb000: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x7bc4a5bdb080: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
//   0x7bc4a5bdb100: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
// =>0x7bc4a5bdb180: fd fd fd fd fd fd fd fd fd fd fd fd fd[fd]fd fd
//   0x7bc4a5bdb200: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x7bc4a5bdb280: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x7bc4a5bdb300: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x7bc4a5bdb380: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
//   0x7bc4a5bdb400: fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd fd
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
// ==3515330==ABORTING
// 
// ## V8 sandbox violation detected!
// STDOUT:
// EXPLORE_ACTION: {"operation":"COMPARE_LESS_THAN","inputs":[{"special":{"name":"exploredValue"}},{"argument":{"index":1}}],"isGuarded":false,"id":"v3"}
// EXPLORE_ACTION: {"operation":"COMPARE_GREATER_THAN","inputs":[{"special":{"name":"exploredValue"}},{"argument":{"index":1}}],"isGuarded":false,"id":"v5"}
// EXPLORE_ACTION: {"operation":"NULL_COALESCE","inputs":[{"special":{"name":"exploredValue"}},{"argument":{"index":3}}],"isGuarded":false,"id":"v12"}
// EXPLORE_ACTION: {"operation":"CONSTRUCT_METHOD","inputs":[{"special":{"name":"exploredValue"}},{"string":{"value":"constructor"}}],"isGuarded":true,"id":"v13"}
// EXPLORE_ACTION: {"operation":"CONSTRUCT_METHOD","inputs":[{"special":{"name":"exploredValue"}},{"string":{"value":"constructor"}}],"isGuarded":true,"id":"v17"}
// EXPLORE_ACTION: {"operation":"CALL_METHOD","inputs":[{"special":{"name":"exploredValue"}},{"string":{"value":"propertyIsEnumerable"}},{"argument":{"index":1}}],"isGuarded":true,"id":"v18"}
// EXPLORE_ACTION: {"operation":"CONSTRUCT_METHOD","inputs":[{"special":{"name":"exploredValue"}},{"string":{"value":"constructor"}}],"isGuarded":true,"id":"v19"}
// EXPLORE_ACTION: {"operation":"NULL_COALESCE","inputs":[{"special":{"name":"exploredValue"}},{"argument":{"index":3}}],"isGuarded":false,"id":"v26"}
// EXPLORE_ACTION: {"operation":"LOGICAL_OR","inputs":[{"special":{"name":"exploredValue"}},{"argument":{"index":2}}],"isGuarded":false,"id":"v44"}
// EXPLORE_ACTION: {"operation":"GET_PROPERTY","inputs":[{"special":{"name":"exploredValue"}},{"string":{"value":"LN10"}}],"isGuarded":false,"id":"v46"}
// EXPLORE_ACTION: {"operation":"LOGICAL_AND","inputs":[{"special":{"name":"exploredValue"}},{"argument":{"index":2}}],"isGuarded":false,"id":"v47"}
// EXPLORE_ACTION: {"operation":"NULL_COALESCE","inputs":[{"special":{"name":"exploredValue"}},{"argument":{"index":2}}],"isGuarded":false,"id":"v30"}
// EXPLORE_ACTION: {"operation":"SET_PROPERTY","inputs":[{"special":{"name":"exploredValue"}},{"int":{"value":1}},{"argument":{"index":3}}],"isGuarded":false,"id":"v37"}
// EXPLORE_ACTION: {"operation":"CONSTRUCT_METHOD","inputs":[{"special":{"name":"exploredValue"}},{"string":{"value":"constructor"}}],"isGuarded":true,"id":"v39"}
// EXPLORE_ACTION: {"operation":"CONSTRUCT_METHOD","inputs":[{"special":{"name":"exploredValue"}},{"string":{"value":"split"}},{"argument":{"index":2}},{"argument":{"index":0}}],"isGuarded":true,"id":"v54"}
// EXPLORE_ACTION: {"operation":"CONSTRUCT_METHOD","inputs":[{"special":{"name":"exploredValue"}},{"string":{"value":"apply"}},{"argument":{"index":3}},{"argument":{"index":1}}],"isGuarded":true,"id":"v56"}
// FUZZER ARGS: /work/FuzzilliSbx/fuzzilli/.build/x86_64-unknown-linux-gnu/release/FuzzilliCli --profile=v8Sandbox --wasm /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --instanceType=intermediate --connectTo=127.0.0.1:10004 --bindTo=127.0.0.1:10003
// TARGET ARGS: /work/FuzzilliSbx/v8/v8/out/fuzzbuild/d8 --expose-gc --omit-quit --allow-natives-syntax --fuzzing --jit-fuzzing --sandbox-fuzzing --disable-in-process-stack-traces
// CONTRIBUTORS: 
// EXECUTION TIME: 221ms
