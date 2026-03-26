<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import { resolveDemo } from "../composables/demoRegistry";
import "@tailor-platform/app-shell/styles";
import "@tailor-platform/app-shell/theme.css";

const props = defineProps<{ name: string }>();

const containerRef = ref<HTMLElement | null>(null);
const error = ref<string | null>(null);
const loading = ref(true);

let reactRoot: { unmount: () => void } | null = null;

async function mountDemo() {
  if (!containerRef.value) return;

  const loader = resolveDemo(props.name);
  if (!loader) {
    error.value = `Demo "${props.name}" not found. Check that a file named "${props.name}.demo.tsx" exists in a demos/ directory.`;
    loading.value = false;
    return;
  }

  try {
    const [{ createRoot }, mod] = await Promise.all([
      import("react-dom/client"),
      loader(),
    ]);
    const { createElement } = await import("react");

    if (reactRoot) {
      reactRoot.unmount();
    }

    reactRoot = createRoot(containerRef.value);
    reactRoot.render(createElement(mod.default));
    loading.value = false;
  } catch (e) {
    error.value = `Failed to render demo "${props.name}": ${e instanceof Error ? e.message : String(e)}`;
    loading.value = false;
  }
}

watch(containerRef, (el) => {
  if (el) mountDemo();
});

onBeforeUnmount(() => {
  if (reactRoot) {
    reactRoot.unmount();
    reactRoot = null;
  }
});
</script>

<template>
  <ClientOnly>
    <div class="appshell-demo">
      <div v-if="error" class="appshell-demo-error">{{ error }}</div>
      <div v-if="loading" class="appshell-demo-loading">Loading demo...</div>
      <div ref="containerRef" />
    </div>
  </ClientOnly>
</template>
