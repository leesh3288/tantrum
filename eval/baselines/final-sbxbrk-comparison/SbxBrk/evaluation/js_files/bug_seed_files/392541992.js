FuzzerInjectionPoint(1);
let err_msg = "AAAABBBB"
FuzzerInjectionPoint(2);;
let stack_trace = "CCCCDDDD";
FuzzerInjectionPoint(3);
const v3 = URIError(err_msg);
FuzzerInjectionPoint(4);
v3.stack = stack_trace;
FuzzerInjectionPoint(5);
d8.serializer.serialize(v3);
