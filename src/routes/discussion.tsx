import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { DISCUSSION_PREVIEW } from "@/lib/mock-data";
import { MessageSquare, Sparkles } from "lucide-react";

export const Route = createFileRoute("/discussion")({
  head: () => ({
    meta: [
      { title: "Community — FusionSynergy" },
      { name: "description", content: "Share what you're watching, swap ideas, and see what the community thinks." },
    ],
  }),
  component: DiscussionPage,
});

function DiscussionPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <h1 className="text-2xl font-semibold">Community</h1>

        <button className="flex w-full items-center gap-3 rounded-2xl border border-border bg-secondary/40 p-3 text-left text-sm text-muted-foreground hover:bg-secondary/60">
          <div className="h-8 w-8 rounded-full bg-fuse-gradient" />
          <span>Share what you're watching today…</span>
        </button>

        {DISCUSSION_PREVIEW.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-6 w-6 text-muted-foreground" />}
            title="No posts yet"
            description="The community is brand new. Start the first conversation — talk about a stock, an idea, or a question."
            action={
              <Link to="/ai" className="inline-flex items-center gap-1.5 rounded-full bg-fuse-gradient px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                <Sparkles className="h-3.5 w-3.5" /> Need an idea? Ask FUSE
              </Link>
            }
          />
        ) : (
          <div className="glass rounded-xl divide-y divide-border/50">
            {DISCUSSION_PREVIEW.map((d, i) => (
              <article key={i} className="p-4 text-sm">
                <div className="text-xs text-muted-foreground">@{d.user}</div>
                <p className="mt-1.5">{d.text}</p>
                <div className="mt-2 text-xs text-muted-foreground">{d.likes} likes</div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
