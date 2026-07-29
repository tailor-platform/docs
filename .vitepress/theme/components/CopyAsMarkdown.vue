<script setup lang="ts">
import { computed, ref } from "vue";
import { useData, withBase } from "vitepress";

const { page, frontmatter } = useData();

// The plugin writes an LLM-friendly .md next to every built page, keyed by source path
const markdownUrl = computed(() => withBase("/" + page.value.filePath));

// Home page is excluded from LLM-friendly output by the plugin
const enabled = computed(() => frontmatter.value.layout !== "home");

const state = ref<"idle" | "copied" | "error">("idle");

async function copy() {
  try {
    const res = await fetch(markdownUrl.value);
    if (!res.ok) throw new Error(String(res.status));
    const text = await res.text();
    // Drop the generated `url:` frontmatter block
    await navigator.clipboard.writeText(text.replace(/^---\n[\s\S]*?\n---\n+/, ""));
    state.value = "copied";
  } catch {
    state.value = "error";
  }
  setTimeout(() => (state.value = "idle"), 2000);
}
</script>

<template>
  <div v-if="enabled" class="md-actions">
    <button type="button" class="md-action" @click="copy">
      {{ state === "copied" ? "Copied" : state === "error" ? "Copy failed" : "Copy as Markdown" }}
    </button>
    <a class="md-action" :href="markdownUrl" target="_blank" rel="noreferrer">View as Markdown</a>
  </div>
</template>

<style scoped>
.md-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: -8px;
}

.md-action {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 12px;
  line-height: 20px;
  color: var(--vp-c-text-2);
  background: transparent;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.md-action:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
</style>
