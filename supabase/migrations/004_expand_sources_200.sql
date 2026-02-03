-- ============================================================
-- Source Expansion v2: Scale from 37 to 200+ sources
-- Covers: Global insurers, InsurTech, media, regulators
-- Languages: EN, ZH, JA, KO, DE, FR, ES, PT, IT, TH, MS, HI, AR
-- ============================================================

INSERT INTO sources (name, url, type, language, region, quality_score, check_frequency, status, discovered_via, config)
VALUES

-- ============================================================
-- A. GLOBAL INSURANCE COMPANIES - North America (15)
-- ============================================================
('State Farm News', 'https://newsroom.statefarm.com/', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Allstate Newsroom', 'https://www.allstatenewsroom.com/', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Progressive News', 'https://www.progressive.com/newsroom/', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('GEICO News', 'https://www.geico.com/about/newsroom/', 'website', 'en', 'north_america', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('USAA News', 'https://communities.usaa.com/t5/Press-Releases/bg-p/press-releases', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Travelers News', 'https://investor.travelers.com/news-releases', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Liberty Mutual News', 'https://www.libertymutualgroup.com/about-lm/news', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Nationwide News', 'https://www.nationwide.com/personal/about-us/newsroom/', 'website', 'en', 'north_america', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('MetLife News', 'https://www.metlife.com/about-us/newsroom/', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Prudential News', 'https://news.prudential.com/', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Cigna News', 'https://newsroom.cigna.com/', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Humana News', 'https://press.humana.com/', 'website', 'en', 'north_america', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('UnitedHealth News', 'https://www.unitedhealthgroup.com/newsroom.html', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Aflac News', 'https://www.aflac.com/about-aflac/newsroom/', 'website', 'en', 'north_america', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('Hartford News', 'https://newsroom.thehartford.com/', 'website', 'en', 'north_america', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),

-- ============================================================
-- A. GLOBAL INSURANCE COMPANIES - Europe (15)
-- ============================================================
('Zurich News', 'https://www.zurich.com/en/media/news-releases', 'website', 'en', 'europe', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Generali News', 'https://www.generali.com/media/press-releases', 'website', 'en', 'europe', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Munich Re News', 'https://www.munichre.com/en/company/media-relations/media-information-and-corporate-news.html', 'website', 'en', 'europe', 0.90, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Swiss Re News', 'https://www.swissre.com/media/news-releases.html', 'website', 'en', 'europe', 0.90, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Aviva News', 'https://www.aviva.com/newsroom/', 'website', 'en', 'europe', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Legal & General News', 'https://group.legalandgeneral.com/en/newsroom', 'website', 'en', 'europe', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('Aegon News', 'https://www.aegon.com/newsroom/', 'website', 'en', 'europe', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('NN Group News', 'https://www.nn-group.com/news-media.htm', 'website', 'en', 'europe', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('MAPFRE News', 'https://www.mapfre.com/en/press-room/', 'website', 'es', 'europe', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('Talanx News', 'https://www.talanx.com/en/newsroom', 'website', 'de', 'europe', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('SCOR News', 'https://www.scor.com/en/media/news-press-releases', 'website', 'fr', 'europe', 0.85, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('Hannover Re News', 'https://www.hannover-re.com/1690710/news', 'website', 'en', 'europe', 0.85, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('VIG News', 'https://www.vig.com/en/press.html', 'website', 'de', 'europe', 0.75, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('RSA News', 'https://www.rsagroup.com/media/news-releases/', 'website', 'en', 'europe', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('Ageas News', 'https://www.ageas.com/newsroom', 'website', 'en', 'europe', 0.75, '12 hours', 'active', 'exploration', '{"type":"company"}'),

-- ============================================================
-- A. GLOBAL INSURANCE COMPANIES - Asia Pacific (15)
-- ============================================================
('中国人寿新闻', 'https://www.chinalife.com.cn/chinalife/xwzx/', 'website', 'zh', 'china', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('中国太保新闻', 'https://www.cpic.com.cn/c/news/', 'website', 'zh', 'china', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('中国人保新闻', 'https://www.picc.com/jtxw/', 'website', 'zh', 'china', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('新华保险新闻', 'https://www.newchinalife.com/xxzx/xwdt/', 'website', 'zh', 'china', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('泰康保险新闻', 'https://www.taikang.com/about/news/', 'website', 'zh', 'china', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('AIA Group News', 'https://www.aia.com/en/media-centre', 'website', 'en', 'asia', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Manulife News', 'https://www.manulife.com/en/news.html', 'website', 'en', 'asia', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Sun Life News', 'https://www.sunlife.com/en/newsroom/', 'website', 'en', 'asia', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Tokio Marine News', 'https://www.tokiomarinehd.com/en/release_topics/', 'website', 'ja', 'japan', 0.85, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('MS&AD News', 'https://www.ms-ad-hd.com/en/news/', 'website', 'ja', 'japan', 0.85, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('Sompo News', 'https://www.sompo-hd.com/en/news/', 'website', 'ja', 'japan', 0.85, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('Samsung Life News', 'https://www.samsunglife.com/company/news/', 'website', 'ko', 'asia', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('Hyundai Marine News', 'https://www.hi.co.kr/company/news.do', 'website', 'ko', 'asia', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('FWD Group News', 'https://www.fwd.com/newsroom/', 'website', 'en', 'asia', 0.85, '6 hours', 'active', 'exploration', '{"type":"company"}'),
('Great Eastern News', 'https://www.greateasternlife.com/sg/en/about-us/media-centre.html', 'website', 'en', 'southeast_asia', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),

-- ============================================================
-- A. GLOBAL INSURANCE COMPANIES - Emerging Markets (8)
-- ============================================================
('Discovery SA News', 'https://www.discovery.co.za/corporate/newsroom', 'website', 'en', 'global', 0.85, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('Bradesco Seguros News', 'https://www.bradescoseguros.com.br/imprensa', 'website', 'pt', 'global', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('SBI Life News', 'https://www.sbilife.co.in/en/about-us/media-center', 'website', 'en', 'asia', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('Bajaj Allianz News', 'https://www.bajajallianzlife.com/about-us/media-centre.html', 'website', 'en', 'asia', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('ICICI Lombard News', 'https://www.icicilombard.com/about-us/media', 'website', 'en', 'asia', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('HDFC Life News', 'https://www.hdfclife.com/about-us/media-centre', 'website', 'en', 'asia', 0.80, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('Max Life News', 'https://www.maxlifeinsurance.com/about-us/media-centre', 'website', 'en', 'asia', 0.75, '12 hours', 'active', 'exploration', '{"type":"company"}'),
('SulAmérica News', 'https://www.sulamerica.com.br/imprensa', 'website', 'pt', 'global', 0.75, '12 hours', 'active', 'exploration', '{"type":"company"}'),

-- ============================================================
-- B. INSURTECH - North America (14)
-- ============================================================
('Hippo Insurance Blog', 'https://www.hippo.com/blog', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Next Insurance Blog', 'https://www.nextinsurance.com/blog/', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Bestow Blog', 'https://www.bestow.com/blog/', 'website', 'en', 'north_america', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Ladder Life Blog', 'https://www.ladderlife.com/blog', 'website', 'en', 'north_america', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Kin Insurance Blog', 'https://www.kin.com/blog/', 'website', 'en', 'north_america', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Branch Insurance Blog', 'https://www.ourbranch.com/blog', 'website', 'en', 'north_america', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Coalition Cyber Blog', 'https://www.coalitioninc.com/blog', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('At-Bay Blog', 'https://www.at-bay.com/articles/', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Pie Insurance Blog', 'https://www.pieinsurance.com/blog/', 'website', 'en', 'north_america', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Corvus Insurance Blog', 'https://www.corvusinsurance.com/blog', 'website', 'en', 'north_america', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Ethos Life Blog', 'https://www.ethoslife.com/blog/', 'website', 'en', 'north_america', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Clearcover Blog', 'https://clearcover.com/blog/', 'website', 'en', 'north_america', 0.75, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Openly Blog', 'https://www.openly.com/blog/', 'website', 'en', 'north_america', 0.75, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Policygenius Blog', 'https://www.policygenius.com/blog/', 'website', 'en', 'north_america', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),

-- ============================================================
-- B. INSURTECH - Europe (10)
-- ============================================================
('Wefox Blog', 'https://www.wefox.com/en-de/blog', 'website', 'de', 'europe', 0.85, '6 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Alan Blog', 'https://alan.com/blog', 'website', 'fr', 'europe', 0.85, '6 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Zego Blog', 'https://www.zego.com/blog/', 'website', 'en', 'europe', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('YuLife Blog', 'https://www.yulife.com/blog', 'website', 'en', 'europe', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('ManyPets Blog', 'https://www.manypets.com/us/blog', 'website', 'en', 'europe', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Cuvva Blog', 'https://www.cuvva.com/blog', 'website', 'en', 'europe', 0.75, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Clark DE Blog', 'https://www.clark.de/de/blog', 'website', 'de', 'europe', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Qover Blog', 'https://www.qover.com/blog', 'website', 'en', 'europe', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Descartes Underwriting', 'https://www.descartesunderwriting.com/news', 'website', 'en', 'europe', 0.85, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Tractable Blog', 'https://www.tractable.ai/blog', 'website', 'en', 'europe', 0.85, '6 hours', 'active', 'exploration', '{"type":"insurtech"}'),

-- ============================================================
-- B. INSURTECH - Asia (10)
-- ============================================================
('众安在线新闻', 'https://www.zhongan.com/open/news', 'website', 'zh', 'china', 0.90, '6 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('水滴公司新闻', 'https://www.shuidihuzhu.com/about/news', 'website', 'zh', 'china', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('蚂蚁保险新闻', 'https://www.antgroup.com/news-media', 'website', 'zh', 'china', 0.85, '6 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('PolicyBazaar Blog', 'https://www.policybazaar.com/blog/', 'website', 'en', 'asia', 0.85, '6 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Digit Insurance Blog', 'https://www.godigit.com/blog', 'website', 'en', 'asia', 0.85, '6 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Acko Blog', 'https://www.acko.com/blog/', 'website', 'en', 'asia', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Singlife Blog', 'https://singlife.com/blog/', 'website', 'en', 'southeast_asia', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('Igloo Insure Blog', 'https://www.iglooinsure.com/blog/', 'website', 'en', 'southeast_asia', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('보맵 뉴스', 'https://www.bomapp.co.kr/news', 'website', 'ko', 'asia', 0.75, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),
('InsurTech Japan News', 'https://instech.co.jp/news/', 'website', 'ja', 'japan', 0.80, '12 hours', 'active', 'exploration', '{"type":"insurtech"}'),

-- ============================================================
-- C. INDUSTRY MEDIA - English (15)
-- ============================================================
('Insurance Insider', 'https://www.insuranceinsider.com/articles', 'website', 'en', 'global', 0.90, '4 hours', 'active', 'exploration', '{"category":"media"}'),
('Intelligent Insurer', 'https://www.intelligentinsurer.com/news', 'website', 'en', 'global', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('PropertyCasualty360', 'https://www.propertycasualty360.com/', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('Risk & Insurance', 'https://riskandinsurance.com/', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('Claims Journal', 'https://www.claimsjournal.com/', 'website', 'en', 'north_america', 0.80, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('Carrier Management', 'https://www.carriermanagement.com/news/', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('Artemis ILS', 'https://www.artemis.bm/news/', 'website', 'en', 'global', 0.90, '4 hours', 'active', 'exploration', '{"category":"media"}'),
('FinTech Futures Insurance', 'https://www.fintechfutures.com/category/insurtech/', 'website', 'en', 'global', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('Dig-in InsurTech', 'https://www.dig-in.com/tag/insurtech', 'website', 'en', 'north_america', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('InsurTech Rising', 'https://insurtechrising.com/', 'website', 'en', 'global', 0.80, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('Global Reinsurance', 'https://www.globalreinsurance.com/', 'website', 'en', 'global', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('Insurance Day', 'https://insuranceday.maritimeintelligence.informa.com/', 'website', 'en', 'global', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('AM Best News', 'https://news.ambest.com/', 'website', 'en', 'global', 0.90, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('Insurance Post', 'https://www.postonline.co.uk/news', 'website', 'en', 'europe', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('Insurance Age', 'https://www.insuranceage.co.uk/news', 'website', 'en', 'europe', 0.80, '6 hours', 'active', 'exploration', '{"category":"media"}'),

-- ============================================================
-- C. INDUSTRY MEDIA - Chinese (8)
-- ============================================================
('21世纪经济报道保险', 'https://www.21jingji.com/channel/insurance', 'website', 'zh', 'china', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('新浪财经保险', 'https://finance.sina.com.cn/insurance/', 'website', 'zh', 'china', 0.80, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('和讯保险', 'https://insurance.hexun.com/', 'website', 'zh', 'china', 0.80, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('搜狐保险频道', 'https://insurance.sohu.com/', 'website', 'zh', 'china', 0.75, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('金融界保险', 'https://insurance.jrj.com.cn/', 'website', 'zh', 'china', 0.80, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('界面新闻保险', 'https://www.jiemian.com/lists/79.html', 'website', 'zh', 'china', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('36氪保险科技', 'https://36kr.com/information/insurance/', 'website', 'zh', 'china', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('亿欧保险科技', 'https://www.iyiou.com/insurance', 'website', 'zh', 'china', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),

-- ============================================================
-- C. INDUSTRY MEDIA - Japanese (5)
-- ============================================================
('保険毎日新聞', 'https://www.homai.co.jp/news/', 'website', 'ja', 'japan', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('保険市場コラム', 'https://www.hokende.com/columns', 'website', 'ja', 'japan', 0.80, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('InsTech Japan', 'https://instech.co.jp/', 'website', 'ja', 'japan', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('日経InsurTech', 'https://xtech.nikkei.com/atcl/nxt/column/18/00138/', 'website', 'ja', 'japan', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('東洋経済保険', 'https://toyokeizai.net/category/insurance', 'website', 'ja', 'japan', 0.80, '12 hours', 'active', 'exploration', '{"category":"media"}'),

-- ============================================================
-- C. INDUSTRY MEDIA - Korean (4)
-- ============================================================
('보험저널', 'https://www.insjournal.co.kr/', 'website', 'ko', 'asia', 0.80, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('인슈어테크뉴스', 'https://www.insurtechnews.co.kr/', 'website', 'ko', 'asia', 0.80, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('보험매일', 'https://www.insnews.co.kr/', 'website', 'ko', 'asia', 0.80, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('디지털보험뉴스', 'https://www.digitalinsurancenews.co.kr/', 'website', 'ko', 'asia', 0.75, '12 hours', 'active', 'exploration', '{"category":"media"}'),

-- ============================================================
-- C. INDUSTRY MEDIA - French (4)
-- ============================================================
('L''Argus de l''Assurance', 'https://www.argusdelassurance.com/tech.html', 'website', 'fr', 'europe', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('L''Agefi Assurance', 'https://www.agefi.fr/assurance', 'website', 'fr', 'europe', 0.80, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('Assurland Magazine', 'https://www.assurland.com/assurance-actualite.html', 'website', 'fr', 'europe', 0.75, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('News Assurances Pro', 'https://www.newsassurancespro.com/', 'website', 'fr', 'europe', 0.80, '12 hours', 'active', 'exploration', '{"category":"media"}'),

-- ============================================================
-- C. INDUSTRY MEDIA - German (4)
-- ============================================================
('Versicherungsbote', 'https://www.versicherungsbote.de/', 'website', 'de', 'europe', 0.80, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('Versicherungsjournal', 'https://www.versicherungsjournal.de/', 'website', 'de', 'europe', 0.80, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('AssCompact', 'https://www.asscompact.de/nachrichten', 'website', 'de', 'europe', 0.80, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('Pfefferminzia', 'https://www.pfefferminzia.de/', 'website', 'de', 'europe', 0.75, '12 hours', 'active', 'exploration', '{"category":"media"}'),

-- ============================================================
-- C. INDUSTRY MEDIA - Spanish/Portuguese (4)
-- ============================================================
('Füture Insurance', 'https://futureinsurance.es/', 'website', 'es', 'global', 0.75, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('Seguros News', 'https://segurosnews.com/', 'website', 'es', 'global', 0.80, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('CQCS Seguros', 'https://cqcs.com.br/noticias/', 'website', 'pt', 'global', 0.75, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('Revista Apólice', 'https://revistaapolice.com.br/', 'website', 'pt', 'global', 0.75, '12 hours', 'active', 'exploration', '{"category":"media"}'),

-- ============================================================
-- C. INDUSTRY MEDIA - Italian (2)
-- ============================================================
('Insurance Trade IT', 'https://www.insurancetrade.it/', 'website', 'it', 'europe', 0.75, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('Assinews', 'https://www.assinews.it/', 'website', 'it', 'europe', 0.75, '12 hours', 'active', 'exploration', '{"category":"media"}'),

-- ============================================================
-- C. INDUSTRY MEDIA - Southeast Asia (4)
-- ============================================================
('Insurance Asia News', 'https://insuranceasianews.com/', 'website', 'en', 'southeast_asia', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('Asia Insurance Post', 'https://www.asiainsurancepost.com/', 'website', 'en', 'asia', 0.80, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('Thai Insurance News', 'https://www.oic.or.th/en/news', 'website', 'th', 'southeast_asia', 0.75, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('Malaysian Insurance News', 'https://www.thestar.com.my/business/insurance', 'website', 'ms', 'southeast_asia', 0.75, '12 hours', 'active', 'exploration', '{"category":"media"}'),

-- ============================================================
-- C. INDUSTRY MEDIA - India (3)
-- ============================================================
('BFSI Insurance India', 'https://bfsi.economictimes.indiatimes.com/tag/insurance', 'website', 'en', 'asia', 0.85, '6 hours', 'active', 'exploration', '{"category":"media"}'),
('Insurance Dekho Blog', 'https://www.insurancedekho.com/blog/', 'website', 'en', 'asia', 0.75, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('Moneycontrol Insurance', 'https://www.moneycontrol.com/news/business/personal-finance/insurance/', 'website', 'en', 'asia', 0.80, '6 hours', 'active', 'exploration', '{"category":"media"}'),

-- ============================================================
-- C. INDUSTRY MEDIA - Middle East / Arabic (2)
-- ============================================================
('Middle East Insurance Review', 'https://www.meinsurancereview.com/', 'website', 'en', 'global', 0.80, '12 hours', 'active', 'exploration', '{"category":"media"}'),
('DIFC Insurance', 'https://www.difc.ae/newsroom/', 'website', 'ar', 'global', 0.75, '12 hours', 'active', 'exploration', '{"category":"media"}'),

-- ============================================================
-- D. REGULATORS (15)
-- ============================================================
('IRDAI India', 'https://www.irdai.gov.in/web/irdai/news-press-releases', 'website', 'en', 'asia', 0.90, '12 hours', 'active', 'exploration', '{"type":"regulatory"}'),
('FSA Japan', 'https://www.fsa.go.jp/en/news/', 'website', 'ja', 'japan', 0.90, '12 hours', 'active', 'exploration', '{"type":"regulatory"}'),
('FSS Korea', 'https://english.fss.or.kr/fss/eng/main.jsp', 'website', 'ko', 'asia', 0.85, '12 hours', 'active', 'exploration', '{"type":"regulatory"}'),
('BaFin Germany', 'https://www.bafin.de/EN/PublikationenDaten/Datenbanken/Meldungen/meldungen_node_en.html', 'website', 'de', 'europe', 0.90, '12 hours', 'active', 'exploration', '{"type":"regulatory"}'),
('ACPR France', 'https://acpr.banque-france.fr/en/news-press', 'website', 'fr', 'europe', 0.90, '12 hours', 'active', 'exploration', '{"type":"regulatory"}'),
('IVASS Italy', 'https://www.ivass.it/pubblicazioni-e-statistiche/pubblicazioni/comunicati-stampa/index.html', 'website', 'it', 'europe', 0.85, '12 hours', 'active', 'exploration', '{"type":"regulatory"}'),
('APRA Australia', 'https://www.apra.gov.au/news-and-publications', 'website', 'en', 'asia', 0.90, '12 hours', 'active', 'exploration', '{"type":"regulatory"}'),
('OSFI Canada', 'https://www.osfi-bsif.gc.ca/en/news', 'website', 'en', 'north_america', 0.90, '12 hours', 'active', 'exploration', '{"type":"regulatory"}'),
('IA Hong Kong', 'https://www.ia.org.hk/en/infocenter/press_releases.html', 'website', 'en', 'asia', 0.85, '12 hours', 'active', 'exploration', '{"type":"regulatory"}'),
('Bank Negara Malaysia', 'https://www.bnm.gov.my/insurance-takaful', 'website', 'ms', 'southeast_asia', 0.85, '12 hours', 'active', 'exploration', '{"type":"regulatory"}'),
('OJK Indonesia', 'https://www.ojk.go.id/en/berita-dan-kegiatan/', 'website', 'en', 'southeast_asia', 0.80, '12 hours', 'active', 'exploration', '{"type":"regulatory"}'),
('RBNZ New Zealand', 'https://www.rbnz.govt.nz/news', 'website', 'en', 'asia', 0.85, '12 hours', 'active', 'exploration', '{"type":"regulatory"}'),
('Dubai FSA', 'https://www.dfsa.ae/news', 'website', 'en', 'global', 0.80, '12 hours', 'active', 'exploration', '{"type":"regulatory"}'),
('CIMA Mexico', 'https://www.gob.mx/cnsf/prensa', 'website', 'es', 'global', 0.75, '12 hours', 'active', 'exploration', '{"type":"regulatory"}'),
('SUSEP Brazil', 'https://www.gov.br/susep/pt-br/assuntos/noticias', 'website', 'pt', 'global', 0.75, '12 hours', 'active', 'exploration', '{"type":"regulatory"}'),

-- ============================================================
-- E. RSS FEEDS - New additions (10)
-- ============================================================
('Carrier Management RSS', 'https://www.carriermanagement.com/feeds/rss/', 'rss', 'en', 'north_america', 0.85, '4 hours', 'active', 'exploration', '{"category":"news"}'),
('Artemis RSS', 'https://www.artemis.bm/feed/', 'rss', 'en', 'global', 0.90, '4 hours', 'active', 'exploration', '{"category":"news"}'),
('Claims Journal RSS', 'https://www.claimsjournal.com/rss/', 'rss', 'en', 'north_america', 0.80, '4 hours', 'active', 'exploration', '{"category":"news"}'),
('Risk & Insurance RSS', 'https://riskandinsurance.com/feed/', 'rss', 'en', 'north_america', 0.85, '4 hours', 'active', 'exploration', '{"category":"news"}'),
('PropertyCasualty360 RSS', 'https://www.propertycasualty360.com/feed/', 'rss', 'en', 'north_america', 0.85, '4 hours', 'active', 'exploration', '{"category":"news"}'),
('Insurance Post RSS', 'https://www.postonline.co.uk/rss', 'rss', 'en', 'europe', 0.85, '4 hours', 'active', 'exploration', '{"category":"news"}'),
('FinTech Futures RSS', 'https://www.fintechfutures.com/feed/', 'rss', 'en', 'global', 0.80, '4 hours', 'active', 'exploration', '{"category":"news"}'),
('AM Best RSS', 'https://news.ambest.com/rss/AMBestNews.rss', 'rss', 'en', 'global', 0.90, '4 hours', 'active', 'exploration', '{"category":"news"}'),
('Reactions Magazine RSS', 'https://www.reactionsnet.com/rss', 'rss', 'en', 'global', 0.85, '6 hours', 'active', 'exploration', '{"category":"news"}'),
('Insurance Age RSS', 'https://www.insuranceage.co.uk/rss', 'rss', 'en', 'europe', 0.80, '6 hours', 'active', 'exploration', '{"category":"news"}'),

-- ============================================================
-- F. TECH/BLOG PLATFORMS (10)
-- ============================================================
('Medium InsurTech', 'https://medium.com/tag/insurtech/latest', 'website', 'en', 'global', 0.75, '6 hours', 'active', 'exploration', '{"type":"platform"}'),
('TechCrunch Insurance', 'https://techcrunch.com/tag/insurance/', 'website', 'en', 'global', 0.85, '4 hours', 'active', 'exploration', '{"type":"platform"}'),
('Forbes Insurance', 'https://www.forbes.com/insurance/', 'website', 'en', 'global', 0.85, '6 hours', 'active', 'exploration', '{"type":"platform"}'),
('VentureBeat Insurance', 'https://venturebeat.com/tag/insurance/', 'website', 'en', 'global', 0.80, '12 hours', 'active', 'exploration', '{"type":"platform"}'),
('SiliconAngle InsurTech', 'https://siliconangle.com/tag/insurtech/', 'website', 'en', 'global', 0.80, '12 hours', 'active', 'exploration', '{"type":"platform"}'),
('Product Hunt Insurance', 'https://www.producthunt.com/topics/insurance', 'website', 'en', 'global', 0.70, '12 hours', 'active', 'exploration', '{"type":"platform"}'),
('McKinsey Insurance', 'https://www.mckinsey.com/industries/financial-services/our-insights/insurance', 'website', 'en', 'global', 0.90, '12 hours', 'active', 'exploration', '{"type":"research"}'),
('Deloitte Insurance', 'https://www.deloitte.com/global/en/Industries/financial-services/research.html', 'website', 'en', 'global', 0.90, '12 hours', 'active', 'exploration', '{"type":"research"}'),
('PwC Insurance', 'https://www.pwc.com/gx/en/industries/financial-services/insurance.html', 'website', 'en', 'global', 0.90, '12 hours', 'active', 'exploration', '{"type":"research"}'),
('EY Insurance', 'https://www.ey.com/en_gl/insurance', 'website', 'en', 'global', 0.90, '12 hours', 'active', 'exploration', '{"type":"research"}')

ON CONFLICT (url) DO NOTHING;
