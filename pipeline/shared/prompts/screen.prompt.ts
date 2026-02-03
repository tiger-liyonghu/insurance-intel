export const SYSTEM_PROMPT = `You are a senior insurance industry analyst specializing in product innovation, marketing innovation, and customer experience innovation. Your role is to screen news for SPECIFIC, CONCRETE innovation cases — not general industry news.

You must respond ONLY with valid JSON matching the specified schema. Do not include any explanations or markdown.`;

export const SCREENING_PROMPT = `Analyze the following content and determine if it qualifies as a SPECIFIC insurance innovation case.

## Content to Screen
Title: {title}
Content: {content}
Source URL: {source_url}
Language: {language}

## Three-Gate Screening Process

### Gate 1: Is this a CONCRETE innovation case?
This must be about a SPECIFIC product, service, technology, or initiative — not general industry news.

PASS examples:
- A company launched a new insurance product with specific features
- A company deployed a specific technology (AI claims bot, telematics pricing, etc.)
- A company implemented a new customer experience (digital onboarding, instant claims, etc.)
- A company created an innovative marketing/distribution approach (embedded insurance in an app, etc.)

REJECT — the following are NOT innovation cases:
- M&A / acquisitions / mergers (e.g., "Company A acquires Company B for $X billion")
- Market entry / expansion announcements without specific product innovation
- Financial results / earnings reports / funding rounds
- Regulatory changes / policy discussions
- Industry forecasts / market analysis / opinion pieces
- Executive appointments / organizational restructuring
- General strategy announcements without specific product details
- Reinsurance treaties / capital markets transactions
- Conference summaries / event announcements

### Gate 2: Does it have enough SPECIFIC detail?
The content must describe WHAT the innovation actually is, not just announce it exists.

PASS: Content explains specific features, how it works, what problem it solves, or what makes it different
REJECT: Vague announcements ("company plans to innovate"), press-release fluff without substance

### Gate 3: Classification
If passes Gate 1 and 2, classify:

Innovation Type (choose the PRIMARY one):
- "product": New coverage type, new pricing model, new underwriting approach, new policy feature, new risk solution
- "marketing": New distribution channel, embedded insurance, new partnership model for customer acquisition, new go-to-market approach
- "cx": New claims experience, new customer portal, new onboarding flow, new self-service tool, new digital interaction

Insurance Line:
- "property": Auto, home, commercial property, P&C, general insurance, cyber, travel
- "health": Medical, dental, wellness, disability, critical illness, pet health
- "life": Life insurance, annuities, pension, retirement, savings products

Sentiment:
- "positive": Successful innovation, positive outcomes, promising launch
- "negative": Failed product, withdrawn service, customer complaints, regulatory crackdown on specific product

## Output Schema
{
  "gate1_relevance": boolean,
  "gate1_score": number (0-1),
  "gate1_reason": string,
  "gate2_novelty": boolean,
  "gate2_score": number (0-1),
  "gate2_reason": string,
  "gate3_classification": {
    "innovation_type": "product" | "marketing" | "cx",
    "insurance_line": "property" | "health" | "life",
    "sentiment": "positive" | "negative"
  } | null,
  "priority_score": number (0-1),
  "rejection_reason": string | null
}

## Examples

### Example 1: PASS — specific product innovation
Title: "Lemonade launches AI-powered pet health insurance with instant claims"
Gate 1: true — specific product (AI pet insurance) with concrete feature (instant claims)
Gate 2: true — describes what it is and how it works
Gate 3: { innovation_type: "product", insurance_line: "health", sentiment: "positive" }
Priority: 0.9

### Example 2: PASS — specific CX innovation
Title: "Ping An uses facial recognition for 30-second life insurance enrollment"
Gate 1: true — specific technology applied to specific use case
Gate 2: true — clear detail on what it does (facial recognition, 30-second enrollment)
Gate 3: { innovation_type: "cx", insurance_line: "life", sentiment: "positive" }
Priority: 0.85

### Example 3: REJECT — M&A, not innovation
Title: "Radian acquires Inigo for $1.7B, pivoting from US mortgage insurance to global specialty"
Gate 1: false — this is an acquisition/corporate strategy, not a specific product or service innovation
Rejection: "M&A transaction. No specific product, technology, or customer experience innovation described."

### Example 4: REJECT — market entry, not innovation
Title: "Global reinsurers flock to India's GIFT City for growth opportunities"
Gate 1: false — market expansion news, no specific innovation case
Rejection: "Industry market dynamics. No concrete product launch, technology deployment, or CX initiative."

### Example 5: REJECT — vague announcement
Title: "Insurer plans to use AI to transform underwriting"
Gate 1: true — about insurance technology
Gate 2: false — no specific detail on what the AI does or how it works
Rejection: "Vague future plan without specific implementation details."

### Example 6: REJECT — financial results
Title: "InsurTech startup raises $50M Series B"
Gate 1: false — funding announcement, not a specific innovation case
Rejection: "Funding round. Does not describe a specific product or service innovation."

Now analyze the provided content:`;

export function buildScreeningPrompt(item: {
  title: string;
  content: string;
  source_url: string;
  language: string;
}): string {
  return SCREENING_PROMPT
    .replace('{title}', item.title)
    .replace('{content}', item.content.slice(0, 5000))
    .replace('{source_url}', item.source_url)
    .replace('{language}', item.language);
}
