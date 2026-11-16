# Native V8 build

Tantrum-native and Tantrum+Mjsunit use V8 `4715559d4fe2ce6e2c0f6de3c966347b6da6a489` with [these source changes](v8-4715559-to-native.patch) and [GN settings](args.gn).

Build on x86-64 Linux in the [SbxBrk environment](../../../baselines/README.md#sbxbrk-comparison), with AFL++ built at `/work/AFLplusplus`. Prepare a clean V8 checkout at the revision above and sync its dependencies before applying the patch.

Set `native_build_dir` to this directory's absolute path. From the V8 checkout:

```sh
git apply --check "$native_build_dir/v8-4715559-to-native.patch"
git apply "$native_build_dir/v8-4715559-to-native.patch"
sed '/^gclient sync --reset$/d' "$native_build_dir/build_fair.sh" | bash
```

The resulting shell is `out/fair-build/d8`.
