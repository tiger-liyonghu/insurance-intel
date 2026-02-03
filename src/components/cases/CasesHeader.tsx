'use client';

import { useLanguage } from '@/lib/language-context';

export default function CasesHeader({ total }: { total: number }) {
  const { t } = useLanguage();

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {t('Case Library', '案例库')}
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        {t(`${total} cases found · Showing latest first`, `共 ${total} 个案例 · 按最新排序`)}
      </p>
    </div>
  );
}
