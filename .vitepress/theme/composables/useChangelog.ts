import { ref, computed, watch, type Ref } from "vue";

export interface ChangelogNarrative {
  summary: string;
  impact?: string;
  details?: string[];
  migration?: string | null;
}

export interface ChangelogItem {
  id: string;
  date: string;
  product: string;
  version: string;
  versionType: "major" | "minor" | "patch";
  title: string;
  breaking: boolean;
  githubUrl: string;
  narrative: ChangelogNarrative | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ChangelogData {
  lastUpdated: string;
  entries: ChangelogItem[];
}

// Products shown in the UI — Platform Core is intentionally excluded
const VISIBLE_PRODUCTS = ["SDK", "AppShell"] as const;

export const PRODUCTS = ["All", ...VISIBLE_PRODUCTS];

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Renders plain-text narrative prose (as delivered by the changelog API) to safe HTML:
 * escapes markup, turns `backtick` spans into <code>, and links bare URLs.
 */
export function formatNarrativeHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return escaped
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(
      /(https?:\/\/[^\s<]+?)([.,;:)]*)(?=\s|$|<)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>$2',
    );
}

/**
 * Splits a migration paragraph into list items. Prefers explicit "(1) … (2) …"
 * markers; otherwise falls back to sentence boundaries. Returns any text that
 * precedes the first numbered marker as `intro`.
 */
export function splitNarrativeItems(text: string): { intro: string; items: string[] } {
  const trimmed = text.trim();
  const numbered = trimmed.split(/\s*\(\d+\)\s+/);
  if (numbered.length > 2) {
    const [intro, ...items] = numbered;
    return { intro: intro.trim(), items: items.map((i) => i.trim()).filter(Boolean) };
  }
  const sentences = trimmed
    .split(/(?<=[.!?])\s+(?=[A-Z`(])/)
    .map((i) => i.trim())
    .filter(Boolean);
  return { intro: "", items: sentences };
}

export function useChangelog(data: Ref<ChangelogData | null>) {
  const selectedProduct = ref("All");
  const currentPage = ref(1);
  const itemsPerPage = 20;

  watch(selectedProduct, () => {
    currentPage.value = 1;
  });

  const visibleEntries = computed(() =>
    (data.value?.entries ?? []).filter((e) =>
      (VISIBLE_PRODUCTS as readonly string[]).includes(e.product),
    ),
  );

  const filteredEntries = computed(() =>
    selectedProduct.value === "All"
      ? visibleEntries.value
      : visibleEntries.value.filter((e) => e.product === selectedProduct.value),
  );

  const paginatedEntries = computed(() =>
    filteredEntries.value.slice(0, currentPage.value * itemsPerPage),
  );

  const hasMore = computed(() => paginatedEntries.value.length < filteredEntries.value.length);

  const remaining = computed(() => filteredEntries.value.length - paginatedEntries.value.length);

  const productCounts = computed(() => {
    const counts: Record<string, number> = { All: visibleEntries.value.length };
    for (const entry of visibleEntries.value) {
      counts[entry.product] = (counts[entry.product] ?? 0) + 1;
    }
    return counts;
  });

  function loadMore() {
    currentPage.value++;
  }

  return {
    selectedProduct,
    filteredEntries,
    paginatedEntries,
    hasMore,
    remaining,
    loadMore,
    productCounts,
  };
}
