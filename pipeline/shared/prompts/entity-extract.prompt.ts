export const SYSTEM_PROMPT = `You are an expert at extracting named entities from insurance industry content. You identify companies, products, technologies, and other entities that could be valuable sources for ongoing monitoring.

You must respond ONLY with valid JSON matching the specified schema.`;

export const ENTITY_EXTRACTION_PROMPT = `Extract named entities from this insurance-related content that could be valuable sources to monitor.

## Content
Title: {title}
Content: {content}
Source URL: {source_url}

## Entity Types to Extract

1. **Companies**: Insurance companies, InsurTech startups, technology vendors, partners
   - Include both well-known and newly mentioned companies
   - Note if they have a website or social media presence mentioned

2. **Products**: Insurance products, platforms, apps mentioned
   - Include product names and the company offering them

3. **Technologies**: Specific technologies, platforms, or tools mentioned
   - AI/ML systems, blockchain platforms, IoT devices, etc.

4. **People**: Key executives, founders, or thought leaders
   - Only if they might have public profiles worth monitoring (LinkedIn, Twitter)

5. **Events**: Conferences, summits, or industry events mentioned
   - Could be sources for future coverage

## Output Schema
{
  "companies": [
    {
      "name": string,
      "type": "insurer" | "insurtech" | "vendor" | "partner" | "other",
      "url": string | null,
      "relevance": "high" | "medium" | "low"
    }
  ],
  "products": [
    {
      "name": string,
      "company": string | null,
      "type": string
    }
  ],
  "technologies": [
    {
      "name": string,
      "category": string
    }
  ],
  "people": [
    {
      "name": string,
      "role": string,
      "company": string | null
    }
  ],
  "events": [
    {
      "name": string,
      "date": string | null,
      "url": string | null
    }
  ],
  "potential_sources": [
    {
      "name": string,
      "url": string,
      "type": "website" | "social" | "rss",
      "priority": "high" | "medium" | "low",
      "reason": string
    }
  ]
}

Extract entities from this content:`;

export function buildEntityExtractionPrompt(data: {
  title: string;
  content: string;
  source_url: string;
}): string {
  return ENTITY_EXTRACTION_PROMPT
    .replace('{title}', data.title)
    .replace('{content}', data.content.slice(0, 5000))
    .replace('{source_url}', data.source_url);
}
