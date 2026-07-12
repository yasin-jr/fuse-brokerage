import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — Ascend" },
      { name: "description", content: "Trending stocks, curated themes and screeners — discover your next idea on Ascend." },
      { property: "og:title", content: "Discover — Ascend" },
      { property: "og:description", content: "Trending stocks, themes and screeners powered by FUSE Intelligence." },
      { property: "og:url", content: "https://ascend-invests.lovable.app/discover" },
    ],
    links: [{ rel: "canonical", href: "https://ascend-invests.lovable.app/discover" }],
  }),
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
