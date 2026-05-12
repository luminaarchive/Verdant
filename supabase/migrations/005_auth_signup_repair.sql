-- ═══════════════════════════════════════════════════════════════════
-- NaLIAI Auth Signup Repair
-- Run this in Supabase SQL Editor (production first, then staging)
-- Safe to run multiple times (idempotent)
-- ═══════════════════════════════════════════════════════════════════

-- 1) Ensure profile table exists before trigger execution.
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name        TEXT,
  organization        TEXT,
  role                TEXT,
  research_focus      TEXT,
  subscription_tier   TEXT DEFAULT 'seeds',
  research_count      INTEGER DEFAULT 0,
  streak_days         INTEGER DEFAULT 0,
  streak_last_date    DATE,
  tree_stage          TEXT DEFAULT 'seedling',
  email_notifications BOOLEAN DEFAULT false,
  joined_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS organization TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS research_focus TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'seeds';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS research_count INTEGER DEFAULT 0;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS streak_last_date DATE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS tree_stage TEXT DEFAULT 'seedling';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT false;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2) Repair trigger function so signup cannot fail because of profile side-effects.
--    Key rule: ALWAYS return NEW, swallow internal profile errors.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Guard clause: never block auth signup if profile table has drift/migration lag.
  IF to_regclass('public.user_profiles') IS NULL THEN
    RETURN NEW;
  END IF;

  BEGIN
    INSERT INTO public.user_profiles (id, display_name, organization, updated_at)
    VALUES (
      NEW.id,
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name', ''), split_part(NEW.email, '@', 1)),
      NULLIF(NEW.raw_user_meta_data->>'organization', ''),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
      SET
        display_name = COALESCE(EXCLUDED.display_name, public.user_profiles.display_name),
        organization = COALESCE(EXCLUDED.organization, public.user_profiles.organization),
        updated_at = NOW();
  EXCEPTION
    WHEN OTHERS THEN
      -- Intentionally ignored to keep auth.users insert successful.
      NULL;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 3) Backfill existing users that may have no profile row.
INSERT INTO public.user_profiles (id, display_name, updated_at)
SELECT
  u.id,
  COALESCE(NULLIF(u.raw_user_meta_data->>'display_name', ''), split_part(u.email, '@', 1)),
  NOW()
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 4) Keep baseline RLS policy present for authenticated users.
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_profiles'
      AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.user_profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- ═══════════════════════════════════════════════════════════════════
-- Expected outcome:
-- - auth signup no longer fails with "Database error saving new user"
-- - profile row is created/upserted best-effort without blocking auth
-- ═══════════════════════════════════════════════════════════════════
