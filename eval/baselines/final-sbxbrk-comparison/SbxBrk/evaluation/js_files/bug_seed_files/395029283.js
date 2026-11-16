FuzzerInjectionPoint(1);
const v5 = 0.0123;
FuzzerInjectionPoint(2);
const v1 = 4294967297.123;
FuzzerInjectionPoint(3);
try {
    FuzzerInjectionPoint(4);
    v5.toPrecision(v1);
} catch (err) {
    FuzzerInjectionPoint(5);
    print(err);
}
