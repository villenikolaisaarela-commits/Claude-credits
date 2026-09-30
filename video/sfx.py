"""Sound design for intro.html from real CC0 recordings (see sfx/CREDITS.md).

Writes video/sfx.wav (44.1 kHz, 16-bit stereo). Cue times mirror the scene
windows `S` and the in-scene timings in intro.html — change both together.

    FFMPEG=/path/to/ffmpeg python3 video/sfx.py
"""
import os
import subprocess
import wave
from pathlib import Path

import numpy as np

HERE = Path(__file__).parent
SR = 44100
DUR = 19.2
N = int(SR * DUR)
FFMPEG = os.environ.get('FFMPEG', 'ffmpeg')
rng = np.random.default_rng(11)

S = {
    's1': (0.0, 2.3), 's2': (2.3, 4.5), 's3': (4.5, 7.1), 's4': (7.1, 8.9),
    's5': (8.9, 9.9), 's6': (9.9, 13.2), 's7': (13.2, 15.4), 's8': (15.4, 19.0),
}


def load(name):
    raw = subprocess.run([FFMPEG, '-loglevel', 'error', '-i', str(HERE / 'sfx' / f'{name}.mp3'),
                          '-f', 's16le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<i2').reshape(-1, 2).astype(float) / 32768


def db(x):
    return 10 ** (x / 20)


def norm(x):
    return x / max(np.abs(x).max(), 1e-9)


def fade(x, fin=0.004, fout=0.03):
    x = x.copy()
    a, b = int(SR * fin), int(SR * fout)
    if a:
        x[:a] *= np.linspace(0, 1, a)[:, None]
    if b:
        x[-b:] *= np.linspace(1, 0, b)[:, None] ** 2
    return x


def envelope(x, win=0.01):
    m = np.abs(x).mean(1)
    k = int(SR * win)
    return np.convolve(m, np.ones(k) / k, mode='same')


def segments(x, thresh_db=-32, min_len=0.12, gap=0.04):
    """Contiguous regions whose envelope is above threshold (relative to peak)."""
    env = envelope(x)
    on = env > env.max() * db(thresh_db)
    out, i, n = [], 0, len(on)
    while i < n:
        if on[i]:
            j = i
            while j < n and (on[j] or on[j:j + int(SR * gap)].any()):
                j += 1
            if (j - i) / SR >= min_len:
                out.append((i, j))
            i = j
        else:
            i += 1
    return out


def onsets(x, min_gap=0.07, thresh_db=-20):
    env = envelope(x, 0.003)
    d = np.diff(env, prepend=0)
    thr = env.max() * db(thresh_db)
    idx, last = [], -10 ** 9
    for i in np.where((d > 0) & (env > thr))[0]:
        if i - last > SR * min_gap:
            idx.append(i)
            last = i
    return idx


def resample(x, ratio):
    """Pitch/speed shift by linear interpolation (ratio > 1 = higher)."""
    n = int(len(x) / ratio)
    src = np.arange(n) * ratio
    return np.stack([np.interp(src, np.arange(len(x)), x[:, c]) for c in (0, 1)], 1)


class Mix:
    def __init__(self):
        self.buf = np.zeros((N, 2))

    def add(self, x, t, gain_db=0.0, pan=0.0, align=0.0):
        """Place x so that its sample at `align` seconds lands on time t."""
        i = int((t - align) * SR)
        if i < 0:
            x, i = x[-i:], 0
        x = x[: N - i] * db(gain_db)
        g = np.array([np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))]) * np.sqrt(2)
        self.buf[i:i + len(x)] += x * g


def peak_time(x):
    return np.argmax(np.abs(x).mean(1)) / SR


# ---------------------------------------------------------------- source cuts

typing = load('typing_topre')
keys = []
for o in onsets(typing):
    k = typing[max(0, o - int(SR * 0.004)): o + int(SR * 0.085)]
    if len(k) > SR * 0.06:
        keys.append(fade(k, 0.002, 0.03))
levels = np.array([np.abs(k).max() for k in keys])
med = np.median(levels)
keys = [norm(k) for k, lv in zip(keys, levels) if 0.6 * med < lv < 1.6 * med][:40]

marker = load('marker')
# Each stroke: from its onset, keep 0.34 s (the strike animation lasts 0.3 s).
strokes = []
for o in onsets(marker, min_gap=0.25, thresh_db=-26):
    seg = marker[max(0, o - int(SR * 0.01)): o + int(SR * 0.34)]
    if len(seg) > SR * 0.3:
        strokes.append(fade(norm(seg), 0.008, 0.09))
strokes = strokes[:3]

mouse = load('mouse_double')
clicks = [fade(norm(mouse[max(0, o - int(SR * 0.003)): o + int(SR * 0.07)]), 0.001, 0.03) for o in onsets(mouse, 0.1, -12)]

whoosh_air = norm(load('whoosh_air'))
whoosh_swipe = norm(load('whoosh_swipe'))
impact = norm(load('lowimpact'))
impact = impact[max(0, int(peak_time(impact) * SR) - int(SR * 0.03)):]  # drop the lead-in, start at the hit
sub = load('subrush2')
ui = norm(load('uiclick'))

# ---------------------------------------------------------------- cues

mix = Mix()

# Hook: a soft air swell as the first words rise.
mix.add(fade(whoosh_air, 0.02, 0.1), 0.05, -17, -0.2, align=peak_time(whoosh_air))

# Search field opens, then thirteen real keystrokes in time with the letters.
a = S['s2'][0]
mix.add(whoosh_swipe, a + 0.12, -15, 0.25, align=peak_time(whoosh_swipe))
text = 'Yrityksesi Oy'
for i in range(len(text)):
    t = a + 0.4 + (i + 1) / len(text) * 0.6 - 0.02
    k = keys[(i * 3) % len(keys)]
    mix.add(resample(k, rng.uniform(0.97, 1.04)), t, rng.uniform(-9, -6), rng.uniform(-0.25, 0.25))
mix.add(keys[5], a + 1.08, -4, 0.0)  # the enter key: a touch heavier

# The question lands: breath.
mix.add(fade(whoosh_air, 0.02, 0.1), a + 1.0, -21, 0.3, align=peak_time(whoosh_air))

# Three marker strokes for the three strike-throughs.
a = S['s3'][0]
for i in range(3):
    s = strokes[i % len(strokes)]
    mix.add(s, a + 0.1 + i * 0.62 + 0.35, -7, -0.35 + 0.35 * i)

# "Hän soittaa kilpailijalle." — one low hit.
a = S['s4'][0]
mix.add(fade(impact[: int(SR * 1.6)], 0.002, 0.9), a + 0.03, -5, 0.0, align=0.03)

# Sub swell under the silence, cut dead on "Korjataan se." + one crisp click.
a = S['s5'][0]
swell = sub[: int(SR * 0.9)] * (np.linspace(0, 1, int(SR * 0.9)) ** 2.5)[:, None]
mix.add(swell, a - 0.9, -16)
mix.add(clicks[0], a, -6, 0.0)

# Work montage: a click on every cover, slightly different each time.
a = S['s6'][0]
mix.add(fade(whoosh_swipe, 0.01, 0.1), a + 0.05, -20, -0.3, align=peak_time(whoosh_swipe))
for i in range(4):
    c = resample(clicks[i % len(clicks)], [1.0, 1.06, 0.97, 1.1][i])
    mix.add(c, a + 0.1 + i * 0.72, -8, [-0.2, 0.2, -0.1, 0.1][i])

# Promise: soft air.
a = S['s7'][0]
mix.add(fade(whoosh_air, 0.02, 0.1), a + 0.1, -18, 0.2, align=peak_time(whoosh_air))

# Call to action: air, the underline drawn with a short marker stroke, a final UI tick.
a = S['s8'][0]
mix.add(fade(whoosh_air, 0.02, 0.1), a + 0.1, -18, -0.2, align=peak_time(whoosh_air))
mix.add(strokes[-1][: int(SR * 0.5)], a + 1.0, -13, 0.2)
mix.add(ui, a + 1.7, -12, 0.0)

# ---------------------------------------------------------------- glue + master

def room(x, seconds=0.7, wet=0.1):
    n = int(SR * seconds)
    t = np.arange(n) / SR
    out = np.zeros_like(x)
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    for c in (0, 1):
        ir = rng.standard_normal(n) * np.exp(-t * 9)
        ir = np.convolve(ir, np.ones(6) / 6, mode='same')
        ir[: int(SR * (0.01 + 0.004 * c))] = 0
        out[:, c] = np.fft.irfft(np.fft.rfft(x[:, c], size) * np.fft.rfft(ir, size), size)[: len(x)]
    out *= np.abs(x).max() / max(np.abs(out).max(), 1e-9)
    return x + wet * out


buf = room(mix.buf)
t = np.arange(N) / SR
buf *= np.clip((DUR - t) / 0.4, 0, 1)[:, None]
buf *= db(-3) / np.abs(buf).max()

out = HERE / 'sfx.wav'
with wave.open(str(out), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((buf * 32767).astype('<i2').tobytes())
print('wrote', out, f'keys={len(keys)} strokes={len(strokes)} clicks={len(clicks)}')
