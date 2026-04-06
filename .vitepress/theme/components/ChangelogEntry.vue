<template>
  <EntryCard>
    <template #meta>
      <span class="entry-date">{{ formatDate(entry.date) }}</span>
      <template v-if="entry.product !== 'Platform Core'">
        <span class="entry-separator">•</span>
        <a :href="entry.githubUrl" target="_blank" rel="noopener" class="entry-github-link">
          View on GitHub →
        </a>
      </template>
    </template>

    <template #badges>
      <span class="product-badge" :data-product="entry.product.toLowerCase().replace(/\s+/g, '-')">
        {{ entry.product }}
      </span>
      <span v-if="entry.product !== 'Platform Core'" class="version-badge" :data-type="entry.versionType">
        v{{ entry.version }}
      </span>
      <span v-if="entry.breaking" class="breaking-badge">⚠️ Breaking</span>
    </template>

    <template #title>
      <h3 class="entry-title">{{ entry.title }}</h3>
    </template>

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
    </div>

    <div v-else v-html="entry.bodyHtml" class="release-body" />

    <template v-if="entry.tags?.length" #footer>
      <span v-for="tag in entry.tags" :key="tag" class="entry-tag">{{ tag }}</span>
    </template>
  </EntryCard>
</template>

<script setup lang="ts">
// Maps a ChangelogEntry onto EntryCard — handles badges, narrative block, and raw HTML fallback.
// Changelog-specific; for other feed types compose EntryCard directly.
import EntryCard from './EntryCard.vue'
import type { ChangelogEntry } from '../composables/useChangelog'
import { formatDate } from '../composables/useChangelog'

defineProps<{
  entry: ChangelogEntry
}>()
</script>
