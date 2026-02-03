-- Insurance Innovation Intelligence System
-- Initial Database Schema
-- Version 1.0

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE source_type AS ENUM ('rss', 'website', 'api', 'social', 'patent', 'app_store');
CREATE TYPE source_status AS ENUM ('active', 'probation', 'disabled');
CREATE TYPE source_discovery AS ENUM ('seed', 'entity_extraction', 'reference', 'exploration');
CREATE TYPE screening_status AS ENUM ('pending', 'passed', 'rejected');
CREATE TYPE innovation_type AS ENUM ('product', 'marketing', 'cx');
CREATE TYPE insurance_line AS ENUM ('property', 'health', 'life');
CREATE TYPE sentiment_type AS ENUM ('positive', 'negative');
CREATE TYPE case_status AS ENUM ('ready', 'published', 'pending_supplement');

-- ============================================
-- TABLES
-- ============================================

-- 1. sources 信息源表
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    type source_type NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    region TEXT NOT NULL DEFAULT 'global',
    quality_score FLOAT DEFAULT 0.5,
    check_frequency INTERVAL NOT NULL DEFAULT '4 hours',
    last_checked_at TIMESTAMPTZ,
    status source_status NOT NULL DEFAULT 'active',
    discovered_via source_discovery DEFAULT 'seed',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. raw_items 原始采集表
CREATE TABLE raw_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    screening_status screening_status DEFAULT 'pending',
    screening_result JSONB,
    content_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for deduplication
CREATE INDEX idx_raw_items_content_hash ON raw_items(content_hash);
CREATE INDEX idx_raw_items_screening_status ON raw_items(screening_status);
CREATE INDEX idx_raw_items_collected_at ON raw_items(collected_at DESC);

-- 3. cases 案例表 (Core)
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    raw_item_id UUID NOT NULL REFERENCES raw_items(id) ON DELETE CASCADE,
    innovation_type innovation_type NOT NULL,
    insurance_line insurance_line NOT NULL,
    sentiment sentiment_type NOT NULL,
    headline_en TEXT NOT NULL,
    headline_zh TEXT NOT NULL,
    analysis_en JSONB NOT NULL,
    analysis_zh JSONB NOT NULL,
    source_urls TEXT[] NOT NULL DEFAULT '{}',
    company_names TEXT[] NOT NULL DEFAULT '{}',
    region TEXT NOT NULL DEFAULT 'global',
    status case_status NOT NULL DEFAULT 'ready',
    supplement_rounds INT DEFAULT 0,
    quality_score FLOAT,
    published_at TIMESTAMPTZ,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    view_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for cases
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_innovation_type ON cases(innovation_type);
CREATE INDEX idx_cases_insurance_line ON cases(insurance_line);
CREATE INDEX idx_cases_sentiment ON cases(sentiment);
CREATE INDEX idx_cases_published_at ON cases(published_at DESC);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX idx_cases_matrix ON cases(innovation_type, insurance_line, sentiment);

-- Full-text search index
CREATE INDEX idx_cases_search ON cases USING gin(
    to_tsvector('english', headline_en || ' ' || COALESCE(analysis_en->>'layer1', ''))
);

-- 4. comments 评论表
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_case_id ON comments(case_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- 5. votes 投票表
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(case_id, user_id)
);

CREATE INDEX idx_votes_case_id ON votes(case_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);

-- 6. pipeline_runs 管道运行日志表
CREATE TABLE pipeline_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'running',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    items_processed INT DEFAULT 0,
    items_succeeded INT DEFAULT 0,
    items_failed INT DEFAULT 0,
    error_log JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_pipeline_runs_name ON pipeline_runs(pipeline_name);
CREATE INDEX idx_pipeline_runs_started_at ON pipeline_runs(started_at DESC);

-- 7. discovered_entities 发现的实体表 (用于信息源自进化)
CREATE TABLE discovered_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    discovered_from UUID REFERENCES raw_items(id),
    url TEXT,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_discovered_entities_processed ON discovered_entities(processed);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_sources_updated_at
    BEFORE UPDATE ON sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update vote counts on cases
CREATE OR REPLACE FUNCTION update_case_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote_type = 1 THEN
            UPDATE cases SET upvotes = upvotes + 1 WHERE id = NEW.case_id;
        ELSE
            UPDATE cases SET downvotes = downvotes + 1 WHERE id = NEW.case_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 1 THEN
            UPDATE cases SET upvotes = upvotes - 1 WHERE id = OLD.case_id;
        ELSE
            UPDATE cases SET downvotes = downvotes - 1 WHERE id = OLD.case_id;
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.vote_type = 1 AND NEW.vote_type = -1 THEN
            UPDATE cases SET upvotes = upvotes - 1, downvotes = downvotes + 1 WHERE id = NEW.case_id;
        ELSIF OLD.vote_type = -1 AND NEW.vote_type = 1 THEN
            UPDATE cases SET upvotes = upvotes + 1, downvotes = downvotes - 1 WHERE id = NEW.case_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_case_votes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_case_votes();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Public read access for published cases
CREATE POLICY "Published cases are viewable by everyone"
    ON cases FOR SELECT
    USING (status = 'published');

-- Service role can do everything
CREATE POLICY "Service role has full access to sources"
    ON sources FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to raw_items"
    ON raw_items FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to cases"
    ON cases FOR ALL
    USING (auth.role() = 'service_role');

-- Comments: users can create their own, read all
CREATE POLICY "Anyone can read comments"
    ON comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create comments"
    ON comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON comments FOR DELETE
    USING (auth.uid() = user_id);

-- Votes: users can manage their own votes
CREATE POLICY "Authenticated users can vote"
    ON votes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
    ON votes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
    ON votes FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read votes"
    ON votes FOR SELECT
    USING (true);
