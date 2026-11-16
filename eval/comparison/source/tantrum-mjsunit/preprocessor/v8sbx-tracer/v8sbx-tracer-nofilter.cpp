#include <stdio.h>
#include <string.h>
#include <sys/mman.h>
#include <vector>
#include <algorithm>
#include <map>
#include <mutex>
#include <atomic>
#include "pin.H"

// assert 64bit
static_assert(sizeof(ADDRINT) == 8);

// ptrcomp cage
#define SBX_SIZE (1ull << 32)

KNOB<std::string> KnobOutputFile(KNOB_MODE_WRITEONCE, "pintool", "o", "trace.out", "trace file path");
KNOB<uint64_t> KnobWritableSandboxLoadCount(KNOB_MODE_WRITEONCE, "pintool", "c", "0", "writable sandbox count limit");
bool trace_fopened = false;
FILE *trace;
std::atomic<uint64_t> writable_sbx_load_limit;
ADDRINT sbx_base = 0;
bool init_complete = false;
std::mutex load_cnt_mtx;
std::map<ADDRINT, uint64_t> load_cnt;
std::vector<std::pair<ADDRINT, ADDRINT>> sbx_writable;
RTN mprotectPltRtn;
typedef enum {
  SANDBOX           = 1<<0,   // in-sandbox
  WRITABLE_SANDBOX  = 1<<1,   // writable in-sandbox, only valid with SANDBOX
  INIT              = 1<<2,   // loads triggered while initializing (pre-script entry)
} LOAD_TYPE;

bool IsWritableSbxAddress(ADDRINT addr, UINT32 size);

VOID DumpStatsAndExit(int retcode)
{
  // dump stats
  for (auto const& lp : load_cnt) {
    fwrite(&lp.first, sizeof(lp.first), 1, trace);    // ip | (lt << 48)
    fwrite(&lp.second, sizeof(lp.second), 1, trace);  // cnt
  }
  fwrite("#eof", 1, 4, trace);
  if (trace_fopened) {
    fclose(trace);
  }
  exit(retcode);
}

// Print a memory read record
VOID RecordMemRead(ADDRINT ip, ADDRINT addr, UINT32 size)
{
  uint64_t offset = addr - sbx_base;
  uint64_t lt = init_complete ? 0 : INIT;
  if (offset < SBX_SIZE) {
    lt |= SANDBOX;
    if (IsWritableSbxAddress(addr, size)) {
      lt |= WRITABLE_SANDBOX;
    }
  }

  {
    std::lock_guard<std::mutex> lock(load_cnt_mtx);
    load_cnt[ip | (static_cast<ADDRINT>(lt) << 48)]++;
    // trace "valid" (post-init writable sbx) loads matching up to the original preprocessor trace length
    // this is conservative in that we drop any "invalid" loads up to the next "valid" load which has been truncated,
    //  thus only boosting the percentage of valid loads (by an insignificant amount)
    if (lt == (SANDBOX | WRITABLE_SANDBOX)) {
      if (--writable_sbx_load_limit == 0) {
        fprintf(stderr, "[+] RecordMemRead: end of original trace, stopping now\n");
        DumpStatsAndExit(0);
      }
    }
  }
}

VOID Instruction(INS ins, VOID *v)
{
  UINT32 memOperands = INS_MemoryOperandCount(ins);

  for (UINT32 memOp = 0; memOp < memOperands; memOp++)
  {
    if (INS_MemoryOperandIsRead(ins, memOp))
    {
      INS_InsertPredicatedCall(
        ins, IPOINT_BEFORE, (AFUNPTR)RecordMemRead,
        IARG_INST_PTR,
        IARG_MEMORYOP_EA, memOp,
        IARG_MEMORYOP_SIZE, memOp,
        IARG_END
      );
    }
  }
}

// not thread-safe (along with several other code),
// but we only consider deterministic traces anyways
bool IsWritableSbxAddress(ADDRINT addr, UINT32 size)
{
  for (const auto &map: sbx_writable) {
    if (map.first <= addr && addr + size <= map.second) {
      return true;
    }
  }
  return false;
}

VOID UpdateSandboxMaps()
{
  sbx_writable.clear();
  FILE *fp = fopen("/proc/self/maps", "rt");
  char buf[0x1000];
  while (fgets(buf, sizeof(buf), fp)) {
    char perms[5];
    ADDRINT start, end;
    if (sscanf(buf, "%lx-%lx %4s", &start, &end, perms) != 3) {
      fprintf(stderr, "[*] UpdateSandboxMaps: /proc/self/maps parse error\n");
      exit(1);
    }

    if (start >= sbx_base + SBX_SIZE) {
      break;
    }
    if (start < sbx_base) {
      continue;
    }

    if (perms[1] == 'w') {
      sbx_writable.emplace_back(start, end);
    }
  }
  fclose(fp);
}

VOID MprotectPostHook()
{
  fprintf(stderr, "[*] MprotectPostHook: mprotect return!\n");
  UpdateSandboxMaps();
}

VOID ScriptRunHook()
{
  static int ctr = 0;
  ctr++;
  fprintf(stderr, "[*] ScriptRunHook: v8::Script::Run(v8::Local<v8::Context>) hit!\n");
  UpdateSandboxMaps();
  if (ctr == 2) {
    if (!sbx_base) {
      fprintf(stderr, "[+] ScriptRunHook: Failed sandbox base identification\n");
      exit(1);
    }
    fprintf(stderr, "[+] ScriptRunHook: Starting in-sandbox instrumentation!\n");
    init_complete = true;
    PIN_RemoveInstrumentation();
  }
}

VOID RegisterV8SandboxHook(ADDRINT addr)
{
  sbx_base = addr;
  fprintf(stderr, "[*] RegisterV8SandboxHook: sandbox base = %lx\n", sbx_base);

  // now the sandbox is considered materialized.
  UpdateSandboxMaps();
  RTN_Open(mprotectPltRtn);
  RTN_InsertCall(mprotectPltRtn, IPOINT_AFTER, (AFUNPTR)MprotectPostHook, IARG_END);
  RTN_Close(mprotectPltRtn);
}

VOID ImageLoad(IMG img, VOID *v)
{
  if (strstr(IMG_Name(img).c_str(), "d8")) {
    {
      RTN scriptRunRtn = RTN_FindByName(img, "_ZN2v86Script3RunENS_5LocalINS_7ContextEEE");   // v8::Script::Run(v8::Local<v8::Context>)
      if (RTN_Valid(scriptRunRtn)) {
        RTN_Open(scriptRunRtn);
        RTN_InsertCall(scriptRunRtn, IPOINT_BEFORE, (AFUNPTR)ScriptRunHook, IARG_END);
        RTN_Close(scriptRunRtn);
        fprintf(stderr, "[*] Instrumented script run entrypoint.\n");
      } else {
        fprintf(stderr, "[!] Script run entrypoint not found!\n");
        exit(-1);
      }
    }
    {
      // Older versions may use SetV8SandboxBaseAndSize.
      RTN sbxRegisterRtn = RTN_FindByName(img, "_ZN2v88internal12trap_handler17RegisterV8SandboxEmm");   // v8::internal::trap_handler::RegisterV8Sandbox(unsigned long, unsigned long)
      if (RTN_Valid(sbxRegisterRtn)) {
        RTN_Open(sbxRegisterRtn);
        RTN_InsertCall(sbxRegisterRtn, IPOINT_BEFORE, (AFUNPTR)RegisterV8SandboxHook, IARG_REG_VALUE, REG_RDI, IARG_END);
        RTN_Close(sbxRegisterRtn);
        fprintf(stderr, "[*] Instrumented V8sbx registration entrypoint.\n");
      } else {
        fprintf(stderr, "[!] V8sbx registration entrypoint not found!\n");
        exit(-1);
      }
    }
  } else if (strstr(IMG_Name(img).c_str(), "libc.so.6")) {
    mprotectPltRtn = RTN_FindByName(img, "mprotect");
    if (!RTN_Valid(mprotectPltRtn)) {
      fprintf(stderr, "[!] mprotect not found!\n");
      exit(-1);
    }
  }
}

VOID Fini(INT32 code, VOID *v)
{
  fprintf(stderr, "[+] Fini: premature end of trace, stopping now\n");
  DumpStatsAndExit(0);
}

INT32 Usage()
{
  PIN_ERROR("V8 sandbox tracer\n" + KNOB_BASE::StringKnobSummary() + "\n");
  return -1;
}

int main(int argc, char *argv[])
{
  PIN_InitSymbols();
  if (PIN_Init(argc, argv))
    return Usage();

  auto trace_fn = KnobOutputFile.Value();
  if (trace_fn == "-"){
    trace = stdout;
  } else if (trace_fn == "-!") {
    trace = stderr;
  } else {
    trace = fopen(trace_fn.c_str(), "w");
    trace_fopened = true;
  }

  // preprocessors have timeouts;
  // equalize loads up to the last sbx load to ensure that
  //  the overhead due to tracking more loads don't truncate results
  writable_sbx_load_limit = KnobWritableSandboxLoadCount.Value();
  if (writable_sbx_load_limit == 0) {
    fprintf(stderr, "[!] zero writable sbx load limit, returning immediately!");
    return 0;
  }

  IMG_AddInstrumentFunction(ImageLoad, 0);
  INS_AddInstrumentFunction(Instruction, 0);
  PIN_AddFiniFunction(Fini, 0);

  PIN_StartProgram();

  return 0;
}
