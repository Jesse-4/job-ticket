#!/bin/bash
# Rebuild the sound track and final MP4 for a video whose frames are already encoded: ./remux.sh 02-paper-vs-app
set -e
cd "$(dirname "$0")/.."
python3 src/sound.py build/$1.events.json build/$1.wav
ffmpeg -loglevel error -y -i build/$1.video.mp4 -i build/$1.wav -c:v copy -c:a aac -b:a 160k -shortest -movflags +faststart videos/$1.mp4
echo "video videos/$1.mp4"
