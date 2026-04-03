import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import path from "node:path";
import { generateNav } from "./config/nav.js";
import { generateAllSidebars } from "./config/sidebar.js";
import { configureMarkdown } from "./config/markdown.js";

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

    head: [["link", { rel: "icon", href: "/favicon.png" }]],

    vite: {
      optimizeDeps: {
        include: ["mermaid"],
      },
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
