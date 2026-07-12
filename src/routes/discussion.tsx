import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { PostComposer } from "@/components/PostComposer";
import { listPublicPosts, toggleLike, deletePost } from "@/lib/posts.functions";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Heart, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/discussion")({
  head: () => ({
    meta: [
      { title: "Community — Ascend" },
      { name: "description", content: "Public community feed — share ideas, post photos, and see what Ascend traders are watching." },
      { property: "og:title", content: "Community — Ascend" },
      { property: "og:description", content: "Public discussion feed for trading ideas." },
      { property: "og:url", content: "https://ascend-invests.lovable.app/discussion" },
    ],
    links: [{ rel: "canonical", href: "https://ascend-invests.lovable.app/discussion" }],
  }),
  component: DiscussionPage,
});

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function DiscussionPage() {
  const qc = useQueryClient();
  const fetchPosts = useServerFn(listPublicPosts);
  const like = useServerFn(toggleLike);
  const del = useServerFn(deletePost);

  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const { data } = useQuery({
    queryKey: ["public-posts"],
    queryFn: () => fetchPosts({ data: { limit: 30 } }),
    refetchInterval: 30_000,
  });
  const posts = data?.posts ?? [];

  // Realtime: refresh feed when posts change
  useEffect(() => {
    const ch = supabase
      .channel("posts-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => {
        qc.invalidateQueries({ queryKey: ["public-posts"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Community</h1>
          <PostComposer
            trigger={
              <button className="inline-flex items-center gap-1.5 rounded-full bg-fuse-gradient px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow">
                <Plus className="h-3.5 w-3.5" /> Post something
              </button>
            }
          />
        </div>

        {posts.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-6 w-6 text-muted-foreground" />}
            title="The room is quiet"
            description="Be the first to post — share a stock, an idea, or a photo."
          />
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <article key={p.id} className="glass rounded-2xl p-4">
                <header className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">@{p.username}</span>
                  <div className="flex items-center gap-2">
                    {p.topic && <span className="rounded-full bg-secondary/60 px-2 py-0.5">#{p.topic}</span>}
                    <span className="text-muted-foreground">{timeAgo(p.created_at)}</span>
                    {userId === p.user_id && (
                      <button
                        onClick={() => del({ data: { post_id: p.id } }).then(() => qc.invalidateQueries({ queryKey: ["public-posts"] }))}
                        className="text-muted-foreground hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </header>
                {p.title && <h2 className="mt-2 text-lg font-semibold">{p.title}</h2>}
                <p className="mt-1 whitespace-pre-wrap text-sm">{p.body}</p>
                {p.media_signed?.length > 0 && (
                  <div className={`mt-3 grid gap-2 ${p.media_signed.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                    {p.media_signed.map((url, i) => (
                      <img key={i} src={url} alt="" className="w-full rounded-lg border border-border object-cover max-h-96" />
                    ))}
                  </div>
                )}
                <footer className="mt-3">
                  <button
                    onClick={async () => {
                      if (!userId) return;
                      await like({ data: { post_id: p.id } });
                      qc.invalidateQueries({ queryKey: ["public-posts"] });
                    }}
                    disabled={!userId}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-400 disabled:opacity-50"
                  >
                    <Heart className="h-3.5 w-3.5" /> {p.likes}
                  </button>
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
