'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MatrixGrid } from '@/components/cases/MatrixGrid';
import { Case } from '@/lib/types';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';

export default function MatrixPage() {
  const [matrixCases, setMatrixCases] = useState<Case[]>([]);
  const [todaysCases, setTodaysCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Get today's start
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayData } = await supabase
        .from('cases')
        .select('*')
        .eq('status', 'published')
        .gte('published_at', today.toISOString())
        .order('published_at', { ascending: false });

      const todayCases = (todayData as Case[]) || [];
      setTodaysCases(todayCases);

      if (todayCases.length >= 6) {
        setMatrixCases(todayCases);
      } else {
        // Get latest case for each matrix cell
        const { data: latestData } = await supabase
          .from('cases')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(50);

        const seenCells = new Set<string>();
        const uniqueCases: Case[] = [];
        for (const c of (latestData as Case[]) || []) {
          const cellKey = `${c.innovation_type}-${c.insurance_line}`;
          if (!seenCells.has(cellKey)) {
            seenCells.add(cellKey);
            uniqueCases.push(c);
          }
          if (uniqueCases.length >= 6) break;
        }
        setMatrixCases(uniqueCases);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-64 mx-auto bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Innovation Matrix
            <span className="text-gray-500 dark:text-gray-400 font-normal ml-2 text-xl">
              创新六宫格
            </span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{todayStr}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
          <StatBox label="Today's Cases" labelZh="今日案例" value={todaysCases.length} target={6} />
          <StatBox label="Positive" labelZh="创新案例" value={todaysCases.filter((c) => c.sentiment === 'positive').length} color="green" />
          <StatBox label="Warnings" labelZh="警示案例" value={todaysCases.filter((c) => c.sentiment === 'negative').length} color="red" />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <MatrixGrid cases={matrixCases} locale="en" />
        </div>

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

        <div className="text-center">
          <Link href="/cases" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:underline">
            View Full Case Library
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, labelZh, value, target, color }: {
  label: string; labelZh: string; value: number; target?: number; color?: 'green' | 'red';
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
