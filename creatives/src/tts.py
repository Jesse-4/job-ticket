"""Synthesize one voiceover line with Kokoro (open-weight TTS, runs locally).

Usage: python3 tts.py VOICE SPEED OUT.wav "text"
Prints the clip's duration in seconds. The model files (kokoro-v1.0.onnx, voices-v1.0.bin from
github.com/thewh1teagle/kokoro-onnx releases) live in $JT_KOKORO_DIR.
Needs: pip install kokoro-onnx soundfile
"""
import os
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

voice, speed, out, text = sys.argv[1], float(sys.argv[2]), sys.argv[3], sys.argv[4]
d = os.environ.get("JT_KOKORO_DIR", ".")
k = Kokoro(os.path.join(d, "kokoro-v1.0.onnx"), os.path.join(d, "voices-v1.0.bin"))
samples, sr = k.create(text, voice=voice, speed=speed, lang="en-us")
# Trim leading/trailing near-silence so lines land exactly on their beat.
thr = 0.01 * np.max(np.abs(samples))
idx = np.where(np.abs(samples) > thr)[0]
if len(idx):
    samples = samples[max(0, idx[0] - int(0.02 * sr)): idx[-1] + int(0.08 * sr)]
sf.write(out, samples, sr)
print(f"{len(samples) / sr:.3f}")
