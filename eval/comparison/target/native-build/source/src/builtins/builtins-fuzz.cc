#include "src/api/api-inl.h"
#include "src/builtins/builtins-utils-inl.h"
#include "src/builtins/builtins.h"
#include "src/execution/isolate.h"
#include "src/objects/objects-inl.h"

namespace v8 {
namespace internal {

BUILTIN(GlobalFuzzerInjectionPoint) {
  return ReadOnlyRoots(isolate).undefined_value();
}

}  // namespace internal
}  // namespace v8

