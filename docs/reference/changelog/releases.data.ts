import type { ChangelogData, ChangelogItem } from '../../../.vitepress/theme/composables/useChangelog'

declare const data: ChangelogData
export { data }

const ENDPOINT = 'https://changelog-3jsbo08al2.erp.dev/query'

const PAGE_SIZE = 100

const QUERY = (limit: number, offset: number) => `
  query {
    listApprovedReleases(limit: ${limit}, offset: ${offset}) {
      items {
        id
        productType
        version
        versionType
        title
        releaseDate
        githubUrl
        body
        breaking
        narrativeSummary
        narrativeImpact
        narrativeDetails
        narrativeMigration
        status
        createdAt
        updatedAt
      }
      hasNextPage
    }
  }
`

function mapItem(item: Record<string, unknown>): ChangelogItem {
  return {
    id: item.id as string,
    product: item.productType === 'PlatformCore' ? 'Platform Core' : item.productType as string,
    version: item.version as string,
    versionType: item.versionType as ChangelogItem['versionType'],
    title: item.title as string,
    date: String(item.releaseDate).split('T')[0],
    githubUrl: item.githubUrl as string,
    body: item.body as string,
    breaking: item.breaking as boolean,
    narrative: {
      summary: item.narrativeSummary as string,
      impact: item.narrativeImpact as string,
      details: item.narrativeDetails as string[],
      migration: item.narrativeMigration as string | null,
    },
    status: item.status as string,
    createdAt: item.createdAt as string,
    updatedAt: item.updatedAt as string | undefined,
  }
}

async function fetchPage(offset: number): Promise<{ items: Record<string, unknown>[]; hasNextPage: boolean }> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY(PAGE_SIZE, offset) }),
  })
  const json = await res.json() as {
    data?: { listApprovedReleases: { items: Record<string, unknown>[]; hasNextPage: boolean } }
    errors?: { message: string }[]
  }
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data!.listApprovedReleases
}

export default {
  async load(): Promise<ChangelogData> {
    const allItems: Record<string, unknown>[] = []
    let offset = 0
    while (true) {
      const { items, hasNextPage } = await fetchPage(offset)
      allItems.push(...items)
      if (!hasNextPage) break
      offset += PAGE_SIZE
    }
    const entries = allItems
      .map(mapItem)
      .sort((a, b) => b.date.localeCompare(a.date))
    return {
      lastUpdated: new Date().toISOString(),
      entries,
    }
  },
}
