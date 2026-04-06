<template>
  <div class="filter-tabs">
    <button
      v-for="option in options"
      :key="option"
      class="filter-tab"
      :class="{ active: modelValue === option }"
      @click="$emit('update:modelValue', option)"
    >
      {{ option }}
    </button>
  </div>
</template>

<script setup lang="ts">
// Generic single-select filter tab bar. Stateless — active value is owned by the parent via v-model.
defineProps<{
  options: string[]
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
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

@media (max-width: 768px) {
  .filter-tabs {
    gap: 0.375rem;
  }

  .filter-tab {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
