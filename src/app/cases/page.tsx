import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { CaseCard } from '@/components/cases/CaseCard';
import { FilterBar } from '@/components/cases/FilterBar';
import CasesHeader from '@/components/cases/CasesHeader';
import { Case, InnovationType, InsuranceLine, SentimentType } from '@/lib/types';

interface CasesPageProps {
  searchParams: Promise<{
    innovation_type?: InnovationType;
    insurance_line?: InsuranceLine;
    sentiment?: SentimentType;
    page?: string;
  }>;
}

async function getCases(filters: {
  innovation_type?: InnovationType;
  insurance_line?: InsuranceLine;
  sentiment?: SentimentType;
  page?: number;
}): Promise<{ cases: Case[]; total: number }> {
  const supabase = await createClient();
  const pageSize = 12;
  const page = filters.page || 1;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('cases')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (filters.innovation_type) {
    query = query.eq('innovation_type', filters.innovation_type);
  }
  if (filters.insurance_line) {
    query = query.eq('insurance_line', filters.insurance_line);
  }
  if (filters.sentiment) {
    query = query.eq('sentiment', filters.sentiment);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching cases:', error);
    return { cases: [], total: 0 };
  }

  return { cases: (data as Case[]) || [], total: count || 0 };
}

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const params = await searchParams;
  const { cases, total } = await getCases({
    innovation_type: params.innovation_type,
    insurance_line: params.insurance_line,
    sentiment: params.sentiment,
    page: params.page ? parseInt(params.page) : 1,
  });

  return (
    <div className="min-h-screen">
      <Suspense fallback={<div className="h-16 bg-white dark:bg-gray-900 border-b" />}>
        <FilterBar />
      </Suspense>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <CasesHeader total={total} />

        {cases.length > 0 ? (
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
