'use client';

import { useLanguage } from '@/lib/language-context';

export default function CasesHeader({ total }: { total: number }) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between mb-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t(`${total} cases · Latest first`, `${total} 个案例 · 最新优先`)}
      </p>
    </div>
  );
}
