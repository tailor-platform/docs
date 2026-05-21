# Tailor Platform Documentation

Central docs repo covering technical docs and ERP app building guides.

## Overview

This repository contains the documentation for Tailor Platform, built with VitePress. It includes comprehensive guides for SDK, services, integrations, and platform features.

The documentation is organized into several main sections:

- **Getting Started** - Introduction to Tailor Platform and core concepts
- **SDK** - Platform SDK documentation and CLI reference
- **Guides** - In-depth guides for TailorDB, Auth, Pipeline, Functions, and more
- **References** - API references and legacy tool documentation

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/tailor-platform/docs.git
cd docs
pnpm install
```

## Usage

### Development

Start the development server with hot reload:

```bash
pnpm dev
```

The documentation will be available at `http://localhost:5173`

### Build

Build the documentation for production:

```bash
pnpm build
```

### Preview

Preview the production build locally:

```bash
pnpm preview
```

## Project Structure

```
docs/
├── .vitepress/          # VitePress configuration and theme
│   ├── config.mts       # Site configuration
│   └── theme/           # Custom theme components
│       ├── components/  # Reusable Vue components (Card, Tabs, etc.)
│       └── styles/      # Custom styles
├── docs/                # Documentation content
│   ├── getting-started/ # Getting started guides
│   ├── sdk/             # SDK documentation
│   ├── guides/          # Feature guides
│   └── references/      # API references
└── scripts/             # Utility scripts
```

## Contributing

When adding new documentation:

1. Place markdown files in the appropriate folder under `docs/`
2. Use `overview.md` for section overviews (automatically ranked first in navigation)
3. Follow the existing structure and conventions
4. Use the custom components (Card, CardGrid) for enhanced layouts

## Custom Components

The documentation includes several custom Vue components:

- **`<Card>`** - Display clickable cards with icons and descriptions
- **`<GitHubIcon>`** - GitHub icon component
- **Grid classes** - `.cards`, `.cards-2`, `.cards-3` for responsive card layouts
