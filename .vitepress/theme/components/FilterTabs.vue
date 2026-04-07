<template>
  <div class="filter-tabs">
    <button
      v-for="option in options"
      :key="option"
      class="filter-tab"
      :class="{ active: modelValue === option }"
      :aria-pressed="modelValue === option"
      @click="$emit('update:modelValue', option)"
    >
      {{ option }}<span v-if="counts?.[option] !== undefined" class="filter-tab-count">{{ counts[option] }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
// Generic single-select filter tab bar. Stateless — active value is owned by the parent via v-model.
defineProps<{
  options: string[]
  modelValue: string
  counts?: Record<string, number>
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style src="../styles/filter-tabs.css" />
