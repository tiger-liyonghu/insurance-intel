import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local'), override: true });

import { insertRawItem, checkDuplicateContent, getSupabaseClient } from '../shared/supabase';
import { generateContentHash, detectLanguage, cleanContent, logger } from '../shared/utils';

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

  // Phase 1: Fetch known article URLs with full content
  logger.info('\n--- Phase 1: Fetching Known Innovation Articles ---');

  for (const article of INNOVATION_ARTICLES) {
    logger.info(`Fetching: ${article.title.slice(0, 60)}...`);

    const content = await fetchArticleContent(article.url);
    if (!content || content.length < 100) {
      logger.warn(`  Insufficient content, skipping`);
      continue;
    }

    const contentHash = generateContentHash(content + article.url);
    const isDuplicate = await checkDuplicateContent(contentHash);
    if (isDuplicate) {
      logger.info(`  Already exists, skipping`);
      continue;
    }

    try {
      await insertRawItem({
        source_id: sourceId,
        source_url: article.url,
        title: article.title,
        content: content,
        language: detectLanguage(article.title + ' ' + content),
        content_hash: contentHash,
      });
      totalCollected++;
      logger.info(`  + Collected with ${content.length} chars of content`);
    } catch (error) {
      logger.warn(`  Error: ${(error as Error).message}`);
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  // Phase 2: Use Google search via DuckDuckGo HTML
  logger.info('\n--- Phase 2: Searching for Innovation Cases ---');

  for (const query of SEARCH_QUERIES) {
    logger.info(`\nSearching: "${query}"`);

    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        logger.warn(`  Search failed: HTTP ${res.status}`);
        continue;
      }

      const html = await res.text();

      // Extract search result links
      const resultRegex = /class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*(?:<[^>]*>[^<]*)*)<\/a>/gi;
      let match;
      let count = 0;

      while ((match = resultRegex.exec(html)) !== null && count < 5) {
        let link = match[1];
        const title = match[2].replace(/<[^>]*>/g, '').trim();

        // Decode DuckDuckGo redirect URLs
        if (link.includes('uddg=')) {
          const decoded = decodeURIComponent(link.split('uddg=')[1]?.split('&')[0] || '');
          if (decoded) link = decoded;
        }

        if (!title || title.length < 15 || !link.startsWith('http')) continue;

        // Skip known non-innovation domains
        if (link.includes('wikipedia.org') || link.includes('investopedia.com') ||
            link.includes('indeed.com') || link.includes('linkedin.com')) continue;

        const contentHash = generateContentHash(title + link);
        const isDuplicate = await checkDuplicateContent(contentHash);
        if (isDuplicate) continue;

        // Fetch article content
        const content = await fetchArticleContent(link);
        const finalContent = content.length > 100 ? content : title;

        try {
          await insertRawItem({
            source_id: sourceId,
            source_url: link,
            title: cleanContent(title),
            content: finalContent,
            language: detectLanguage(title),
            content_hash: contentHash,
          });
          totalCollected++;
          count++;
          logger.info(`  + ${title.slice(0, 70)} (${finalContent.length} chars)`);
        } catch (error) {
          logger.warn(`  Error: ${(error as Error).message}`);
        }

        await new Promise((r) => setTimeout(r, 500));
      }
    } catch (error) {
      logger.warn(`  Search error: ${(error as Error).message}`);
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  logger.info(`\n=== Collection Complete: ${totalCollected} articles collected ===`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Web search collection failed:', error);
    process.exit(1);
  });
