import { notFound } from 'next/navigation';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { CaseDetail } from '@/components/cases/CaseDetail';
import { Case } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface CasePageProps {
  params: Promise<{ id: string }>;
}

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function getCase(id: string): Promise<Case | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Case;
}

export async function generateStaticParams() {
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from('cases')
    .select('id')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(500);

  return (data || []).map((c: { id: string }) => ({ id: c.id }));
}

export async function generateMetadata({ params }: CasePageProps) {
  const { id } = await params;
  const caseData = await getCase(id);

  if (!caseData) {
    return { title: 'Case Not Found' };
  }

  return {
    title: `${caseData.headline_en} | Insurance Innovation Intelligence`,
    description: caseData.analysis_en.layer1.slice(0, 160),
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const { id } = await params;
  const caseData = await getCase(id);

  if (!caseData) {
    notFound();
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back link */}
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
