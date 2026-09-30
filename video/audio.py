"""Original score + sound design for intro.html, synthesized from scratch (no samples).

Writes video/soundtrack.wav (44.1 kHz, 16-bit stereo). Timings mirror the scene
windows `S` in intro.html — change both together.

    python3 video/audio.py
"""
import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = 28.05
N = int(SR * DUR)
rng = np.random.default_rng(7)

S = {  # scene windows, seconds (same as intro.html)
    's1': (0.35, 3.3), 's2': (3.3, 6.2), 's3': (6.2, 10.6), 's4': (10.6, 13.4),
    's5': (13.4, 14.9), 's6': (14.9, 19.9), 's7': (19.9, 24.0), 's8': (24.0, 28.0),
}


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def note_names(*names):
    table = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
    out = []
    for n in names:
        pc = table[n[0]] + (1 if '#' in n else 0) - (1 if n[1:2] == 'b' else 0)
        octave = int(n[-1])
        out.append(12 * (octave + 1) + pc)
    return out


class Bus:
    def __init__(self):
        self.l = np.zeros(N)
        self.r = np.zeros(N)

    def add(self, sig, t0, gain=1.0, pan=0.0):
        i = int(t0 * SR)
        if i >= N:
            return
        sig = sig[: N - i] * gain
        self.l[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
        self.r[i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def smooth(x, n):
    """Cheap low-pass: moving average of n samples."""
    if n <= 1:
        return x
    k = np.ones(n) / n
    return np.convolve(x, k, mode='same')


# ---------------------------------------------------------------- instruments

def piano(midi, dur=3.5, vel=1.0):
    """Soft felt-piano tone: decaying harmonics with slight inharmonicity."""
    t = np.arange(int(SR * dur)) / SR
    f = hz(midi)
    sig = np.zeros_like(t)
    for k in range(1, 8):
        fk = f * k * (1 + 0.0004 * k * k)
        if fk > 12000:
            break
        amp = 1 / k ** 1.7
        decay = 1.1 + 0.9 * k + f / 900
        sig += amp * np.sin(2 * np.pi * fk * t + rng.uniform(0, 6.28)) * np.exp(-decay * t)
    attack = np.minimum(1, t / 0.006)
    felt = smooth(rng.standard_normal(len(t)) * np.exp(-t * 90), 12) * 0.25  # hammer felt
    return (sig * attack + felt) * vel * 0.22


def pad(midis, dur, attack=1.2, release=1.4, level=1.0):
    t = np.arange(int(SR * dur)) / SR
    sig = np.zeros_like(t)
    for m in midis:
        f = hz(m)
        for det in (-0.12, 0.0, 0.12):  # cents-ish detune for width
            ff = f * 2 ** (det / 12)
            sig += np.sin(2 * np.pi * ff * t + rng.uniform(0, 6.28)) * (1.0 if det == 0 else 0.55)
            sig += 0.12 * np.sin(2 * np.pi * 2 * ff * t)
    env = np.minimum(1, t / attack) * np.minimum(1, (dur - t) / release)
    breathe = 1 + 0.08 * np.sin(2 * np.pi * 0.18 * t)
    return sig * env * breathe * level * 0.018 / max(1, len(midis) / 4)


def kick(freq=58, dur=0.5, vel=1.0):
    t = np.arange(int(SR * dur)) / SR
    f = freq + 70 * np.exp(-t * 28)
    phase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(phase) * np.exp(-t * 9) * np.minimum(1, t / 0.002) * vel * 0.5


def noise_burst(dur, lp=4, hp=True):
    x = rng.standard_normal(int(SR * dur))
    if hp:
        x = np.diff(x, prepend=0)
    return smooth(x, lp)


def click(vel=1.0):
    """Key click: tiny bright transient."""
    d = 0.018
    t = np.arange(int(SR * d)) / SR
    x = noise_burst(d, lp=2) * np.exp(-t * 520) * 0.6
    x += np.sin(2 * np.pi * 3100 * t) * np.exp(-t * 380) * 0.25
    return x * vel * 0.35


def whoosh(dur=0.55, vel=1.0):
    """Soft air swell for text reveals."""
    t = np.arange(int(SR * dur)) / SR
    x = smooth(rng.standard_normal(len(t)), 9) - smooth(rng.standard_normal(len(t)), 60) * 0.5
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2.2
    return x * env * vel * 0.06


def swish(dur=0.45, vel=1.0):
    """Pen stroke for the strike-through: brighter noise that sweeps up."""
    t = np.arange(int(SR * dur)) / SR
    x = noise_burst(dur, lp=1)
    lo = smooth(x, 14)
    mix = np.clip(t / dur, 0, 1)
    y = lo * (1 - mix) + x * mix * 0.6
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    return y * env * vel * 0.16


def tock(vel=1.0):
    """Wooden tick for image reveals."""
    d = 0.12
    t = np.arange(int(SR * d)) / SR
    x = np.sin(2 * np.pi * 1250 * t) * np.exp(-t * 60) + 0.5 * np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 110)
    return x * vel * 0.12


def riser(dur=0.9, vel=1.0):
    t = np.arange(int(SR * dur)) / SR
    x = smooth(rng.standard_normal(len(t)), 6)
    env = (t / dur) ** 2.6
    return x * env * vel * 0.07


# ---------------------------------------------------------------- composition

music = Bus()
sfx = Bus()

# Harmony follows the story: open question → tension → turn → resolve.
chords = [
    (0.0, 3.3, note_names('A2', 'E3', 'G3', 'B3', 'C4')),        # Am9  — the hook
    (3.3, 6.2, note_names('F2', 'C3', 'E3', 'A3')),              # Fmaj7 — searching
    (6.2, 10.6, note_names('D2', 'A2', 'F3', 'C4', 'E4')),       # Dm9  — what they find
    (10.6, 13.4, note_names('E2', 'B2', 'D3', 'A3')),            # Esus — unresolved
    (13.4, 19.9, note_names('C2', 'G2', 'E3', 'B3', 'D4')),      # Cmaj9 — the turn
    (19.9, 24.0, note_names('F2', 'C3', 'A3', 'E4')),            # Fmaj7
    (24.0, 28.05, note_names('C2', 'G2', 'E3', 'G3', 'D4')),     # Cadd9 — resolve
]
for a, b, ch in chords:
    lvl = 0.55 if a == 10.6 else 1.0
    music.add(pad(ch, (b - a) + 1.4, attack=0.9 if a else 2.2, release=1.3, level=lvl), max(0, a - 0.3))

# Sparse piano, a few notes per scene (melody sits on scene beats).
melody = [
    (0.35, 'E5', 0.8), (1.45, 'C5', 0.55), (2.3, 'B4', 0.5),
    (3.3, 'A4', 0.7), (4.4, 'C5', 0.45), (5.3, 'E5', 0.5),
    (6.4, 'F4', 0.6), (8.3, 'E4', 0.45),
    (10.6, 'D4', 0.55),
    (13.4, 'G4', 0.75), (13.4, 'E5', 0.6), (13.85, 'B5', 0.45),
    (19.9, 'A4', 0.6), (20.9, 'C5', 0.5), (21.9, 'E5', 0.5), (22.9, 'G5', 0.4),
    (24.0, 'E5', 0.7), (24.0, 'C5', 0.5),
    (25.5, 'G5', 0.55), (25.5, 'D6', 0.4), (26.3, 'C6', 0.45),
]
for i, (t0, n, v) in enumerate(melody):
    music.add(piano(note_names(n)[0], dur=4.0, vel=v), t0, pan=(-0.25 if i % 2 else 0.25))

# Montage: gentle eighth-note arpeggio + soft pulse on every cover reveal.
a6 = S['s6'][0]
step = 1.1
arp_sets = [note_names('C4', 'G4', 'D5', 'E5'), note_names('B3', 'G4', 'D5', 'G5'),
            note_names('A3', 'E4', 'C5', 'G5'), note_names('F3', 'C4', 'A4', 'E5')]
for i in range(4):
    st = a6 + 0.15 + i * step
    for j, m in enumerate(arp_sets[i]):
        music.add(piano(m, dur=2.2, vel=0.33 + 0.05 * (j == 0)), st + j * step / 4, pan=0.35 * np.sin(j * 1.7))
    music.add(kick(52, vel=0.55), st)
    sfx.add(tock(0.9), st + 0.02, pan=0.1)
# tail of the montage leading into s7
music.add(piano(note_names('C4')[0], dur=3, vel=0.35), a6 + 0.15 + 4 * step)

# ---------------------------------------------------------------- sound design

for name, (a, _) in S.items():
    if name in ('s6',):
        continue
    sfx.add(whoosh(0.6, 0.9), max(0, a - 0.12), pan=-0.1)

# search bar opens + typing
a2 = S['s2'][0]
sfx.add(whoosh(0.7, 1.2), a2 - 0.05, pan=0.2)
text = 'Yrityksesi Oy'
for k in range(len(text)):
    t = a2 + 0.55 + (k + 1) / len(text) * 0.85
    sfx.add(click(rng.uniform(0.7, 1.0)), t + rng.uniform(-0.008, 0.008), pan=rng.uniform(-0.2, 0.2))

# strike-throughs
a3 = S['s3'][0]
for i in range(3):
    sfx.add(swish(0.45, 1.0), a3 + 0.2 + i * 0.95 + 0.55, pan=-0.3 + 0.3 * i)

# the competitor line lands with a low, soft thud
sfx.add(kick(44, 0.9, 1.1), S['s4'][0] + 0.02)

# the turn: a breath in, then release
sfx.add(riser(1.0, 1.0), S['s5'][0] - 1.0)
sfx.add(kick(50, 0.6, 0.7), S['s5'][0])

# final underline + status dot: two soft ticks
a8 = S['s8'][0]
sfx.add(tock(0.7), a8 + 1.5)
sfx.add(tock(0.5), a8 + 2.3)

# ---------------------------------------------------------------- mix

def reverb(l, r, seconds=3.2, decay=1.7, wet=0.32):
    n = int(SR * seconds)
    t = np.arange(n) / SR
    irl = rng.standard_normal(n) * np.exp(-t * (6.9 / decay) / 2.3)
    irr = rng.standard_normal(n) * np.exp(-t * (6.9 / decay) / 2.3)
    irl, irr = smooth(irl, 5), smooth(irr, 5)  # darker tail
    irl[: int(SR * 0.012)] = 0  # pre-delay
    irr[: int(SR * 0.017)] = 0
    size = 1 << int(np.ceil(np.log2(len(l) + n)))
    wl = np.fft.irfft(np.fft.rfft(l, size) * np.fft.rfft(irl, size), size)[: len(l)]
    wr = np.fft.irfft(np.fft.rfft(r, size) * np.fft.rfft(irr, size), size)[: len(r)]
    norm = max(np.abs(wl).max(), np.abs(wr).max(), 1e-9) / max(np.abs(l).max(), np.abs(r).max(), 1e-9)
    return l + wet * wl / norm, r + wet * wr / norm


ml, mr = reverb(music.l, music.r, wet=0.45)
sl, sr_ = reverb(sfx.l, sfx.r, seconds=1.6, decay=0.8, wet=0.18)
L = ml + sl * 0.9
R = mr + sr_ * 0.9

# fade in/out
t = np.arange(N) / SR
fade = np.minimum(1, t / 0.25) * np.clip((DUR - t) / 2.2, 0, 1)
L *= fade
R *= fade

# gentle glue: soft saturation, then peak-normalize to -1 dBFS
peak = max(np.abs(L).max(), np.abs(R).max())
L, R = np.tanh(1.4 * L / peak) / np.tanh(1.4), np.tanh(1.4 * R / peak) / np.tanh(1.4)
gain = 10 ** (-1 / 20) / max(np.abs(L).max(), np.abs(R).max())
L, R = L * gain, R * gain

out = Path(__file__).with_name('soundtrack.wav')
pcm = (np.stack([L, R], axis=1) * 32767).astype('<i2')
with wave.open(str(out), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', out, f'{DUR:.2f}s')
