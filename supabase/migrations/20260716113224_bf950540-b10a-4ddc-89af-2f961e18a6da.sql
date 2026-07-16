
-- 1) post_likes: restrict SELECT to likes on public posts only
DROP POLICY IF EXISTS "Anyone can see like counts" ON public.post_likes;
CREATE POLICY "Anyone can see likes on public posts"
  ON public.post_likes FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_likes.post_id
        AND p.visibility = 'public'
    )
  );

-- 2) profiles: block unauthenticated reads (protects email + financial fields)
DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);
REVOKE SELECT ON public.profiles FROM anon;

-- 3) Username spoofing: force posts.username and post_comments.username to match author's profile
CREATE OR REPLACE FUNCTION public.assert_username_matches_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expected text;
BEGIN
  SELECT username INTO expected FROM public.profiles WHERE user_id = NEW.user_id;
  IF expected IS NULL OR expected = '' THEN
    RAISE EXCEPTION 'profile username not set for user %', NEW.user_id;
  END IF;
  IF NEW.username IS DISTINCT FROM expected THEN
    RAISE EXCEPTION 'username must match the author profile username';
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS posts_username_check ON public.posts;
CREATE TRIGGER posts_username_check
  BEFORE INSERT OR UPDATE OF username ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.assert_username_matches_profile();

DROP TRIGGER IF EXISTS post_comments_username_check ON public.post_comments;
CREATE TRIGGER post_comments_username_check
  BEFORE INSERT OR UPDATE OF username ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.assert_username_matches_profile();

-- 4) Bounds on paper-trading balance/points to prevent client-side abuse
CREATE OR REPLACE FUNCTION public.assert_profile_bounds()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  cap numeric;
BEGIN
  cap := COALESCE(NEW.claimed_balance, 100000);

  IF NEW.claimed_balance IS NOT NULL AND (NEW.claimed_balance < 0 OR NEW.claimed_balance > 1000000) THEN
    RAISE EXCEPTION 'claimed_balance out of allowed range';
  END IF;

  IF NEW.cash IS NOT NULL AND (NEW.cash < 0 OR NEW.cash > cap * 10) THEN
    RAISE EXCEPTION 'cash out of allowed range';
  END IF;

  IF NEW.points < 0 THEN
    RAISE EXCEPTION 'points cannot be negative';
  END IF;

  IF NEW.points_multiplier NOT IN (1, 2, 3) THEN
    RAISE EXCEPTION 'invalid points_multiplier';
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.points > COALESCE(OLD.points, 0) + 100000 THEN
      RAISE EXCEPTION 'points delta exceeds allowed bound';
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    IF NEW.points > 100000 THEN
      RAISE EXCEPTION 'initial points too high';
    END IF;
  END IF;

  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS profiles_bounds_check ON public.profiles;
CREATE TRIGGER profiles_bounds_check
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.assert_profile_bounds();
