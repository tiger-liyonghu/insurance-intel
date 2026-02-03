export const SYSTEM_PROMPT = `You are an expert at searching for insurance industry innovation news and cases. You generate effective search queries to find relevant, verifiable information.

You must respond ONLY with valid JSON matching the specified schema.`;

export const GENERATE_SEARCH_QUERIES_PROMPT = `Generate search queries to find insurance innovation news and cases.

## Current Coverage Gaps
Based on our 2x3 matrix (product/marketing × property/health/life), we need to find cases in these areas:
{coverage_gaps}

## Date Range
Focus on news from the past {days} days.

## Requirements
- Queries should be specific enough to find relevant results
- Include queries in multiple languages (English, Chinese, Japanese, etc.)
- Mix of:
  - General innovation searches
  - Specific company/product searches
  - Region-specific searches
  - Technology-specific searches

## Output Schema
{
  "queries": [
    {
      "query": string,
      "language": string,
      "target_matrix_cell": {
        "innovation_type": "product" | "marketing",
        "insurance_line": "property" | "health" | "life"
      } | null,
      "region": string | null,
      "priority": "high" | "medium" | "low"
    }
  ]
}

Generate search queries:`;

export const SUPPLEMENT_SEARCH_PROMPT = `We need additional information to complete our analysis of this insurance innovation case.

## Current Information
Title: {title}
Content: {content}
Source URL: {source_url}

## Missing Information
{missing_information}

## Generate Search Queries
Create targeted search queries to find the missing information. Focus on:
- Official company announcements
- Press releases
- Industry news coverage
- Product documentation
- Regulatory filings

## Output Schema
{
  "queries": [
    {
      "query": string,
      "language": string,
      "target_information": string,
      "expected_source_type": "company_website" | "news" | "regulatory" | "industry_report"
    }
  ],
  "alternative_approaches": string[]
}

Generate queries to supplement this case:`;

export function buildSearchQueriesPrompt(data: {
  coverage_gaps: string;
  days: number;
}): string {
  return GENERATE_SEARCH_QUERIES_PROMPT
    .replace('{coverage_gaps}', data.coverage_gaps)
    .replace('{days}', data.days.toString());
}

export function buildSupplementSearchPrompt(data: {
  title: string;
  content: string;
  source_url: string;
  missing_information: string[];
}): string {
  return SUPPLEMENT_SEARCH_PROMPT
    .replace('{title}', data.title)
    .replace('{content}', data.content.slice(0, 3000))
    .replace('{source_url}', data.source_url)
    .replace('{missing_information}', data.missing_information.map(m => `- ${m}`).join('\n'));
}
