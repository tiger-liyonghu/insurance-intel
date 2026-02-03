import { collectAllRSS } from './rss';
import { collectAllWebsites } from './web-scraper';
import { runAISearch } from './ai-search';
import { startPipelineRun, completePipelineRun } from '../shared/supabase';
import { logger } from '../shared/utils';

interface CollectionSummary {
  rss: { collected: number; skipped: number; errors: number };
  web: { collected: number; skipped: number; errors: number };
  ai: { collected: number; skipped: number; errors: number };
  total: { collected: number; skipped: number; errors: number };
}

/**
 * Run the complete collection pipeline
 */
export async function runCollectionPipeline(): Promise<CollectionSummary> {
  const runId = await startPipelineRun('collect');
  const errorLog: Array<{ message: string; timestamp: string }> = [];

  const summary: CollectionSummary = {
    rss: { collected: 0, skipped: 0, errors: 0 },
    web: { collected: 0, skipped: 0, errors: 0 },
    ai: { collected: 0, skipped: 0, errors: 0 },
    total: { collected: 0, skipped: 0, errors: 0 },
  };

  try {
    logger.info('=== Starting Collection Pipeline ===');

    // 1. Collect from RSS feeds
    logger.info('\n--- Phase 1: RSS Collection ---');
    try {
      const rssResult = await collectAllRSS();
      summary.rss = {
        collected: rssResult.totalCollected,
        skipped: rssResult.totalSkipped,
        errors: rssResult.totalErrors,
      };
    } catch (error) {
      const msg = `RSS collection failed: ${(error as Error).message}`;
      logger.error(msg);
      errorLog.push({ message: msg, timestamp: new Date().toISOString() });
    }

    // 2. Scrape websites
    logger.info('\n--- Phase 2: Web Scraping ---');
    try {
      const webResult = await collectAllWebsites();
      summary.web = {
        collected: webResult.totalCollected,
        skipped: webResult.totalSkipped,
        errors: webResult.totalErrors,
      };
    } catch (error) {
      const msg = `Web scraping failed: ${(error as Error).message}`;
      logger.error(msg);
      errorLog.push({ message: msg, timestamp: new Date().toISOString() });
    }

    // 3. AI-powered search (to fill gaps)
    logger.info('\n--- Phase 3: AI Search ---');
    try {
      const aiResult = await runAISearch();
      summary.ai = {
        collected: aiResult.totalCollected,
        skipped: aiResult.totalSkipped,
        errors: aiResult.totalErrors,
      };
    } catch (error) {
      const msg = `AI search failed: ${(error as Error).message}`;
      logger.error(msg);
      errorLog.push({ message: msg, timestamp: new Date().toISOString() });
    }

    // Calculate totals
    summary.total = {
      collected: summary.rss.collected + summary.web.collected + summary.ai.collected,
      skipped: summary.rss.skipped + summary.web.skipped + summary.ai.skipped,
      errors: summary.rss.errors + summary.web.errors + summary.ai.errors,
    };

    // Complete pipeline run
    await completePipelineRun(
      runId,
      errorLog.length > 0 ? 'completed' : 'completed',
      {
        processed: summary.total.collected + summary.total.skipped,
        succeeded: summary.total.collected,
        failed: summary.total.errors,
      },
      errorLog
    );

    logger.info('\n=== Collection Pipeline Complete ===');
    logger.info(`RSS:   ${summary.rss.collected} collected, ${summary.rss.skipped} skipped, ${summary.rss.errors} errors`);
    logger.info(`Web:   ${summary.web.collected} collected, ${summary.web.skipped} skipped, ${summary.web.errors} errors`);
    logger.info(`AI:    ${summary.ai.collected} collected, ${summary.ai.skipped} skipped, ${summary.ai.errors} errors`);
    logger.info(`TOTAL: ${summary.total.collected} collected, ${summary.total.skipped} skipped, ${summary.total.errors} errors`);

    return summary;
  } catch (error) {
    await completePipelineRun(
      runId,
      'failed',
      { processed: 0, succeeded: 0, failed: 1 },
      [{ message: (error as Error).message, timestamp: new Date().toISOString() }]
    );
    throw error;
  }
}

// Main execution
if (require.main === module) {
  runCollectionPipeline()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Collection pipeline failed:', error);
      process.exit(1);
    });
}
