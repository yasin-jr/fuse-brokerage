import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";

export const Route = createFileRoute("/discover")({
  head: () => ({ meta: [{ title: "Discover — FusionSynergy" }] }),
  component: () => (
    <AppShell>
      <BackBar />
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <h1 className="text-2xl font-semibold">🔍 Discover</h1>
        <div className="glass rounded-2xl p-10 text-center">
          <div className="text-5xl mb-3">✨</div>
          <h2 className="text-lg font-semibold">Coming soon</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Trending stocks, themes and screeners will live here.
          </p>
        </div>
      </div>
    </AppShell>
  ),
});
