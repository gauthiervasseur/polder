#!/bin/zsh
# Regenerate the website screenshots with headless Chrome.
# Needs a local server on port 8765 serving the Polder folder:
#   python3 -m http.server 8765 --bind 127.0.0.1   (run from the Polder folder)
set -e
cd "$(dirname "$0")/.."
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT=website/assets/screens
PROFILE=$(mktemp -d)
mkdir -p "$OUT"

shot() { # name hash
  "$CH" --headless=new --hide-scrollbars --user-data-dir="$PROFILE" --window-size=1440,860 \
    --force-device-scale-factor=2 --virtual-time-budget=5000 --screenshot="$OUT/$1.png" \
    "http://127.0.0.1:8765/app/index.html#mute&$2" >/dev/null 2>&1
  sips -s format jpeg -s formatOptions 82 --resampleWidth 1600 "$OUT/$1.png" --out "$OUT/$1.jpg" >/dev/null
  rm "$OUT/$1.png"
  echo "  $OUT/$1.jpg"
}

shot splash  "theme=dll&light"
shot table   "demo&preset=table&theme=dll&light"
shot bar     "demo&preset=bar&theme=dll&light"
shot line    "demo&preset=line&theme=dll&light"
shot scatter "demo&preset=scatter&theme=dll&light"
shot treemap "demo&preset=treemap&theme=dll&light"
shot kpi     "demo&preset=kpi&theme=dll&light"
shot dark    "demo&preset=line&theme=dll&dark"
rm -rf "$PROFILE"
