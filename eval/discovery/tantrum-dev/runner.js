let __fuzz_tests = arguments;
let __fuzz_scripts = __fuzz_tests.map(v => d8.file.read(v));
let __fuzz_d8_file_execute = d8.file.execute;
let __fuzz_loaded = new Set();

// instrument d8.file.execute to only load once
d8.file.execute = (fn)=>{
  if (__fuzz_loaded.has(fn)) {
    return;
  }
  __fuzz_loaded.add(fn);
  __fuzz_d8_file_execute(fn);
}

for (let i = 0; i < __fuzz_tests.length; i++) {
  console.log(`[*] running test: ${__fuzz_tests[i]}`);
  // note that this may modify the behavior of the underlying script!
  try {
    new Function(__fuzz_scripts[i])();
  } catch (e) {
    console.log(`[!] exception thrown: ${e}`);
  }
}
