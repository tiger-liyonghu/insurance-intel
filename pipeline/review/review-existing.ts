import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local'), override: true });

import { getAllNonRejectedCases, rejectCase } from '../shared/supabase';
import { generateJSON } from '../shared/gemini';
import { logger } from '../shared/utils';

const REVIEW_PROMPT = `You are reviewing an existing case in an insurance innovation database.

## Case to Review
Headline (EN): {headline_en}
Headline (ZH): {headline_zh}
Innovation Type: {innovation_type}
Insurance Line: {insurance_line}
Analysis Layer 1 (EN): {layer1}

## Question
Does this represent a STRUCTURAL SHIFT in insurance logic — a significant change in who insures, what is insured, how it's priced, who sells it, or how it pays out?

KEEP if it describes:
- A new risk category previously deemed "uninsurable" (boundary expansion)
- Dynamic/real-time pricing driven by IoT, sensors, or AI (pricing evolution)
- Insurance bundled with prevention/service delivery (prevention-as-product)
- Parametric, smart contract, or non-cash payout mechanisms (payout innovation)
- Embedded insurance in non-insurance platforms (contextual distribution)
- Non-traditional players entering insurance (distribution shift)
- AI-driven hyper-personalization or behavioral incentive loops

REJECT if it is:
- M&A / acquisition / merger news
- Market entry / expansion without specific product innovation
- Financial results / earnings / funding rounds
- Regulatory changes / policy discussions
- Industry forecasts / opinion / commentary
- Executive appointments / restructuring
- Reinsurance treaties / capital markets
- Vague strategy announcements without specific product detail

Respond with JSON:
{
  "keep": boolean,
  "reason": string (brief explanation)
}`;

interface ReviewResult {
  keep: boolean;
  reason: string;
}

async function main() {
  logger.info('=== Reviewing Existing Cases ===');

  const cases = await getAllNonRejectedCases();
  logger.info(`Found ${cases.length} cases to review`);

  let kept = 0;
  let rejected = 0;

  for (const c of cases) {
    const prompt = REVIEW_PROMPT
      .replace('{headline_en}', c.headline_en || '')
      .replace('{headline_zh}', c.headline_zh || '')
      .replace('{innovation_type}', c.innovation_type || '')
      .replace('{insurance_line}', c.insurance_line || '')
      .replace('{layer1}', c.analysis_en?.layer1?.slice(0, 500) || '');

    try {
      const result = await generateJSON<ReviewResult>(prompt, {
        config: 'fast',
        systemPrompt: 'You are an insurance innovation quality reviewer. Respond only with valid JSON.',
      });

      if (result.success && result.data) {
        if (result.data.keep) {
          kept++;
          logger.info(`✓ KEEP: ${c.headline_en?.slice(0, 60)} — ${result.data.reason}`);
        } else {
          rejected++;
          logger.info(`✗ REJECT: ${c.headline_en?.slice(0, 60)} — ${result.data.reason}`);
          await rejectCase(c.id);
        }
      } else {
        logger.warn(`? SKIP (AI error): ${c.headline_en?.slice(0, 60)}`);
      }
    } catch (error) {
      logger.error(`Error reviewing ${c.id}: ${(error as Error).message}`);
    }

    // Brief pause
    await new Promise((r) => setTimeout(r, 500));
  }

  logger.info(`\n=== Review Complete ===`);
  logger.info(`Kept: ${kept}`);
  logger.info(`Rejected: ${rejected}`);
  logger.info(`Total: ${cases.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Review failed:', error);
    process.exit(1);
  });
