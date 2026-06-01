import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — FusionSynergy" },
      { name: "description", content: "Short, casual lessons to help new traders find their footing in the markets." },
      { property: "og:title", content: "Learn — FusionSynergy" },
      { property: "og:description", content: "Bite-size trading and markets lessons from FusionSynergy." },
      { property: "og:url", content: "https://fuse-brokerage.lovable.app/learn" },
    ],
    links: [{ rel: "canonical", href: "https://fuse-brokerage.lovable.app/learn" }],
  }),
  component: () => (
    <AppShell>
      <BackBar />
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <h1 className="text-2xl font-semibold">📚 Learn</h1>
        <div className="glass rounded-2xl p-10 text-center">
          <div className="text-5xl mb-3">🚧</div>
          <h2 className="text-lg font-semibold">Coming soon</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We're putting together short, casual lessons to help you find your footing. Check back soon.
          </p>
        </div>
      </div>
    </AppShell>
  ),
});
