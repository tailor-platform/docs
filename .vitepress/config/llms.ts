import fs from "node:fs";
import path from "node:path";
import type { DefaultTheme } from "vitepress";
import { toTitle } from "./utils.js";

type Item = DefaultTheme.SidebarItem;

/**
 * vitepress-plugin-llms builds the llms.txt table of contents from sidebar
 * groups (entries with `items`). Two shapes in our generated sidebar fall
 * outside that and end up under a catch-all "Other" heading with no useful
 * section:
 *
 * - links that sit directly under a section, such as the section overview and
 *   the root-level guides, belong to no group
 * - a folder's own index.md is not linked from the group header for that
 *   folder, so the page is in no group at all
 *
 * This returns a copy of the sidebar with the loose links wrapped in a group
 * named after the section, an index link added to each group whose folder has
 * an index.md, and every group renamed "<Section> / <Group>" so headings are
 * unique across sections. It is passed to the plugin only; the website sidebar
 * is rendered from the original config and is untouched.
 */
export function groupSidebarForLlms(docsDir: string) {
  return (sidebar: DefaultTheme.Sidebar | undefined): DefaultTheme.Sidebar | undefined => {
    if (!sidebar || Array.isArray(sidebar)) {
      return sidebar;
    }

    const result: DefaultTheme.SidebarMulti = {};

    for (const [prefix, entry] of Object.entries(sidebar)) {
      const section = prefix.replace(/^\/|\/$/g, "");
      const items = withIndexLink(
        (Array.isArray(entry) ? entry : entry.items).map((item) => addIndexLinks(item, docsDir)),
        `/${section}`,
        toTitle(section),
        docsDir,
      );

      const sectionTitle = toTitle(section);
      const loose = items.filter(isLoose);
      // The plugin flattens each first-level group into its own heading, so
      // "API" under Reference and "API" under AppShell would collide. Prefix
      // with the section so every heading names its area.
      const groups = items
        .filter((item) => !isLoose(item))
        .map((item) => ({ ...item, text: `${sectionTitle} / ${item.text}` }));
      const grouped =
        loose.length === 0 ? groups : [{ text: sectionTitle, items: loose }, ...groups];

      result[prefix] = Array.isArray(entry) ? grouped : { ...entry, items: grouped };
    }

    return result;
  };
}

function isLoose(item: Item): boolean {
  return typeof item.link === "string" && !item.items;
}

// Recursively give every group a link to its folder's index.md, when one exists.
function addIndexLinks(item: Item, docsDir: string): Item {
  if (!item.items) {
    return item;
  }
  const children = item.items.map((child) => addIndexLinks(child, docsDir));
  const dir = inferDir(children);
  return {
    ...item,
    items: dir ? withIndexLink(children, dir, item.text ?? "", docsDir) : children,
  };
}

// Prepend `{ text, link: dir/ }` unless index.md is missing or already linked.
function withIndexLink(items: Item[], dir: string, text: string, docsDir: string): Item[] {
  if (!fs.existsSync(path.join(docsDir, dir, "index.md"))) {
    return items;
  }
  const indexLink = `${dir}/`;
  const alreadyLinked = items.some(
    (item) => typeof item.link === "string" && item.link.replace(/\/$/, "") === dir,
  );
  return alreadyLinked ? items : [{ text, link: indexLink }, ...items];
}

// The folder a group represents: the parent of its first leaf link, or the
// parent of a nested group's folder when it has no leaf links of its own.
function inferDir(items: Item[]): string | undefined {
  for (const item of items) {
    if (typeof item.link === "string" && !item.items) {
      return path.posix.dirname(item.link.replace(/\/$/, ""));
    }
  }
  for (const item of items) {
    if (item.items) {
      const nested = inferDir(item.items);
      if (nested) {
        return path.posix.dirname(nested);
      }
    }
  }
  return undefined;
}
