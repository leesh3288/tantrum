# Saved crash replays in Docker

On a Linux x86-64 host, from the repository root:

```sh
docker build -f repro/Dockerfile -t tantrum-repro .
docker run --rm --init --cgroupns=private --cap-add=SYS_PTRACE --cap-add=SYS_ADMIN --security-opt=seccomp=unconfined --memory=16g --cpus=4 tantrum-repro 8
```

The second command replays Bug #8 and prints the result. Use `list` to see the available cases and `all` to replay the listed bugs. Three saved comparison records are available as `native-x8`, `native-d8`, and `mjsunit-x8`.

To keep the full logs and reports, add `-v "$PWD/repro-results:/results"` before `tantrum-repro` in the run command. Each run gets its own directory under `repro-results/`.

