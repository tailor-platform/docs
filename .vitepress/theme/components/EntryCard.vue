<template>
  <div class="entry-card">
    <div class="entry-card-header">
      <div class="entry-card-meta">
        <slot name="meta" />
      </div>
      <div class="entry-card-badges">
        <slot name="badges" />
      </div>
    </div>

    <div class="entry-card-title">
      <slot name="title" />
    </div>

    <div class="entry-card-body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="entry-card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Generic slot-driven card for feed/list content. Slots: #meta, #badges, #title, #footer, default (body).
// No props — fully composable, usable for changelogs, blog feeds, release notes, etc.
</script>

<style scoped>
.entry-card {
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.entry-card:last-child {
  border-bottom: none;
}

.entry-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.entry-card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.entry-card-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.entry-card-title {
  margin-bottom: 0.75rem;
}

.entry-card-body {
  color: var(--vp-c-text-2);
}

.entry-card-footer {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .entry-card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
