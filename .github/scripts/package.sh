#!/usr/bin/env bash
# Zips the built extension (run `npm run build` first).
# Usage: package.sh <version>  -> dist/jira-bug-report-formatter-v<version>.zip
set -euo pipefail
VERSION="${1:?version required}"
OUT="dist/jira-bug-report-formatter-v${VERSION}.zip"
test -f build/manifest.json || { echo "build/ is missing; run npm run build" >&2; exit 1; }
mkdir -p dist
rm -f "$OUT"
(cd build && zip -q -r "../$OUT" .)
echo "$OUT"
