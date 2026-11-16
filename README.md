# Tantrum

Artifact for *Tantrum: Breaking the Heap Sandbox in JavaScript Engines via Protection Domain Fuzzing* (ACM CCS 2026).

| Directory | Contents |
| --- | --- |
| [paper](paper/README.md) | Paper PDFs |
| [backend](backend/README.md) | Run Tantrum and the preprocessing ablation |
| [eval/discovery](eval/discovery/README.md) | Discovery crash logs and replay instructions |
| [repro](repro/README.md) | Run saved crash replays in Docker |
| [eval/comparison](eval/comparison/README.md) | Plot coverage, comparison code and crash logs |
| [eval/baselines](eval/baselines/README.md) | Build and run the SbxBrk and V8SbxFuzzer baselines |

## Citation

```bibtex
@inproceedings{10.1145/3830454.3832647,
  author = {Lee, Seunghyun and Brumley, David},
  title = {TANTRUM: Breaking the Heap Sandbox in JavaScript Engines via Protection Domain Fuzzing},
  year = {2026},
  isbn = {9798400728716},
  publisher = {Association for Computing Machinery},
  address = {New York, NY, USA},
  url = {https://doi.org/10.1145/3830454.3832647},
  doi = {10.1145/3830454.3832647},
  booktitle = {Proceedings of the 2026 ACM SIGSAC Conference on Computer and Communications Security},
  pages = {1537–1551},
  numpages = {15},
  keywords = {sandboxing, fuzzing, browser security},
  location = {The Hague, Netherlands},
  series = {CCS '26}
}
```

## License

Tantrum code and documentation are licensed under [CC BY 4.0](LICENSE). See the separate licenses for [V8](backend/tantrum/V8-LICENSE), [SbxBrk](eval/baselines/final-sbxbrk-comparison/SbxBrk/LICENSE), and [Fuzzilli](eval/baselines/final-v8sbxfuzzer/FuzzilliSbx/fuzzilli/LICENSE).

## AI use

We used AI tools to help write supporting scripts and prepare this release.
