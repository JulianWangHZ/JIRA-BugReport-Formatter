#!/usr/bin/env bash
# Zips only the files Chrome needs to load the extension.
# Usage: package.sh <version>  -> dist/jira-bug-report-formatter-v<version>.zip
set -euo pipefail
VERSION="${1:?version required}"
OUT="dist/jira-bug-report-formatter-v${VERSION}.zip"
mkdir -p dist
rm -f "$OUT"
zip -q -r "$OUT" \
  manifest.json background.js constants.js content.js \
  sidepanel.html sidepanel.css sidepanel.js \
  icons/logo.svg icons/icon16.png icons/icon32.png icons/icon48.png icons/icon128.png
echo "$OUT"
