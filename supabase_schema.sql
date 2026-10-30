-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Create the posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  author TEXT NOT NULL DEFAULT 'Anonymous',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  likes INTEGER DEFAULT 0
);

-- Enable Row Level Security (required by Supabase)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access (SELECT)
DROP POLICY IF EXISTS "Allow public read" ON posts;
CREATE POLICY "Allow public read" ON posts
  FOR SELECT USING (true);

-- Allow public insert
DROP POLICY IF EXISTS "Allow public insert" ON posts;
CREATE POLICY "Allow public insert" ON posts
  FOR INSERT WITH CHECK (true);

-- Allow public update
DROP POLICY IF EXISTS "Allow public update" ON posts;
CREATE POLICY "Allow public update" ON posts
  FOR UPDATE USING (true);

-- Allow public delete
DROP POLICY IF EXISTS "Allow public delete" ON posts;
CREATE POLICY "Allow public delete" ON posts
  FOR DELETE USING (true);

-- ========================================================
-- ENABLE REALTIME ON POSTS TABLE
-- ========================================================
-- Set replica identity to full so UPDATE and DELETE events include the complete row payload
ALTER TABLE posts REPLICA IDENTITY FULL;

-- Add the posts table to Supabase Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE posts;
  END IF;
END $$;


-- Seed with sample posts
INSERT INTO posts (title, subtitle, content, cover_image, tags, author, status, likes) VALUES
(
  'The Art of Minimalist Engineering',
  'Why doing less is often the best approach to building scalable software.',
  E'## The Burden of Complexity\nIn modern software development, there''s a strong temptation to adopt the latest tools, microservices architectures, and state management libraries before truly needing them. We convince ourselves that we are preparing for scale.\n\n> \"Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.\" - Antoine de Saint-Exupéry\n\n### What is Minimalist Engineering?\n1. **Solve only the current problem.** Don''t over-abstract.\n2. **Choose boring technology.** Predictability over hype.\n3. **Delete code relentlessly.** Code is a liability, not an asset.\n\nHere is a simple example in Python of taking a minimal approach:\n```python\ndef process_data(data):\n    # Instead of a complex pipeline, use a simple generator\n    return (item * 2 for item in data if item > 0)\n```\n\nWhen building your next project, ask yourself: *What is the absolute minimum required to ship this value to the user?*',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
  ARRAY['engineering', 'minimalism', 'architecture'],
  'Alice Chen',
  'published',
  42
),
(
  'CSS Variables in the Real World',
  'A practical guide to implementing robust theming with pure CSS.',
  E'CSS variables (custom properties) have revolutionized how we write styles. No longer do we strictly need preprocessors for dynamic theming.\n\n## The Basics\nDeclaring a variable is simple. We usually do this at the `:root` level so it''s accessible everywhere:\n\n```css\n:root {\n  --primary-color: #E8A838;\n  --bg-color: #1a1a1a;\n  --text-color: #e8e0d5;\n}\n```\n\n## Dark Mode Implementation\nThe true power shines when implementing dark/light modes. Instead of redeclaring all your components, simply redefine the variables inside a class or media query:\n\n```css\nbody.light-theme {\n  --primary-color: #C0392B;\n  --bg-color: #FAF7F2;\n  --text-color: #1A1A1A;\n}\n```\n\n*That''s it.* All components using these variables automatically update. This approach is highly performant and easy to maintain.',
  'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=1200',
  ARRAY['css', 'frontend', 'design'],
  'Bob Smith',
  'published',
  128
);
