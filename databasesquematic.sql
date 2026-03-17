-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.bookmarks (
  id integer NOT NULL DEFAULT nextval('bookmarks_id_seq'::regclass),
  user_id uuid NOT NULL,
  routine_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT bookmarks_pkey PRIMARY KEY (id),
  CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT bookmarks_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.routines(id)
);
CREATE TABLE public.exercises (
  id integer NOT NULL DEFAULT nextval('exercises_id_seq'::regclass),
  name text NOT NULL UNIQUE,
  muscle_group text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty = ANY (ARRAY['Beginner'::text, 'Intermediate'::text, 'Advanced'::text])),
  video_url text,
  instructions text,
  muscles ARRAY,
  CONSTRAINT exercises_pkey PRIMARY KEY (id)
);
CREATE TABLE public.follows (
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT follows_pkey PRIMARY KEY (follower_id, following_id),
  CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES auth.users(id),
  CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text NOT NULL UNIQUE,
  ap_points integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  weekly_streak integer NOT NULL DEFAULT 0,
  total_workouts integer NOT NULL DEFAULT 0,
  routines_created integer NOT NULL DEFAULT 0,
  join_date timestamp with time zone NOT NULL DEFAULT now(),
  prs jsonb NOT NULL DEFAULT '{}'::jsonb,
  badges ARRAY NOT NULL DEFAULT '{}'::text[],
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.routines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_public boolean NOT NULL DEFAULT false,
  category text,
  difficulty text,
  rating numeric DEFAULT 0,
  downloads integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT routines_pkey PRIMARY KEY (id),
  CONSTRAINT routines_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.workouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  finished_at timestamp with time zone,
  duration_sec integer,
  total_volume numeric,
  ap_earned integer DEFAULT 0,
  exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT workouts_pkey PRIMARY KEY (id),
  CONSTRAINT workouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

--FUNCTIONS--------------------------------
handle_new_user
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email,'@',1)));
  RETURN NEW;
END;

increase_ap_and_workouts
BEGIN
  UPDATE profiles SET ap_points = ap_points + p_ap, total_workouts = total_workouts + 1
  WHERE id = p_user_id;
END;

increment_routine_downloads
BEGIN
  UPDATE routines SET downloads = downloads + 1 WHERE id = p_routine_id;
END;

increment_routines_created
BEGIN
  UPDATE profiles SET routines_created = routines_created + 1 WHERE id = p_user_id;
END;

update_streak
DECLARE v_last TIMESTAMPTZ; v_today DATE := CURRENT_DATE;
BEGIN
  SELECT MAX(finished_at) INTO v_last FROM workouts WHERE user_id = p_user_id;
  IF v_last::DATE = v_today - 1 THEN
    UPDATE profiles SET streak = streak + 1 WHERE id = p_user_id;
  ELSIF v_last::DATE < v_today - 1 THEN
    UPDATE profiles SET streak = 1 WHERE id = p_user_id;
  END IF;
END;

