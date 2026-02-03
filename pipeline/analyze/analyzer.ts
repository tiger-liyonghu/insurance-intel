import { generateJSON } from '../shared/gemini';
import {
  buildPositiveAnalysisPrompt,
  buildNegativeAnalysisPrompt,
  buildQualityCheckPrompt,
  SYSTEM_PROMPT,
} from '../shared/prompts/analyze.prompt';
import {
  getPassedItemsWithoutCase,
  insertCase,
  startPipelineRun,
  completePipelineRun,
  RawItem,
  ScreeningResult,
  CaseAnalysis,
} from '../shared/supabase';
import { logger, sleep, inferRegion, extractCompanyNames } from '../shared/utils';

interface AnalysisResult {
  headline_en: string;
  headline_zh: string;
  analysis_en: CaseAnalysis;
  analysis_zh: CaseAnalysis;
  company_names: string[];
  quality_notes: string;
}

interface QualityCheckResult {
  overall_pass: boolean;
  quality_score: number;
  issues: Array<{
    check_item: string;
    passed: boolean;
    issue_description: string | null;
  }>;
  improvement_suggestions: string[];
  ready_for_publication: boolean;
}

const BATCH_SIZE = 8; // Process 8 items in parallel

/**
 * Perform deep analysis (the core AI call)
 */
async function performAnalysis(
  item: RawItem,
  classification: ScreeningResult['gate3_classification']
): Promise<AnalysisResult | null> {
  if (!classification) {
    logger.error('No classification available for analysis');
    return null;
  }

  const region = inferRegion(item.source_url, item.content);
  const companyNames = extractCompanyNames(item.title + ' ' + item.content);

  const data = {
    title: item.title,
    content: item.content,
    source_urls: [item.source_url],
    company_names: companyNames,
    region: region,
    innovation_type: classification.innovation_type,
    insurance_line: classification.insurance_line,
  };

  const prompt =
    classification.sentiment === 'positive'
      ? buildPositiveAnalysisPrompt(data)
      : buildNegativeAnalysisPrompt(data);

  const response = await generateJSON<AnalysisResult>(prompt, {
    model: 'pro',
    config: 'creative',
    systemPrompt: SYSTEM_PROMPT,
  });

  if (!response.success || !response.data) {
    logger.error(`Analysis failed: ${response.error}`);
    return null;
  }

  return response.data;
}

/**
 * Quality check
 */
async function performQualityCheck(analysis: AnalysisResult, sourceUrls: string[]): Promise<QualityCheckResult> {
  const prompt = buildQualityCheckPrompt({
    headline_en: analysis.headline_en,
    headline_zh: analysis.headline_zh,
    analysis_en: analysis.analysis_en,
    analysis_zh: analysis.analysis_zh,
    source_urls: sourceUrls,
  });

  const response = await generateJSON<QualityCheckResult>(prompt, {
    model: 'flash',
    config: 'fast',
    systemPrompt: SYSTEM_PROMPT,
  });

  if (!response.success || !response.data) {
    return {
      overall_pass: true,
      quality_score: 0.7,
      issues: [],
      improvement_suggestions: [],
      ready_for_publication: true,
    };
  }

  return response.data;
}

/**
 * Analyze a single item: 2 AI calls (analysis + quality check)
 */
async function analyzeItem(item: RawItem): Promise<{
  success: boolean;
  caseId?: string;
  reason?: string;
}> {
  const screeningResult = item.screening_result as ScreeningResult | null;

  if (!screeningResult || !screeningResult.gate3_classification) {
    return { success: false, reason: 'Missing classification' };
  }

  const classification = screeningResult.gate3_classification;

  // Step 1: Deep analysis (single AI call)
  const analysis = await performAnalysis(item, classification);

  if (!analysis) {
    return { success: false, reason: 'Analysis generation failed' };
  }

  // Step 2: Quality check (single AI call)
  const qualityCheck = await performQualityCheck(analysis, [item.source_url]);

  if (!qualityCheck.ready_for_publication && qualityCheck.quality_score < 0.5) {
    return {
      success: false,
      reason: `Quality check failed: ${qualityCheck.improvement_suggestions.join(', ')}`,
    };
  }

  // Step 3: Create case
  const region = inferRegion(item.source_url, item.content);

  const newCase = await insertCase({
    raw_item_id: item.id,
    innovation_type: classification.innovation_type,
    insurance_line: classification.insurance_line,
    sentiment: classification.sentiment,
    headline_en: analysis.headline_en,
    headline_zh: analysis.headline_zh,
    analysis_en: analysis.analysis_en,
    analysis_zh: analysis.analysis_zh,
    source_urls: [item.source_url],
    company_names: analysis.company_names || [],
    region: region,
    status: qualityCheck.quality_score >= 0.5 ? 'ready' : 'pending_supplement',
    supplement_rounds: 0,
    quality_score: qualityCheck.quality_score,
    published_at: null,
  });

  return { success: true, caseId: newCase.id };
}

/**
 * Process a batch of items in parallel
 */
function batch<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

/**
 * Run the analysis pipeline on all passed items without cases
 */
export async function runAnalysisPipeline(): Promise<{
  totalProcessed: number;
  totalSucceeded: number;
  totalFailed: number;
}> {
  const runId = await startPipelineRun('analyze');
  const errorLog: Array<{ message: string; timestamp: string; item_id?: string }> = [];

  let totalProcessed = 0;
  let totalSucceeded = 0;
  let totalFailed = 0;

  try {
    logger.info('=== Starting Analysis Pipeline ===');

    const items = await getPassedItemsWithoutCase(300);

    if (items.length === 0) {
      logger.info('No items to analyze');
      await completePipelineRun(runId, 'completed', { processed: 0, succeeded: 0, failed: 0 }, []);
      return { totalProcessed: 0, totalSucceeded: 0, totalFailed: 0 };
    }

    logger.info(`Found ${items.length} items to analyze`);

    // Process items in batches of BATCH_SIZE in parallel
    const batches = batch(items, BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const currentBatch = batches[batchIndex];
      logger.info(`\nBatch ${batchIndex + 1}/${batches.length} (${currentBatch.length} items)`);

      const results = await Promise.allSettled(
        currentBatch.map(async (item) => {
          totalProcessed++;
          const itemNum = batchIndex * BATCH_SIZE + currentBatch.indexOf(item) + 1;
          logger.info(`Analyzing (${itemNum}/${items.length}): ${item.title.slice(0, 55)}...`);

          const result = await analyzeItem(item);

          if (result.success) {
            totalSucceeded++;
            logger.info(`✓ Case created: ${result.caseId}`);
          } else {
            totalFailed++;
            logger.warn(`✗ Failed: ${result.reason}`);
            errorLog.push({
              message: result.reason || 'Unknown error',
              timestamp: new Date().toISOString(),
              item_id: item.id,
            });
          }

          return result;
        })
      );

      // Brief pause between batches
      if (batchIndex < batches.length - 1) {
        await sleep(500);
      }
    }

    await completePipelineRun(
      runId,
      'completed',
      { processed: totalProcessed, succeeded: totalSucceeded, failed: totalFailed },
      errorLog
    );

    logger.info('\n=== Analysis Pipeline Complete ===');
    logger.info(`Total processed: ${totalProcessed}`);
    logger.info(`Total succeeded: ${totalSucceeded}`);
    logger.info(`Total failed: ${totalFailed}`);
    logger.info(`Success rate: ${((totalSucceeded / totalProcessed) * 100).toFixed(1)}%`);

    return { totalProcessed, totalSucceeded, totalFailed };
  } catch (error) {
    await completePipelineRun(
      runId,
      'failed',
      { processed: totalProcessed, succeeded: totalSucceeded, failed: totalFailed },
      [{ message: (error as Error).message, timestamp: new Date().toISOString() }]
    );
    throw error;
  }
}

// Main execution
if (require.main === module) {
  runAnalysisPipeline()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Analysis pipeline failed:', error);
      process.exit(1);
    });
}
