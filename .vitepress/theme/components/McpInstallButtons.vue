<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  name: { type: String, default: "tailor-mcp" },
  url: { type: String, default: "https://mcp.tailor.tech/" },
});

// Cursor reads the same object it would put under `mcpServers` in mcp.json,
// base64-encoded. A remote server is just `{ url }`.
const cursorLink = computed(() => {
  const config = btoa(JSON.stringify({ url: props.url }));
  return `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(props.name)}&config=${config}`;
});

// VS Code takes the `servers` entry shape, URL-encoded. The https redirect
// works from any browser and hands off to the installed VS Code.
const vscodeLink = computed(() => {
  const config = encodeURIComponent(JSON.stringify({ type: "http", url: props.url }));
  return `https://insiders.vscode.dev/redirect/mcp/install?name=${encodeURIComponent(props.name)}&config=${config}`;
});
</script>

<template>
  <div class="mcp-install">
    <a class="mcp-install-btn" :href="cursorLink">Add to Cursor</a>
    <a class="mcp-install-btn" :href="vscodeLink" target="_blank" rel="noopener noreferrer"
      >Add to VS Code</a
    >
    <code class="mcp-install-url">{{ url }}</code>
  </div>
</template>

<style scoped>
.mcp-install {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 16px 0 24px;
}

.mcp-install-btn {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.mcp-install-btn:hover {
  background: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
  color: #fff;
  text-decoration: none;
}

.mcp-install-url {
  padding: 4px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  user-select: all;
}
</style>
