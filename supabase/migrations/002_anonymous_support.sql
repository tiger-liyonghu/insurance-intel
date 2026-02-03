-- Migration: Support anonymous voting and commenting
-- 1. Drop RLS policies that reference user_id on votes
DROP POLICY IF EXISTS "Authenticated users can vote" ON votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON votes;
DROP POLICY IF EXISTS "Anyone can read votes" ON votes;

-- 2. Drop RLS policies that reference user_id on comments
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Anyone can read comments" ON comments;

-- 3. Alter votes table: change user_id from UUID to TEXT
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_case_id_user_id_key;
DROP INDEX IF EXISTS idx_votes_user_id;
ALTER TABLE votes ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE votes ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE votes ADD CONSTRAINT votes_case_id_user_id_key UNIQUE(case_id, user_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);

-- 4. Alter comments table: change user_id to TEXT nullable, add nickname
DROP INDEX IF EXISTS idx_comments_user_id;
ALTER TABLE comments ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE comments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS nickname TEXT;
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- 5. Recreate RLS policies for anonymous access
-- Votes: anyone can insert/read/update/delete (anonymous voting)
CREATE POLICY "Anyone can read votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Anyone can vote" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update votes" ON votes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete votes" ON votes FOR DELETE USING (true);

-- Comments: anyone can insert/read, no update/delete for anonymous
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Anyone can create comments" ON comments FOR INSERT WITH CHECK (true);
