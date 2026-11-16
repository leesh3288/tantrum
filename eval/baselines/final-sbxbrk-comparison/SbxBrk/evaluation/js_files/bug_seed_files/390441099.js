FuzzerInjectionPoint(1);
const v1 = WebAssembly.Table;
FuzzerInjectionPoint(2);
const o4 = {
    "element": "anyfunc",
    "initial": 2,
};
FuzzerInjectionPoint(3);
const v5 = new v1(o4);
FuzzerInjectionPoint(4);
try { v5.get(v1); } catch (e) { }
