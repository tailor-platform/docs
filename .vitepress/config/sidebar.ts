import fs from "node:fs";
import path from "node:path";
import { toTitle, discoverSections } from "./utils.js";
import { sidebarItemOrder, defaultSidebarOrder } from "./constants.js";

export interface SidebarItem {
  text: string;
  link?: string;
  collapsed?: boolean;
  items?: SidebarItem[];
}

// Recursively generate sidebar from directory structure
export function generateSidebar(
  docsDir: string,
  dir: string,
  basePath: string,
  depth: number = 0,
): SidebarItem[] {
  const fullPath = path.join(docsDir, dir);

  if (!fs.existsSync(fullPath)) {
    return [];
  }

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  // Get custom ordering: check current directory name first, then top-level section
  const currentDirName = path.basename(dir);
  const sectionName = dir.split(path.sep)[0];
  const customOrder =
    sidebarItemOrder[currentDirName] || sidebarItemOrder[sectionName] || defaultSidebarOrder;

  // Get markdown files (excluding index.md)
  const files = entries
    .filter(
      (e) =>
        e.isFile() && e.name.endsWith(".md") && e.name !== "index.md" && !e.name.startsWith("."),
    )
    .map((e) => e.name.replace(/\.md$/, ""));

  // Get directories (excluding hidden and assets)
  const dirs = entries
    .filter((e) => e.isDirectory() && !e.name.startsWith(".") && e.name !== "assets")
    .map((e) => e.name);

  // Sort function that respects custom order
  const sortItems = (items: string[]) => {
    return items.sort((a, b) => {
      if (customOrder) {
        const indexA = customOrder.indexOf(a);
        const indexB = customOrder.indexOf(b);

        // If both are in custom order, use that order
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        // If only A is in custom order, it comes first
        if (indexA !== -1) return -1;
        // If only B is in custom order, it comes first
        if (indexB !== -1) return 1;
      }

      // Otherwise, use alphabetical sorting
      return a.localeCompare(b);
    });
  };

  // Sort files and directories separately
  const sortedFiles = sortItems([...files]);
  const sortedDirs = sortItems([...dirs]);

  const items: SidebarItem[] = [];

  // Process files first
  for (const fileName of sortedFiles) {
    items.push({
      text: toTitle(fileName + ".md"),
      link: `${basePath}/${fileName}`,
    });
  }

  // Then process directories
  for (const dirName of sortedDirs) {
    const subdirPath = path.join(dir, dirName);
    const subdirBasePath = `${basePath}/${dirName}`;
    const subItems = generateSidebar(docsDir, subdirPath, subdirBasePath, depth + 1);

    if (subItems.length > 0) {
      items.push({
        text: toTitle(dirName),
        collapsed: depth > 0,
        items: subItems,
      });
    }
  }

  return items;
}

// Generate sidebar for a top-level section
export function generateSectionSidebar(docsDir: string, section: string): SidebarItem[] {
  const items = generateSidebar(docsDir, section, `/${section}`);

  // Check if there's an index.md to add as overview
  const indexPath = path.join(docsDir, section, "index.md");
  if (fs.existsSync(indexPath)) {
    items.unshift({
      text: "Overview",
      link: `/${section}/`,
    });
  }

  return items;
}

// Generate sidebar config for all sections
export function generateAllSidebars(docsDir: string) {
  const sections = discoverSections(docsDir);
  const sidebar: Record<string, SidebarItem[]> = {};

  for (const section of sections) {
    sidebar[`/${section}/`] = generateSectionSidebar(docsDir, section);
  }

  return sidebar;
}
