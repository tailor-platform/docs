import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import path from "node:path";
import { generateNav } from "./config/nav.js";
import { generateAllSidebars } from "./config/sidebar.js";
import { configureMarkdown } from "./config/markdown.js";
import { generateSitemap } from "./config/sitemap.js";
import llmstxt from "vitepress-plugin-llms";

const docsDir = path.join(process.cwd(), "docs");

export default withMermaid(
  defineConfig({
    title: "Tailor",
    description: "Platform Documentation",
    base: "/",
    srcDir: "docs",
    ignoreDeadLinks: [
      // Ignore localhost URLs used in examples
      /^http:\/\/localhost/,
    ],

    head: [
      ["link", { rel: "icon", href: "/favicon.png" }],
      ["meta", { name: "theme-color", content: "#6366f1" }],
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:locale", content: "en" }],
      ["meta", { property: "og:site_name", content: "Tailor Platform Documentation" }],
      ["meta", { name: "robots", content: "index,follow" }],
    ],

    // Generate sitemap on build
    buildEnd: async (config) => {
      generateSitemap(config);
    },

    vite: {
      optimizeDeps: {
        include: ["mermaid"],
      },
      plugins: [
        llmstxt({
          domain: "https://docs.tailor.tech",
          title: "Tailor Platform Documentation",
          description:
            "Tailor is a headless ERP platform. These docs cover the SDK, AppShell UI framework, platform services (TailorDB, Pipeline, StateFlow, Executor, Auth), and administration.",
          injectLLMHint: false,
        }),
      ],
    },

    themeConfig: {
      logo: {
        light: "/logo-light.svg",
        dark: "/logo-dark.svg",
      },
      siteTitle: false,

      nav: generateNav(docsDir),
      sidebar: generateAllSidebars(docsDir),

      socialLinks: [
        {
          icon: "github",
          link: "https://github.com/tailor-platform/docs",
        },
      ],

      search: {
        provider: "local",
        options: {
          detailedView: true,
          miniSearch: {
            options: {
              tokenize: (text) => text.split(/[\s\-._/]+/),
            },
            searchOptions: {
              fuzzy: 0.2,
              prefix: true,
              boost: { title: 4, headers: 2 },
            },
          },
        },
      },

      outline: {
        level: [2, 3],
      },

      editLink: {
        pattern: "https://github.com/tailor-platform/docs/edit/main/docs/:path",
        text: "Edit this page on GitHub",
      },
    },

    mermaid: {
      // Mermaid configuration options
    },

    mermaidPlugin: {
      class: "mermaid",
    },

    markdown: {
      config: configureMarkdown,
    },
  }),
);
