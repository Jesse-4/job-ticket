"""Synthesize simple UI sound design for a video from its event list.

Usage: python3 sound.py events.json out.wav
Every sound is generated here (sine, noise, envelopes); no samples or music.
"""
import json
import sys
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def env(n, attack, decay):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / decay)


def tone(freq, dur, attack=0.002, decay=0.1, f_end=None):
    n = int(dur * SR)
    f = np.linspace(freq, f_end or freq, n)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(n, attack, decay)


def noise(dur, attack, decay, lp=0.0, hp=0.0):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    if hp:  # crude one-pole high-pass
        y = np.empty_like(x); prev_x = prev_y = 0.0
        for i in range(n):
            prev_y = hp * (prev_y + x[i] - prev_x); prev_x = x[i]; y[i] = prev_y
        x = y
    if lp:  # one-pole low-pass
        y = np.empty_like(x); acc = 0.0
        for i in range(n):
            acc += lp * (x[i] - acc); y[i] = acc
        x = y / (np.max(np.abs(y)) + 1e-9)
    return x * env(n, attack, decay)


def mix(*parts):
    """Sum signals of different lengths (shorter ones are zero-padded)."""
    out = np.zeros(max(len(p) for p in parts))
    for p in parts:
        out[: len(p)] += p
    return out


def tap():
    return mix(0.55 * tone(190, 0.07, 0.001, 0.025, 120), 0.25 * noise(0.02, 0.0005, 0.004, hp=0.6))


def key():
    return mix(0.18 * noise(0.015, 0.0003, 0.003, hp=0.85), 0.08 * tone(900, 0.015, 0.0005, 0.004))


def pop():
    return 0.32 * tone(520, 0.09, 0.002, 0.03, 880)


def whoosh():
    d = 0.42
    n = int(d * SR)
    x = noise(d, 0.0, 10, lp=0.08)
    t = np.arange(n) / n
    shape = np.sin(np.pi * t) ** 2
    return 0.32 * x * shape


def swipe():
    d = 0.25
    n = int(d * SR)
    x = noise(d, 0.0, 10, lp=0.15)
    t = np.arange(n) / n
    return 0.12 * x * np.sin(np.pi * t) ** 2


def ding():
    a = tone(1318.5, 0.9, 0.002, 0.28) + 0.6 * tone(1975.5, 0.9, 0.002, 0.2)
    b = np.zeros(int(0.07 * SR))
    c = tone(1760, 0.9, 0.002, 0.3) + 0.5 * tone(2637, 0.9, 0.002, 0.18)
    out = np.zeros(len(a) + len(b))
    out[: len(a)] += a
    out[len(b):] += c
    return 0.16 * out


def thud():
    return mix(0.7 * tone(95, 0.25, 0.002, 0.07, 55), 0.2 * noise(0.06, 0.001, 0.015, lp=0.3))


def tick():
    return 0.12 * tone(2400, 0.02, 0.0005, 0.006)


def scribble():
    d = 0.5
    n = int(d * SR)
    x = noise(d, 0.01, 10, hp=0.7)
    t = np.arange(n) / SR
    am = 0.5 + 0.5 * np.sin(2 * np.pi * 9 * t) ** 2
    return 0.08 * x * am * np.sin(np.pi * t / d)


SOUNDS = {k: f() for k, f in {
    "tap": tap, "key": key, "pop": pop, "whoosh": whoosh, "swipe": swipe,
    "ding": ding, "thud": thud, "tick": tick, "scribble": scribble}.items()}


def load_vo(path):
    """Load a voiceover clip, resample to SR and level it to a consistent loudness."""
    with wave.open(path) as w:
        sr, ch = w.getframerate(), w.getnchannels()
        raw = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    if ch > 1:
        raw = raw.reshape(-1, ch).mean(axis=1)
    if sr != SR:
        t_old = np.arange(len(raw)) / sr
        raw = np.interp(np.arange(int(len(raw) * SR / sr)) / SR, t_old, raw)
    rms = np.sqrt(np.mean(raw ** 2)) or 1
    raw = raw * (0.16 / rms)  # about -16 dBFS RMS
    peak = np.max(np.abs(raw))
    return raw * (0.95 / peak) if peak > 0.95 else raw


def write(dst, mix):
    peak = np.max(np.abs(mix)) or 1
    if peak > 0.95:
        mix = mix / peak * 0.95
    pcm = (mix * 32767).astype(np.int16)
    stereo = np.repeat(pcm[:, None], 2, axis=1)
    with wave.open(dst, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(stereo.tobytes())


def main(src, dst, sfx_dst=None):
    data = json.load(open(src))
    n = int((data["duration"] + 1) * SR)
    sfx = np.zeros(n)
    vo = np.zeros(n)
    duck = np.ones(n)
    ramp = int(0.08 * SR)
    for ev in data["events"]:
        i = int(ev["t"] * SR)
        if ev["kind"] == "vo":
            clip = load_vo(ev["file"])
            i = max(i, 0)
            seg = clip[: max(0, n - i)]
            vo[i: i + len(seg)] += seg
            a, b = max(0, i - ramp), min(n, i + len(seg) + ramp)
            duck[a:b] = np.minimum(duck[a:b], 0.4)
            continue
        s = SOUNDS.get(ev["kind"])
        if s is None:
            continue
        if i < 0:  # sounds scheduled just before frame 0 start part-way through
            s, i = s[-i:], 0
        if i >= n or not len(s):
            continue
        seg = s[: n - i] * ev.get("vol", 1)
        sfx[i: i + len(seg)] += seg
    # Smooth the ducking so effects dip and recover without clicks.
    k = np.ones(ramp) / ramp
    duck = np.convolve(duck, k, mode="same")
    end = int(data["duration"] * SR)
    write(dst, (sfx * duck + vo)[:end])
    if sfx_dst:
        write(sfx_dst, sfx[:end])


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None)
