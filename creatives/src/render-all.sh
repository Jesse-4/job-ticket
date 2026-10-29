#!/bin/bash
# Render every video (needs the repo served at http://localhost:8765, e.g. `python3 -m http.server 8765` from the repo root).
# Usage: ./render-all.sh [name-filter]   e.g. ./render-all.sh 03
cd "$(dirname "$0")"
mkdir -p ../build
ls videos/*${1}*.js | xargs -P 3 -I{} sh -c 'n=$(basename {} .js); node {} > ../build/$n.log 2>&1 && tail -n1 ../build/$n.log || echo "FAILED $n (see build/$n.log)"'
