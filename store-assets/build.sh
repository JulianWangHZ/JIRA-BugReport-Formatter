#!/usr/bin/env bash
# Renders all Chrome Web Store assets with the system Chrome (headless).
#
#   1) Screenshots the real side panel (sidepanel.html + css) in several states -> _build/
#   2) Renders each page to upload/ and converts it to what the store accepts:
#      screenshots 1280x800, small promo 440x280, marquee 1400x560 as 24-bit PNG (no alpha),
#      store icon 128x128 PNG (96px artwork + 16px transparent padding).
set -euo pipefail
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
ROOT="$(cd .. && pwd)"
HERE="$(pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p _build upload

# render_panel <lang: en|zh-TW> <tab: quick|settings> <height> <out.png>
render_panel() {
  local lang="$1" tab="$2" height="$3" out="$4"
  LANG_CODE="$lang" TAB="$tab" ROOT="$ROOT" python3 - > "$TMP/panel.html" <<'PY'
import os
root, lang, tab = os.environ["ROOT"], os.environ["LANG_CODE"], os.environ["TAB"]
stub = ('<script>window.chrome={storage:{sync:{get:(k,cb)=>{const r={language:"%s"};cb&&cb(r);return Promise.resolve(r)},'
        'set:(o,cb)=>{cb&&cb()}}},runtime:{lastError:null,sendMessage(){}},tabs:{query:(q,cb)=>cb&&cb([])}};</script>') % lang
if tab == "settings":
    action = 'document.querySelector(\'[data-tab="settings"]\').click();'
else:
    # Same visual state sidepanel.js sets after a successful insert
    action = ('const b=document.getElementById("insertTemplateBtn");b.dataset.state="success";'
              'b.textContent=I18N[currentLang()].buttons.insertTemplateSuccess;b.style.backgroundColor="#3a9468";')
script = ('<style>*{transition:none!important}</style><script>function currentLang(){return document.documentElement.lang||"%s"}'
          'setTimeout(()=>{%s},200)</script>') % (lang, action)
html = open(f"{root}/sidepanel.html", encoding="utf-8").read()
html = html.replace("<head>", f'<head><base href="file://{root}/">{stub}', 1)
print(html.replace("</body>", f"{script}</body>", 1))
PY
  echo "<body style=\"margin:0\"><iframe src=\"panel.html\" style=\"width:360px;height:${height}px;border:0;display:block\"></iframe></body>" > "$TMP/frame.html"
  "$CHROME" --headless=new --hide-scrollbars --allow-file-access-from-files --force-device-scale-factor=2 \
    --window-size=500,"$height" --virtual-time-budget=3000 --screenshot="$TMP/full.png" "$TMP/frame.html" 2>/dev/null
  python3 -c "from PIL import Image; Image.open('$TMP/full.png').crop((0,0,720,$height*2)).save('$out')"
}

# shoot <page.html[?query]> <width> <height> <out.png> [keep-alpha]
shoot() {
  local page="$1" w="$2" h="$3" out="$4" alpha="${5:-}"
  local bg=()
  [ -n "$alpha" ] && bg=(--default-background-color=00000000)
  "$CHROME" --headless=new --hide-scrollbars --allow-file-access-from-files ${bg[@]+"${bg[@]}"} \
    --window-size="$w","$h" --virtual-time-budget=4000 --screenshot="$TMP/shot.png" "file://$HERE/$page" 2>/dev/null
  OUT="$out" W="$w" H="$h" ALPHA="$alpha" python3 - "$TMP/shot.png" <<'PY'
import os, sys
from PIL import Image
w, h, out = int(os.environ["W"]), int(os.environ["H"]), os.environ["OUT"]
img = Image.open(sys.argv[1])
if img.size != (w, h):
    sys.exit(f"{out}: expected {w}x{h}, got {img.size[0]}x{img.size[1]}")
img = img.convert("RGBA" if os.environ["ALPHA"] else "RGB")
img.save(out, optimize=True)
print(f"  {out}  {w}x{h}  {img.mode}")
PY
}

echo "side panel states:"
render_panel en quick 560 _build/panel-en-quick.png
render_panel zh-TW quick 560 _build/panel-zh-quick.png
render_panel en settings 800 _build/panel-en-settings.png
echo "  _build/panel-*.png"

echo "store assets:"
shoot "hero.html"         1280 800 upload/screenshot-1-hero-en.png
shoot "hero.html?lang=zh" 1280 800 upload/screenshot-2-hero-zh.png
shoot "settings.html"     1280 800 upload/screenshot-3-settings.png
shoot "sections.html"     1280 800 upload/screenshot-4-sections.png
shoot "promo-small.html"   440 280 upload/promo-small-440x280.png
shoot "promo-marquee.html" 1400 560 upload/promo-marquee-1400x560.png

echo '<body style="margin:0;background:transparent"><img src="../icons/logo.svg" style="display:block;width:96px;height:96px;margin:16px"></body>' > store-icon.tmp.html
shoot "store-icon.tmp.html" 128 128 upload/store-icon-128.png keep-alpha
rm -f store-icon.tmp.html
