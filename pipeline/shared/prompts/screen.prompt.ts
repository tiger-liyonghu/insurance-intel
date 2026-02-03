export const SYSTEM_PROMPT = `You are a senior insurance industry analyst specializing in detecting "logical evolution" signals — structural shifts in how insurance operates, not incremental improvements. You screen news for cases where the fundamental logic of insurance (who insures, what is insured, how it's priced, who sells it, how it pays out) is being disrupted.

You must respond ONLY with valid JSON matching the specified schema. Do not include any explanations or markdown.`;

export const SCREENING_PROMPT = `Analyze the following content and determine if it represents a significant "logical evolution" in insurance.

## Content to Screen
Title: {title}
Content: {content}
Source URL: {source_url}
Language: {language}

## Three-Gate Screening Process

### Gate 1: Does this signal a STRUCTURAL SHIFT in insurance logic?

The "Delta Logic" test: Compare against the traditional insurance baseline. Does this news touch a SIGNIFICANT change in any of these five fundamental variables?
- WHO is insuring (new entrants: tech companies, supply chain players, AI agents, sovereign funds)
- WHAT is insured (new risk categories: virtual assets, climate indirect losses, pre-existing conditions, process/outcome guarantees)
- HOW it's priced (dynamic/real-time pricing, IoT-driven, behavioral, satellite/sensor-based)
- WHO sells it (embedded in non-insurance platforms, AI-driven personalization, community/DAO distribution)
- HOW it pays out (parametric triggers, smart contracts, non-cash/service delivery, prevention-as-payout)

PASS — signals of logical evolution:
- A non-insurance company builds or embeds insurance capability (e.g., Tesla, Amazon, Uber offering insurance)
- A new risk category previously deemed "uninsurable" is now covered
- Pricing moves from static actuarial tables to dynamic/real-time models
- Insurance is distributed through non-traditional channels (embedded, AI agent, DAO)
- Payout mechanism shifts from reimbursement to parametric, smart contract, or service delivery
- Insurance scope expands from "loss compensation" to "prevention + service bundle"
- AI agents autonomously purchasing, managing, or adjudicating insurance
- Behavioral incentive loops that merge insurance with ongoing risk reduction

REJECT — noise (not structural shifts):
- Minor coverage amount adjustments or deductible changes
- APP interface updates or UX polish without structural change
- Seasonal promotions, holiday marketing campaigns
- Standard add-on riders without novel risk concepts
- M&A / acquisitions / mergers (unless the acquisition itself creates a structural shift, e.g., a tech giant acquiring an insurer to embed insurance)
- Financial results / earnings reports / funding rounds
- Regulatory changes / policy discussions (unless creating entirely new insurable categories)
- Industry forecasts / market analysis / opinion pieces without concrete cases
- Executive appointments / organizational restructuring
- Reinsurance treaties / capital markets transactions
- Conference summaries / event announcements

### Gate 2: Does it have enough SPECIFIC detail?
The content must describe WHAT the innovation actually is, not just announce it exists.

PASS: Content explains specific features, mechanisms, partnerships, technology stack, or measurable outcomes
REJECT: Vague announcements ("company plans to innovate"), press-release fluff without substance

### Gate 3: Classification
If passes Gate 1 and 2, classify:

Innovation Type (choose the PRIMARY one):

"product" — The structural shift is in WHAT is insured, HOW it's priced, or HOW it pays out.
Sub-dimensions (use as detection signals, do not output):
  - Boundary Expansion: Covering previously "uninsurable" risks (pre-existing conditions, mental health, virtual assets, climate indirect losses, cross-border medical, commodity supply chain)
  - Pricing Evolution: Dynamic/real-time pricing driven by IoT, biometric sensors, AI agent behavior traces, satellite imagery, or other non-traditional data
  - Prevention-as-Product: Core shifts from post-loss compensation to pre-loss prevention + physical service delivery (insurance bundled with diagnostics, maintenance, legal support)
  - Payout Mechanism: Parametric insurance, smart contract auto-payout, non-cash (service/in-kind) compensation replacing traditional reimbursement

"marketing" — The structural shift is in WHO sells it, HOW it reaches customers, or WHO the new insurance players are.
Sub-dimensions (use as detection signals, do not output):
  - Embedded & Contextual: Insurance vanishes into the customer's decision chain — native integration with automakers, pharma platforms, commodity trading systems
  - Hyper-personalization: AI Agent-driven individual risk profiling and companion-style recommendation (not traditional sales scripts)
  - Distribution Shift: Power center moves — distribution via KOCs, vertical professional communities, DAOs, or cross-industry strategic partners (not traditional agents)
  - Incentive Design: Behavioral economics loops — dynamic premium feedback, health credits, risk-reduction rewards creating retention + risk improvement flywheel

Insurance Line:
- "property": Auto, home, commercial property, P&C, general insurance, cyber, travel
- "health": Medical, dental, wellness, disability, critical illness, pet health, mental health
- "life": Life insurance, annuities, pension, retirement, savings products

Sentiment:
- "positive": Successful launch, promising innovation, positive market response
- "negative": Failed product, withdrawn service, customer backlash, regulatory crackdown on specific innovation

## Output Schema
{
  "gate1_relevance": boolean,
  "gate1_score": number (0-1),
  "gate1_reason": string,
  "gate2_novelty": boolean,
  "gate2_score": number (0-1),
  "gate2_reason": string,
  "gate3_classification": {
    "innovation_type": "product" | "marketing",
    "insurance_line": "property" | "health" | "life",
    "sentiment": "positive" | "negative"
  } | null,
  "priority_score": number (0-1),
  "rejection_reason": string | null
}

## Examples

### Example 1: PASS — parametric insurance (product: payout mechanism)
Title: "FloodFlash launches instant parametric flood insurance paying within hours via IoT sensors"
Gate 1: true — fundamental shift in HOW it pays out (parametric trigger vs. traditional claims)
Gate 2: true — specific mechanism described (IoT sensors, instant payout, no adjuster)
Gate 3: { innovation_type: "product", insurance_line: "property", sentiment: "positive" }
Priority: 0.95

### Example 2: PASS — embedded insurance (marketing: embedded & contextual)
Title: "Tesla integrates real-time driving-score insurance directly into vehicle purchase flow"
Gate 1: true — WHO sells it (automaker, not insurer) and HOW it's priced (real-time telematics)
Gate 2: true — specific features described (driving score, integrated purchase flow)
Gate 3: { innovation_type: "marketing", insurance_line: "property", sentiment: "positive" }
Priority: 0.9

### Example 3: PASS — prevention-as-product (product: prevention transformation)
Title: "Oscar Health bundles free virtual primary care visits and chronic disease management into all plans"
Gate 1: true — WHAT is insured shifts from "loss compensation" to "health management service bundle"
Gate 2: true — specific program details (virtual PCP, chronic disease management, included in premium)
Gate 3: { innovation_type: "product", insurance_line: "health", sentiment: "positive" }
Priority: 0.85

### Example 4: PASS — new entrant (marketing: distribution shift)
Title: "Amazon launches cargo insurance for third-party sellers integrated into FBA logistics"
Gate 1: true — WHO insures (Amazon, non-traditional player) and embedded in supply chain
Gate 2: true — specific product (cargo insurance for FBA sellers, integrated in logistics dashboard)
Gate 3: { innovation_type: "marketing", insurance_line: "property", sentiment: "positive" }
Priority: 0.9

### Example 5: REJECT — incremental, not structural
Title: "Major insurer increases maximum coverage limit for home insurance by 15%"
Gate 1: false — minor coverage amount adjustment, no structural shift in logic
Rejection: "Incremental adjustment to existing product parameters. No change to fundamental insurance logic."

### Example 6: REJECT — vague future plan
Title: "Insurer announces plans to explore AI-powered underwriting"
Gate 1: true — potentially relevant
Gate 2: false — no specific detail on what the AI does, when it launches, or how it differs
Rejection: "Vague future plan without specific implementation details."

### Example 7: REJECT — seasonal promotion
Title: "Travel insurance company offers 20% discount for summer holiday season"
Gate 1: false — standard seasonal marketing, no structural shift
Rejection: "Routine promotional pricing. No change to fundamental insurance logic."

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
