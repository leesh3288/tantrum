FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y --no-install-recommends \
    binutils build-essential gdb libc6-dbg libdwarf-dev libelf-dev \
    libiberty-dev patch python3 python3-dev python3-venv zstd \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv
ENV PATH=/opt/venv/bin:$PATH
RUN python3 -m pip install --no-cache-dir libdebug==0.9.0 capstone==5.0.9
COPY deps/libdebug.patch /tmp/libdebug.patch
RUN patch -p1 -d "$(python3 -c 'import sysconfig; print(sysconfig.get_paths()["purelib"] + "/libdebug")')" \
    < /tmp/libdebug.patch && rm /tmp/libdebug.patch

COPY eval/discovery/tantrum-dev/ /work/replay/discovery/
COPY eval/discovery/crashlog/ /work/replay/crashlog/
COPY backend/tantrum/ /work/replay/backend/
RUN mkdir -p /work/replay/discovery/test /work/replay/backend/logs \
    && tar -xzf /work/replay/discovery/mjsunit.tar.gz -C /work/replay/discovery/test \
    && tar -xzf /work/replay/backend/c59dbe20-eval-mjsunit.tar.gz -C /work/replay/backend \
    && zstd -dc /work/replay/backend/builds/c59dbe20-eval/d8.zst \
       > /work/replay/backend/builds/c59dbe20-eval/d8 \
    && chmod +x /work/replay/backend/builds/c59dbe20-eval/d8

COPY eval/comparison/source/tantrum-native/ /work/replay/comparison/native/
COPY eval/comparison/source/tantrum-mjsunit/ /work/replay/comparison/mjsunit/
COPY eval/comparison/evidence/tantrum-native/TP/441949792/REPRO_v8sbx-fuzz-17992-15132.txt /work/replay/comparison/evidence/native-x8.txt
COPY eval/comparison/evidence/tantrum-native/TP/444048032/REPRO_READ_v8sbx-fuzz-12701-394583.txt /work/replay/comparison/evidence/native-d8.txt
COPY eval/comparison/evidence/tantrum-mjsunit/TP/435630464/REPRO_v8sbx-fuzz-34400-46307.txt /work/replay/comparison/evidence/mjsunit-x8.txt
COPY eval/comparison/target/d8-4715559d4f-native-build-bundle.tar.gz /tmp/comparison-d8.tar.gz
COPY eval/baselines/final-sbxbrk-comparison/shared-eval-corpus-js.tar.gz /tmp/comparison-corpus.tar.gz
RUN mkdir -p /work/v8-build /work/evaluation/js_files/eval_corpus \
    /work/replay/comparison/native/logs /work/replay/comparison/mjsunit/logs \
    /work/replay/comparison/mjsunit/test \
    && tar -xzf /tmp/comparison-d8.tar.gz -C /work/v8-build \
    && tar -xzf /tmp/comparison-corpus.tar.gz -C /work/evaluation/js_files/eval_corpus \
    && ln -s /work/v8-build/test/mjsunit /work/replay/comparison/mjsunit/test/mjsunit \
    && python3 /work/replay/comparison/native/patch_load.py \
       /work/v8-build/out/fair-build/d8 /work/v8-build/out/fair-build/x8 \
       > /tmp/x8-patch.log \
    && rm /tmp/comparison-d8.tar.gz /tmp/comparison-corpus.tar.gz

COPY repro/run.py repro/run_no_cgroup.py /opt/tantrum-repro/
RUN mkdir -p /results
ENTRYPOINT ["/opt/venv/bin/python", "/opt/tantrum-repro/run.py"]
CMD ["all"]
