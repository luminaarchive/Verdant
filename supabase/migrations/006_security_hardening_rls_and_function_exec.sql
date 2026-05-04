-- Security hardening for advisor findings:
-- 1) Enable RLS on exposed public tables.
-- 2) Add least-privilege policies that preserve expected app flows.
-- 3) Restrict SECURITY DEFINER function execution grants.
-- 4) Pin function search_path to avoid mutable search path warnings.

-- -----------------------------------------------------------------------------
-- RLS: public.contacts
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.contacts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'contacts'
      AND policyname = 'contacts_insert_public'
  ) THEN
    CREATE POLICY contacts_insert_public
      ON public.contacts
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- RLS: public.subscribers
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.subscribers ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'subscribers'
      AND policyname = 'subscribers_insert_public'
  ) THEN
    CREATE POLICY subscribers_insert_public
      ON public.subscribers
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- RLS: public.memberships
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.memberships ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'memberships'
      AND policyname = 'memberships_select_own'
  ) THEN
    CREATE POLICY memberships_select_own
      ON public.memberships
      FOR SELECT
      TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'memberships'
      AND policyname = 'memberships_insert_own'
  ) THEN
    CREATE POLICY memberships_insert_own
      ON public.memberships
      FOR INSERT
      TO authenticated
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'memberships'
      AND policyname = 'memberships_update_own'
  ) THEN
    CREATE POLICY memberships_update_own
      ON public.memberships
      FOR UPDATE
      TO authenticated
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- SECURITY DEFINER function hardening
-- -----------------------------------------------------------------------------
ALTER FUNCTION public.handle_new_user() SET search_path = public, auth, pg_temp;
ALTER FUNCTION public.update_streak(uuid) SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_streak(uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_streak(uuid) TO service_role;
