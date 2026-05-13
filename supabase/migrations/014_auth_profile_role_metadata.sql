CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, institution)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'student'),
    NEW.raw_user_meta_data->>'institution'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    role = COALESCE(EXCLUDED.role, public.users.role),
    institution = COALESCE(EXCLUDED.institution, public.users.institution);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
