# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "altair==5.4.1",
#     "pandas==2.2.3",
#     "psutil==6.1.0",
#     "tqdm==4.67.0",
#     "vegafusion==1.6.9",
#     "vegafusion-python-embed==1.6.9",
#     "vl-convert-python",
# ]
# [tool.uv]
# exclude-newer = "2025-08-11T00:00:00Z"
# ///

# %%
from collections import defaultdict
from datetime import datetime
import shutil
import statistics
import pandas as pd
import argparse
from pathlib import Path
import typing as t
import altair as alt
from dataclasses import dataclass
import enum
import json
from utils import log

alt.data_transformers.disable_max_rows()
alt.data_transformers.enable("vegafusion")
pd.set_option("display.max_rows", None)

main_parser = argparse.ArgumentParser(
    prog="afl_cov",
    description="Compute the coverage for SbxBrk or FuzzilliSbx using the same AFL++ instrumented binary. This script will save a .afl_map.txt file alongside each found input.",
)

main_parser.add_argument(
    "--add-sbxbrk-storage",
    dest="sbxbrk_folders",
    type=Path,
    default=[],
    nargs="+",
    help=f"Add a storage folder of one SbxBrk run.",
)

main_parser.add_argument(
    "--add-fuzzillisbx-storage",
    dest="fuzzillisbx_folders",
    type=Path,
    default=[],
    nargs="+",
    help=f"Add a storage folder of one FuzzilliSbx run.",
)

main_parser.add_argument(
    "--storage",
    type=Path,
    default=Path("graphs"),
    help=f"Folder where the graphs are stored.",
)

main_parser.add_argument(
    "--purge",
    action="store_true",
    default=False,
    help="Delete existing data in the storage folder.",
)


args = main_parser.parse_args()

if len(args.sbxbrk_folders) == 0 and len(args.fuzzillisbx_folders) == 0:
    log.error("At least one input directory must be passed.")
    main_parser.print_usage()
    exit(1)

sbxbrk_folders: t.List[Path] = args.sbxbrk_folders
sbxbrk_folders.sort()

fuzzillisbx_folders: t.List[Path] = args.fuzzillisbx_folders
fuzzillisbx_folders.sort()

storage: Path = args.storage
if storage.exists():
    if args.purge:
        shutil.rmtree(storage)
    else:
        log.error(f"Storage folder {storage.as_posix()} already exists. Pass --purge or delete it first.")
        exit(1)
storage.mkdir()

@dataclass(frozen=True, unsafe_hash=True)
class CoveredLine:
    fpath: str
    line: int


class Fuzzer(enum.Enum):
    FuzzilliSbx = "FuzzilliSbx"
    SbxBrk = "SbxBrk"
    Seed = "Seed"


class Run:

    def __init__(self, path: Path, fuzzer: Fuzzer, run_id: int):
        assert Run.contains_coverage_data(
            path
        ), f"This does not seem like a valid run result dir ({path})"
        data = json.loads((path / ("ts_to_num_covered_edged.json")).read_text())
        data = {int(ts): cov for ts, cov in data.items()}
        self._ts_sorted_to_num_edges = data
        self._fuzzer = fuzzer
        self._run_id = run_id

    def fuzzer(self) -> Fuzzer:
        return self._fuzzer

    def run_id(self) -> int:
        return self._run_id

    def ts_sorted_to_num_cov_edges(self) -> t.Dict[int, int]:
        return self._ts_sorted_to_num_edges

    def max_coverage(self) -> int:
        return max(self._ts_sorted_to_num_edges.values())

    @staticmethod
    def contains_coverage_data(path: Path) -> bool:
        return (path / "ts_to_num_covered_edged.json").exists()


ctr = 0
fuzzilli_sbx_runs: t.List[Run] = []
for run_id, d in enumerate(fuzzillisbx_folders):
    if Run.contains_coverage_data(d):
        print(f"[+] Importing {d}")
        fuzzilli_sbx_runs.append(Run(d, Fuzzer.FuzzilliSbx, run_id))

if len(fuzzilli_sbx_runs) > 0:
    fuzzilli_median_cov = statistics.median([e.max_coverage() for e in fuzzilli_sbx_runs])
else:
    fuzzilli_median_cov = 0.0

ctr = 0
sbxbrk_runs: t.List[Run] = []
for run_id, d in enumerate(sbxbrk_folders):
    if Run.contains_coverage_data(d):
        print(f"[+] Importing {d}")
        sbxbrk_runs.append(Run(d, Fuzzer.SbxBrk, run_id))

if len(sbxbrk_runs) > 0:
    sbxbrk_median_cov =  statistics.median([e.max_coverage() for e in sbxbrk_runs])
else:
    sbxbrk_median_cov = 0.0

print(f"{fuzzilli_median_cov=}, {sbxbrk_median_cov=}")
# median_increase = sbxbrk_median_cov / fuzzilli_median_cov 
# print(f"{median_increase=}")

# corpus_run = Run(Path("/work/evalutation/corpus/result_corpus/js"), Fuzzer.Seed, 0)
# corpus_max_coverage = corpus_run.max_coverage()

# get the length of the longest run in minutes and use this for x-scaling.
available_data_in_minutes = 1
for run in (fuzzilli_sbx_runs + sbxbrk_runs):
    timestamps_with_cov = list(run.ts_sorted_to_num_cov_edges().keys())
    if len(timestamps_with_cov) > 0:
        available_data_in_minutes = max([timestamps_with_cov[-1]//60, available_data_in_minutes])
log.info(f"Plotting {available_data_in_minutes} minutes of data.")

fuzzer_to_frames = defaultdict(list)
for run in fuzzilli_sbx_runs + sbxbrk_runs:  #  + [corpus_run]:
    max_seen_coverage = 0
    data_frame_dict = defaultdict(list)
    ts_sorted_to_num_cov_edges = run.ts_sorted_to_num_cov_edges()
    for minute in range(available_data_in_minutes):
        data_frame_dict["fuzzer"].append(run.fuzzer().value)
        data_frame_dict["run_id"].append(run.run_id())
        data_frame_dict["minute"].append(minute)
        data_frame_dict["ts"].append(datetime.fromtimestamp(minute * 60))
        for second in range(minute * 60, (minute + 1) * 60):
            coverage_current_second = ts_sorted_to_num_cov_edges.get(second, 0)
            assert (
                coverage_current_second == 0
                or coverage_current_second >= max_seen_coverage
            )
            if coverage_current_second > max_seen_coverage:
                max_seen_coverage = coverage_current_second
        data_frame_dict["cov"].append(max_seen_coverage)
    data_frame = pd.DataFrame(data_frame_dict)
    fuzzer_to_frames[run.fuzzer()].append(data_frame)

def calculate_intervals(
    data: pd.DataFrame
) -> pd.DataFrame:
    y_vals_grouped_by_min = data.groupby("minute")["cov"].apply(list)
    interval_frame = defaultdict(list)
    for minute, y_vals in y_vals_grouped_by_min.items():
        y_vals = sorted(y_vals)
        # todo: remove any?
        # y_vals = y_vals[1:-1]
        # to_be_removed = len(y_vals) - 7
        # to_be_removed_lower = math.ceil(to_be_removed / 2)
        # to_be_removed_upper = to_be_removed - to_be_removed_lower
        # y_vals = y_vals[to_be_removed_lower:-to_be_removed_upper]
        # print(y_vals)
        interval_frame["minute"].append(minute)
        interval_frame["interval_lower"].append(min(y_vals))
        interval_frame["interval_upper"].append(max(y_vals))
    interval_frame = pd.DataFrame(interval_frame, index=interval_frame["minute"])
    data = data.merge(interval_frame, on=["minute"])
    return data



ret_frames = []
for fuzzer, frames in fuzzer_to_frames.items():
    frame = pd.concat(frames)
    ret_frames.append(calculate_intervals(frame))

data_frame = pd.concat(ret_frames)

def plot(data_frame: pd.DataFrame) -> alt.LayerChart:

    base = alt.Chart(data_frame)

    dot_layer: alt.Chart = (
        base.mark_point(filled=True, size=60)
        .encode(
            x=alt.X(
                "ts:T",
                title="Time [hh:mm]",
                axis=alt.Axis(format="%H:%M"),
                # scale=alt.Scale(domain=[0, available_data_in_minutes]),
            ),
            y=alt.Y("median(cov)", title="#Covered Edges"),
            shape=alt.Shape("fuzzer:N"),
            color=alt.Color("fuzzer:N", title="Fuzzer"),
        )
        .transform_filter(alt.datum.minute % (60 * 6 + 0) == 0)
    )

    lines = base.mark_line().encode(
        x=alt.X(
            "ts:T",
        ),
        y=alt.Y("median(cov)", title="#Covered Edges"),
        color=alt.Color("fuzzer:N", legend=None),
    )

    interval_layer: alt.Chart = (
        base.mark_area(opacity=0.4)
        .encode(
            color=alt.Color("fuzzer:N", legend=None),
        )
        .transform_window(
            rollingy2="mean(interval_upper)",
            rollingy="mean(interval_lower)",
            frame=[0, 0],
        )
        .encode(x=alt.X("ts:T"), y=alt.Y("rollingy:Q"), y2="rollingy2")
    )

    # ruler_data = pd.DataFrame({"cov": [corpus_max_coverage], "fuzzer": ["Seed Corpus"]})

    # ruler = (
    #     alt.Chart(ruler_data)
    #     .mark_rule(strokeDash=[4, 4], size=2, color="black")
    #     .encode(y="cov:Q")
    # )

    chart = (
        (lines + dot_layer + interval_layer) # + ruler
        .resolve_scale(color="independent", shape="independent")
        .configure_legend(titleFontSize=20, labelFontSize=18, orient="top")
        .configure_axis(
            labelFontSize=14,
            titleFontSize=14,
        )
        .configure_title(
            fontSize=18,
        )
        .configure_view(
            continuousHeight=230,
            continuousWidth=300,
        )
    )

    chart.save(storage / f"fuzzilli_vs_sbxbrk.png", scale_factor=3.0)
    chart.save(storage / f"fuzzilli_vs_sbxbrk.svg", scale_factor=3.0)
    chart.save(storage / f"fuzzilli_vs_sbxbrk.pdf", scale_factor=3.0)
    return chart


p = plot(data_frame)
p # type: ignore
