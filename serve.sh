#!/bin/sh
cd "$(dirname "$0")"
echo "→ http://localhost:8811"
open http://localhost:8811 2>/dev/null
python3 -m http.server 8811
