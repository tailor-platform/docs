import { useState } from "react";
import { Combobox } from "@tailor-platform/app-shell";

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
  { value: "svelte", label: "SvelteKit" },
];

export default function Demo() {
  const [value, setValue] = useState<(typeof frameworks)[number] | null>(null);

  return (
    <div style={{ width: 300 }}>
      <Combobox
        items={frameworks}
        placeholder="Select a framework..."
        mapItem={(item) => ({ label: item.label, key: item.value })}
        value={value}
        onValueChange={setValue}
      />
    </div>
  );
}
