import { ref, computed, watch } from 'vue'

// Generic filter + pagination for any typed list.
// Resets to page 1 automatically when the selected filter changes.
export function usePaginatedFilter<T>(
  items: T[],
  filterFn: (item: T, selected: string) => boolean,
  itemsPerPage = 10,
) {
  const selected = ref('All')
  const currentPage = ref(1)

  watch(selected, () => {
    currentPage.value = 1
  })

  const filtered = computed(() => {
    if (selected.value === 'All') return items
    return items.filter((item) => filterFn(item, selected.value))
  })

  const paginated = computed(() => filtered.value.slice(0, currentPage.value * itemsPerPage))

  const hasMore = computed(() => paginated.value.length < filtered.value.length)

  const remaining = computed(() => filtered.value.length - paginated.value.length)

  function loadMore() {
    currentPage.value++
  }

  return { selected, filtered, paginated, hasMore, remaining, loadMore }
}
