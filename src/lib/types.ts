export type InnovationType = 'product' | 'marketing';
export type InsuranceLine = 'property' | 'health' | 'life';
export type SentimentType = 'positive' | 'negative';
export type CaseStatus = 'ready' | 'published' | 'pending_supplement';

export interface CaseAnalysis {
  layer1: string;
  layer2: string;
  layer3: string;
  layer4: string;
  layer5: string;
}

export interface Case {
  id: string;
  raw_item_id: string;
  innovation_type: InnovationType;
  insurance_line: InsuranceLine;
  sentiment: SentimentType;
  headline_en: string;
  headline_zh: string;
  analysis_en: CaseAnalysis;
  analysis_zh: CaseAnalysis;
  source_urls: string[];
  company_names: string[];
  region: string;
  status: CaseStatus;
  supplement_rounds: number;
  quality_score: number | null;
  published_at: string | null;
  upvotes: number;
  downvotes: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  case_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
  };
}

export interface Vote {
  id: string;
  case_id: string;
  user_id: string;
  vote_type: 1 | -1;
  created_at: string;
}

export const INNOVATION_TYPES: Record<InnovationType, { en: string; zh: string; color: string }> = {
  product: { en: 'Product', zh: '产品创新', color: 'blue' },
  marketing: { en: 'Marketing', zh: '营销创新', color: 'green' },
};

export const INSURANCE_LINES: Record<InsuranceLine, { en: string; zh: string; color: string }> = {
  property: { en: 'Property & Casualty', zh: '财产险', color: 'orange' },
  health: { en: 'Health', zh: '健康险', color: 'red' },
  life: { en: 'Life', zh: '人寿险', color: 'teal' },
};

export const SENTIMENTS: Record<SentimentType, { en: string; zh: string; color: string; icon: string }> = {
  positive: { en: 'Innovation', zh: '创新案例', color: 'green', icon: '✓' },
  negative: { en: 'Warning', zh: '警示案例', color: 'red', icon: '⚠' },
};

export const ANALYSIS_LAYERS_POSITIVE = {
  layer1: { en: 'What It Is', zh: '产品/服务是什么' },
  layer2: { en: 'How It Works', zh: '运作机制' },
  layer3: { en: 'Why It Matters', zh: '创新意义' },
  layer4: { en: 'Results & Evidence', zh: '效果与证据' },
  layer5: { en: 'Actionable Insights', zh: '可借鉴之处' },
};

export const ANALYSIS_LAYERS_NEGATIVE = {
  layer1: { en: 'What Happened', zh: '发生了什么' },
  layer2: { en: 'Where Is the Problem', zh: '问题在哪' },
  layer3: { en: 'Root Cause', zh: '为什么出问题' },
  layer4: { en: 'Consequences', zh: '后果' },
  layer5: { en: 'Lessons & Warnings', zh: '警示与教训' },
};
