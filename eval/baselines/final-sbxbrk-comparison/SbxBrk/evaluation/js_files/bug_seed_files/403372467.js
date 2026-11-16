FuzzerInjectionPoint(1);
var val = -0.0;
function f3(a4, a5) {
    return val;
}
FuzzerInjectionPoint(2);
Float32Array.valueOf = f3;

FuzzerInjectionPoint(3);
try {
    FuzzerInjectionPoint(4);
    const t4 = constructor().Intl.NumberFormat;
    t4().formatRangeToParts(Float32Array, 59);
} catch (e) {
    print(e);
}