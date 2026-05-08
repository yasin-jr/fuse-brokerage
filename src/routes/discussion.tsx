import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { usePosts, savePosts, loadPosts, loadProfile, type Post } from "@/lib/profile-store";
import { MessageSquare, Heart, Send } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/discussion")({
  head: () => ({
    meta: [
      { title: "Community — FusionSynergy" },
      { name: "description", content: "Share what you're watching, swap ideas, and see what the community thinks." },
    ],
  }),
  component: DiscussionPage,
});

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function DiscussionPage() {
  const posts = usePosts();
  const [text, setText] = useState("");

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    const profile = loadProfile();
    const post: Post = {
      id: Math.random().toString(36).slice(2),
      user: profile.username || "you",
      text: t,
      ts: Date.now(),
      likes: 0,
    };
    savePosts([post, ...loadPosts()]);
    setText("");
  };

  const like = (id: string) => {
    savePosts(loadPosts().map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <h1 className="text-2xl font-semibold">Community</h1>

        <div className="rounded-2xl border border-border bg-secondary/40 p-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share what you're watching today…"
            rows={2}
            className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <div className="flex justify-end">
            <button
              onClick={submit}
              disabled={!text.trim()}
              className="inline-flex items-center gap-1.5 rounded-full bg-fuse-gradient px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" /> Post
            </button>
          </div>
        </div>

        {posts.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-6 w-6 text-muted-foreground" />}
            title="No posts yet"
            description="The community is brand new. Start the first conversation — talk about a stock, an idea, or a question."
          />
        ) : (
          <div className="glass rounded-xl divide-y divide-border/50">
            {posts.map((d) => (
              <article key={d.id} className="p-4 text-sm">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">@{d.user}</div>
                  <div className="text-xs text-muted-foreground">{timeAgo(d.ts)}</div>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap">{d.text}</p>
                <button onClick={() => like(d.id)} className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-400">
                  <Heart className="h-3.5 w-3.5" /> {d.likes}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
