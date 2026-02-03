import { generateJSON } from '../shared/gemini';
import { buildSearchQueriesPrompt } from '../shared/prompts/search.prompt';
import {
  getSupabaseClient,
  insertRawItem,
  checkDuplicateContent,
} from '../shared/supabase';
import {
  generateContentHash,
  detectLanguage,
  cleanContent,
  logger,
  sleep,
} from '../shared/utils';

interface SearchQuery {
  query: string;
  language: string;
  target_matrix_cell: {
    innovation_type: 'product' | 'marketing';
    insurance_line: 'property' | 'health' | 'life';
  } | null;
  region: string | null;
  priority: 'high' | 'medium' | 'low';
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Get current coverage gaps in the matrix
 */
async function getCoverageGaps(): Promise<string> {
  const supabase = getSupabaseClient();

  // Get cases created in the last 7 days by matrix cell
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: recentCases, error } = await supabase
    .from('cases')
    .select('innovation_type, insurance_line, sentiment')
    .gte('created_at', sevenDaysAgo.toISOString());

  if (error) {
    logger.error(`Failed to get recent cases: ${error.message}`);
    return 'All cells need coverage';
  }

  // Count cases per cell
  const coverage: Record<string, number> = {};
  const cells = [
    'product-property', 'product-health', 'product-life',
    'marketing-property', 'marketing-health', 'marketing-life',
  ];

  for (const cell of cells) {
    coverage[cell] = 0;
  }

  for (const c of recentCases || []) {
    const key = `${c.innovation_type}-${c.insurance_line}`;
    coverage[key] = (coverage[key] || 0) + 1;
  }

  // Find gaps (cells with < 3 cases in last 7 days)
  const gaps: string[] = [];
  for (const [cell, count] of Object.entries(coverage)) {
    if (count < 3) {
      const [type, line] = cell.split('-');
      gaps.push(`${type} innovation in ${line} insurance (current: ${count} cases)`);
    }
  }

  if (gaps.length === 0) {
    return 'Good coverage across all cells. Focus on high-impact stories.';
  }

  return 'Priority gaps:\n' + gaps.map((g) => `- ${g}`).join('\n');
}

/**
 * Generate search queries using Gemini
 */
async function generateSearchQueries(): Promise<SearchQuery[]> {
  const coverageGaps = await getCoverageGaps();

  const prompt = buildSearchQueriesPrompt({
    coverage_gaps: coverageGaps,
    days: 7,
  });

  const response = await generateJSON<{ queries: SearchQuery[] }>(prompt, {
    model: 'flash',
    config: 'fast',
    systemPrompt: 'You are an expert at searching for insurance industry news.',
  });

  if (!response.success || !response.data) {
    logger.error('Failed to generate search queries');
    return getDefaultSearchQueries();
  }

  return response.data.queries;
}

/**
 * Default search queries as fallback
 */
function getDefaultSearchQueries(): SearchQuery[] {
  return [
    // English queries — product innovation
    { query: 'parametric insurance smart contract 2026', language: 'en', target_matrix_cell: { innovation_type: 'product', insurance_line: 'property' }, region: null, priority: 'high' },
    { query: 'health insurance prevention service bundle wearable', language: 'en', target_matrix_cell: { innovation_type: 'product', insurance_line: 'health' }, region: null, priority: 'high' },
    { query: 'dynamic pricing IoT insurance real-time', language: 'en', target_matrix_cell: { innovation_type: 'product', insurance_line: 'property' }, region: null, priority: 'medium' },
    { query: 'life insurance instant underwriting AI', language: 'en', target_matrix_cell: { innovation_type: 'product', insurance_line: 'life' }, region: null, priority: 'medium' },

    // English queries — marketing innovation
    { query: 'embedded insurance platform partnership 2026', language: 'en', target_matrix_cell: { innovation_type: 'marketing', insurance_line: 'property' }, region: null, priority: 'high' },
    { query: 'Tesla Amazon insurance non-traditional insurer', language: 'en', target_matrix_cell: { innovation_type: 'marketing', insurance_line: 'property' }, region: null, priority: 'medium' },

    // Chinese queries
    { query: '参数保险 智能合约 2026', language: 'zh', target_matrix_cell: { innovation_type: 'product', insurance_line: 'property' }, region: 'china', priority: 'high' },
    { query: '嵌入式保险 场景化 平台合作', language: 'zh', target_matrix_cell: { innovation_type: 'marketing', insurance_line: 'property' }, region: 'china', priority: 'medium' },
    { query: '健康险 预防服务 可穿戴设备', language: 'zh', target_matrix_cell: { innovation_type: 'product', insurance_line: 'health' }, region: 'china', priority: 'medium' },
  ];
}

/**
 * Perform web search using Gemini's grounding capability
 */
async function searchWithGemini(query: string): Promise<SearchResult[]> {
  // Note: This is a simplified version. In production, you might use:
  // 1. Google Custom Search API
  // 2. Bing Search API
  // 3. SerpAPI
  // For now, we'll use Gemini to generate hypothetical search results
  // based on its knowledge, and then verify them

  const prompt = `Search the web for recent news about: "${query}"

Return the top 5 most relevant and recent results. Each result must have:
- A real, verifiable URL (not made up)
- Recent publication (within last 30 days preferred)
- Direct relevance to insurance industry innovation

Output JSON:
{
  "results": [
    {
      "title": "Article title",
      "url": "https://...",
      "snippet": "Brief description of the content"
    }
  ]
}

If you cannot find real, verifiable results, return an empty array.`;

  const response = await generateJSON<{ results: SearchResult[] }>(prompt, {
    model: 'flash',
    config: 'fast',
  });

  if (!response.success || !response.data) {
    return [];
  }

  // Filter out obviously fake URLs
  return response.data.results.filter((r) => {
    try {
      const url = new URL(r.url);
      // Skip common fake domains
      const fakeDomains = ['example.com', 'test.com', 'fake.com'];
      return !fakeDomains.some((d) => url.hostname.includes(d));
    } catch {
      return false;
    }
  });
}

/**
 * Verify and fetch content from a URL
 */
async function verifyAndFetch(url: string): Promise<{ title: string; content: string } | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InsuranceIntelBot/1.0)',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Simple extraction using regex (in production, use cheerio)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract text content (simplified)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000);

    if (title && textContent.length > 100) {
      return { title, content: textContent };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Run AI-powered search to fill coverage gaps
 */
export async function runAISearch(): Promise<{
  totalCollected: number;
  totalSkipped: number;
  totalErrors: number;
}> {
  let totalCollected = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  try {
    logger.info('Starting AI-powered search');

    // Generate search queries
    const queries = await generateSearchQueries();
    logger.info(`Generated ${queries.length} search queries`);

    // Sort by priority
    const sortedQueries = queries.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Process top queries
    const maxQueries = 10;
    for (const query of sortedQueries.slice(0, maxQueries)) {
      try {
        logger.info(`Searching: "${query.query}" (${query.language}, ${query.priority})`);

        const results = await searchWithGemini(query.query);
        logger.info(`Found ${results.length} results`);

        for (const result of results) {
          try {
            // Verify and fetch actual content
            const verified = await verifyAndFetch(result.url);

            if (!verified) {
              totalSkipped++;
              continue;
            }

            const content = cleanContent(verified.content);
            const contentHash = generateContentHash(content + result.url);

            // Check for duplicates
            const isDuplicate = await checkDuplicateContent(contentHash);
            if (isDuplicate) {
              totalSkipped++;
              continue;
            }

            // Detect language
            const language = detectLanguage(verified.title + ' ' + content);

            // Insert raw item (use a special source ID for AI search)
            // In production, you'd create a dedicated "AI Search" source
            await insertRawItem({
              source_id: '00000000-0000-0000-0000-000000000001', // Placeholder
              source_url: result.url,
              title: cleanContent(verified.title),
              content: content,
              language: language,
              content_hash: contentHash,
            });

            totalCollected++;
            logger.debug(`Collected: ${verified.title.slice(0, 50)}...`);
          } catch (error) {
            totalErrors++;
            logger.error(`Error processing result: ${(error as Error).message}`);
          }
        }

        // Rate limiting
        await sleep(2000);
      } catch (error) {
        totalErrors++;
        logger.error(`Error with query "${query.query}": ${(error as Error).message}`);
      }
    }

    logger.info(
      `AI search complete: ${totalCollected} collected, ${totalSkipped} skipped, ${totalErrors} errors`
    );
  } catch (error) {
    logger.error(`AI search failed: ${(error as Error).message}`);
    throw error;
  }

  return { totalCollected, totalSkipped, totalErrors };
}

// Main execution
if (require.main === module) {
  runAISearch()
    .then((result) => {
      console.log('\n=== AI Search Summary ===');
      console.log(`Total collected: ${result.totalCollected}`);
      console.log(`Total skipped: ${result.totalSkipped}`);
      console.log(`Total errors: ${result.totalErrors}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('AI search failed:', error);
      process.exit(1);
    });
}
