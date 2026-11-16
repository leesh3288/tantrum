FuzzerInjectionPoint(1);
let a = new DataView(new Sandbox.MemoryView(0, 967296));
function b() {
    FuzzerInjectionPoint(2);
    c = {}.__proto__[Object] = d = []
    FuzzerInjectionPoint(3);
    e = [Int16Array, d, Int16Array, "", 7, d]
    FuzzerInjectionPoint(4);
    for (f in e) {
        function g() {
            for (h = 0;
                h < 100;
                h++)
                JSON.parse("4294967297")
        }
        for (i = 0;
            i < 100;
            i++)
            g()
    }
}
FuzzerInjectionPoint(5);
b();
FuzzerInjectionPoint(6);
a.setUint16(262144, 5141);
