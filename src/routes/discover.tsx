import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/discover")({
  head: () => ({ meta: [{ title: "Discover — FusionSynergy" }] }),
  component: () => (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <h1 className="text-2xl font-semibold">🔍 Discover</h1>
        <p className="text-sm text-muted-foreground">
          Trending stocks, screeners, themes, and "stocks like your pillars" — coming in Phase 7.
        </p>
        <div className="glass rounded-xl p-6 text-center text-sm text-muted-foreground">
          🛠️ Module 18 (Trending) + Module 22 (Heat Map) under construction.
        </div>
      </div>
    </AppShell>
  ),
});
