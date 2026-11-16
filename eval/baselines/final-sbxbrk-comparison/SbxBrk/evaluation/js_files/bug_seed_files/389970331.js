FuzzerInjectionPoint(1);
const v6 = new Int32Array(256);
FuzzerInjectionPoint(2);
const v = v6.join(1111111111111);
FuzzerInjectionPoint(3);
BigInt(v);
