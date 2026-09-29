#!/usr/bin/env bash
# Kopiuje przestrzeń promptów Canvasu (bricki, operacje, składarka) z canvas/prompts
# do nextbyte-preview/src/sections/canvas/prompty. Źródłem prawdy jest canvas/prompts —
# edytuj tam, potem uruchom ten skrypt. Część Gemini (gemini/) nie jest kopiowana:
# preview ma własnego reżysera (rezyser.ts).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/canvas/prompts"
DST="$ROOT/nextbyte-preview/src/sections/canvas/prompty"

rm -rf "$DST"
mkdir -p "$DST"
cp -r "$SRC/bricks" "$SRC/operacje" "$DST/"
cp "$SRC/types.ts" "$SRC/pozytyw.ts" "$SRC/skladaj.ts" "$DST/"
cat > "$DST/index.ts" <<'IDX'
/**
 * KOPIA z canvas/prompts (bricki, operacje, składarka) — NIE EDYTUJ RĘCZNIE.
 * Źródło prawdy: canvas/prompts. Synchronizacja: skrypty/sync-prompty-canvas.sh
 */
export * from './types'
export * from './operacje'
export * from './bricks'
export * from './pozytyw'
export * from './skladaj'
IDX
echo "Skopiowano do $DST"
