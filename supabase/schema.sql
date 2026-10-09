-- ============================================================
-- 人生常识知识库 - PostgreSQL / Supabase 数据库模式定义
-- 严格遵照《Vibe Coding Master Prompt V4.0》规范设计
-- ============================================================

-- 1. Concepts 概念主表
CREATE TABLE IF NOT EXISTS concepts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    canonical_question TEXT NOT NULL,
    canonical_summary TEXT NOT NULL,
    domain TEXT NOT NULL,
    topic TEXT,
    parent_concept_id TEXT,
    status TEXT NOT NULL DEFAULT 'published',
    difficulty INTEGER NOT NULL DEFAULT 1,
    origin TEXT NOT NULL DEFAULT 'imported',
    quality_score INTEGER DEFAULT 90,
    tags TEXT[] DEFAULT '{}',
    verified_at TIMESTAMPTZ,
    next_review_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Sources 权威信源表
CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    organization TEXT,
    title TEXT NOT NULL,
    author TEXT,
    url TEXT NOT NULL,
    source_type TEXT NOT NULL DEFAULT 'guideline',
    publication_date TEXT,
    region TEXT,
    language TEXT,
    retrieved_at TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    citation TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. Claims 事实与主张表
CREATE TABLE IF NOT EXISTS claims (
    id TEXT PRIMARY KEY,
    concept_id TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    claim_type TEXT NOT NULL DEFAULT 'fact',
    claim_text TEXT NOT NULL,
    canonical BOOLEAN NOT NULL DEFAULT true,
    confidence NUMERIC DEFAULT 1.0,
    evidence_level TEXT NOT NULL DEFAULT 'strong',
    status TEXT NOT NULL DEFAULT 'supported',
    version INTEGER NOT NULL DEFAULT 1,
    source_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. Cards 知识卡片表
CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    concept_id TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    primary_claim_id TEXT,
    type TEXT NOT NULL DEFAULT 'action',
    module TEXT NOT NULL DEFAULT 'life_archive',
    title TEXT NOT NULL,
    subtitle TEXT,
    one_line TEXT NOT NULL,
    body TEXT,
    misconception TEXT,
    reality TEXT,
    why TEXT,
    action_steps TEXT[] DEFAULT '{}',
    cost TEXT,
    benefit TEXT,
    notes TEXT,
    ratio TEXT,
    grade TEXT DEFAULT 'A',
    evidence_level TEXT DEFAULT 'strong',
    risk_level TEXT DEFAULT 'medium',
    angle TEXT DEFAULT 'action',
    difficulty INTEGER DEFAULT 1,
    region TEXT[] DEFAULT '{}',
    audience TEXT[] DEFAULT '{}',
    scenarios TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'published',
    published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    verified_at TIMESTAMPTZ
);

-- 5. Relations 概念关联关系表
CREATE TABLE IF NOT EXISTS relations (
    id TEXT PRIMARY KEY,
    source_concept_id TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL,
    target_concept_id TEXT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    confidence NUMERIC NOT NULL DEFAULT 1.0,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 索引配置
CREATE INDEX IF NOT EXISTS idx_cards_concept_id ON cards(concept_id);
CREATE INDEX IF NOT EXISTS idx_cards_module ON cards(module);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_claims_concept_id ON claims(concept_id);
CREATE INDEX IF NOT EXISTS idx_relations_source ON relations(source_concept_id);
CREATE INDEX IF NOT EXISTS idx_relations_target ON relations(target_concept_id);

-- Row Level Security (RLS) 安全策略（开放读写，适配无登录与后台管理场景）
ALTER TABLE concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE relations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read concepts" ON concepts FOR SELECT USING (true);
CREATE POLICY "Public read sources" ON sources FOR SELECT USING (true);
CREATE POLICY "Public read claims" ON claims FOR SELECT USING (true);
CREATE POLICY "Public read cards" ON cards FOR SELECT USING (true);
CREATE POLICY "Public read relations" ON relations FOR SELECT USING (true);

CREATE POLICY "Full access concepts" ON concepts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access sources" ON sources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access claims" ON claims FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access cards" ON cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full access relations" ON relations FOR ALL USING (true) WITH CHECK (true);
