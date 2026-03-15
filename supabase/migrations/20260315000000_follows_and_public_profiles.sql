-- Follows table: who follows whom
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Follows RLS: users can only insert/delete their own follow rows; anyone authenticated can read
CREATE POLICY "Users can view all follows"
  ON public.follows FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own follow"
  ON public.follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follow"
  ON public.follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- Allow authenticated users to read any profile (for viewing other users' profiles).
-- If you already have a SELECT policy on profiles, this adds read access for all authenticated users (policies are OR'd).
CREATE POLICY "Profiles viewable by authenticated"
  ON public.profiles FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to read any workout (for viewing other users' workout history on their profile).
CREATE POLICY "Workouts viewable by authenticated"
  ON public.workouts FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to read any routine (for viewing other users' routines on their profile).
CREATE POLICY "Routines viewable by authenticated"
  ON public.routines FOR SELECT TO authenticated USING (true);
