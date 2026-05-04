-- Follow-up policy tightening:
-- - Replace permissive public INSERT policies with validation-based checks.
-- - Remove broad full-access policy on research_runs.
-- - Restrict article write policies to service-role context.

-- -----------------------------------------------------------------------------
-- contacts: replace permissive INSERT policy with validated inputs
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS contacts_insert_public ON public.contacts;

CREATE POLICY contacts_insert_public
  ON public.contacts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(name)) BETWEEN 2 AND 120
    AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    AND length(btrim(message)) BETWEEN 10 AND 5000
  );

-- -----------------------------------------------------------------------------
-- subscribers: replace permissive INSERT policy with basic email validation
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS subscribers_insert_public ON public.subscribers;

CREATE POLICY subscribers_insert_public
  ON public.subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  );

-- -----------------------------------------------------------------------------
-- research_runs: remove broad full-access policy
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role full access runs" ON public.research_runs;

-- -----------------------------------------------------------------------------
-- articles: tighten authenticated write policies to service-role context only
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.articles;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.articles;

CREATE POLICY "Allow service role insert"
  ON public.articles
  FOR INSERT
  TO public
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'service_role'
  );

CREATE POLICY "Allow service role update"
  ON public.articles
  FOR UPDATE
  TO public
  USING (
    current_setting('request.jwt.claim.role', true) = 'service_role'
  )
  WITH CHECK (
    current_setting('request.jwt.claim.role', true) = 'service_role'
  );
