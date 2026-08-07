#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { globby } from "globby";
import { redirectMap, shouldRedirect } from "../.vitepress/config/redirects.ts";

/**
 * Validate internal links that VitePress cannot check itself.
 *
 * `vitepress build` resolves and dead-link-checks markdown links, but it never
 * looks inside raw HTML/component attributes. That blind spot shipped a
 * homepage where 10 of 17 <Card href="..."> links were broken (#198), so the
 * href attributes are checked here instead.
 *
 * Usage: node scripts/check-links.mts
 */

const DOCS_DIR = "docs";

// Resolve a site-absolute URL path to the markdown file it is built from.
function resolveToFile(urlPath: string): string | null {
  const withoutFragment = urlPath.split(/[?#]/)[0];
  const rel = decodeURIComponent(withoutFragment)
    .replace(/^\//, "")
    .replace(/\.html$/, "");

  const candidates =
    rel === "" || rel.endsWith("/") ? [`${rel}index.md`] : [`${rel}.md`, `${rel}/index.md`];

  for (const candidate of candidates) {
    const file = path.join(DOCS_DIR, candidate);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

// Fenced code blocks contain example markup, not real links.
function stripCodeFences(source: string): string {
  return source.replace(/^```[\s\S]*?^```/gm, "");
}

type Problem = { where: string; link: string; detail: string };
const problems: Problem[] = [];

const files = await globby([`${DOCS_DIR}/**/*.md`], { gitignore: true });
let hrefCount = 0;

for (const file of files) {
  const source = stripCodeFences(fs.readFileSync(file, "utf8"));

  for (const match of source.matchAll(/href="(\/[^"]*)"/g)) {
    const link = match[1];
    hrefCount++;

    if (!resolveToFile(link)) {
      problems.push({ where: file, link, detail: "no page builds at this path" });
      continue;
    }

    // The redirect layer only runs on 404s, so a link to a page that exists must
    // never be rewritten. If this fires, the redirect rules have regressed into
    // hijacking live pages.
    const hijackedTo = shouldRedirect(link);
    if (hijackedTo) {
      problems.push({ where: file, link, detail: `redirect rules hijack this to ${hijackedTo}` });
    }
  }
}

// A redirect pointing at a missing page just trades one 404 for another.
for (const [from, to] of Object.entries(redirectMap)) {
  if (!resolveToFile(to)) {
    problems.push({
      where: ".vitepress/config/redirects.ts",
      link: `${from} -> ${to}`,
      detail: "redirect target does not exist",
    });
  }
}

console.log(
  `Checked ${hrefCount} component href link(s) across ${files.length} file(s) ` +
    `and ${Object.keys(redirectMap).length} redirect target(s).\n`,
);

if (problems.length > 0) {
  for (const { where, link, detail } of problems) {
    console.error(`❌ ${where}\n   ${link}\n   ${detail}\n`);
  }
  console.error(`❌ ${problems.length} broken internal link(s)`);
  process.exit(1);
}

console.log("✅ All internal component links and redirect targets resolve");
