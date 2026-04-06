// Changelog domain types, formatDate utility, and a thin wrapper over usePaginatedFilter.
// Filters entries by product; renames generic return keys to domain-specific names.

import { usePaginatedFilter } from './usePaginatedFilter'

export interface ChangelogNarrative {
  summary: string
  impact?: string
  details?: string[]
  migration?: string
}

export interface ChangelogEntry {
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
  entries: ChangelogEntry[]
}

export function formatDate(dateString: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function useChangelog(data: ChangelogData) {
  const { selected: selectedProduct, filtered: filteredEntries, paginated: paginatedEntries, ...rest } =
    usePaginatedFilter<ChangelogEntry>(data.entries, (entry, product) => entry.product === product)

  return { selectedProduct, filteredEntries, paginatedEntries, ...rest }
}
