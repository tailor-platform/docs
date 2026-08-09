# CLAUDE.md

## Project Overview

Tailor Platform documentation site built with **VitePress 1.6.4**. Contains technical docs, SDK guides, and ERP app building guides.

## Quick Commands

- `pnpm dev` — Start dev server (http://localhost:5173)
- `pnpm build` — Production build
- `pnpm preview` — Preview production build
- `pnpm lint` — Lint with oxlint
- `pnpm fmt` — Format with oxfmt

## Project Structure

```
docs/
├── .vitepress/
│   ├── config.mts          # Main VitePress config
│   ├── config/             # Config modules (nav, sidebar, markdown, utils, constants)
│   └── theme/              # Custom theme (components, styles)
├── docs/                   # All documentation content (srcDir)
│   ├── index.md
│   ├── getting-started/
│   ├── sdk/
│   ├── guides/
│   ├── tutorials/
│   ├── reference/
│   └── administration/
├── scripts/                # Utility scripts (mdx-to-md, sdk-sync, validate-schema, etc.)
├── schema.yml              # Schema validation config for docs
├── _typos.toml             # Typo checker config
└── .mdschema.yml           # Markdown schema config
```

## Key Conventions

- **Package manager**: pnpm (v10.28.0)
- **Docs source dir**: `docs/` (configured as `srcDir` in VitePress)
- **Section overviews**: Use `overview.md` — these are automatically ranked first in navigation
- **Navigation & sidebars**: Auto-generated from filesystem in `.vitepress/config/nav.ts` and `sidebar.ts`
- **Custom components**: `<Card>`, `<GitHubIcon>`, grid classes (`.cards`, `.cards-2`, `.cards-3`)
- **Mermaid diagrams**: Supported via `vitepress-plugin-mermaid`
- **Custom containers**: Supported via `markdown-it-container`

## Writing Docs

- Place markdown files in the appropriate folder under `docs/`
- Use frontmatter for metadata
- Internal links should be extensionless (resolved at build time)
- Links inside components (`<Card href="...">`) are emitted verbatim — the VitePress
  build does **not** dead-link-check HTML attributes. Run `pnpm check:links` after
  editing them
- External links are restricted to the `allowed_domains` list in `schema.yml` (add a domain there when linking to a new, trustworthy destination)
- Headings must not skip levels (e.g., h1 -> h3 is invalid), max depth is h4
- Custom words in `_typos.toml` won't be flagged by the typo checker

## CI Checks

GitHub Actions workflows run on PRs (`.github/workflows/pr-checks.yml`):

- **lint** — `pnpm typecheck`, `pnpm lint`, `pnpm fmt:check`, `pnpm check:links`, `pnpm build`
  (the build is also what dead-link-checks markdown links)
- **typo-check** — Catches typos
- **schema-check** — Validates doc structure via mdschema

Separate workflows: **sdk-docs-sync** and **app-shell-sync** sync generated pages.
