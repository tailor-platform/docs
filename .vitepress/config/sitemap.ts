import { SiteConfig } from "vitepress";
import fs from "node:fs";
import path from "node:path";

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

// Generate sitemap.xml from all markdown files
export function generateSitemap(config: SiteConfig) {
  const docsDir = path.join(process.cwd(), "docs");
  const siteUrl = "https://docs.tailor.tech"; // Update with your actual domain
  const entries: SitemapEntry[] = [];

  // Recursively find all .md files
  function findMarkdownFiles(dir: string, baseDir: string = ""): void {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      const relativePath = path.join(baseDir, file.name);

      // Skip hidden files and directories
      if (file.name.startsWith(".")) continue;

      // Skip certain directories
      if (file.isDirectory() && ["node_modules", "dist", "cache"].includes(file.name)) {
        continue;
      }

      if (file.isDirectory()) {
        findMarkdownFiles(fullPath, relativePath);
      } else if (file.name.endsWith(".md")) {
        // Convert file path to URL
        let url = relativePath
          .replace(/\.md$/, "")
          .replace(/\\/g, "/")
          .replace(/index$/, "");

        // Clean up the URL
        if (url && !url.startsWith("/")) url = "/" + url;
        if (url.endsWith("/index")) url = url.replace("/index", "/");

        // Get file modification time
        const stats = fs.statSync(fullPath);
        const lastmod = stats.mtime.toISOString().split("T")[0];

        // Determine priority based on path depth
        const depth = url.split("/").filter((p) => p).length;
        const priority = Math.max(0.3, 1.0 - depth * 0.1);

        entries.push({
          url: siteUrl + url,
          lastmod,
          changefreq: depth <= 2 ? "weekly" : "monthly",
          priority: Number(priority.toFixed(1)),
        });
      }
    }
  }

  findMarkdownFiles(docsDir);

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  // Write sitemap to public directory
  const publicDir = path.join(process.cwd(), ".vitepress", "dist"); 
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, "sitemap.xml");
  fs.writeFileSync(sitemapPath, xml);

  console.log(`✓ Generated sitemap with ${entries.length} URLs`);
}
