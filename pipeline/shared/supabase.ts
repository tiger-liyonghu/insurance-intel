import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local (override existing)
config({ path: resolve(process.cwd(), '.env.local'), override: true });

// Database types
export type SourceType = 'rss' | 'website' | 'api' | 'social' | 'patent' | 'app_store';
export type SourceStatus = 'active' | 'probation' | 'disabled';
export type SourceDiscovery = 'seed' | 'entity_extraction' | 'reference' | 'exploration';
export type ScreeningStatus = 'pending' | 'passed' | 'rejected';
export type InnovationType = 'product' | 'marketing' | 'cx';
export type InsuranceLine = 'property' | 'health' | 'life';
export type SentimentType = 'positive' | 'negative';
export type CaseStatus = 'ready' | 'published' | 'pending_supplement';

export interface Source {
  id: string;
  name: string;
  url: string;
  type: SourceType;
  language: string;
  region: string;
  quality_score: number;
  check_frequency: string;
  last_checked_at: string | null;
  status: SourceStatus;
  discovered_via: SourceDiscovery | null;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RawItem {
  id: string;
  source_id: string;
  source_url: string;
  title: string;
  content: string;
  language: string;
  collected_at: string;
  screening_status: ScreeningStatus;
  screening_result: ScreeningResult | null;
  content_hash: string | null;
  created_at: string;
}

export interface ScreeningResult {
  gate1_relevance: boolean;
  gate1_score: number;
  gate2_novelty: boolean;
  gate2_score: number;
  gate3_classification: {
    innovation_type: InnovationType;
    insurance_line: InsuranceLine;
    sentiment: SentimentType;
  } | null;
  priority_score: number;
  rejection_reason?: string;
}

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

export interface PipelineRun {
  id: string;
  pipeline_name: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  items_processed: number;
  items_succeeded: number;
  items_failed: number;
  error_log: Array<{ message: string; timestamp: string; item_id?: string }>;
  metadata: Record<string, unknown>;
}

// Singleton client for pipeline scripts
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseClient;
}

// Helper functions for common operations

export async function getActiveSources(): Promise<Source[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('status', 'active')
    .order('quality_score', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSourcesDueForCheck(): Promise<Source[]> {
  const supabase = getSupabaseClient();

  // Get all active sources - we'll filter in application code
  // since Supabase doesn't support interval arithmetic in filters
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('status', 'active')
    .order('quality_score', { ascending: false });

  if (error) throw error;

  // Filter sources that need checking
  const now = new Date();
  return (data || []).filter(source => {
    if (!source.last_checked_at) return true;

    // Parse interval like '4 hours', '6 hours', '12 hours'
    const match = source.check_frequency.match(/(\d+)\s*(hour|minute|day)/i);
    if (!match) return true;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    let intervalMs = value * 60 * 60 * 1000; // default hours
    if (unit === 'minute') intervalMs = value * 60 * 1000;
    if (unit === 'day') intervalMs = value * 24 * 60 * 60 * 1000;

    const lastChecked = new Date(source.last_checked_at);
    return (now.getTime() - lastChecked.getTime()) > intervalMs;
  });
}

export async function updateSourceLastChecked(sourceId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('sources')
    .update({ last_checked_at: new Date().toISOString() })
    .eq('id', sourceId);

  if (error) throw error;
}

export async function insertRawItem(item: Omit<RawItem, 'id' | 'created_at' | 'collected_at' | 'screening_status' | 'screening_result'>): Promise<RawItem> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('raw_items')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPendingRawItems(limit = 50): Promise<RawItem[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('raw_items')
    .select('*')
    .eq('screening_status', 'pending')
    .order('collected_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function updateRawItemScreening(
  itemId: string,
  status: ScreeningStatus,
  result: ScreeningResult
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('raw_items')
    .update({
      screening_status: status,
      screening_result: result,
    })
    .eq('id', itemId);

  if (error) throw error;
}

export async function getPassedItemsWithoutCase(limit = 20): Promise<RawItem[]> {
  const supabase = getSupabaseClient();

  // Get items that passed screening but don't have a case yet
  const { data, error } = await supabase
    .from('raw_items')
    .select(`
      *,
      cases!left(id)
    `)
    .eq('screening_status', 'passed')
    .is('cases.id', null)
    .order('collected_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(item => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { cases, ...rawItem } = item;
    return rawItem as RawItem;
  });
}

export async function insertCase(caseData: Omit<Case, 'id' | 'created_at' | 'updated_at' | 'upvotes' | 'downvotes' | 'view_count'>): Promise<Case> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('cases')
    .insert(caseData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReadyCases(): Promise<Case[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('status', 'ready')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function publishCase(caseId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('cases')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', caseId);

  if (error) throw error;
}

export async function rejectCase(caseId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('cases')
    .update({ status: 'rejected' })
    .eq('id', caseId);

  if (error) throw error;
}

export async function getAllNonRejectedCases(): Promise<Case[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .neq('status', 'rejected')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPublishedCasesToday(): Promise<Case[]> {
  const supabase = getSupabaseClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('status', 'published')
    .gte('published_at', today.toISOString())
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function startPipelineRun(pipelineName: string): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('pipeline_runs')
    .insert({ pipeline_name: pipelineName, status: 'running' })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function completePipelineRun(
  runId: string,
  status: 'completed' | 'failed',
  stats: { processed: number; succeeded: number; failed: number },
  errorLog: Array<{ message: string; timestamp: string; item_id?: string }> = []
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('pipeline_runs')
    .update({
      status,
      completed_at: new Date().toISOString(),
      items_processed: stats.processed,
      items_succeeded: stats.succeeded,
      items_failed: stats.failed,
      error_log: errorLog,
    })
    .eq('id', runId);

  if (error) throw error;
}

export async function checkDuplicateContent(contentHash: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('raw_items')
    .select('id')
    .eq('content_hash', contentHash)
    .limit(1);

  if (error) throw error;
  return (data?.length || 0) > 0;
}
