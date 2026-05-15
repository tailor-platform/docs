<template>
  <div class="changelog-container">
    <div v-if="loading" class="changelog-loading">
      Loading changelog…
    </div>

    <div v-else-if="error" class="changelog-error">
      Failed to load changelog: {{ error }}
    </div>

    <template v-else>
      <FilterTabs v-model="selectedProduct" :options="PRODUCTS" :counts="productCounts" />

      <div v-if="paginatedEntries.length > 0">
        <div
          v-for="entry in paginatedEntries"
          :key="entry.id"
          class="release-card"
          :id="anchorId(entry.id)"
        >
          <div class="release-card-header">
            <div class="release-card-meta">
              <span class="entry-date">{{ formatDate(entry.date) }}</span>
              <template v-if="entry.product !== 'Platform Core'">
                <span class="entry-separator">•</span>
                <a :href="entry.githubUrl" target="_blank" rel="noopener" class="entry-github-link">
                  View on GitHub →
                </a>
              </template>
            </div>
            <div class="release-card-badges">
              <span class="product-badge" :data-product="entry.product.toLowerCase().replace(/\s+/g, '-')">
                {{ entry.product }}
              </span>
              <span v-if="entry.product !== 'Platform Core'" class="version-badge" :data-type="entry.versionType">
                v{{ extractVersion(entry.version) }}
              </span>
              <span v-if="entry.breaking" class="breaking-badge">⚠️ Breaking</span>
            </div>
          </div>

          <h3 class="entry-title">{{ entry.title }}</h3>

          <div v-if="entry.narrative" class="entry-narrative">
            <div class="narrative-summary">
              <strong>What's new:</strong> {{ entry.narrative.summary }}
            </div>
            <div v-if="entry.narrative.impact" class="narrative-impact">
              <strong>Impact:</strong> {{ entry.narrative.impact }}
            </div>
            <div v-if="entry.narrative.details?.length" class="narrative-details">
              <strong>Key changes:</strong>
              <ul>
                <li v-for="(detail, i) in entry.narrative.details" :key="i">{{ detail }}</li>
              </ul>
            </div>
            <div v-if="entry.narrative.migration" class="narrative-migration">
              <strong>⚠️ Migration required:</strong>
              <div v-html="entry.narrative.migration" />
            </div>
            <div v-if="entry.githubUrl" class="narrative-full-notes">
              <a :href="entry.githubUrl" target="_blank" rel="noopener">Full release notes →</a>
            </div>
          </div>

        </div>
      </div>

      <div v-else class="empty-state">
        <p>No releases found for {{ selectedProduct }}.</p>
      </div>

      <div v-if="hasMore" class="load-more">
        <button class="load-more-btn" @click="loadMore">
          Load More <span class="remaining">({{ remaining }} remaining)</span>
        </button>
      </div>

      <div class="changelog-footer">
        <p class="stats">
          Showing {{ paginatedEntries.length }} of {{ filteredEntries.length }} releases
          <span v-if="selectedProduct !== 'All'"> for {{ selectedProduct }}</span>
        </p>
        <p v-if="changelogData" class="last-updated">Last updated: {{ formatDate(changelogData.lastUpdated) }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useChangelogData } from '../composables/useChangelogData'
import { useChangelog, formatDate, PRODUCTS } from '../composables/useChangelog'
import FilterTabs from './FilterTabs.vue'

const { data: changelogData, loading, error, load } = useChangelogData()
const { selectedProduct, filteredEntries, paginatedEntries, hasMore, remaining, loadMore, productCounts } =
  useChangelog(changelogData)

onMounted(() => load())

function extractVersion(version?: string): string {
  if (!version) return ''
  const lastAt = version.lastIndexOf('@')
  return lastAt > 0 ? version.slice(lastAt + 1) : version
}

function anchorId(id: string): string {
  return id.replace(/[@/]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}
</script>

<style src="../styles/changelog.css" />
