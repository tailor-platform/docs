import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import Card from "./components/Card.vue";
import GitHubIcon from "./components/icons/GitHubIcon.vue";
import Tag from "./components/Tag.vue";
import DeprecatedTag from "./components/DeprecatedTag.vue";
import PreviewTag from "./components/PreviewTag.vue";
import ReactDemo from "./components/ReactDemo.vue";

// Tailor brand theme styles (order matters!)
import "./styles/vars.css"; // Brand colors & CSS variables (must be first)
import "./styles/typography.css"; // Font scale & prose styles
import "./styles/code.css"; // Syntax highlighting
import "./styles/tables.css"; // Table styling

// Component-specific styles
import "./styles/cards.css";
import "./styles/tabs.css";
import "./styles/search.css";
import "./styles/demo.css";

import { onMounted } from "vue";

const theme: Theme = {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("Card", Card);
    app.component("GitHubIcon", GitHubIcon);
    app.component("Tag", Tag);
    app.component("DeprecatedTag", DeprecatedTag);
    app.component("PreviewTag", PreviewTag);
    app.component("ReactDemo", ReactDemo);
  },
  setup() {
    onMounted(() => {
      document.addEventListener("click", (e) => {
        const btn = (e.target as HTMLElement).closest(".vp-tab-btn");
        if (!btn) return;

        const clickedLabel = (btn as HTMLElement).dataset.label;
        if (!clickedLabel) return;

        // Sync all tabs with the same label across all tab groups
        document.querySelectorAll(".vp-tabs").forEach((tabGroup) => {
          const matchingBtn = tabGroup.querySelector(`.vp-tab-btn[data-label="${clickedLabel}"]`);
          if (!matchingBtn) return;

          const tabId = (matchingBtn as HTMLElement).dataset.tab;

          // Deactivate all tabs in this group
          tabGroup.querySelectorAll(".vp-tab-btn").forEach((b) => b.classList.remove("active"));
          tabGroup.querySelectorAll(".vp-tab-panel").forEach((p) => p.classList.remove("active"));

          // Activate matching tab
          matchingBtn.classList.add("active");
          const panel = tabGroup.querySelector(`.vp-tab-panel[data-tab="${tabId}"]`);
          if (panel) panel.classList.add("active");
        });
      });
    });
  },
};

export default theme;
