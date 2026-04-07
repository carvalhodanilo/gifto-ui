#!/usr/bin/env bash
# Falha se reaparecer o padrão legado: fundo da marca + hover por opacity no mesmo className,
# que colide com hover:bg-primary do variant default do Button.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PATTERN='bg-\[var\(--brand-primary\)\].*hover:opacity-90'
LEGACY=$(
  grep -rEn --include='*.tsx' "$PATTERN" "$ROOT/apps/sales-app/src" "$ROOT/packages/ui/src" 2>/dev/null || true
)
if [[ -n "${LEGACY}" ]]; then
  echo "check-brand-button-pattern: use <Button variant=\"brand\"> em vez de bg-[var(--brand-primary)] + hover:opacity-90 na mesma className."
  echo "$LEGACY"
  exit 1
fi
