#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = ["matplotlib"]
# ///
"""Plot five coverage curves up to 24h: SbxBrk, Tantrum+SbxBrk, Tantrum, Tantrum+Mjsunit, V8SbxFuzzer."""

import json
import io
import pathlib
import tarfile
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker

plt.rcParams.update({
    'font.size':         14,
    'axes.labelsize':    15,
    'axes.labelweight':  'bold',
    'axes.titlesize':    15,
    'legend.fontsize':   13,
    'xtick.labelsize':   12,
    'ytick.labelsize':   12,
})

HOUR = 3600
CAP = 24 * HOUR
ROOT = pathlib.Path(__file__).resolve().parent
DATA = ROOT / 'data'


def load_sbxbrk(path):
    d = json.loads(pathlib.Path(path).read_text())
    return sorted((int(t), int(c)) for t, c in d.items() if int(t) <= CAP)


import re
_TANTRUM_INC_PAT = re.compile(r'Global Coverage Increase:\s*\d+\s*->\s*(\d+)\s*\(([\d.]+)s\)')


def load_tantrum_coverage_curve(run_archive, log_member):
    """Parse Tantrum orchestrator log: (0, baseline) from '[*] Baseline Coverage: N'
    plus (t, cov) pairs from '[+] Global Coverage Increase: _ -> NEW (Ts)' lines.
    """
    pts = []
    with tarfile.open(run_archive, 'r:gz') as archive:
        member = archive.extractfile(log_member)
        if member is None:
            raise FileNotFoundError(f'{log_member} missing from {run_archive}')
        with io.TextIOWrapper(member, encoding='utf-8', errors='replace') as log:
            for line in log:
                if 'Baseline Coverage:' in line:
                    pts.append((0.0, int(line.rsplit(':', 1)[1].strip())))
                    continue
                m = _TANTRUM_INC_PAT.search(line)
                if m:
                    elapsed = float(m.group(2))
                    if elapsed <= CAP:
                        pts.append((elapsed, int(m.group(1))))
    pts.sort()
    return pts


sbxbrk          = load_sbxbrk(DATA / 'sbxbrk-ts_to_num_covered_edged.json')
tantrum_sbx     = load_tantrum_coverage_curve(DATA / 'tantrum-on-sbxbrk.tar.gz', 'tantrum/tantrum_orchestrator_log.log')
tantrum         = load_tantrum_coverage_curve(DATA / 'tantrum-native-exp.tar.gz', 'tantrum_orchestrator_log.log')
tantrum_mjsunit = load_tantrum_coverage_curve(DATA / 'tantrum-merged-exp.tar.gz', 'tantrum_orchestrator_log.log')
v8sbxfuzzer     = load_sbxbrk(DATA / 'v8sbxfuzzer-ts_to_num_covered_edged.json')

for name, pts in [
    ('SbxBrk', sbxbrk),
    ('Tantrum+SbxBrk', tantrum_sbx),
    ('Tantrum', tantrum),
    ('Tantrum+Mjsunit', tantrum_mjsunit),
    ('V8SbxFuzzer', v8sbxfuzzer),
]:
    print(f'{name:<16}: {len(pts):>5} pts, cov range {pts[0][1]:>7}..{pts[-1][1]:>7}')


def xy(pts):
    """Normalize to span [0, 24h]: prepend (0, first_y), extrapolate to 24h."""
    pts = list(pts)
    if not pts:
        return [], []
    if pts[0][0] > 0:
        pts.insert(0, (0, pts[0][1]))
    if pts[-1][0] < CAP:
        if len(pts) >= 2:
            (t1, y1), (t2, y2) = pts[-2], pts[-1]
            if t2 > t1:
                slope = (y2 - y1) / (t2 - t1)
                y_cap = int(round(y2 + slope * (CAP - t2)))
            else:
                y_cap = y2
        else:
            y_cap = pts[-1][1]
        pts.append((CAP, y_cap))
    elif pts[-1][0] > CAP:
        for i in range(len(pts) - 1, 0, -1):
            if pts[i - 1][0] <= CAP <= pts[i][0]:
                (t1, y1), (t2, y2) = pts[i - 1], pts[i]
                if t2 > t1:
                    slope = (y2 - y1) / (t2 - t1)
                    y_cap = int(round(y1 + slope * (CAP - t1)))
                else:
                    y_cap = y1
                pts = pts[:i] + [(CAP, y_cap)]
                break
    return [t / HOUR for t, _ in pts], [c for _, c in pts]


fig, ax = plt.subplots(figsize=(8, 5))

COLOR_SBXBRK     = '#D62728'
COLOR_TANTRUM    = '#1F77B4'
COLOR_TANTRUM_SX = '#B040C8'
COLOR_V8SBX      = '#2CA02C'

for name, pts, style in [
    ('V8SbxFuzzer',     v8sbxfuzzer,     {'linewidth': 1.5, 'color': COLOR_V8SBX}),
    ('SbxBrk',          sbxbrk,          {'linewidth': 1.5, 'color': COLOR_SBXBRK}),
    ('Tantrum+SbxBrk',  tantrum_sbx,     {'linewidth': 1.5, 'color': COLOR_TANTRUM_SX}),
    ('Tantrum',         tantrum,         {'linewidth': 1.5, 'color': COLOR_TANTRUM}),
    # Tantrum+Mjsunit uses a different corpus (eval_corpus ∪ mjsunit), not
    # head-to-head with the other four; dashed to indicate that.
    ('Tantrum+Mjsunit', tantrum_mjsunit, {'linewidth': 1.5, 'color': COLOR_TANTRUM, 'linestyle': '--'}),
]:
    x, y = xy(pts)
    ax.plot(x, y, label=name, **style)

ax.set_xlim(0, 24)
ax.set_xticks(range(0, 25, 2))
ax.set_xlabel('Time (hours)')
ax.set_ylabel('# Covered Edges')
ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda v, _: f'{int(v):,}'))
ax.grid(True, alpha=0.3)
ax.legend(loc='lower right')

plt.tight_layout()

out = ROOT
plt.savefig(out / 'coverage_5way.png', dpi=200)
plt.savefig(out / 'coverage_5way.svg')
plt.savefig(out / 'coverage_5way.pdf')

print(f'\nwrote {out}/coverage_5way.{{png,svg,pdf}}')
