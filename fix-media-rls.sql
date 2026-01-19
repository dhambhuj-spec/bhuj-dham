-- Fix RLS policies for media table to allow public access

-- Drop existing policies
DROP POLICY IF EXISTS "Public Full Access" ON media;
DROP POLICY IF EXISTS "Public Insert" ON media;
DROP POLICY IF EXISTS "Public Update" ON media;
DROP POLICY IF EXISTS "Public Delete" ON media;
DROP POLICY IF EXISTS "Anyone can view published media" ON media;
DROP POLICY IF EXISTS "Admins can insert media" ON media;
DROP POLICY IF EXISTS "Admins can update media" ON media;
DROP POLICY IF EXISTS "Admins can delete media" ON media;

-- Enable RLS (if not already enabled)
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Allow ANYONE (including anonymous users) to view published media
CREATE POLICY "Anyone can view published media"
ON media FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Allow authenticated users to view all media (for admin dashboard)
CREATE POLICY "Authenticated can view all media"
ON media FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert media
CREATE POLICY "Authenticated can insert media"
ON media FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update media
CREATE POLICY "Authenticated can update media"
ON media FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete media
CREATE POLICY "Authenticated can delete media"
ON media FOR DELETE
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT SELECT ON media TO anon;
GRANT ALL ON media TO authenticated;
