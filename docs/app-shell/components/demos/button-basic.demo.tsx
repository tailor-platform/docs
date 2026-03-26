import { Button } from "@tailor-platform/app-shell";

export default function Demo() {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  );
}
