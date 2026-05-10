-- Add missing profile columns for enhanced profile page
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS website TEXT;
