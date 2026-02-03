'use client';

import { useLanguage } from '@/lib/language-context';

interface HeroSectionProps {
  todayCount: number;
  totalCases: number;
  totalSources: number;
}

export default function HeroSection({ todayCount, totalCases, totalSources }: HeroSectionProps) {
  const { t } = useLanguage();

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t('Insurance Innovation Intelligence', '保险创新情报')}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {t(
          'Daily curated insights across the 3×3 innovation matrix',
          '全球保险创新情报 — 每日精选 3×3 创新矩阵洞察'
        )}
      </p>

      {/* Stats bar */}
      <div className="flex items-center gap-6 mt-3 text-sm">
        <Stat label={t('Today', '今日')} value={todayCount} />
        <Stat label={t('Total', '总计')} value={totalCases} />
        <Stat label={t('Sources', '信息源')} value={totalSources} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{value}</span>
      <span className="text-gray-500 dark:text-gray-400 text-xs">{label}</span>
    </div>
  );
}
