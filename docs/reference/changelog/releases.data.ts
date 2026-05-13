import { createMarkdownRenderer } from 'vitepress'
import type { ChangelogData, ChangelogItem } from '../../../.vitepress/theme/composables/useChangelog'

const md = await createMarkdownRenderer(process.cwd())

declare const data: ChangelogData
export { data }

const ENDPOINT = 'https://changelog-lu2nvur63d.erp.dev/query'

const PAGE_SIZE = 100

const QUERY = (first: number, after: string | null) => `
  query {
    releases(first: ${first}${after ? `, after: "${after}"` : ''}) {
      edges {
        node {
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
          createdAt
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
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
    bodyHtml: md.render(item.body as string),
    breaking: item.breaking as boolean,
    narrative: item.narrativeSummary != null ? {
      summary: item.narrativeSummary as string,
      impact: item.narrativeImpact as string | undefined,
      details: item.narrativeDetails as string[] | undefined,
      migration: item.narrativeMigration as string | null,
    } : null,
    createdAt: item.createdAt as string,
    updatedAt: item.updatedAt as string | undefined,
  }
}

async function fetchPage(after: string | null): Promise<{ edges: { node: Record<string, unknown> }[]; pageInfo: { hasNextPage: boolean; endCursor: string } }> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY(PAGE_SIZE, after) }),
  })
  const json = await res.json() as {
    data?: { releases: { edges: { node: Record<string, unknown> }[]; pageInfo: { hasNextPage: boolean; endCursor: string } } }
    errors?: { message: string }[]
  }
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data!.releases
}

export default {
  async load(): Promise<ChangelogData> {
    const allItems: Record<string, unknown>[] = []
    let cursor: string | null = null
    while (true) {
      const { edges, pageInfo } = await fetchPage(cursor)
      allItems.push(...edges.map((e) => e.node))
      if (!pageInfo.hasNextPage) break
      cursor = pageInfo.endCursor
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
