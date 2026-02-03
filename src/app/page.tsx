'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import CaseFeed from '@/components/cases/CaseFeed';
import HeroSection from '@/components/layout/HeroSection';
import type { Case } from '@/lib/types';

export default function Home() {
  const [cases, setCases] = useState<Case[]>([]);
  const [stats, setStats] = useState({ totalCases: 0, totalSources: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data: recentCases } = await supabase
        .from('cases')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(20);

      setCases((recentCases as Case[]) || []);

      const { count: totalCases } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      const { count: totalSources } = await supabase
        .from('sources')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats({
        totalCases: totalCases || 0,
        totalSources: totalSources || 0,
      });

      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-52 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <HeroSection
        todayCount={cases.length}
        totalCases={stats.totalCases}
        totalSources={stats.totalSources}
      />
      <CaseFeed initialCases={cases} />
    </div>
  );
}
