const demoModules = import.meta.glob<{ default: React.ComponentType }>(
  "/app-shell/**/demos/*.demo.tsx"
);

export function resolveDemo(name: string): (() => Promise<{ default: React.ComponentType }>) | null {
  const match = Object.entries(demoModules).find(([path]) =>
    path.endsWith(`/${name}.demo.tsx`)
  );
  return match ? match[1] : null;
}
