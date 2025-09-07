#!/usr/bin/env bash
set -euo pipefail

# cleanup-safe.sh — Phase 4 controlled cleanup (dry-run by default)
# Usage:
#   bash scripts/cleanup-safe.sh [--apply]
# Notes:
#   - Reads tools/reports/unused-files.json if present
#   - Skips any path under apps/*/app/api or prisma or migrations
#   - Always prints actions; requires --apply to actually delete

APPLY=false
if [[ "${1:-}" == "--apply" ]]; then
  APPLY=true
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_JSON="$ROOT_DIR/tools/reports/unused-files.json"

info() { echo -e "[info] $*"; }
warn() { echo -e "[warn] $*"; }
err()  { echo -e "[error] $*" >&2; }

protect_path() {
  local p="$1"
  # Protect critical areas
  if [[ "$p" == apps/*/app/api/* ]] || [[ "$p" == */prisma/* ]] || [[ "$p" == supabase/migrations/* ]]; then
    return 1
  fi
  return 0
}

list_candidates() {
  if [[ -f "$REPORT_JSON" ]]; then
    # Expecting a JSON array of paths or an object with a top-level "files" array
    if command -v jq >/dev/null 2>&1; then
      jq -r '.files // .[]? // empty' "$REPORT_JSON" | sed '/^\s*$/d'
    else
      warn "jq not found. Falling back to grep/sed (may be less accurate)."
      grep -Eo '"([^"]+)"' "$REPORT_JSON" | sed 's/"//g'
    fi
  else
    warn "Report not found: $REPORT_JSON — no candidates listed."
    return 0
  fi
}

main() {
  info "Root: $ROOT_DIR"
  info "Report: $REPORT_JSON"
  info "Mode: $([[ "$APPLY" == true ]] && echo APPLY || echo DRY-RUN)"

  local removed=0 skipped=0 total=0

  while IFS= read -r path; do
    [[ -z "$path" ]] && continue
    total=$((total+1))

    # Normalize to repo-relative
    local full="$ROOT_DIR/$path"

    if ! protect_path "$path"; then
      info "SKIP (protected): $path"
      skipped=$((skipped+1))
      continue
    fi

    if [[ -e "$full" ]]; then
      if [[ "$APPLY" == true ]]; then
        info "DELETE: $path"
        git rm -r --cached --ignore-unmatch "$path" >/dev/null 2>&1 || true
        rm -rf "$full"
      else
        info "DRY: would delete $path"
      fi
      removed=$((removed+1))
    else
      info "MISS: $path (not found)"
      skipped=$((skipped+1))
    fi
  done < <(list_candidates)

  echo "---"
  info "Summary: total=$total removed=$removed skipped=$skipped mode=$([[ "$APPLY" == true ]] && echo APPLY || echo DRY-RUN)"
  info "Tip: run with --apply to execute removals."
}

main "$@"
