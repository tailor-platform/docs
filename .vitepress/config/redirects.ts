// Redirect mappings from Next.js (tailor-web/apps/docs) to VitePress
// Generated based on comparison of old and new structures

export const redirectMap: Record<string, string> = {
  // ============================================
  // tailor-sdk → sdk (MAIN MIGRATION PATTERN)
  // ============================================
  "/tailor-sdk": "/sdk/",
  "/tailor-sdk/": "/sdk/",
  "/tailor-sdk/quickstart": "/sdk/quickstart",
  "/tailor-sdk/configuration": "/sdk/configuration",
  "/tailor-sdk/testing": "/sdk/testing",
  "/tailor-sdk/cli-reference": "/sdk/cli-reference",

  // CLI pages
  "/tailor-sdk/cli/application": "/sdk/cli/application",
  "/tailor-sdk/cli/auth": "/sdk/cli/auth",
  "/tailor-sdk/cli/completion": "/sdk/cli/completion",
  "/tailor-sdk/cli/executor": "/sdk/cli/executor",
  "/tailor-sdk/cli/function": "/sdk/cli/function",
  "/tailor-sdk/cli/secret": "/sdk/cli/secret",
  "/tailor-sdk/cli/staticwebsite": "/sdk/cli/staticwebsite",
  "/tailor-sdk/cli/tailordb": "/sdk/cli/tailordb",
  "/tailor-sdk/cli/user": "/sdk/cli/user",
  "/tailor-sdk/cli/workflow": "/sdk/cli/workflow",
  "/tailor-sdk/cli/workspace": "/sdk/cli/workspace",

  // Services
  "/tailor-sdk/services": "/sdk/services/",
  "/tailor-sdk/services/auth": "/sdk/services/auth",
  "/tailor-sdk/services/executor": "/sdk/services/executor",
  "/tailor-sdk/services/idp": "/sdk/services/idp",
  "/tailor-sdk/services/resolver": "/sdk/services/resolver",
  "/tailor-sdk/services/secret": "/sdk/services/secret",
  "/tailor-sdk/services/staticwebsite": "/sdk/services/staticwebsite",
  "/tailor-sdk/services/tailordb": "/sdk/services/tailordb",
  "/tailor-sdk/services/workflow": "/sdk/services/workflow",

  // Generator
  "/tailor-sdk/generator": "/sdk/generator/",
  "/tailor-sdk/generator/builtin": "/sdk/generator/builtin",
  "/tailor-sdk/generator/custom": "/sdk/generator/custom",
  "/tailor-sdk/generator/index-file": "/sdk/generator/index",

  // Plugin
  "/tailor-sdk/plugin": "/sdk/plugin/",
  "/tailor-sdk/plugin/custom": "/sdk/plugin/custom",
  "/tailor-sdk/plugin/index-file": "/sdk/plugin/index",

  // ============================================
  // tailorctl → DEPRECATED (redirect to SDK)
  // ============================================
  "/tailorctl": "/sdk/",
  "/tailorctl/": "/sdk/",
  "/tailorctl/auth": "/sdk/cli/auth",
  "/tailorctl/auth/login": "/sdk/cli/auth",
  "/tailorctl/auth/logout": "/sdk/cli/auth",
  "/tailorctl/auth/get": "/sdk/cli/auth",
  "/tailorctl/auth/machineuser": "/sdk/cli/auth",
  "/tailorctl/auth/machineuser_get": "/sdk/cli/auth",
  "/tailorctl/auth/machineuser_list": "/sdk/cli/auth",
  "/tailorctl/auth/pat": "/sdk/cli/auth",
  "/tailorctl/auth/pat_create": "/sdk/cli/auth",
  "/tailorctl/auth/pat_delete": "/sdk/cli/auth",
  "/tailorctl/auth/pat_list": "/sdk/cli/auth",
  "/tailorctl/config": "/sdk/configuration",
  "/tailorctl/config/delete": "/sdk/configuration",
  "/tailorctl/config/describe": "/sdk/configuration",
  "/tailorctl/config/list": "/sdk/configuration",
  "/tailorctl/config/set": "/sdk/configuration",
  "/tailorctl/config/switch": "/sdk/configuration",
  "/tailorctl/workspace": "/sdk/cli/workspace",
  "/tailorctl/workspace/create": "/sdk/cli/workspace",
  "/tailorctl/workspace/list": "/sdk/cli/workspace",
  "/tailorctl/workspace/machineuser_list": "/sdk/cli/workspace",

  // ============================================
  // Getting Started (minor changes)
  // ============================================
  "/getting-started/quickstart/cue": "/getting-started/quickstart",
  "/getting-started/quickstart/terraform": "/getting-started/quickstart",
  "/getting-started/cue": "/getting-started/",
  "/getting-started/overview": "/getting-started/",

  // ============================================
  // Tutorials base-template → develop-from-scratch
  // ============================================
  "/tutorials/base-template": "/tutorials/develop-from-scratch/",
  "/tutorials/base-template/cue": "/tutorials/develop-from-scratch/",
  "/tutorials/base-template/sdk": "/tutorials/develop-from-scratch/",
  "/tutorials/base-template/terraform": "/tutorials/develop-from-scratch/",

  // ============================================
  // Root pages that moved to /reference
  // ============================================
  "/security": "/reference/security",

  // ============================================
  // Common variations with /docs prefix
  // ============================================
  "/docs/tailor-sdk": "/sdk/",
  "/docs/tailor-sdk/": "/sdk/",
  "/docs/getting-started": "/getting-started/",
  "/docs/guides": "/guides/",
  "/docs/tutorials": "/tutorials/",
  "/docs/reference": "/reference/",
  "/docs/sdk": "/sdk/",
  "/docs/administration": "/administration/",
  "/docs/security": "/reference/security",

  // ============================================
  // Index pages → overview pages
  // ============================================
  "/guides/auth/index": "/guides/auth/overview",
  "/guides/executor/index": "/guides/executor/overview",
  "/guides/function/index": "/guides/function/overview",
  "/guides/tailordb/index": "/guides/tailordb/overview",
  "/guides/workflow/index": "/guides/workflow/overview",
  "/guides/integration/index": "/guides/integration/overview",
};

// Fuzzy match redirects - tries to find similar pages
export function findBestMatch(path: string): string | null {
  // Remove trailing slashes and normalize
  const normalizedPath = path.replace(/\/$/, "").toLowerCase();

  // Direct match
  if (redirectMap[normalizedPath]) {
    return redirectMap[normalizedPath];
  }

  // Try with /docs prefix removed (common Next.js → VitePress migration)
  if (normalizedPath.startsWith("/docs/")) {
    const withoutDocs = normalizedPath.replace("/docs/", "/");
    if (redirectMap[withoutDocs]) {
      return redirectMap[withoutDocs];
    }
    // If no redirect map, try the path without /docs directly
    return withoutDocs;
  }

  // Try tailor-sdk → sdk conversion
  if (normalizedPath.includes("/tailor-sdk/")) {
    const converted = normalizedPath.replace("/tailor-sdk/", "/sdk/");
    // Check if this new path might exist
    return converted;
  }

  // Try fuzzy matching based on path segments
  const segments = normalizedPath.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  // Look for pages with the same last segment in redirect map
  for (const [oldPath, newPath] of Object.entries(redirectMap)) {
    if (oldPath.endsWith("/" + lastSegment) && newPath) {
      return newPath;
    }
  }

  // No match found
  return null;
}

// Check if a path should redirect
export function shouldRedirect(path: string): string | null {
  const match = findBestMatch(path);
  if (match && match !== path) {
    return match;
  }
  return null;
}
