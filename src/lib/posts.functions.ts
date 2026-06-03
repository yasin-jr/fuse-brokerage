import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function extractTickers(body: string): string[] {
  const out = new Set<string>();
  const re = /\$([A-Z]{1,5})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) out.add(m[1]);
  return [...out].slice(0, 10);
}

const CreateInput = z.object({
  title: z.string().max(200).optional().nullable(),
  body: z.string().trim().min(1).max(4000),
  media_paths: z.array(z.string().min(1).max(512)).max(8).optional().default([]),
  topic: z.string().trim().max(40).optional().nullable(),
  visibility: z.enum(["public", "followers", "private"]).default("public"),
});

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => CreateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: userInfo } = await supabase.auth.getUser();
    const meta = (userInfo.user?.user_metadata ?? {}) as Record<string, string>;
    const username =
      meta.username || meta.preferred_username || meta.name ||
      userInfo.user?.email?.split("@")[0] || "user";

    const tickers = extractTickers(data.body + " " + (data.title ?? ""));

    const { data: row, error } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        username,
        title: data.title ?? null,
        body: data.body,
        media_urls: data.media_paths ?? [],
        topic: data.topic ?? null,
        visibility: data.visibility,
        tickers,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { post: row };
  });

const FeedInput = z.object({ limit: z.number().int().min(1).max(50).default(30) }).default({ limit: 30 });

type FeedRow = {
  id: string;
  user_id: string;
  username: string;
  title: string | null;
  body: string;
  media_urls: string[];
  topic: string | null;
  tickers: string[];
  likes: number;
  created_at: string;
  media_signed: string[];
  liked_by_me?: boolean;
  comment_count: number;
};

export const listPublicPosts = createServerFn({ method: "GET" })
  .inputValidator((d) => FeedInput.parse(d))
  .handler(async ({ data }): Promise<{ posts: FeedRow[] }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("posts")
      .select("id, user_id, username, title, body, media_urls, topic, tickers, likes, created_at")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);

    const ids = (rows ?? []).map((r: any) => r.id);
    const counts = new Map<string, number>();
    if (ids.length) {
      const { data: cnts } = await supabaseAdmin
        .from("post_comments")
        .select("post_id")
        .in("post_id", ids);
      for (const c of cnts ?? []) counts.set((c as any).post_id, (counts.get((c as any).post_id) ?? 0) + 1);
    }

    const posts: FeedRow[] = await Promise.all(
      (rows ?? []).map(async (r: any) => {
        const media_signed: string[] = [];
        for (const path of r.media_urls ?? []) {
          const { data: signed } = await supabaseAdmin.storage
            .from("post-media").createSignedUrl(path, 60 * 60 * 6);
          if (signed?.signedUrl) media_signed.push(signed.signedUrl);
        }
        return { ...r, tickers: r.tickers ?? [], media_signed, comment_count: counts.get(r.id) ?? 0 };
      }),
    );
    return { posts };
  });

const LikeInput = z.object({ post_id: z.string().uuid() });

export const toggleLike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => LikeInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("post_likes").select("user_id")
      .eq("post_id", data.post_id).eq("user_id", userId).maybeSingle();
    if (existing) {
      const { error } = await supabase.from("post_likes").delete().eq("post_id", data.post_id).eq("user_id", userId);
      if (error) throw new Error(error.message);
      return { liked: false };
    }
    const { error } = await supabase.from("post_likes").insert({ post_id: data.post_id, user_id: userId });
    if (error) throw new Error(error.message);
    return { liked: true };
  });

const DeleteInput = z.object({ post_id: z.string().uuid() });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => DeleteInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("posts").delete().eq("id", data.post_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----- Comments -----

const ListCommentsInput = z.object({ post_id: z.string().uuid() });

export const listComments = createServerFn({ method: "GET" })
  .inputValidator((d) => ListCommentsInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("post_comments")
      .select("id, post_id, user_id, username, body, created_at")
      .eq("post_id", data.post_id)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    return { comments: rows ?? [] };
  });

const AddCommentInput = z.object({
  post_id: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});

export const addComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => AddCommentInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: userInfo } = await supabase.auth.getUser();
    const meta = (userInfo.user?.user_metadata ?? {}) as Record<string, string>;
    const username =
      meta.username || meta.preferred_username || meta.name ||
      userInfo.user?.email?.split("@")[0] || "user";

    const { data: row, error } = await supabase
      .from("post_comments")
      .insert({ post_id: data.post_id, user_id: userId, username, body: data.body })
      .select("*").single();
    if (error) throw new Error(error.message);
    return { comment: row };
  });

const DeleteCommentInput = z.object({ id: z.string().uuid() });

export const deleteComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => DeleteCommentInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("post_comments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
