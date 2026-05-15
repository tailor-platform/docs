import fs from "fs";
import path from "path";

interface SyncConfig {
  src: string;
  dst: string;
  /** Files to remove from destination after copy */
  removeFiles: string[];
  /** Optional extra file copies: [src, dst] pairs */
  extraCopies?: [string, string][];
  label: string;
}

const ROOT = process.cwd();
const DOCS_ROOT = path.resolve(ROOT, "../../docs");

const configs: Record<string, SyncConfig> = {
  sdk: {
    src: path.resolve(ROOT, "../../../sdk/packages/sdk/docs"),
    dst: path.resolve(ROOT, "../../docs/sdk"),
    removeFiles: ["README.md"],
    label: "SDK",
  },
  "app-shell": {
    src: path.resolve(ROOT, "../../../app-shell/docs"),
    dst: path.resolve(ROOT, "../../docs/app-shell"),
    removeFiles: ["README.md", "development.md"],
    extraCopies: [
      [
        path.resolve(ROOT, "../../../app-shell/packages/core/CHANGELOG.md"),
        path.resolve(ROOT, "../../docs/app-shell/changelog.md"),
      ],
    ],
    label: "App Shell",
  },
};

const configName = process.argv[2];
if (!configName || !configs[configName]) {
  console.error(`Usage: npm start -- <${Object.keys(configs).join("|")}>`);
  process.exit(1);
}

const config = configs[configName];

function walk(dir: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// Allowed external domains (must match schema.yml)
const ALLOWED_DOMAINS = [
  "github.com",
  "tailor.tech",
  "localhost",
  "127.0.0.1",
  "registry.terraform.io",
  "en.wikipedia.org",
  "vitest.dev",
  "unicode.org",
  "ibm.com",
  "iana.org",
  "auth0.com",
  "brew.sh",
  "ietf.org",
  "nodejs.org",
  "graphql.org",
  "hashicorp.com",
  "buf.build",
  "slack.com",
  "microsoft.com",
  "google.com",
  "intuit.com",
  "openid.net",
  "shipstation.com",
  "loopreturns.com",
  "zapier.com",
  "pipedream.com",
  "aquaproj.github.io",
];

function fixHeadingLevels(content: string): string {
  const lines = content.split("\n");
  let lastLevel = 0;

  return lines
    .map((line) => {
      const match = line.match(/^(#{1,6})\s/);
      if (match) {
        let currentLevel = match[1].length;
        if (lastLevel > 0 && currentLevel > lastLevel + 1) {
          currentLevel = lastLevel + 1;
          line = "#".repeat(currentLevel) + line.slice(match[1].length);
        }
        lastLevel = currentLevel;
      }
      return line;
    })
    .join("\n");
}

function stripNonAllowedLinks(content: string): string {
  return content.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (match, text, url) => {
    try {
      const hostname = new URL(url).hostname;
      const isAllowed = ALLOWED_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`));
      return isAllowed ? match : text;
    } catch {
      return match;
    }
  });
}

// 1. Backup index.md
const indexBackupPath = path.join(config.dst, "index.md");
const indexBackup = fs.existsSync(indexBackupPath)
  ? fs.readFileSync(indexBackupPath, "utf8")
  : null;

// 2. Clean and copy
fs.rmSync(config.dst, { recursive: true, force: true });
fs.mkdirSync(config.dst, { recursive: true });
fs.cpSync(config.src, config.dst, { recursive: true });

// 3. Remove unwanted files
for (const file of config.removeFiles) {
  fs.rmSync(path.join(config.dst, file), { force: true });
}

// 4. Restore index.md (skip for app-shell as we'll use introduction.md)
if (indexBackup && configName !== "app-shell") {
  fs.writeFileSync(indexBackupPath, indexBackup, "utf8");
}

// 5. Extra copies (e.g. CHANGELOG)
for (const [src, dst] of config.extraCopies ?? []) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`Copied ${path.basename(src)} to ${dst}`);
  } else {
    console.warn(`${path.basename(src)} not found at: ${src}`);
  }
}

// 6. Post-process markdown files
walk(config.dst)
  .filter((f) => f.endsWith(".md"))
  .forEach((f) => {
    let content = fs.readFileSync(f, "utf8");
    content = content.replace(/\(https:\/\/docs\.tailor\.tech(\/[^)]*)\)/g, (_: string, urlPath: string) => {
      const hasIndex = fs.existsSync(path.join(DOCS_ROOT, urlPath, "index.md"));
      return hasIndex ? `(${urlPath}/)` : `(${urlPath})`;
    });
    content = content.replace(/\(\.\//g, "(");
    content = content.replace(/\/index\.md\)/g, "/)");
    content = content.replace(/\.md\)/g, ")");
    content = fixHeadingLevels(content);
    content = stripNonAllowedLinks(content);
    fs.writeFileSync(f, content);
  });

// 7. For app-shell: rename introduction.md to index.md
if (configName === "app-shell") {
  const introPath = path.join(config.dst, "introduction.md");
  const indexPath = path.join(config.dst, "index.md");

  if (fs.existsSync(introPath)) {
    fs.renameSync(introPath, indexPath);
    console.log("Renamed introduction.md to index.md");
  } else {
    console.warn("introduction.md not found, skipping rename");
  }
}

console.log(`${config.label} docs synced`);
