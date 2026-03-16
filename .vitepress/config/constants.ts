// Define custom ordering for nav dropdowns
export const navItemOrder: Record<string, string[]> = {
  guides: [
    "tailordb",
    "pipeline",
    "stateflow",
    "executor",
    "function",
    "auth",
    "application",
    "events",
  ],
  tutorials: [
    "app-endpoint",
    "resolver",
    "manage-data-schema",
    "setup-auth",
    "setup-executor",
    "develop-from-scratch",
  ],
  sdk: ["quickstart", "cli", "services", "generator"],
  reference: ["api", "platform", "concepts", "infrastructure"],
  "getting-started": ["quickstart", "core-concepts", "console"],
  "app-shell": [
    "index",
    "api",
    "authentication",
    "file-based-routing",
    "module-resource-definition",
    "routing-and-navigation",
    "sidebar-navigation",
    "styles",
    "changelog",
  ],
};

// Navigation groups for organized top-level navigation
export interface NavGroup {
  title: string;
  sections: string[];
  description?: string;
  showSubItems?: boolean; // Whether to show sub-items for sections in this group
}

export const navGroups: Record<string, NavGroup> = {
  start: {
    title: "Start",
    sections: ["getting-started", "tutorials"],
    description: "Get started and learn through tutorials",
  },
  guides: {
    title: "Guides",
    sections: ["guides"],
    description: "Feature guides and tutorials",
    showSubItems: true, // Show sub-folders and files for Guides
  },
  build: {
    title: "Build",
    sections: ["sdk", "app-shell"],
    description: "SDK and UI framework",
  },
  reference: {
    title: "Reference",
    sections: ["reference"],
    description: "API reference and technical docs",
    showSubItems: true, // Show sub-folders for Reference
  },
  administration: {
    title: "Administration",
    sections: ["administration"],
    description: "Account and workspace management",
    showSubItems: true, // Show files in dropdown
  },
};

// Folders to exclude from navigation discovery
export const excludedSections: string[] = ["public"];

// Custom title overrides for sections/folders
export const customTitles: Record<string, string> = {
  "app-shell": "UI Framework",
  // Add more custom titles here as needed
};

// Define custom ordering for sidebar items within sections
// Default order for all sections: overview first, quickstart second, then alphabetical
export const defaultSidebarOrder: string[] = ["overview", "quickstart"];

// Section-specific overrides (only if you need different ordering for a specific section)
export const sidebarItemOrder: Record<string, string[]> = {
  function: ["overview", "builtin-interfaces"],
  "app-shell": [
    "api",
    "authentication",
    "file-based-routing",
    "module-resource-definition",
    "routing-and-navigation",
    "sidebar-navigation",
    "styles",
    "changelog",
  ],
};

// Acronyms mapping for title casing
export const acronyms: Record<string, string> = {
  sdk: "SDK",
  idp: "IdP",
  cli: "CLI",
  api: "API",
  cdc: "CDC",
  id: "ID",
  db: "DB",
  ui: "UI",
  ip: "IP",
  oauth: "OAuth",
  ios: "iOS",
  cel: "CEL",
  js: "JS",
  trn: "TRN",
  csv: "CSV",
  scim: "SCIM",
  spa: "SPA",
};
