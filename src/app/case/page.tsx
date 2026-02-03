'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CaseDetail } from '@/components/cases/CaseDetail';
import { Case } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function CaseContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function fetchCase() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setCaseData(data as Case);
      }
      setLoading(false);
    }

    fetchCase();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !caseData) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Case Not Found</h1>
          <Link href="/cases" className="text-blue-600 hover:underline">
            Back to Cases
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cases
        </Link>

        <CaseDetail caseData={caseData} />
      </div>
    </div>
  );
}

export default function CasePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>
        </div>
      </div>
    }>
      <CaseContent />
    </Suspense>
  );
}
