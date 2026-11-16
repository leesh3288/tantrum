FuzzerInjectionPoint(1);
function f0() {
    FuzzerInjectionPoint(2);
    const o3 = {
        [-2.0]: 652590.8400089946,
    };
    return o3;
}
FuzzerInjectionPoint(3);
const v4 = [1000000000.0,98518.52636175626,2.1501572133963123,3.0,-1000.0,-1.0];
FuzzerInjectionPoint(4);
v4.toJSON = f0;
FuzzerInjectionPoint(5);
const v6 = Array(v4);
FuzzerInjectionPoint(6);
v6[6] = v4;
FuzzerInjectionPoint(7);
JSON.parse(JSON.stringify(v6));
