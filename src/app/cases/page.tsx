'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CaseCard } from '@/components/cases/CaseCard';
import { FilterBar } from '@/components/cases/FilterBar';
import CasesHeader from '@/components/cases/CasesHeader';
import { Case, InnovationType, InsuranceLine, SentimentType } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const PAGE_SIZE = 12;

function CasesContent() {
  const searchParams = useSearchParams();
  const [cases, setCases] = useState<Case[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const innovationType = searchParams.get('innovation_type') as InnovationType | null;
  const insuranceLine = searchParams.get('insurance_line') as InsuranceLine | null;
  const sentiment = searchParams.get('sentiment') as SentimentType | null;
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    async function fetchCases() {
      setLoading(true);
      const supabase = createClient();
      const offset = (page - 1) * PAGE_SIZE;

      let query = supabase
        .from('cases')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (innovationType) query = query.eq('innovation_type', innovationType);
      if (insuranceLine) query = query.eq('insurance_line', insuranceLine);
      if (sentiment) query = query.eq('sentiment', sentiment);

      const { data, count, error } = await query;

      if (!error) {
        setCases((data as Case[]) || []);
        setTotal(count || 0);
      }
      setLoading(false);
    }

    fetchCases();
  }, [innovationType, insuranceLine, sentiment, page]);

  return (
    <div className="min-h-screen">
      <FilterBar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <CasesHeader total={total} />

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : cases.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((caseData) => (
              <CaseCard key={caseData.id} caseData={caseData} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

export default function CasesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen animate-pulse" />}>
      <CasesContent />
    </Suspense>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No cases found
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        Try adjusting your filters or check back later for new cases.
      </p>
    </div>
  );
}
