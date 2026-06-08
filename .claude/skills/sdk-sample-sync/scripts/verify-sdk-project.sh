#!/usr/bin/env bash
# Verify a @tailor-platform/sdk project compiles end to end.
#
# Runs the same pipeline a developer would: install deps, generate the kysely
# types (no-op if the project declares no generators), then `tsc --noEmit`.
# Generated artifacts that the repo does not track (tailor.d.ts, src/generated/)
# are removed afterward so the working tree is left clean.
#
# Usage:  verify-sdk-project.sh <project-dir>
# Exit:   0 = typecheck passed, non-zero = something failed (output shows what).

set -uo pipefail

DIR="${1:-}"
if [[ -z "$DIR" || ! -d "$DIR" ]]; then
  echo "usage: $0 <project-dir>" >&2
  exit 2
fi
cd "$DIR" || exit 2

if [[ ! -f package.json ]]; then
  echo "no package.json in $DIR — not an SDK project" >&2
  exit 2
fi

echo "==> $DIR"

# Track which generated paths were untracked before we ran, so cleanup only
# removes things we created (never a checked-in file).
GENERATED=(tailor.d.ts src/generated)
declare -a TO_CLEAN=()
for p in "${GENERATED[@]}"; do
  if ! git ls-files --error-unmatch "$p" >/dev/null 2>&1; then
    TO_CLEAN+=("$p")
  fi
done

cleanup() {
  for p in "${TO_CLEAN[@]}"; do
    rm -rf "$p"
  done
}
trap cleanup EXIT

echo "==> npm install"
if ! npm install >/tmp/sdk-verify-install.log 2>&1; then
  echo "FAIL: npm install" >&2
  tail -20 /tmp/sdk-verify-install.log >&2
  exit 1
fi

# Generate is harmless when no generators are configured; it produces the
# kysely types that resolver/executor snippets import.
echo "==> tailor-sdk generate"
npx tailor-sdk generate >/tmp/sdk-verify-generate.log 2>&1 || {
  echo "(generate reported issues — continuing to typecheck; see /tmp/sdk-verify-generate.log)" >&2
}

echo "==> typecheck"
if npm run --silent typecheck >/tmp/sdk-verify-tc.log 2>&1 \
   || npx tsc --noEmit >/tmp/sdk-verify-tc.log 2>&1; then
  echo "PASS: $DIR"
  exit 0
fi

echo "FAIL: typecheck" >&2
grep -E "error TS" /tmp/sdk-verify-tc.log >&2 || tail -30 /tmp/sdk-verify-tc.log >&2
exit 1
