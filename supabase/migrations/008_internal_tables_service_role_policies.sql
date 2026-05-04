-- Add baseline policies for internal pipeline tables that currently have RLS
-- enabled but no policies. Access is restricted to service-role context.

-- -----------------------------------------------------------------------------
-- corpus_documents
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.corpus_documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'corpus_documents'
      AND policyname = 'corpus_documents_service_role_all'
  ) THEN
    CREATE POLICY corpus_documents_service_role_all
      ON public.corpus_documents
      FOR ALL
      TO public
      USING (current_setting('request.jwt.claim.role', true) = 'service_role')
      WITH CHECK (current_setting('request.jwt.claim.role', true) = 'service_role');
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- failure_logs
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.failure_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'failure_logs'
      AND policyname = 'failure_logs_service_role_all'
  ) THEN
    CREATE POLICY failure_logs_service_role_all
      ON public.failure_logs
      FOR ALL
      TO public
      USING (current_setting('request.jwt.claim.role', true) = 'service_role')
      WITH CHECK (current_setting('request.jwt.claim.role', true) = 'service_role');
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- feedback_entries
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.feedback_entries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feedback_entries'
      AND policyname = 'feedback_entries_service_role_all'
  ) THEN
    CREATE POLICY feedback_entries_service_role_all
      ON public.feedback_entries
      FOR ALL
      TO public
      USING (current_setting('request.jwt.claim.role', true) = 'service_role')
      WITH CHECK (current_setting('request.jwt.claim.role', true) = 'service_role');
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- generated_files
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.generated_files ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'generated_files'
      AND policyname = 'generated_files_service_role_all'
  ) THEN
    CREATE POLICY generated_files_service_role_all
      ON public.generated_files
      FOR ALL
      TO public
      USING (current_setting('request.jwt.claim.role', true) = 'service_role')
      WITH CHECK (current_setting('request.jwt.claim.role', true) = 'service_role');
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- research_results
-- -----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.research_results ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'research_results'
      AND policyname = 'research_results_service_role_all'
  ) THEN
    CREATE POLICY research_results_service_role_all
      ON public.research_results
      FOR ALL
      TO public
      USING (current_setting('request.jwt.claim.role', true) = 'service_role')
      WITH CHECK (current_setting('request.jwt.claim.role', true) = 'service_role');
  END IF;
END
$$;
