#!/usr/bin/env bash
# SessionStart hook — prints the current phase block from PHASE.md
# so every fresh Claude session sees "where we are" without re-reading the plan.
set -euo pipefail
cd "$CLAUDE_PROJECT_DIR"

if [[ ! -f PHASE.md ]]; then
  echo "⚠  PHASE.md missing — run from project root or check git state."
  exit 0
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PHASE STATE — gamblino"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
awk '/^## Current/,/^## Done/' PHASE.md | sed '$d'
echo ""
echo "Plan: ~/.claude/plans/greedy-honking-fairy.md"
echo "Advance: /next-phase  ·  Resume current: /feature-dev <phase>"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")
expected=$(awk -F'`' '/\*\*Branch:\*\*/ {print $2; exit}' PHASE.md)
if [[ -n "$expected" && "$branch" != "$expected" && "$branch" != "main" ]]; then
  echo "⚠  On branch '$branch' but PHASE.md expects '$expected'."
fi
