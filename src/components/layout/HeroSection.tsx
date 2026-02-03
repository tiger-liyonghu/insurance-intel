'use client';

import { useLanguage } from '@/lib/language-context';
import { Newspaper, Database, Zap } from 'lucide-react';

interface HeroSectionProps {
  todayCount: number;
  totalCases: number;
  totalSources: number;
}

export default function HeroSection({ todayCount, totalCases, totalSources }: HeroSectionProps) {
  const { t } = useLanguage();

  return (
    <div className="mb-8">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('Latest', '\u6700\u65b0')}</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{todayCount}</div>
        </div>
        <div className="rounded-xl p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40">
          <div className="flex items-center gap-1.5 mb-1">
            <Newspaper className="w-4 h-4 text-indigo-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('Total', '\u603b\u8ba1')}</span>
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totalCases}</div>
        </div>
        <div className="rounded-xl p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/40">
          <div className="flex items-center gap-1.5 mb-1">
            <Database className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{t('Sources', '\u4fe1\u606f\u6e90')}</span>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalSources}</div>
        </div>
      </div>
    </div>
  );
}
