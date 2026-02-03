-- Seed data: Initial sources for the Insurance Innovation Intelligence System
-- These are high-quality, verified sources across different regions and types

-- First, create a special source for AI-powered search results
INSERT INTO sources (id, name, url, type, language, region, quality_score, check_frequency, status, discovered_via, config) VALUES
('00000000-0000-0000-0000-000000000001', 'AI Search', 'https://ai-search.internal', 'api', 'en', 'global', 0.7, '4 hours', 'active', 'seed', '{"type": "ai_search"}');

-- Regular sources
INSERT INTO sources (name, url, type, language, region, quality_score, check_frequency, status, discovered_via, config) VALUES

-- ============================================
-- GLOBAL INSURANCE MEDIA (RSS)
-- ============================================
('Insurance Journal', 'https://www.insurancejournal.com/feed/', 'rss', 'en', 'north_america', 0.8, '4 hours', 'active', 'seed', '{"category": "news"}'),
('Insurance Business Magazine', 'https://www.insurancebusinessmag.com/rss/news/', 'rss', 'en', 'global', 0.8, '4 hours', 'active', 'seed', '{"category": "news"}'),
('Coverager', 'https://coverager.com/feed/', 'rss', 'en', 'north_america', 0.85, '4 hours', 'active', 'seed', '{"category": "insurtech"}'),
('The Digital Insurer', 'https://www.the-digital-insurer.com/feed/', 'rss', 'en', 'global', 0.85, '4 hours', 'active', 'seed', '{"category": "digital"}'),
('InsurTech News', 'https://insurtechnews.com/feed/', 'rss', 'en', 'global', 0.75, '4 hours', 'active', 'seed', '{"category": "insurtech"}'),
('Reinsurance News', 'https://www.reinsurancene.ws/feed/', 'rss', 'en', 'global', 0.7, '6 hours', 'active', 'seed', '{"category": "reinsurance"}'),
('Asia Insurance Review', 'https://www.asiainsurancereview.com/rss', 'rss', 'en', 'asia', 0.8, '4 hours', 'active', 'seed', '{"category": "asia"}'),

-- ============================================
-- CHINESE INSURANCE MEDIA
-- ============================================
('中国保险报', 'https://www.zgbxb.com/', 'website', 'zh', 'china', 0.8, '4 hours', 'active', 'seed', '{"selector": ".news-list"}'),
('慧保天下', 'https://www.ehuibao.com/', 'website', 'zh', 'china', 0.85, '4 hours', 'active', 'seed', '{"selector": ".article-list"}'),
('保观', 'https://www.baoguan.com/', 'website', 'zh', 'china', 0.8, '4 hours', 'active', 'seed', '{"selector": ".news-item"}'),
('今日保', 'https://www.jinribao.com/', 'website', 'zh', 'china', 0.75, '6 hours', 'active', 'seed', '{"selector": ".article"}'),

-- ============================================
-- JAPANESE INSURANCE MEDIA
-- ============================================
('保険毎日新聞', 'https://www.homai.co.jp/', 'website', 'ja', 'japan', 0.75, '6 hours', 'active', 'seed', '{"selector": ".news"}'),
('NikkeiXTECH Insurance', 'https://xtech.nikkei.com/atcl/nxt/column/insurance/', 'website', 'ja', 'japan', 0.8, '6 hours', 'active', 'seed', '{}'),

-- ============================================
-- EUROPEAN INSURANCE MEDIA
-- ============================================
('Insurance Times UK', 'https://www.insurancetimes.co.uk/rss', 'rss', 'en', 'europe', 0.8, '4 hours', 'active', 'seed', '{"category": "uk"}'),
('Versicherungswirtschaft', 'https://www.vwheute.de/feed/', 'rss', 'de', 'europe', 0.75, '6 hours', 'active', 'seed', '{"category": "germany"}'),
('L''Argus de l''assurance', 'https://www.argusdelassurance.com/', 'website', 'fr', 'europe', 0.75, '6 hours', 'active', 'seed', '{}'),

-- ============================================
-- INSURTECH DATABASES
-- ============================================
('Crunchbase InsurTech', 'https://www.crunchbase.com/hub/insurtech-companies', 'website', 'en', 'global', 0.9, '12 hours', 'active', 'seed', '{"type": "database"}'),
('CB Insights InsurTech', 'https://www.cbinsights.com/research/insurtech/', 'website', 'en', 'global', 0.9, '12 hours', 'active', 'seed', '{"type": "research"}'),

-- ============================================
-- REGULATORY AUTHORITIES
-- ============================================
('NAIC News', 'https://content.naic.org/news', 'website', 'en', 'north_america', 0.9, '12 hours', 'active', 'seed', '{"type": "regulatory"}'),
('中国银保监会', 'https://www.cbirc.gov.cn/', 'website', 'zh', 'china', 0.95, '6 hours', 'active', 'seed', '{"type": "regulatory"}'),
('FCA UK', 'https://www.fca.org.uk/news', 'website', 'en', 'europe', 0.9, '12 hours', 'active', 'seed', '{"type": "regulatory"}'),
('EIOPA', 'https://www.eiopa.europa.eu/media/news_en', 'website', 'en', 'europe', 0.9, '12 hours', 'active', 'seed', '{"type": "regulatory"}'),
('MAS Singapore', 'https://www.mas.gov.sg/news', 'website', 'en', 'southeast_asia', 0.9, '12 hours', 'active', 'seed', '{"type": "regulatory"}'),

-- ============================================
-- MAJOR INSURANCE COMPANIES (Press Releases)
-- ============================================
('Ping An Press', 'https://group.pingan.com/media/news.html', 'website', 'en', 'china', 0.85, '6 hours', 'active', 'seed', '{"type": "company"}'),
('AXA Newsroom', 'https://www.axa.com/en/newsroom', 'website', 'en', 'global', 0.85, '6 hours', 'active', 'seed', '{"type": "company"}'),
('Allianz News', 'https://www.allianz.com/en/press.html', 'website', 'en', 'global', 0.85, '6 hours', 'active', 'seed', '{"type": "company"}'),
('Lemonade Blog', 'https://www.lemonade.com/blog/', 'website', 'en', 'north_america', 0.8, '6 hours', 'active', 'seed', '{"type": "insurtech"}'),
('Root Insurance News', 'https://www.joinroot.com/blog/', 'website', 'en', 'north_america', 0.75, '12 hours', 'active', 'seed', '{"type": "insurtech"}'),
('Oscar Health Blog', 'https://www.hioscar.com/blog', 'website', 'en', 'north_america', 0.8, '12 hours', 'active', 'seed', '{"type": "insurtech"}'),

-- ============================================
-- SOUTHEAST ASIA
-- ============================================
('Insurance Asia News', 'https://insuranceasianews.com/', 'website', 'en', 'asia', 0.8, '6 hours', 'active', 'seed', '{}'),
('Thailand Insurance News', 'https://www.oic.or.th/', 'website', 'th', 'southeast_asia', 0.7, '12 hours', 'active', 'seed', '{"type": "regulatory"}');
