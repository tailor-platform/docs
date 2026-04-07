/// <reference types="vitepress/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent;
  export default component;
}

declare module "*/releases.json" {
  import type { ChangelogData } from "./.vitepress/theme/composables/useChangelog";
  const value: ChangelogData;
  export default value;
}
