import { createClient } from '@/lib/supabase/server';
import { MatrixGrid } from '@/components/cases/MatrixGrid';
import { Case } from '@/lib/types';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';

async function getTodaysCases(): Promise<Case[]> {
  const supabase = await createClient();

  // Get today's start
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('status', 'published')
    .gte('published_at', today.toISOString())
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching today\'s cases:', error);
    return [];
  }

  return (data as Case[]) || [];
}

async function getLatestCasePerCell(): Promise<Case[]> {
  const supabase = await createClient();

  // Get latest case for each matrix cell
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching cases:', error);
    return [];
  }

  // Deduplicate to get one per cell
  const seenCells = new Set<string>();
  const uniqueCases: Case[] = [];

  for (const c of (data as Case[]) || []) {
    const cellKey = `${c.innovation_type}-${c.insurance_line}`;
    if (!seenCells.has(cellKey)) {
      seenCells.add(cellKey);
      uniqueCases.push(c);
    }
    if (uniqueCases.length >= 9) break;
  }

  return uniqueCases;
}

export default async function MatrixPage() {
  const todaysCases = await getTodaysCases();
  const matrixCases = todaysCases.length >= 9 ? todaysCases : await getLatestCasePerCell();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Innovation Matrix
            <span className="text-gray-500 dark:text-gray-400 font-normal ml-2 text-xl">
              创新九宫格
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{today}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
          <StatBox
            label="Today's Cases"
            labelZh="今日案例"
            value={todaysCases.length}
            target={9}
          />
          <StatBox
            label="Positive"
            labelZh="创新案例"
            value={todaysCases.filter((c) => c.sentiment === 'positive').length}
            color="green"
          />
          <StatBox
            label="Warnings"
            labelZh="警示案例"
            value={todaysCases.filter((c) => c.sentiment === 'negative').length}
            color="red"
          />
        </div>

        {/* Matrix Grid */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <MatrixGrid cases={matrixCases} locale="en" />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Positive (Innovation)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Negative (Warning)</span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/cases"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            View Full Case Library
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  labelZh,
  value,
  target,
  color,
}: {
  label: string;
  labelZh: string;
  value: number;
  target?: number;
  color?: 'green' | 'red';
}) {
  const colorClass = color === 'green'
    ? 'text-green-600 dark:text-green-400'
    : color === 'red'
    ? 'text-red-600 dark:text-red-400'
    : 'text-blue-600 dark:text-blue-400';

  return (
    <div className="text-center p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <div className={`text-2xl font-bold ${colorClass}`}>
        {value}
        {target && <span className="text-gray-400 font-normal">/{target}</span>}
      </div>
      <div className="text-xs text-gray-900 dark:text-gray-100">{label}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{labelZh}</div>
    </div>
  );
}
