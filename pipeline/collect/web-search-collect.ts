import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local'), override: true });

import { insertRawItem, checkDuplicateContentBatch, getSupabaseClient } from '../shared/supabase';
import { generateContentHash, detectLanguage, cleanContent, logger, batch as batchArray } from '../shared/utils';

/**
 * Use fetch to get real article content from specific URLs
 */

// Specific innovation case URLs with known quality content
const INNOVATION_ARTICLES = [
  // Product innovation
  { title: 'Toyota launches new short-term motor insurance product in UK', url: 'https://www.insurancetimes.co.uk/news/toyota-launches-new-short-term-motor-insurance-product/1453000.article' },
  { title: 'Fintech partners with Qover to expand travel protection offering', url: 'https://www.insurancetimes.co.uk/news/fintech-partners-with-qover-to-expand-travel-protection-offering/1452900.article' },
  { title: 'Brit Announces Renewal of $200M Cyber Consortium', url: 'https://www.insurancejournal.com/news/international/2026/01/31/811000.htm' },
  { title: 'Rokstone Launches Specialized Farm Property Program', url: 'https://www.insurancejournal.com/news/national/2026/01/28/810500.htm' },
  { title: 'Allianz Built an AI Agent to Train Claims Professionals in Virtual Reality', url: 'https://www.carriermanagement.com/news/2026/02/01/275000.htm' },
  // These are searches we'll do via Google-like queries
];

// Search queries targeting specific innovation cases
const SEARCH_QUERIES = [
  // English - Product Innovation
  'insurtech product launch 2025 2026',
  'insurance AI claims automation launch',
  'parametric insurance new product',
  'embedded insurance platform launch',
  'insurance digital onboarding innovation',
  'telematics auto insurance new feature',
  'health insurance app AI diagnosis',
  'life insurance digital underwriting platform',
  'pet insurance new product launch',
  'cyber insurance product innovation',
  'insurance chatbot customer service launch',
  'microinsurance mobile platform launch',
  'insurance blockchain product',
  'usage-based insurance new product',
  'insurance wearable device integration',
  // English - Advanced Topics
  'insurance-as-a-service API platform',
  'generative AI insurance underwriting',
  'climate insurance parametric product',
  'ESG insurance innovation launch',
  'insurance super app digital ecosystem',
  'insurance marketplace aggregator launch',
  'drone insurance product commercial',
  'insurance NFT digital asset',
  'DeFi decentralized insurance protocol',
  'insurance gamification wellness rewards',
  // Chinese - 中文搜索
  '保险科技 新产品发布 2025 2026',
  '互联网保险 创新产品',
  '数字保险平台 上线',
  '健康险 AI 智能理赔',
  '车险改革 UBI 创新',
  '寿险数字化转型 新功能',
  '惠民保 创新模式',
  '保险科技 融资 新产品',
  // Japanese - 日本語検索
  '保険テック 新製品 2025 2026',
  'デジタル保険 イノベーション 新サービス',
  '自動車保険 テレマティクス 新機能',
  '生命保険 デジタル 新商品',
  // Korean - 한국어 검색
  '인슈어테크 혁신 신제품 2025 2026',
  '보험 디지털 전환 신규 서비스',
  '자동차보험 텔레매틱스 혁신',
  // French - Recherche française
  'assurance innovation produit numérique 2025 2026',
  'insurtech france lancement nouveau produit',
  // German - Deutsche Suche
  'Versicherung Innovation digitales Produkt 2025 2026',
  'InsurTech Deutschland neues Produkt',
  // Spanish - Búsqueda en español
  'seguro innovación producto digital 2025 2026',
  'insurtech latinoamérica nuevo producto',
  // Portuguese - Pesquisa em português
  'seguro inovação produto digital 2025 2026',
  'insurtech brasil novo produto lançamento',
  // === Round 2: Delta Logic structural shift queries ===
  // Product - Boundary Expansion
  'insurance pre-existing conditions coverage innovation',
  'virtual asset crypto insurance product 2025 2026',
  'climate risk indirect loss insurance new',
  'mental health insurance innovation digital therapy',
  'cross-border medical insurance seamless product',
  'supply chain insurance parametric cargo',
  // Product - Pricing Evolution
  'real-time dynamic insurance pricing IoT sensor',
  'satellite imagery crop insurance pricing',
  'AI behavioral insurance pricing model',
  'biometric data health insurance premium',
  'connected car insurance score pricing',
  // Product - Prevention as Product
  'insurance prevention service bundle health',
  'wellness program insurance integration wearable',
  'predictive maintenance insurance industrial IoT',
  'insurance legal service bundle package',
  'chronic disease management insurance plan',
  // Product - Payout Mechanism
  'parametric insurance earthquake flood instant',
  'smart contract insurance automatic payout',
  'non-cash service delivery insurance claim',
  'index-based insurance agriculture weather',
  'flight delay parametric automatic compensation',
  // Marketing - Embedded & Contextual
  'embedded insurance e-commerce checkout',
  'car manufacturer built-in insurance Tesla BYD',
  'pharmacy platform health insurance embedded',
  'travel platform insurance integration booking',
  'gig economy worker insurance platform embedded',
  // Marketing - AI Hyper-personalization
  'AI insurance recommendation personalized',
  'insurance chatbot AI advisor personalized',
  'machine learning customer insurance matching',
  'insurtech personalization AI agent companion',
  // Marketing - Distribution Shift
  'insurance KOL influencer community distribution',
  'DAO mutual insurance decentralized community',
  'insurance distribution fintech partnership new',
  'non-traditional insurance channel innovation',
  'B2B2C insurance platform white-label',
  // Marketing - Incentive Design
  'insurance premium reward healthy behavior',
  'safe driving discount insurance reward program',
  'insurance loyalty points cashback gamification',
  'risk reduction incentive insurance program',
  'health insurance fitness tracker reward',
  // Chinese Round 2
  '带病投保 既往症 保险创新',
  '虚拟资产 NFT 保险产品',
  '气候保险 参数触发 自动赔付',
  '嵌入式保险 电商平台 场景化',
  'AI保险顾问 智能推荐 千人千面',
  '保险社群 KOC 分销创新',
  '健康管理 保险 激励机制 积分',
  '宠物保险 创新 互联网',
  '网络安全保险 数据泄露 新产品',
  '新能源车险 智能定价 车联网',
  // Japanese Round 2
  'ペット保険 新サービス 2025 2026',
  'サイバー保険 新商品 企業',
  'AI 保険 引受 自動化',
  'パラメトリック保険 地震 台風',
  // Korean Round 2
  '펫보험 혁신 디지털 2025',
  'AI 보험 심사 자동화 혁신',
  '임베디드 보험 플랫폼 혁신',
];

async function fetchArticleContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return '';

    const html = await res.text();

    // Strip HTML tags, get text content
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[^;]+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Take the middle portion (skip nav, get article body)
    if (text.length > 2000) {
      const start = Math.floor(text.length * 0.2);
      text = text.slice(start, start + 3000);
    }

    return text.slice(0, 3000);
  } catch {
    return '';
  }
}

async function getSourceId(): Promise<string> {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('sources')
    .select('id')
    .eq('name', 'AI Search')
    .single();
  if (data) return data.id;

  const { data: fallback } = await supabase
    .from('sources')
    .select('id')
    .eq('status', 'active')
    .limit(1)
    .single();
  return fallback?.id || '';
}

async function main() {
  logger.info('=== Web Search Collection for Innovation Cases ===');

  const sourceId = await getSourceId();
  let totalCollected = 0;

  // Phase 1: Fetch known article URLs with full content (concurrent)
  logger.info('\n--- Phase 1: Fetching Known Innovation Articles ---');

  const articleResults = await Promise.allSettled(
    INNOVATION_ARTICLES.map(async (article) => {
      const content = await fetchArticleContent(article.url);
      return { article, content };
    })
  );

  const articleItems: Array<{ title: string; url: string; content: string }> = [];
  for (const r of articleResults) {
    if (r.status === 'fulfilled' && r.value.content && r.value.content.length >= 100) {
      articleItems.push({
        title: r.value.article.title,
        url: r.value.article.url,
        content: r.value.content,
      });
    }
  }

  // Batch dedup check
  const articleHashes = articleItems.map(a => generateContentHash(a.content + a.url));
  const existingArticleHashes = await checkDuplicateContentBatch(articleHashes);

  for (let i = 0; i < articleItems.length; i++) {
    if (existingArticleHashes.has(articleHashes[i])) continue;
    try {
      const a = articleItems[i];
      await insertRawItem({
        source_id: sourceId,
        source_url: a.url,
        title: a.title,
        content: a.content,
        language: detectLanguage(a.title + ' ' + a.content),
        content_hash: articleHashes[i],
      });
      totalCollected++;
      logger.info(`  + ${a.title.slice(0, 60)} (${a.content.length} chars)`);
    } catch (error) {
      logger.warn(`  Error: ${(error as Error).message}`);
    }
  }

  // Phase 2: Use DuckDuckGo HTML search (concurrent batches of 5)
  logger.info('\n--- Phase 2: Searching for Innovation Cases ---');

  const queryBatches = batchArray(SEARCH_QUERIES, 5);

  for (let bi = 0; bi < queryBatches.length; bi++) {
    const queryBatch = queryBatches[bi];
    logger.info(`\nQuery batch ${bi + 1}/${queryBatches.length}`);

    // Fetch all search result pages concurrently
    const searchResults = await Promise.allSettled(
      queryBatch.map(async (query) => {
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const res = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return { query, links: [] as Array<{ link: string; title: string }> };
        const html = await res.text();

        const resultRegex = /class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*(?:<[^>]*>[^<]*)*)<\/a>/gi;
        let match;
        const links: Array<{ link: string; title: string }> = [];
        while ((match = resultRegex.exec(html)) !== null && links.length < 5) {
          let link = match[1];
          const title = match[2].replace(/<[^>]*>/g, '').trim();
          if (link.includes('uddg=')) {
            const decoded = decodeURIComponent(link.split('uddg=')[1]?.split('&')[0] || '');
            if (decoded) link = decoded;
          }
          if (!title || title.length < 15 || !link.startsWith('http')) continue;
          if (link.includes('wikipedia.org') || link.includes('investopedia.com') ||
              link.includes('indeed.com') || link.includes('linkedin.com')) continue;
          links.push({ link, title });
        }
        return { query, links };
      })
    );

    // Collect all unique links from this batch
    const allLinks: Array<{ link: string; title: string; query: string }> = [];
    const seenLinks = new Set<string>();
    for (const sr of searchResults) {
      if (sr.status !== 'fulfilled') continue;
      for (const item of sr.value.links) {
        if (!seenLinks.has(item.link)) {
          seenLinks.add(item.link);
          allLinks.push({ ...item, query: sr.value.query });
        }
      }
    }

    // Batch dedup check
    const linkHashes = allLinks.map(l => generateContentHash(l.title + l.link));
    const existingLinkHashes = await checkDuplicateContentBatch(linkHashes);

    // Filter out duplicates
    const newLinks = allLinks.filter((_, i) => !existingLinkHashes.has(linkHashes[i]));

    // Fetch article content concurrently (batches of 5)
    const contentBatches = batchArray(newLinks, 5);
    for (const contentBatch of contentBatches) {
      const contentResults = await Promise.allSettled(
        contentBatch.map(async (item) => {
          const content = await fetchArticleContent(item.link);
          return { ...item, content: content.length > 100 ? content : item.title };
        })
      );

      for (let i = 0; i < contentResults.length; i++) {
        const cr = contentResults[i];
        if (cr.status !== 'fulfilled') continue;
        const item = cr.value;
        const hash = generateContentHash(item.title + item.link);
        try {
          await insertRawItem({
            source_id: sourceId,
            source_url: item.link,
            title: cleanContent(item.title),
            content: item.content,
            language: detectLanguage(item.title),
            content_hash: hash,
          });
          totalCollected++;
          logger.info(`  + ${item.title.slice(0, 70)} (${item.content.length} chars)`);
        } catch (error) {
          logger.warn(`  Error: ${(error as Error).message}`);
        }
      }
    }

    // Brief pause between query batches
    if (bi < queryBatches.length - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  logger.info(`\n=== Collection Complete: ${totalCollected} articles collected ===`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Web search collection failed:', error);
    process.exit(1);
  });
