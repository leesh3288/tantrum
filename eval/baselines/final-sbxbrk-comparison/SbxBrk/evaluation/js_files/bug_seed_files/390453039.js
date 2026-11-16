FuzzerInjectionPoint(1);
const v4 = WebAssembly.Memory;
FuzzerInjectionPoint(2);
const o6 = {
    "initial": 1,
};
FuzzerInjectionPoint(3);
const v7 = new v4(o6);
FuzzerInjectionPoint(4);
v7.grow(65535);
