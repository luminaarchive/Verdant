-- Fix advisor warning: public bucket allows listing.
-- Public buckets can still serve object URLs without a broad SELECT policy
-- on storage.objects. Dropping this policy removes list access.

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
