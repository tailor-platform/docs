<template>
  <div class="changelog-container">
    <FilterTabs v-model="selectedProduct" :options="PRODUCTS" />

    <div v-if="paginatedEntries.length > 0">
      <ChangelogEntry
        v-for="entry in paginatedEntries"
        :key="entry.id"
        :entry="entry"
      />
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
      <p class="last-updated">Last updated: {{ formatDate(changelogData.lastUpdated) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page-level orchestrator for the changelog. Filterable by product, paginated, data loaded from data.json at build time.
import changelogData from '../../../docs/reference/changelog/data.json'
import { useChangelog, formatDate } from '../composables/useChangelog'
import FilterTabs from './FilterTabs.vue'
import ChangelogEntry from './ChangelogEntry.vue'

const PRODUCTS = ['All', 'SDK', 'AppShell', 'Platform Core']

const { selectedProduct, filteredEntries, paginatedEntries, hasMore, remaining, loadMore } =
  useChangelog(changelogData)
</script>

<style src="../styles/changelog.css" />
