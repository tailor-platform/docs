<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import CopyAsMarkdown from "./components/CopyAsMarkdown.vue";
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-before>
      <CopyAsMarkdown />
    </template>
  </DefaultTheme.Layout>
</template>

<style>
/* Style tags in page headers as superscript */
.vp-doc h1 .tag,
.vp-doc h2 .tag,
.vp-doc h3 .tag,
.vp-doc h4 .tag {
  vertical-align: super;
  font-size: 0.625rem !important; /* Fixed small size */
  margin-left: 0.5rem;
  padding: 0.4rem !important; /* More padding for breathing room */
}
</style>
