    -- Create media table
    CREATE TABLE IF NOT EXISTS media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
    
    -- Storage info
    storage_path TEXT, -- Path in Supabase storage
    storage_url TEXT, -- Public URL from storage
    external_url TEXT, -- YouTube, Drive, or other external URL
    thumbnail_url TEXT, -- Thumbnail for videos
    
    -- Metadata
    date DATE,
    location TEXT,
    tags TEXT[] DEFAULT '{}',
    photographer TEXT,
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    is_featured BOOLEAN DEFAULT false,
    order_weight INTEGER DEFAULT 0,
    
    -- Engagement
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_media_status ON media(status);
    CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
    CREATE INDEX IF NOT EXISTS idx_media_featured ON media(is_featured);
    CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_media_tags ON media USING GIN(tags);

    -- Create function to increment views
    CREATE OR REPLACE FUNCTION increment_views(media_id UUID)
    RETURNS void AS $$
    BEGIN
    UPDATE media
    SET views = views + 1
    WHERE id = media_id;
    END;
    $$ LANGUAGE plpgsql;

    -- Create function to increment likes
    CREATE OR REPLACE FUNCTION increment_likes(media_id UUID)
    RETURNS void AS $$
    BEGIN
    UPDATE media
    SET likes = likes + 1
    WHERE id = media_id;
    END;
    $$ LANGUAGE plpgsql;

    -- Create function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Create trigger for updated_at
    CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

    -- Enable Row Level Security
    ALTER TABLE media ENABLE ROW LEVEL SECURITY;

    -- Simple policies for demo app (restrict in production)
    CREATE POLICY "Public Full Access"
    ON media FOR SELECT
    USING (true);

    CREATE POLICY "Public Insert"
    ON media FOR INSERT
    WITH CHECK (true);

    CREATE POLICY "Public Update"
    ON media FOR UPDATE
    USING (true);

    CREATE POLICY "Public Delete"
    ON media FOR DELETE
    USING (true);

    -- Create storage bucket (run this in Supabase Dashboard -> Storage)
    -- Bucket name: 'media'
    -- Public: true
    -- File size limit: 100MB
    -- Allowed MIME types: image/*, video/*

-- Create tags table for tag management
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on tag name
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- RLS policies for tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tags"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert tags"
  ON tags FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete tags"
  ON tags FOR DELETE
  USING (true);

-- Insert default tags
INSERT INTO tags (name) VALUES 
  ('Darshan'),
  ('Aarti'),
  ('Festival'),
  ('Architecture'),
  ('Abhishek'),
  ('Celebration'),
  ('Seva'),
  ('Procession')
ON CONFLICT (name) DO NOTHING;
