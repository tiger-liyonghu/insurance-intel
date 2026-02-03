import * as cheerio from 'cheerio';
import {
  getSupabaseClient,
  Source,
  insertRawItem,
  updateSourceLastChecked,
  checkDuplicateContent,
} from '../shared/supabase';
import {
  generateContentHash,
  detectLanguage,
  cleanContent,
  logger,
  retry,
  sleep,
} from '../shared/utils';

interface ScrapedItem {
  title: string;
  url: string;
  content: string;
}

interface ScraperConfig {
  articleSelector?: string;
  titleSelector?: string;
  linkSelector?: string;
  contentSelector?: string;
  baseUrl?: string;
}

interface CollectionResult {
  source: Source;
  itemsCollected: number;
  itemsSkipped: number;
  errors: string[];
}

/**
 * Fetch HTML content from a URL
 */
async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; InsuranceIntelBot/1.0; +https://actuaryhelp.com)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5,zh-CN;q=0.3',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.text();
}

/**
 * Default scraper for generic news sites
 */
function defaultScraper($: cheerio.CheerioAPI, config: ScraperConfig): ScrapedItem[] {
  const items: ScrapedItem[] = [];
  const baseUrl = config.baseUrl || '';

  // Try common article selectors
  const articleSelectors = config.articleSelector
    ? [config.articleSelector]
    : [
        'article',
        '.article',
        '.news-item',
        '.post',
        '.entry',
        '.story',
        '[class*="article"]',
        '[class*="news"]',
        '.list-item',
        'li.item',
      ];

  for (const selector of articleSelectors) {
    const articles = $(selector);
    if (articles.length > 0) {
      articles.each((_, element) => {
        const $el = $(element);

        // Find title
        const titleSelectors = config.titleSelector
          ? [config.titleSelector]
          : ['h1', 'h2', 'h3', '.title', 'a.title', '[class*="title"]', 'a:first'];

        let title = '';
        let link = '';

        for (const ts of titleSelectors) {
          const titleEl = $el.find(ts).first();
          if (titleEl.length) {
            title = titleEl.text().trim();
            // Try to get link from title element or its parent anchor
            link = titleEl.attr('href') || titleEl.find('a').attr('href') || titleEl.parent('a').attr('href') || '';
            if (title) break;
          }
        }

        // If no title found, skip
        if (!title) return;

        // Find link if not found yet
        if (!link) {
          const linkEl = $el.find('a').first();
          link = linkEl.attr('href') || '';
        }

        // Resolve relative URLs
        if (link && !link.startsWith('http')) {
          if (link.startsWith('/')) {
            link = baseUrl + link;
          } else {
            link = baseUrl + '/' + link;
          }
        }

        // Skip if no valid link
        if (!link || !link.startsWith('http')) return;

        // Get content/summary
        const contentSelectors = config.contentSelector
          ? [config.contentSelector]
          : ['.summary', '.excerpt', '.description', 'p', '.content'];

        let content = '';
        for (const cs of contentSelectors) {
          const contentEl = $el.find(cs).first();
          if (contentEl.length) {
            content = contentEl.text().trim();
            if (content && content !== title) break;
          }
        }

        // Use title as content if no separate content found
        if (!content) {
          content = title;
        }

        items.push({ title, url: link, content });
      });

      // If we found items, don't try other selectors
      if (items.length > 0) break;
    }
  }

  return items;
}

/**
 * Site-specific scrapers
 */
const siteScrapers: Record<string, (html: string, source: Source) => ScrapedItem[]> = {
  // Chinese insurance sites
  'zgbxb.com': (html, source) => {
    const $ = cheerio.load(html);
    return defaultScraper($, {
      baseUrl: new URL(source.url).origin,
      articleSelector: '.news-list li',
      titleSelector: 'a',
    });
  },

  'ehuibao.com': (html, source) => {
    const $ = cheerio.load(html);
    return defaultScraper($, {
      baseUrl: new URL(source.url).origin,
      articleSelector: '.article-item',
    });
  },

  // InsurTech sites
  'coverager.com': (html, source) => {
    const $ = cheerio.load(html);
    return defaultScraper($, {
      baseUrl: new URL(source.url).origin,
      articleSelector: 'article',
    });
  },

  // Company press releases
  'pingan.com': (html, source) => {
    const $ = cheerio.load(html);
    return defaultScraper($, {
      baseUrl: new URL(source.url).origin,
      articleSelector: '.news-item',
    });
  },
};

/**
 * Get the appropriate scraper for a source
 */
function getScraperForSource(source: Source): (html: string, source: Source) => ScrapedItem[] {
  const hostname = new URL(source.url).hostname.replace('www.', '');

  // Check for site-specific scraper
  for (const [domain, scraper] of Object.entries(siteScrapers)) {
    if (hostname.includes(domain)) {
      return scraper;
    }
  }

  // Use default scraper with config from source
  return (html: string, source: Source) => {
    const $ = cheerio.load(html);
    const config = (source.config as ScraperConfig) || {};
    return defaultScraper($, {
      ...config,
      baseUrl: new URL(source.url).origin,
    });
  };
}

/**
 * Collect items from a single website source
 */
export async function collectFromWebSource(source: Source): Promise<CollectionResult> {
  const result: CollectionResult = {
    source,
    itemsCollected: 0,
    itemsSkipped: 0,
    errors: [],
  };

  try {
    logger.info(`Scraping website: ${source.name} (${source.url})`);

    const html = await retry(
      () => fetchHTML(source.url),
      {
        maxRetries: 3,
        onError: (error, attempt) => {
          logger.warn(`Fetch attempt ${attempt} failed for ${source.name}: ${error.message}`);
        },
      }
    );

    const scraper = getScraperForSource(source);
    const items = scraper(html, source);

    if (items.length === 0) {
      logger.info(`No items found on ${source.name}`);
      return result;
    }

    logger.info(`Found ${items.length} items on ${source.name}`);

    for (const item of items) {
      try {
        // Clean content
        const cleanedTitle = cleanContent(item.title);
        const cleanedContent = cleanContent(item.content);

        // Skip items with very short titles
        if (cleanedTitle.length < 10) {
          result.itemsSkipped++;
          continue;
        }

        // Generate content hash for deduplication
        const contentHash = generateContentHash(cleanedContent + item.url);

        // Check for duplicates
        const isDuplicate = await checkDuplicateContent(contentHash);
        if (isDuplicate) {
          result.itemsSkipped++;
          continue;
        }

        // Detect language
        const language = detectLanguage(cleanedTitle + ' ' + cleanedContent);

        // Insert raw item
        await insertRawItem({
          source_id: source.id,
          source_url: item.url,
          title: cleanedTitle,
          content: cleanedContent,
          language: language,
          content_hash: contentHash,
        });

        result.itemsCollected++;
        logger.debug(`Collected: ${cleanedTitle.slice(0, 50)}...`);
      } catch (error) {
        const errorMessage = `Error processing item "${item.title.slice(0, 30)}...": ${(error as Error).message}`;
        result.errors.push(errorMessage);
        logger.error(errorMessage);
      }
    }

    // Update source last checked time
    await updateSourceLastChecked(source.id);

    logger.info(
      `Completed ${source.name}: ${result.itemsCollected} collected, ${result.itemsSkipped} skipped`
    );
  } catch (error) {
    const errorMessage = `Failed to scrape ${source.name}: ${(error as Error).message}`;
    result.errors.push(errorMessage);
    logger.error(errorMessage);
  }

  return result;
}

/**
 * Collect from all active website sources
 */
export async function collectAllWebsites(): Promise<{
  totalCollected: number;
  totalSkipped: number;
  totalErrors: number;
  results: CollectionResult[];
}> {
  const supabase = getSupabaseClient();

  // Get all active website sources
  const { data: sources, error } = await supabase
    .from('sources')
    .select('*')
    .eq('type', 'website')
    .eq('status', 'active');

  if (error) {
    throw new Error(`Failed to fetch website sources: ${error.message}`);
  }

  if (!sources || sources.length === 0) {
    logger.info('No active website sources found');
    return { totalCollected: 0, totalSkipped: 0, totalErrors: 0, results: [] };
  }

  logger.info(`Starting web scraping from ${sources.length} sources`);

  const results: CollectionResult[] = [];
  let totalCollected = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  // Process sources sequentially with delays to be polite
  for (const source of sources) {
    const result = await collectFromWebSource(source as Source);
    results.push(result);
    totalCollected += result.itemsCollected;
    totalSkipped += result.itemsSkipped;
    totalErrors += result.errors.length;

    // Longer delay between websites to be respectful
    await sleep(2000);
  }

  logger.info(
    `Web scraping complete: ${totalCollected} collected, ${totalSkipped} skipped, ${totalErrors} errors`
  );

  return { totalCollected, totalSkipped, totalErrors, results };
}

// Main execution
if (require.main === module) {
  collectAllWebsites()
    .then((result) => {
      console.log('\n=== Web Scraping Summary ===');
      console.log(`Total collected: ${result.totalCollected}`);
      console.log(`Total skipped: ${result.totalSkipped}`);
      console.log(`Total errors: ${result.totalErrors}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Web scraping failed:', error);
      process.exit(1);
    });
}
