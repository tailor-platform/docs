# Contributing

Thank you for your interest in contributing to the Tailor Platform documentation!

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```

## Writing Documentation

- Place markdown files in the appropriate folder under `docs/`
- Use `overview.md` for section overviews (automatically ranked first in navigation)
- Follow the existing structure and conventions
- Use frontmatter for metadata

### Linking

- Internal links should be extensionless (resolved at build time)
- External links are restricted to approved domains listed in `schema.yml`

### Headings

- Do not skip heading levels (e.g., h1 directly to h3 is invalid)
- Maximum heading depth is h4

### Custom Components

- `<Card>` for clickable cards with icons and descriptions
- Grid classes `.cards`, `.cards-2`, `.cards-3` for responsive layouts

## Quality Checks

Before submitting a PR, make sure your changes pass:

```bash
pnpm lint    # Lint with oxlint
pnpm fmt     # Format with oxfmt
pnpm build   # Production build
```

The CI pipeline will also run:

- **Schema validation** on document structure
- **Link checking** on all internal and external links
- **Typo checking** via the project's typo configuration

## Submitting Changes

1. Create a branch for your changes
2. Make your edits and verify locally with `pnpm dev`
3. Run `pnpm lint` and `pnpm build` to catch issues early
4. Open a pull request with a clear description of the changes
