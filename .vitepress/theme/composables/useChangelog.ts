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
