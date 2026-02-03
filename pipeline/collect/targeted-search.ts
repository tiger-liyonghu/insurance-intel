import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local'), override: true });

import { insertRawItem, checkDuplicateContent, getSupabaseClient } from '../shared/supabase';
import { generateContentHash, detectLanguage, cleanContent, logger } from '../shared/utils';

/**
 * Targeted search: Use web fetch to find SPECIFIC insurance innovation cases
 * from known high-quality InsurTech news sources
 */

const TARGETED_URLS = [
  // InsurTech-focused sources with actual product news
  'https://www.insurancejournal.com/news/national/',
  'https://www.insurancejournal.com/news/international/',
  'https://www.the-digital-insurer.com/blog/',
  'https://www.dig-in.com/list/insurtech',
  'https://www.insurancetimes.co.uk/news',
  'https://siliconangle.com/tag/insurtech/',
  'https://www.finextra.com/channel/insurtech/news',
  'https://www.artemis.bm/news/',
  'https://www.carriermanagement.com/news/',
];

// Specific innovation case URLs to collect directly
// These are known high-quality innovation stories
const DIRECT_ARTICLE_URLS = [
  // Parametric insurance
  { url: 'https://www.insurancejournal.com/news/national/2025/01/', title: 'Insurance Journal Latest' },
  // Embedded insurance
  { url: 'https://www.the-digital-insurer.com/knowledge/', title: 'Digital Insurer Knowledge' },
];

async function fetchAndExtract(url: string): Promise<Array<{ title: string; link: string; content: string }>> {
  const items: Array<{ title: string; link: string; content: string }> = [];

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InsurIntelBot/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      logger.warn(`HTTP ${res.status} for ${url}`);
      return items;
    }

    const html = await res.text();

    // Extract article links and titles from HTML
    const linkRegex = /<a[^>]+href="([^"]*)"[^>]*>([^<]+)<\/a>/gi;
    let match;
    const seen = new Set<string>();

    while ((match = linkRegex.exec(html)) !== null) {
      const link = match[1];
      const title = match[2].trim();

      // Filter for article-like links
      if (
        title.length > 20 && title.length < 200 &&
        !seen.has(link) &&
        !link.includes('#') &&
        !link.includes('javascript:') &&
        !link.includes('mailto:') &&
        (link.includes('/news/') || link.includes('/blog/') || link.includes('/article/') ||
         link.includes('/2024/') || link.includes('/2025/') || link.includes('/2026/'))
      ) {
        // Make absolute URL
        let fullUrl = link;
        if (link.startsWith('/')) {
          const baseUrl = new URL(url);
          fullUrl = `${baseUrl.origin}${link}`;
        }

        seen.add(fullUrl);
        items.push({ title, link: fullUrl, content: title });
      }
    }
  } catch (error) {
    logger.error(`Error fetching ${url}: ${(error as Error).message}`);
  }

  return items;
}

async function getSourceId(): Promise<string> {
  const supabase = getSupabaseClient();

  // Use the AI Search source as the source_id for targeted items
  const { data } = await supabase
    .from('sources')
    .select('id')
    .eq('name', 'AI Search')
    .single();

  if (data) return data.id;

  // Fallback: use first active source
  const { data: fallback } = await supabase
    .from('sources')
    .select('id')
    .eq('status', 'active')
    .limit(1)
    .single();

  return fallback?.id || '';
}

async function main() {
  logger.info('=== Targeted Search for Insurance Innovation Cases ===');

  const sourceId = await getSourceId();
  let totalCollected = 0;
  let totalSkipped = 0;

  for (const url of TARGETED_URLS) {
    logger.info(`\nSearching: ${url}`);

    const items = await fetchAndExtract(url);
    logger.info(`Found ${items.length} potential articles`);

    for (const item of items.slice(0, 15)) { // Max 15 per source
      try {
        const content = cleanContent(item.content || item.title);
        const contentHash = generateContentHash(content + item.link);
        const isDuplicate = await checkDuplicateContent(contentHash);

        if (isDuplicate) {
          totalSkipped++;
          continue;
        }

        const language = detectLanguage(item.title);

        await insertRawItem({
          source_id: sourceId,
          source_url: item.link,
          title: cleanContent(item.title),
          content: content,
          language: language,
          content_hash: contentHash,
        });

        totalCollected++;
        logger.info(`  + ${item.title.slice(0, 70)}`);
      } catch (error) {
        logger.warn(`  Error: ${(error as Error).message}`);
      }
    }

    // Small delay
    await new Promise((r) => setTimeout(r, 1000));
  }

  logger.info(`\n=== Targeted Search Complete ===`);
  logger.info(`Collected: ${totalCollected}`);
  logger.info(`Skipped (duplicates): ${totalSkipped}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Targeted search failed:', error);
    process.exit(1);
  });
