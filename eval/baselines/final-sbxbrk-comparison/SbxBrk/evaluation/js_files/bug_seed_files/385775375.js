FuzzerInjectionPoint(1);
let len = 0x20000;
FuzzerInjectionPoint(2);
let ar = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * len));
FuzzerInjectionPoint(3);
ar.sort();
