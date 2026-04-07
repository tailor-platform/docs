import { ref, computed, watch } from 'vue'

export interface ChangelogNarrative {
  summary: string
  impact?: string
  details?: string[]
  migration?: string | null
}

export interface ChangelogItem {
  id: string
  date: string
  product: string
  version?: string
  versionType?: 'major' | 'minor' | 'patch'
  title: string
  breaking?: boolean
  githubUrl?: string
  bodyHtml?: string
  tags?: string[]
  narrative?: ChangelogNarrative
}

export interface ChangelogData {
  lastUpdated: string
  entries: ChangelogItem[]
}

// Products shown in the UI — Platform Core is intentionally excluded
const VISIBLE_PRODUCTS = ['SDK', 'AppShell'] as const

export const PRODUCTS = ['All', ...VISIBLE_PRODUCTS]

export function formatDate(dateString: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function useChangelog(data: ChangelogData) {
  const selectedProduct = ref('All')
  const currentPage = ref(1)
  const itemsPerPage = 10

  watch(selectedProduct, () => {
    currentPage.value = 1
  })

  // Only surface entries for visible products
  const visibleEntries = data.entries.filter((e) =>
    (VISIBLE_PRODUCTS as readonly string[]).includes(e.product),
  )

  const filteredEntries = computed(() =>
    selectedProduct.value === 'All'
      ? visibleEntries
      : visibleEntries.filter((e) => e.product === selectedProduct.value),
  )

  const paginatedEntries = computed(() =>
    filteredEntries.value.slice(0, currentPage.value * itemsPerPage),
  )

  const hasMore = computed(() => paginatedEntries.value.length < filteredEntries.value.length)

  const remaining = computed(() => filteredEntries.value.length - paginatedEntries.value.length)

  const productCounts = computed(() => {
    const counts: Record<string, number> = { All: visibleEntries.length }
    for (const entry of visibleEntries) {
      counts[entry.product] = (counts[entry.product] ?? 0) + 1
    }
    return counts
  })

  function loadMore() {
    currentPage.value++
  }

  return {
    selectedProduct,
    filteredEntries,
    paginatedEntries,
    hasMore,
    remaining,
    loadMore,
    productCounts,
  }
}
