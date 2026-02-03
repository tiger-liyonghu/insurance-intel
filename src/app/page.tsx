import { createClient } from '@/lib/supabase/server';
import CaseFeed from '@/components/cases/CaseFeed';
import HeroSection from '@/components/layout/HeroSection';
import type { Case } from '@/lib/types';

export const revalidate = 60;

async function getRecentCases(): Promise<Case[]> {
  const supabase = await createClient();

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let { data: cases } = await supabase
    .from('cases')
    .select('*')
    .eq('status', 'published')
    .gte('published_at', twentyFourHoursAgo)
    .order('published_at', { ascending: false });

  if (!cases || cases.length === 0) {
    const { data: recentCases } = await supabase
      .from('cases')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20);
    cases = recentCases;
  }

  return (cases || []) as Case[];
}

async function getStats() {
  const supabase = await createClient();

  const { count: totalCases } = await supabase
    .from('cases')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  const { count: totalSources } = await supabase
    .from('sources')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  return {
    totalCases: totalCases || 0,
    totalSources: totalSources || 0,
  };
}

export default async function Home() {
  const [cases, stats] = await Promise.all([getRecentCases(), getStats()]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <HeroSection
        todayCount={cases.length}
        totalCases={stats.totalCases}
        totalSources={stats.totalSources}
      />
      <CaseFeed initialCases={cases} />
    </div>
  );
}
