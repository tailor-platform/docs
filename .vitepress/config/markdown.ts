import container from "markdown-it-container";
import type MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";
import type { Options } from "markdown-it";

export function configureMarkdown(md: MarkdownIt) {
  // Transform <!-- demo: name --> HTML comments into <ReactDemo> Vue components
  const defaultHtmlBlockRenderer = md.renderer.rules.html_block ||
    function (tokens: Token[], idx: number) { return tokens[idx].content; };

  md.renderer.rules.html_block = (tokens, idx, options, env, self) => {
    const content = tokens[idx].content.trim();
    const match = content.match(/^<!--\s*demo:\s*(\S+)\s*-->$/);
    if (match) {
      const demoName = match[1];
      return `<ReactDemo name="${demoName}" />\n`;
    }
    return defaultHtmlBlockRenderer(tokens, idx, options, env, self);
  };

  md.use(container, "tabs", {
    render(
      tokens: Token[],
      idx: number,
      _options: Options,
      env: { frontmatter?: Record<string, unknown> },
    ) {
      const token = tokens[idx];

      // opening :::tabs [groupName]
      if (token.nesting === 1) {
        const groupName = token.info.trim().split(/\s+/)[1]; // Get group name after 'tabs'

        if (!groupName) {
          return '<div class="warning">Tab group name required: :::tabs groupName</div>';
        }

        const tabGroups = env.frontmatter?.tabs as
          | Record<string, { label: string; content: string }[]>
          | undefined;
        if (!tabGroups || typeof tabGroups !== "object") {
          return `<div class="warning">No tab groups defined in frontmatter</div>`;
        }

        const tabs = tabGroups[groupName];
        if (!tabs || !Array.isArray(tabs)) {
          return `<div class="warning">Tab group "${groupName}" not found in frontmatter</div>`;
        }

        return `
          <div class="vp-tabs">
            <div class="vp-tabs-nav">
              ${tabs
                .map(
                  (tab, i) =>
                    `<button class="vp-tab-btn${i === 0 ? " active" : ""}" data-tab="${groupName}-${i}" data-label="${tab.label}">${tab.label}</button>`,
                )
                .join("")}
            </div>
            <div class="vp-tabs-content">
              ${tabs
                .map(
                  (tab, i) =>
                    `<div class="vp-tab-panel${i === 0 ? " active" : ""}" data-tab="${groupName}-${i}" data-label="${tab.label}">
                      ${md.render(tab.content)}
                    </div>`,
                )
                .join("")}
            </div>
          </div>`;
      }

      // closing :::tabs
      return "";
    },
  });
}
