import {
  getSupabaseClient,
  getReadyCases,
  getPublishedCasesToday,
  publishCase,
  startPipelineRun,
  completePipelineRun,
  Case,
} from '../shared/supabase';
import { logger } from '../shared/utils';

const DAILY_TARGET = 200; // Publish up to 200 cases per run

interface MatrixCell {
  innovation_type: 'product' | 'marketing';
  insurance_line: 'property' | 'health' | 'life';
}

const MATRIX_CELLS: MatrixCell[] = [
  { innovation_type: 'product', insurance_line: 'property' },
  { innovation_type: 'product', insurance_line: 'health' },
  { innovation_type: 'product', insurance_line: 'life' },
  { innovation_type: 'marketing', insurance_line: 'property' },
  { innovation_type: 'marketing', insurance_line: 'health' },
  { innovation_type: 'marketing', insurance_line: 'life' },
];

/**
 * Get the best case for a given matrix cell
 */
function getBestCaseForCell(cases: Case[], cell: MatrixCell): Case | null {
  // Filter cases matching this cell
  const cellCases = cases.filter(
    (c) =>
      c.innovation_type === cell.innovation_type &&
      c.insurance_line === cell.insurance_line
  );

  if (cellCases.length === 0) return null;

  // Sort by:
  // 1. Quality score (higher is better)
  // 2. Created date (newer is better)
  // 3. Balance positive/negative sentiment
  const sorted = cellCases.sort((a, b) => {
    // Quality score first
    const qualityDiff = (b.quality_score || 0) - (a.quality_score || 0);
    if (Math.abs(qualityDiff) > 0.1) return qualityDiff;

    // Then freshness
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return sorted[0];
}

/**
 * Select cases for daily publication
 */
async function selectDailyCases(): Promise<Case[]> {
  // Get already published today
  const publishedToday = await getPublishedCasesToday();
  const publishedIds = new Set(publishedToday.map((c) => c.id));

  // Get cells already covered today
  const coveredCells = new Set(
    publishedToday.map((c) => `${c.innovation_type}-${c.insurance_line}`)
  );

  // How many more do we need?
  const remaining = DAILY_TARGET - publishedToday.length;
  if (remaining <= 0) {
    logger.info('Daily target already reached');
    return [];
  }

  logger.info(`Need to publish ${remaining} more cases today`);

  // Get all ready cases
  const readyCases = await getReadyCases();

  // Filter out already published
  const availableCases = readyCases.filter((c) => !publishedIds.has(c.id));

  if (availableCases.length === 0) {
    logger.warn('No ready cases available for publication');
    return [];
  }

  logger.info(`${availableCases.length} cases available for selection`);

  const selected: Case[] = [];

  // First, try to fill uncovered cells
  for (const cell of MATRIX_CELLS) {
    if (selected.length >= remaining) break;

    const cellKey = `${cell.innovation_type}-${cell.insurance_line}`;
    if (coveredCells.has(cellKey)) continue;

    const bestCase = getBestCaseForCell(
      availableCases.filter((c) => !selected.includes(c)),
      cell
    );

    if (bestCase) {
      selected.push(bestCase);
      coveredCells.add(cellKey);
      logger.info(
        `Selected for ${cellKey}: ${bestCase.headline_en.slice(0, 50)}... (quality: ${bestCase.quality_score?.toFixed(2)})`
      );
    }
  }

  // If we still need more, select from any cell by quality
  if (selected.length < remaining) {
    const remainingCases = availableCases
      .filter((c) => !selected.includes(c))
      .sort((a, b) => {
        // Mix positive and negative
        const selectedPositive = selected.filter((s) => s.sentiment === 'positive').length;
        const selectedNegative = selected.filter((s) => s.sentiment === 'negative').length;

        // Prefer sentiment that we have less of
        const aPreference = a.sentiment === 'positive' ? selectedNegative : selectedPositive;
        const bPreference = b.sentiment === 'positive' ? selectedNegative : selectedPositive;

        if (aPreference !== bPreference) return bPreference - aPreference;

        // Then by quality
        return (b.quality_score || 0) - (a.quality_score || 0);
      });

    const needed = remaining - selected.length;
    selected.push(...remainingCases.slice(0, needed));
  }

  return selected;
}

/**
 * Trigger Vercel ISR revalidation
 */
async function triggerRevalidation(): Promise<void> {
  const revalidateToken = process.env.VERCEL_REVALIDATE_TOKEN;
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost:3000';

  if (!revalidateToken) {
    logger.warn('VERCEL_REVALIDATE_TOKEN not set, skipping revalidation');
    return;
  }

  try {
    // Revalidate key pages
    const paths = ['/cases', '/matrix', '/'];

    for (const path of paths) {
      const url = `https://${vercelUrl}/api/revalidate?path=${encodeURIComponent(path)}&token=${revalidateToken}`;

      const response = await fetch(url, { method: 'POST' });

      if (response.ok) {
        logger.info(`Revalidated: ${path}`);
      } else {
        logger.warn(`Failed to revalidate ${path}: ${response.status}`);
      }
    }
  } catch (error) {
    logger.error(`Revalidation error: ${(error as Error).message}`);
  }
}

/**
 * Run the publishing pipeline
 */
export async function runPublishingPipeline(): Promise<{
  totalPublished: number;
  totalToday: number;
}> {
  const runId = await startPipelineRun('publish');

  let totalPublished = 0;

  try {
    logger.info('=== Starting Publishing Pipeline ===');

    // Select cases for today
    const casesToPublish = await selectDailyCases();

    if (casesToPublish.length === 0) {
      logger.info('No cases to publish');
      await completePipelineRun(runId, 'completed', { processed: 0, succeeded: 0, failed: 0 }, []);

      const publishedToday = await getPublishedCasesToday();
      return { totalPublished: 0, totalToday: publishedToday.length };
    }

    logger.info(`Publishing ${casesToPublish.length} cases`);

    // Publish each case
    for (const caseItem of casesToPublish) {
      try {
        await publishCase(caseItem.id);
        totalPublished++;
        logger.info(`✓ Published: ${caseItem.headline_en.slice(0, 50)}...`);
      } catch (error) {
        logger.error(`Failed to publish case ${caseItem.id}: ${(error as Error).message}`);
      }
    }

    // Trigger ISR revalidation
    await triggerRevalidation();

    // Complete pipeline run
    await completePipelineRun(
      runId,
      'completed',
      { processed: casesToPublish.length, succeeded: totalPublished, failed: casesToPublish.length - totalPublished },
      []
    );

    const publishedToday = await getPublishedCasesToday();

    logger.info('\n=== Publishing Pipeline Complete ===');
    logger.info(`Published this run: ${totalPublished}`);
    logger.info(`Total published today: ${publishedToday.length}/${DAILY_TARGET}`);

    return { totalPublished, totalToday: publishedToday.length };
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

/**
 * Get publishing status
 */
export async function getPublishingStatus(): Promise<{
  publishedToday: number;
  target: number;
  coverageByCell: Record<string, number>;
}> {
  const publishedToday = await getPublishedCasesToday();

  const coverageByCell: Record<string, number> = {};

  for (const cell of MATRIX_CELLS) {
    const key = `${cell.innovation_type}-${cell.insurance_line}`;
    coverageByCell[key] = publishedToday.filter(
      (c) => c.innovation_type === cell.innovation_type && c.insurance_line === cell.insurance_line
    ).length;
  }

  return {
    publishedToday: publishedToday.length,
    target: DAILY_TARGET,
    coverageByCell,
  };
}

// Main execution
if (require.main === module) {
  runPublishingPipeline()
    .then((result) => {
      console.log('\n=== Publishing Summary ===');
      console.log(`Published this run: ${result.totalPublished}`);
      console.log(`Total today: ${result.totalToday}/${DAILY_TARGET}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Publishing pipeline failed:', error);
      process.exit(1);
    });
}
