import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { DISCUSSION_PREVIEW } from "@/lib/mock-data";

export const Route = createFileRoute("/discussion")({
  head: () => ({
    meta: [
      { title: "Discussion — FusionSynergy Community" },
      { name: "description", content: "Community sentiment, cashtag discussions, and agent commentary." },
    ],
  }),
  component: DiscussionPage,
});

function DiscussionPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <h1 className="text-2xl font-semibold">💬 Community</h1>

        <section>
          <h2 className="mb-2 text-sm font-semibold">👥 From people you follow</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {DISCUSSION_PREVIEW.map((d, i) => (
              <div key={i} className="glass min-w-[220px] rounded-xl p-3 text-sm">
                <div className="text-xs text-muted-foreground">{d.badge} @{d.user}</div>
                <p className="mt-1">{d.text} {d.sentiment}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">🔥 Trending</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="glass rounded-full px-3 py-1">$AMD <span className="text-muted-foreground text-xs">342</span></span>
            <span className="glass rounded-full px-3 py-1">$IONQ <span className="text-muted-foreground text-xs">189</span></span>
            <span className="glass rounded-full px-3 py-1">$UEC <span className="text-muted-foreground text-xs">142</span></span>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">All discussions</h2>
          <div className="glass rounded-xl divide-y divide-border/50">
            {[...DISCUSSION_PREVIEW, ...DISCUSSION_PREVIEW].map((d, i) => (
              <article key={i} className="p-4 text-sm">
                <div className="text-xs text-muted-foreground">{d.badge} @{d.user} · 245 PTS</div>
                <p className="mt-1.5">{d.text}</p>
                <div className="mt-2 text-xs text-muted-foreground">🐂 {d.likes} · 💬 12 replies</div>
              </article>
            ))}
          </div>
        </section>

        <section className="glass rounded-xl p-4">
          <h2 className="text-sm font-semibold text-fuse-violet">🤖 Agent Commentary</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sniper triggered $AMD BUY — effective confidence 0.84
          </p>
        </section>
      </div>
    </AppShell>
  );
}
