import type { DefaultTheme } from "vitepress";
import fs from "node:fs";
import path from "node:path";
import { toTitle } from "./utils.js";
import { navGroups, navItemOrder, sidebarItemOrder, defaultSidebarOrder } from "./constants.js";

// Generate grouped nav items with organized dropdown structure
export function generateNav(docsDir: string): DefaultTheme.NavItem[] {
  const nav: DefaultTheme.NavItem[] = [{ text: "Home", link: "/" }];

  // Generate grouped navigation
  for (const [, group] of Object.entries(navGroups)) {
    const groupItems: (
      | DefaultTheme.NavItemComponent
      | DefaultTheme.NavItemChildren
      | DefaultTheme.NavItemWithLink
    )[] = [];

    // Process each section in the group
    for (const section of group.sections) {
      const sectionPath = path.join(docsDir, section);

      // Skip if section doesn't exist
      if (!fs.existsSync(sectionPath)) continue;

      // Check if this group should show sub-items
      if (group.showSubItems) {
        // Enumerate and show both sub-folders AND files
        const entries = fs.readdirSync(sectionPath, { withFileTypes: true });

        const subdirs = entries
          .filter((e) => e.isDirectory() && !e.name.startsWith(".") && e.name !== "assets")
          .map((e) => {
            const indexPath = path.join(sectionPath, e.name, "index.md");
            let link = `/${section}/${e.name}/`;

            if (!fs.existsSync(indexPath)) {
              const subFiles = fs
                .readdirSync(path.join(sectionPath, e.name))
                .filter((f) => f.endsWith(".md") && !f.startsWith("."))
                .map((f) => f.replace(/\.md$/, ""));

              // Use sidebarItemOrder, then defaultSidebarOrder, then alphabetical
              const order = sidebarItemOrder[e.name] || defaultSidebarOrder;
              const firstOrdered = order.find((item) => subFiles.includes(item));
              if (firstOrdered) {
                link = `/${section}/${e.name}/${firstOrdered}`;
              } else if (subFiles.length > 0) {
                subFiles.sort();
                link = `/${section}/${e.name}/${subFiles[0]}`;
              }
            }

            return {
              text: toTitle(e.name),
              link: link,
              key: e.name,
            };
          });

        const files = entries
          .filter(
            (e) =>
              e.isFile() &&
              e.name.endsWith(".md") &&
              e.name !== "index.md" &&
              !e.name.startsWith("."),
          )
          .map((e) => ({
            text: toTitle(e.name),
            link: `/${section}/${e.name.replace(/\.md$/, "")}`,
            key: e.name.replace(/\.md$/, ""),
          }));

        const allItems = [...subdirs, ...files];

        // Sort by custom order if defined, otherwise alphabetically
        const order = navItemOrder[section];
        const sortedItems = order
          ? allItems.sort((a, b) => {
              const indexA = order.indexOf(a.key);
              const indexB = order.indexOf(b.key);

              if (indexA !== -1 && indexB !== -1) return indexA - indexB;
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              return a.text.localeCompare(b.text);
            })
          : allItems.sort((a, b) => a.text.localeCompare(b.text));

        // Add sorted items to group (without the key property)
        groupItems.push(...sortedItems.map(({ text, link }) => ({ text, link })));
      } else {
        // Only show section link, no sub-items
        // Check if there's a preferred first page defined in navItemOrder
        let link = `/${section}/`;
        const order = navItemOrder[section];
        if (order && order.length > 0) {
          const firstPage = order[0];
          const firstPagePath = path.join(sectionPath, `${firstPage}.md`);
          // If the first ordered page exists, use it instead of overview
          if (fs.existsSync(firstPagePath)) {
            link = `/${section}/${firstPage}`;
          }
        }

        groupItems.push({
          text: toTitle(section),
          link: link,
        });
      }
    }

    // Add the group to navigation
    nav.push({
      text: group.title,
      items: groupItems,
    });
  }

  return nav;
}
