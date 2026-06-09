---
name: sdk-sample-sync
description: >-
  Verify and update the hand-written @tailor-platform/sdk code samples in this docs
  repo (tutorials, guides, getting-started) against the currently published SDK, and
  keep the companion source in tailor-platform/templates in sync. Use this whenever a
  new @tailor-platform/sdk version ships, when someone reports a tutorial snippet that
  no longer compiles or deploys, when reviewing or editing any SDK code block in the
  docs, or when asked to "update the SDK tutorial", "check the docs code samples",
  "the SDK API changed", "migrate the develop-from-scratch guide", or similar. Reach
  for it even when the request only mentions a single broken snippet — the same drift
  usually spans several pages and the matching templates project.
metadata:
  author: jackchuka
  scope: tailor-platform/docs
  verification: empirical
---

# Syncing SDK code samples with the published SDK

## Why this skill exists

This repo has two kinds of SDK documentation, and they age differently:

- **`docs/sdk/` is auto-synced.** `scripts/docs-sync/main.ts` copies the SDK package's
  own `docs/` into `docs/sdk/` (see `sdk-docs-sync` CI). Never hand-edit it — your
  changes get overwritten on the next sync.
- **The tutorials and guides are hand-written.** `docs/tutorials/develop-from-scratch/`,
  `docs/getting-started/`, and the SDK examples scattered through `docs/guides/` contain
  code blocks a human typed. Nothing regenerates them, so when the SDK changes its API
  they silently rot. That rot is what this skill fixes.

The samples also have a twin: the runnable source in
`tailor-platform/templates/docs/build-from-scratch/sdk/step-0X/`, which each tutorial
page links to. The prose and the runnable code must agree, so this skill updates both
in lockstep.

The hard-won lesson from the last migration: **a snippet can compile and still be
wrong.** The webhook `body:` field type-checked fine but was silently ignored at
runtime (the real field is `requestBody:`). Reading release notes is not enough —
verify empirically.

## The process

### 1. Establish the source of truth for the new SDK

Don't trust memory or training data — pull the actual published package and read the
docs it ships with.

```bash
cd /tmp && rm -rf sdk-inspect && mkdir sdk-inspect && cd sdk-inspect
npm pack @tailor-platform/sdk@latest >/dev/null 2>&1 && tar -xzf *.tgz
# Read these — they are the authoritative API reference for the version you're targeting:
ls package/docs package/docs/services package/docs/cli
cat package/CHANGELOG.md          # what changed and when
node -e "console.log(require('./package/package.json').version)"
```

The bundled `package/docs/` is the same content that becomes `docs/sdk/` here, so it
*is* canonical. When the prose and a code block disagree, the bundled service docs
(e.g. `docs/services/executor.md`) win.

If you only need to confirm an exported symbol or a method exists, inspect the entry
type defs or check at runtime against an installed copy:

```bash
node -e "import('@tailor-platform/sdk').then(m => console.log(Object.keys(m.t)))"
```

### 2. Find every hand-written SDK sample

Cast a wide net — the same drift repeats across pages.

```bash
cd <docs repo root>
# import lines, config keys, and CLI invocations are the highest-signal anchors
grep -rn "@tailor-platform/sdk\|tailor-sdk\|defineConfig\|createResolver\|createExecutor\|db\.enum\|db\.type" \
  docs --include="*.md" | grep -v "docs/sdk/"   # exclude the auto-synced reference
```

Group hits by page. Note which pages have a companion templates project (the
develop-from-scratch steps map 1:1 to `templates/docs/build-from-scratch/sdk/step-0X`).

### 3. Diagnose against the new API

For each distinct API surface a sample uses, confirm the current shape from the
bundled docs in step 1 — not from memory of how the old version worked. The package's
`CHANGELOG.md` tells you what moved; the bundled service docs tell you the current
shape. Treat both as inputs to the empirical check in step 4, not as a substitute for
it (the CHANGELOG misses things — see the silent `body`/`requestBody` case).

### 4. Verify empirically — this is the point of the skill

Apply the candidate fix to the **templates** project and prove it works, because the
templates project is a real, runnable SDK app. `scripts/verify-sdk-project.sh` runs
the full pipeline (install → `tailor-sdk generate` → `tsc --noEmit`) and cleans up the
generated artifacts afterward:

```bash
.claude/skills/sdk-sample-sync/scripts/verify-sdk-project.sh \
  <path-to>/templates/docs/build-from-scratch/sdk/step-03
```

When an API choice is ambiguous (two fields both compile, unsure which is real), force
the question with a deliberate type error. The decisive test from last time:

```ts
// In the executor, the wrong payload field leaves the callback param untyped:
requestBody: ({ newRecord }) => ({ ... })  // OK — newRecord is typed
body:        ({ newRecord }) => ({ ... })  // TS7031 'newRecord' implicitly 'any'  → body is NOT the field
```

`TS7031 implicitly has 'any'` on a callback parameter is the tell that a field name is
unrecognized (silently dropped), not validated. Excess-property checks alone won't
catch it. Prefer this kind of probe over assuming.

### 5. Apply to both repos in lockstep

- **templates**: edit the runnable source; re-run `verify-sdk-project.sh` until green.
  Use `git mv` for renames (e.g. `src/pipeline/` → `src/resolver/`) so history is
  preserved. Don't commit generated artifacts (`tailor.d.ts`, `src/generated/`) — they
  aren't tracked.
- **docs**: update the prose code blocks to match the verified source exactly. Also fix
  surrounding prose that describes the API (deploy commands, env var names, field
  explanations) — these rot too. Keep the `[Source code on GitHub]` links pointing at
  the right paths.

### 6. Validate the docs site and open PRs

```bash
pnpm lint && pnpm build      # schema-check, link-check, typo_check run in CI too
```

Branch off `main` in **each** repo (never reuse an unrelated checked-out branch), open
a **draft** PR in each, and cross-link them in the PR descriptions so a reviewer sees
they ship together. Do not push or open PRs until the user has reviewed — confirm
first.

## What to watch for

- **Silent compiles.** The whole reason for step 4. Type-checking green ≠ correct.
  Always sanity-check payload/field names against the bundled service docs.
- **Don't touch `docs/sdk/`.** It's regenerated; edits are lost.
- **Prose, not just code.** Env vars (`WORKSPACE_ID` → `TAILOR_PLATFORM_WORKSPACE_ID`),
  CLI flags, and conceptual names (pipeline → resolver) live in sentences too.
- **Pin vs. `latest`.** Templates `package.json` historically pins an exact version;
  the docs sometimes show `"latest"`. Match the existing convention of each file rather
  than imposing one.
- **CHANGELOG gaps.** Not every breaking change is in the CHANGELOG. The empirical
  pipeline is your safety net for the ones that aren't.

## Bundled resources

- `scripts/verify-sdk-project.sh` — install + generate + typecheck any SDK project dir,
  then clean up untracked generated files. Use it as the verification gate in step 4.
