<template>
  <div class="changelog-container">
    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        v-for="product in products"
        :key="product"
        class="filter-tab"
        :class="{ active: selectedProduct === product }"
        @click="selectedProduct = product"
      >
        {{ product }}
      </button>
    </div>

    <!-- Timeline -->
    <div v-if="paginatedEntries.length > 0" class="timeline">
      <div
        v-for="(entry, index) in paginatedEntries"
        :key="entry.id"
        class="timeline-item"
      >
        <!-- Content -->
        <div class="timeline-content">
          <!-- Header -->
          <div class="timeline-header">
            <div class="timeline-meta">
              <span class="timeline-date">{{ formatDate(entry.date) }}</span>
              <template v-if="entry.product !== 'Platform Core'">
                <span class="timeline-separator">•</span>
                <a :href="entry.githubUrl" target="_blank" rel="noopener" class="github-link">
                  View on GitHub →
                </a>
              </template>
            </div>
            <div class="timeline-badges">
              <span class="product-badge" :data-product="entry.product.toLowerCase().replace(/\s+/g, '-')">
                {{ entry.product }}
              </span>
              <span v-if="entry.product !== 'Platform Core'" class="version-badge" :data-type="entry.versionType">
                v{{ entry.version }}
              </span>
              <span v-if="entry.breaking" class="breaking-badge">
                ⚠️ Breaking
              </span>
            </div>
          </div>

          <!-- Title -->
          <h3 class="timeline-title">{{ entry.title }}</h3>

          <!-- Narrative (if available) -->
          <div v-if="entry.narrative" class="timeline-narrative">
            <div class="narrative-summary">
              <strong>What's new:</strong> {{ entry.narrative.summary }}
            </div>

            <div v-if="entry.narrative.impact" class="narrative-impact">
              <strong>Impact:</strong> {{ entry.narrative.impact }}
            </div>

            <div v-if="entry.narrative.details && entry.narrative.details.length > 0" class="narrative-details">
              <strong>Key changes:</strong>
              <ul>
                <li v-for="(detail, i) in entry.narrative.details" :key="i">
                  {{ detail }}
                </li>
              </ul>
            </div>

            <div v-if="entry.narrative.migration" class="narrative-migration">
              <strong>⚠️ Migration required:</strong>
              <div v-html="entry.narrative.migration"></div>
            </div>
          </div>

          <!-- No narrative - show raw notes -->
          <div v-else class="timeline-body">
            <div v-html="entry.bodyHtml" class="release-body"></div>
          </div>

          <!-- Tags -->
          <div v-if="entry.tags && entry.tags.length > 0" class="timeline-tags">
            <span v-for="tag in entry.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <p>No releases found for {{ selectedProduct }}.</p>
    </div>

    <!-- Load More -->
    <div v-if="hasMore" class="load-more">
      <button @click="loadMore" class="load-more-btn">
        Load More <span class="remaining">({{ remaining }} remaining)</span>
      </button>
    </div>

    <!-- Footer stats -->
    <div class="changelog-footer">
      <p class="stats">
        Showing {{ paginatedEntries.length }} of {{ filteredEntries.length }} releases
        <span v-if="selectedProduct !== 'All'"> for {{ selectedProduct }}</span>
      </p>
      <p class="last-updated">Last updated: {{ formatDate(changelogData.lastUpdated) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import changelogData from '../../../docs/reference/changelog/data.json'

const selectedProduct = ref('All')
const currentPage = ref(1)
const itemsPerPage = 10

const products = ['All', 'SDK', 'AppShell', 'Platform Core']

const filteredEntries = computed(() => {
  if (selectedProduct.value === 'All') {
    return changelogData.entries
  }
  return changelogData.entries.filter(
    entry => entry.product === selectedProduct.value
  )
})

const paginatedEntries = computed(() => {
  const start = 0
  const end = currentPage.value * itemsPerPage
  return filteredEntries.value.slice(start, end)
})

const hasMore = computed(() => {
  return paginatedEntries.value.length < filteredEntries.value.length
})

const remaining = computed(() => {
  return filteredEntries.value.length - paginatedEntries.value.length
})

function getProductCount(product) {
  if (product === 'All') {
    return changelogData.entries.length
  }
  return changelogData.entries.filter(e => e.product === product).length
}

function loadMore() {
  currentPage.value++
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.changelog-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 0;
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.5rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.filter-tab:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.filter-tab.active {
  background: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
}

/* Timeline */
.timeline {
  position: relative;
}

.timeline-item {
  margin-bottom: 3rem;
}

.timeline-content {
  width: 100%;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.timeline-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.timeline-date {
  font-weight: 500;
}

.timeline-separator {
  opacity: 0.5;
}

.github-link {
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.2s;
}

.github-link:hover {
  color: var(--vp-c-brand);
}

.timeline-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.product-badge,
.version-badge,
.breaking-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.product-badge {
  color: white;
}

.product-badge[data-product="sdk"] {
  background: #3b82f6; /* Tailwind blue-500 */
}

.product-badge[data-product="appshell"] {
  background: #8b5cf6; /* Tailwind violet-500 */
}

.product-badge[data-product="platform-core"] {
  background: #06b6d4; /* Tailwind cyan-500 */
}

.version-badge {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.version-badge[data-type="major"] {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.version-badge[data-type="minor"] {
  background: #eff6ff;
  color: #1e40af;
  border-color: #bfdbfe;
}

.breaking-badge {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.timeline-title {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

/* Narrative */
.timeline-narrative {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.narrative-summary,
.narrative-impact,
.narrative-details {
  margin-bottom: 1rem;
}

.narrative-summary:last-child,
.narrative-impact:last-child,
.narrative-details:last-child {
  margin-bottom: 0;
}

.narrative-summary strong,
.narrative-impact strong,
.narrative-details strong {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

.narrative-details ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
}

.narrative-details li {
  margin-bottom: 0.25rem;
  color: var(--vp-c-text-2);
}

.narrative-migration {
  margin-top: 1rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #991b1b;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--vp-c-text-2);
}

/* Load More */
.load-more {
  text-align: center;
  margin: 3rem 0;
}

.load-more-btn {
  padding: 0.75rem 2rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9375rem;
}

.load-more-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.load-more-btn .remaining {
  opacity: 0.7;
  margin-left: 0.5rem;
}

/* Footer */
.changelog-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
  text-align: center;
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

.changelog-footer .stats {
  margin-bottom: 0.5rem;
}

.changelog-footer .last-updated {
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
  .timeline-item {
    gap: 1rem;
  }

  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-tabs {
    gap: 0.375rem;
  }

  .filter-tab {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
