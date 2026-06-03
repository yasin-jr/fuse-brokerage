-- Add tickers column to posts for $TICKER tagging
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS tickers text[] NOT NULL DEFAULT '{}';

-- Comments table
CREATE TABLE public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  username text NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id, created_at DESC);

GRANT SELECT ON public.post_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_comments TO authenticated;
GRANT ALL ON public.post_comments TO service_role;

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments on public posts"
ON public.post_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.posts p WHERE p.id = post_comments.post_id AND p.visibility = 'public'
  )
);

CREATE POLICY "Authenticated users add comments as themselves"
ON public.post_comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners update their comments"
ON public.post_comments FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Owners delete their comments"
ON public.post_comments FOR DELETE TO authenticated
USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
