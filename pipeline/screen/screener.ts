import { generateJSON } from '../shared/gemini';
import { buildScreeningPrompt, SYSTEM_PROMPT } from '../shared/prompts/screen.prompt';
import {
  getPendingRawItems,
  updateRawItemScreening,
  startPipelineRun,
  completePipelineRun,
  RawItem,
  ScreeningResult,
} from '../shared/supabase';
import { logger, batch, sleep } from '../shared/utils';

interface ScreeningOutput {
  gate1_relevance: boolean;
  gate1_score: number;
  gate1_reason: string;
  gate2_novelty: boolean;
  gate2_score: number;
  gate2_reason: string;
  gate3_classification: {
    innovation_type: 'product' | 'marketing';
    insurance_line: 'property' | 'health' | 'life';
    sentiment: 'positive' | 'negative';
  } | null;
  priority_score: number;
  rejection_reason: string | null;
}

/**
 * Screen a single raw item through the three-gate process
 */
async function screenItem(item: RawItem): Promise<{
  status: 'passed' | 'rejected';
  result: ScreeningResult;
}> {
  const prompt = buildScreeningPrompt({
    title: item.title,
    content: item.content,
    source_url: item.source_url,
    language: item.language,
  });

  const response = await generateJSON<ScreeningOutput>(prompt, {
    model: 'flash', // Use flash for faster, cheaper screening
    config: 'fast',
    systemPrompt: SYSTEM_PROMPT,
  });

  if (!response.success || !response.data) {
    // If AI fails, mark as rejected
    return {
      status: 'rejected',
      result: {
        gate1_relevance: false,
        gate1_score: 0,
        gate2_novelty: false,
        gate2_score: 0,
        gate3_classification: null,
        priority_score: 0,
        rejection_reason: `AI screening failed: ${response.error || 'Unknown error'}`,
      },
    };
  }

  const output = response.data;

  // Determine pass/fail based on gates
  const passed = output.gate1_relevance && output.gate2_novelty && output.gate3_classification !== null;

  return {
    status: passed ? 'passed' : 'rejected',
    result: {
      gate1_relevance: output.gate1_relevance,
      gate1_score: output.gate1_score,
      gate2_novelty: output.gate2_novelty,
      gate2_score: output.gate2_score,
      gate3_classification: output.gate3_classification,
      priority_score: output.priority_score,
      rejection_reason: passed ? undefined : (output.rejection_reason || output.gate1_reason || output.gate2_reason),
    },
  };
}

/**
 * Run the screening pipeline on all pending items
 */
export async function runScreeningPipeline(): Promise<{
  totalProcessed: number;
  totalPassed: number;
  totalRejected: number;
  totalErrors: number;
}> {
  const runId = await startPipelineRun('screen');
  const errorLog: Array<{ message: string; timestamp: string; item_id?: string }> = [];

  let totalProcessed = 0;
  let totalPassed = 0;
  let totalRejected = 0;
  let totalErrors = 0;

  try {
    logger.info('=== Starting Screening Pipeline ===');

    // Get pending items
    const pendingItems = await getPendingRawItems(100);

    if (pendingItems.length === 0) {
      logger.info('No pending items to screen');
      await completePipelineRun(runId, 'completed', { processed: 0, succeeded: 0, failed: 0 }, []);
      return { totalProcessed: 0, totalPassed: 0, totalRejected: 0, totalErrors: 0 };
    }

    logger.info(`Found ${pendingItems.length} items to screen`);

    // Process in batches to manage rate limits
    const batches = batch(pendingItems, 5);

    for (let i = 0; i < batches.length; i++) {
      const batchItems = batches[i];
      logger.info(`Processing batch ${i + 1}/${batches.length} (${batchItems.length} items)`);

      // Process items in parallel within batch
      const results = await Promise.allSettled(
        batchItems.map(async (item) => {
          try {
            logger.debug(`Screening: ${item.title.slice(0, 50)}...`);

            const { status, result } = await screenItem(item);

            await updateRawItemScreening(item.id, status, result);

            return { item, status, result };
          } catch (error) {
            throw { item, error };
          }
        })
      );

      // Process results
      for (const result of results) {
        totalProcessed++;

        if (result.status === 'fulfilled') {
          const { item, status, result: screenResult } = result.value;

          if (status === 'passed') {
            totalPassed++;
            logger.info(`✓ PASSED: ${item.title.slice(0, 50)}... (priority: ${screenResult.priority_score.toFixed(2)})`);
          } else {
            totalRejected++;
            logger.debug(`✗ REJECTED: ${item.title.slice(0, 50)}... (${screenResult.rejection_reason})`);
          }
        } else {
          totalErrors++;
          const { item, error } = result.reason as { item: RawItem; error: Error };
          const msg = `Error screening item ${item.id}: ${error.message}`;
          logger.error(msg);
          errorLog.push({ message: msg, timestamp: new Date().toISOString(), item_id: item.id });
        }
      }

      // Rate limiting between batches
      if (i < batches.length - 1) {
        await sleep(2000);
      }
    }

    // Complete pipeline run
    await completePipelineRun(
      runId,
      totalErrors > 0 ? 'completed' : 'completed',
      {
        processed: totalProcessed,
        succeeded: totalPassed,
        failed: totalRejected + totalErrors,
      },
      errorLog
    );

    logger.info('\n=== Screening Pipeline Complete ===');
    logger.info(`Total processed: ${totalProcessed}`);
    logger.info(`Total passed: ${totalPassed}`);
    logger.info(`Total rejected: ${totalRejected}`);
    logger.info(`Total errors: ${totalErrors}`);
    logger.info(`Pass rate: ${((totalPassed / totalProcessed) * 100).toFixed(1)}%`);

    return { totalProcessed, totalPassed, totalRejected, totalErrors };
  } catch (error) {
    await completePipelineRun(
      runId,
      'failed',
      { processed: totalProcessed, succeeded: totalPassed, failed: totalRejected + totalErrors },
      [{ message: (error as Error).message, timestamp: new Date().toISOString() }]
    );
    throw error;
  }
}

// Main execution
if (require.main === module) {
  runScreeningPipeline()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Screening pipeline failed:', error);
      process.exit(1);
    });
}
