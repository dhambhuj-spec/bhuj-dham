-- Drop and recreate the entire media table with NO RLS
DROP TABLE IF EXISTS media CASCADE;

CREATE TABLE media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  storage_path TEXT,
  storage_url TEXT,
  external_url TEXT,
  thumbnail_url TEXT,
  date DATE,
  location TEXT,
  tags TEXT[] DEFAULT '{}',
  photographer TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_featured BOOLEAN DEFAULT false,
  order_weight INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_media_status ON media(status);
CREATE INDEX idx_media_type ON media(type);
CREATE INDEX idx_media_featured ON media(is_featured);
CREATE INDEX idx_media_created_at ON media(created_at DESC);
CREATE INDEX idx_media_tags ON media USING GIN(tags);

-- Create functions
CREATE OR REPLACE FUNCTION increment_views(media_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE media SET views = views + 1 WHERE id = media_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_likes(media_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE media SET likes = likes + 1 WHERE id = media_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- NO RLS - table is completely open for demo
SELECT 'Media table recreated without RLS' AS status;
