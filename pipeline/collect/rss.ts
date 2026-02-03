import Parser from 'rss-parser';
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
} from '../shared/utils';

const parser = new Parser({
  timeout: 30000,
  headers: {
    'User-Agent': 'InsuranceIntelBot/1.0 (+https://actuaryhelp.com)',
  },
});

interface RSSItem {
  title?: string;
  link?: string;
  content?: string;
  contentSnippet?: string;
  pubDate?: string;
  creator?: string;
  categories?: string[];
}

interface CollectionResult {
  source: Source;
  itemsCollected: number;
  itemsSkipped: number;
  errors: string[];
}

/**
 * Collect items from a single RSS source
 */
export async function collectFromRSSSource(source: Source): Promise<CollectionResult> {
  const result: CollectionResult = {
    source,
    itemsCollected: 0,
    itemsSkipped: 0,
    errors: [],
  };

  try {
    logger.info(`Collecting from RSS: ${source.name} (${source.url})`);

    const feed = await retry(
      () => parser.parseURL(source.url),
      {
        maxRetries: 3,
        onError: (error, attempt) => {
          logger.warn(`RSS fetch attempt ${attempt} failed for ${source.name}: ${error.message}`);
        },
      }
    );

    if (!feed.items || feed.items.length === 0) {
      logger.info(`No items found in feed: ${source.name}`);
      return result;
    }

    logger.info(`Found ${feed.items.length} items in ${source.name}`);

    for (const item of feed.items as RSSItem[]) {
      try {
        // Skip items without required fields
        if (!item.title || !item.link) {
          result.itemsSkipped++;
          continue;
        }

        // Get content from various possible fields
        const content = cleanContent(
          item.content || item.contentSnippet || item.title
        );

        // Generate content hash for deduplication
        const contentHash = generateContentHash(content + item.link);

        // Check for duplicates
        const isDuplicate = await checkDuplicateContent(contentHash);
        if (isDuplicate) {
          result.itemsSkipped++;
          continue;
        }

        // Detect language
        const language = detectLanguage(item.title + ' ' + content);

        // Insert raw item
        await insertRawItem({
          source_id: source.id,
          source_url: item.link,
          title: cleanContent(item.title),
          content: content,
          language: language,
          content_hash: contentHash,
        });

        result.itemsCollected++;
        logger.debug(`Collected: ${item.title.slice(0, 50)}...`);
      } catch (error) {
        const errorMessage = `Error processing item "${item.title?.slice(0, 30)}...": ${(error as Error).message}`;
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
    const errorMessage = `Failed to collect from ${source.name}: ${(error as Error).message}`;
    result.errors.push(errorMessage);
    logger.error(errorMessage);
  }

  return result;
}

/**
 * Collect from all active RSS sources
 */
export async function collectAllRSS(): Promise<{
  totalCollected: number;
  totalSkipped: number;
  totalErrors: number;
  results: CollectionResult[];
}> {
  const supabase = getSupabaseClient();

  // Get all active RSS sources that are due for checking
  const { data: sources, error } = await supabase
    .from('sources')
    .select('*')
    .eq('type', 'rss')
    .eq('status', 'active');

  if (error) {
    throw new Error(`Failed to fetch RSS sources: ${error.message}`);
  }

  if (!sources || sources.length === 0) {
    logger.info('No active RSS sources found');
    return { totalCollected: 0, totalSkipped: 0, totalErrors: 0, results: [] };
  }

  logger.info(`Starting RSS collection from ${sources.length} sources`);

  const results: CollectionResult[] = [];
  let totalCollected = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  // Process sources sequentially to avoid rate limiting
  for (const source of sources) {
    const result = await collectFromRSSSource(source as Source);
    results.push(result);
    totalCollected += result.itemsCollected;
    totalSkipped += result.itemsSkipped;
    totalErrors += result.errors.length;

    // Small delay between sources
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  logger.info(
    `RSS collection complete: ${totalCollected} collected, ${totalSkipped} skipped, ${totalErrors} errors`
  );

  return { totalCollected, totalSkipped, totalErrors, results };
}

// Main execution
if (require.main === module) {
  collectAllRSS()
    .then((result) => {
      console.log('\n=== RSS Collection Summary ===');
      console.log(`Total collected: ${result.totalCollected}`);
      console.log(`Total skipped: ${result.totalSkipped}`);
      console.log(`Total errors: ${result.totalErrors}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('RSS collection failed:', error);
      process.exit(1);
    });
}
