export const SYSTEM_PROMPT = `You are a senior insurance industry analyst with 20+ years of experience across global markets. You produce deep, insightful analysis of insurance innovations that helps executives and product developers make informed decisions.

Your analysis must be:
- Fact-based with specific details (numbers, dates, names)
- Insightful beyond surface-level description
- Actionable for insurance professionals
- Balanced and objective

You must respond ONLY with valid JSON matching the specified schema.`;

// ============================================
// POSITIVE CASE ANALYSIS (Innovation)
// ============================================

export const POSITIVE_ANALYSIS_PROMPT = `Analyze this insurance innovation case and produce a five-layer deep analysis.

## Case Information
Title: {title}
Content: {content}
Source URLs: {source_urls}
Company: {company_names}
Region: {region}
Innovation Type: {innovation_type}
Insurance Line: {insurance_line}

## Five-Layer Analysis Framework for Positive Cases

### Layer 1: What It Is (产品/服务是什么)
Describe the innovation concisely:
- What is the product, service, or initiative?
- Who is the target customer segment?
- What problem does it solve?
- Key features and differentiators

### Layer 2: How It Works (运作机制)
Explain the mechanism:
- Technology or approach used
- Business model (pricing, distribution, partnerships)
- Key processes and workflows
- Integration with existing systems/products

### Layer 3: Why It Matters (创新意义)
Analyze the strategic significance:
- What makes this genuinely innovative?
- Market gap or opportunity being addressed
- Competitive advantages created
- Potential impact on the industry

### Layer 4: Results & Evidence (效果与证据)
Present concrete outcomes:
- Quantitative results (users, revenue, growth rates)
- Qualitative indicators (awards, recognition, feedback)
- Timeline and milestones achieved
- If early stage, what metrics to watch

### Layer 5: Actionable Insights (可借鉴之处)
Provide takeaways for practitioners:
- What can other insurers learn from this?
- Prerequisites for replication (tech, talent, capital)
- Potential pitfalls to avoid
- Adaptation considerations for different markets

## Output Schema
{
  "headline_en": string (compelling headline, max 100 chars),
  "headline_zh": string (Chinese headline, max 50 chars),
  "analysis_en": {
    "layer1": string (150-250 words),
    "layer2": string (150-250 words),
    "layer3": string (150-250 words),
    "layer4": string (100-200 words),
    "layer5": string (150-250 words)
  },
  "analysis_zh": {
    "layer1": string (Chinese, culturally adapted, not literal translation),
    "layer2": string,
    "layer3": string,
    "layer4": string,
    "layer5": string
  },
  "company_names": string[],
  "quality_notes": string (any concerns about analysis quality)
}

Now analyze this case:`;

// ============================================
// NEGATIVE CASE ANALYSIS (Warning)
// ============================================

export const NEGATIVE_ANALYSIS_PROMPT = `Analyze this insurance failure/warning case and produce a five-layer deep analysis.

## Case Information
Title: {title}
Content: {content}
Source URLs: {source_urls}
Company: {company_names}
Region: {region}
Innovation Type: {innovation_type}
Insurance Line: {insurance_line}

## Five-Layer Analysis Framework for Negative Cases

### Layer 1: What Happened (发生了什么)
Describe the situation:
- Who was involved (company, product, market)?
- What went wrong?
- Timeline of events
- Scale of the issue

### Layer 2: Where Is the Problem (问题在哪)
Identify the core issue:
- Design flaw?
- Pricing error?
- Poor customer experience?
- Wrong distribution channel?
- Technology failure?
- Compliance/regulatory risk?
- Market misjudgment?

### Layer 3: Root Cause Analysis (为什么出问题)
Go beyond surface symptoms:
- Not just "pricing too low" but WHY: insufficient data, flawed model, competitive pressure, risk underestimation
- Organizational factors (culture, incentives, governance)
- External factors (market conditions, regulations, competition)
- Decision-making failures

### Layer 4: Consequences (后果)
Document the impact:
- Financial losses (quantify if possible)
- Product withdrawal or changes
- Customer impact (churn, complaints)
- Regulatory penalties
- Brand/reputation damage
- Strategic implications

### Layer 5: Lessons & Warnings (警示与教训)
Provide actionable warnings:
- How can others avoid the same mistakes?
- Early warning signs to watch for
- Better alternatives or approaches
- Risk mitigation strategies

## Output Schema
{
  "headline_en": string (attention-grabbing headline, max 100 chars),
  "headline_zh": string (Chinese headline, max 50 chars),
  "analysis_en": {
    "layer1": string (150-250 words),
    "layer2": string (150-250 words),
    "layer3": string (150-250 words),
    "layer4": string (100-200 words),
    "layer5": string (150-250 words)
  },
  "analysis_zh": {
    "layer1": string (Chinese, culturally adapted),
    "layer2": string,
    "layer3": string,
    "layer4": string,
    "layer5": string
  },
  "company_names": string[],
  "quality_notes": string (any concerns about analysis quality)
}

Now analyze this case:`;

// ============================================
// COMPLETENESS ASSESSMENT
// ============================================

export const ASSESS_COMPLETENESS_PROMPT = `Assess whether we have enough information to produce a high-quality five-layer analysis.

## Available Information
Title: {title}
Content: {content}
Source URLs: {source_urls}

## Requirements for Each Layer

For POSITIVE cases:
- Layer 1 (What): Product name, target customers, key features
- Layer 2 (How): Technology/approach, business model, key processes
- Layer 3 (Why): Innovation significance, market opportunity
- Layer 4 (Results): Any quantitative or qualitative outcomes
- Layer 5 (Insights): Enough context for actionable takeaways

For NEGATIVE cases:
- Layer 1 (What): Company, product, what went wrong, timeline
- Layer 2 (Where): Specific area of failure
- Layer 3 (Why): Root causes beyond surface symptoms
- Layer 4 (Consequences): Impact and outcomes
- Layer 5 (Lessons): Enough context for warnings

## Output Schema
{
  "is_sufficient": boolean,
  "confidence": number (0-1),
  "missing_information": string[] (list of specific missing items),
  "suggested_searches": string[] (search queries to fill gaps),
  "layers_ready": {
    "layer1": boolean,
    "layer2": boolean,
    "layer3": boolean,
    "layer4": boolean,
    "layer5": boolean
  }
}

Assess the information:`;

// ============================================
// QUALITY CHECK
// ============================================

export const QUALITY_CHECK_PROMPT = `Review this analysis and check for quality issues.

## Analysis to Review
Headline EN: {headline_en}
Headline ZH: {headline_zh}
Analysis EN: {analysis_en}
Analysis ZH: {analysis_zh}
Source URLs: {source_urls}

## Quality Checklist

1. Factual Support: Every layer supported by specific facts, not vague generalizations
2. Mechanism Clarity: Layer 2/3 specific enough for reader to understand HOW it works
3. Source Traceability: All factual claims could be traced to source links
4. Bilingual Consistency: Chinese and English versions convey same information
5. No Duplication: Content is distinct (you don't have access to existing cases, so skip this)
6. Source Validity: URLs appear valid and accessible

## Output Schema
{
  "overall_pass": boolean,
  "quality_score": number (0-1),
  "issues": [
    {
      "check_item": string,
      "passed": boolean,
      "issue_description": string | null
    }
  ],
  "improvement_suggestions": string[],
  "ready_for_publication": boolean
}

Review the analysis:`;

// ============================================
// HELPER FUNCTIONS
// ============================================

export function buildPositiveAnalysisPrompt(data: {
  title: string;
  content: string;
  source_urls: string[];
  company_names: string[];
  region: string;
  innovation_type: string;
  insurance_line: string;
}): string {
  return POSITIVE_ANALYSIS_PROMPT
    .replace('{title}', data.title)
    .replace('{content}', data.content.slice(0, 8000))
    .replace('{source_urls}', data.source_urls.join('\n'))
    .replace('{company_names}', data.company_names.join(', ') || 'Unknown')
    .replace('{region}', data.region)
    .replace('{innovation_type}', data.innovation_type)
    .replace('{insurance_line}', data.insurance_line);
}

export function buildNegativeAnalysisPrompt(data: {
  title: string;
  content: string;
  source_urls: string[];
  company_names: string[];
  region: string;
  innovation_type: string;
  insurance_line: string;
}): string {
  return NEGATIVE_ANALYSIS_PROMPT
    .replace('{title}', data.title)
    .replace('{content}', data.content.slice(0, 8000))
    .replace('{source_urls}', data.source_urls.join('\n'))
    .replace('{company_names}', data.company_names.join(', ') || 'Unknown')
    .replace('{region}', data.region)
    .replace('{innovation_type}', data.innovation_type)
    .replace('{insurance_line}', data.insurance_line);
}

export function buildCompletenessPrompt(data: {
  title: string;
  content: string;
  source_urls: string[];
}): string {
  return ASSESS_COMPLETENESS_PROMPT
    .replace('{title}', data.title)
    .replace('{content}', data.content.slice(0, 6000))
    .replace('{source_urls}', data.source_urls.join('\n'));
}

export function buildQualityCheckPrompt(data: {
  headline_en: string;
  headline_zh: string;
  analysis_en: { layer1: string; layer2: string; layer3: string; layer4: string; layer5: string };
  analysis_zh: { layer1: string; layer2: string; layer3: string; layer4: string; layer5: string };
  source_urls: string[];
}): string {
  return QUALITY_CHECK_PROMPT
    .replace('{headline_en}', data.headline_en)
    .replace('{headline_zh}', data.headline_zh)
    .replace('{analysis_en}', JSON.stringify(data.analysis_en, null, 2))
    .replace('{analysis_zh}', JSON.stringify(data.analysis_zh, null, 2))
    .replace('{source_urls}', data.source_urls.join('\n'));
}
