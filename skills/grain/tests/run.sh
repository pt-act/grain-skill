#!/usr/bin/env bash
# run.sh — the grain self-test. Runs the gate against fixtures and smoke-tests
# the script surface. In CI this runs with a browser installed; locally,
# --skip-browser runs everything except the inspector.
#
#   ./run.sh              full run (needs Chrome/Edge/Chromium)
#   ./run.sh --skip-browser

set -euo pipefail
cd "$(dirname "$0")/../../.."   # repo root (skills/grain/tests/run.sh → three levels up)

SKILL="skills/grain"
S="$SKILL/scripts"
FIX="$SKILL/tests/fixtures"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

fail() { echo "FAIL: $1"; exit 1; }

echo "== fixtures present =="
[ -f "$FIX/clean.html" ] || fail "missing $FIX/clean.html"
[ -f "$FIX/sloppy.html" ] || fail "missing $FIX/sloppy.html"
for img in "$FIX"/img*.jpg; do [ -f "$img" ] || fail "missing fixture image $img"; done

echo "== lint catches the sloppy page =="
if node "$S/lint.mjs" "$FIX/sloppy.html" >"$WORK/lint-sloppy.txt" 2>&1; then
  fail "lint passed on sloppy.html — it should fail"
fi
grep -q "FAIL" "$WORK/lint-sloppy.txt" || fail "sloppy.html findings contain no FAIL"
node "$S/lint.mjs" "$FIX/clean.html" >"$WORK/lint-clean.txt" 2>&1 || fail "lint failed on clean.html"

echo "== script smoke (no browser, no network) =="
cd "$WORK"
node "$OLDPWD/$S/draw.mjs" --sector craft --brief "test fixture" --sections intro,list --direction manifesto >/dev/null || fail "draw deal"
node "$OLDPWD/$S/tokens.mjs" >/dev/null || fail "tokens"
node "$OLDPWD/$S/report.mjs" --idea "test idea" >/dev/null || fail "report"
node "$OLDPWD/$S/doctor.mjs" >/dev/null || fail "doctor"
node "$OLDPWD/$S/lint.mjs" "$OLDPWD/$SKILL/scripts" >/dev/null || fail "self-lint of the skill's scripts"
echo "   draw, tokens, report, doctor, self-lint: ok"

if [ "${1:-}" != "--skip-browser" ]; then
  echo "== inspector on the clean page =="
  if ! node "$OLDPWD/$S/inspect.mjs" "$OLDPWD/$FIX/clean.html" >"$WORK/inspect.txt" 2>&1; then
    cat "$WORK/inspect.txt"
    fail "inspect failed on clean.html"
  fi
  grep -q "inspect: PASS" "$WORK/inspect.txt" || fail "inspect did not PASS on clean.html"
  [ -f ".grain/inspect/phone.png" ] || fail "no phone screenshot"
  [ -f ".grain/inspect/desktop.png" ] || fail "no desktop screenshot"
  echo "   inspect: PASS, screenshots written"
else
  echo "== inspector skipped (--skip-browser) =="
fi

echo
echo "grain self-test: ALL GREEN"
