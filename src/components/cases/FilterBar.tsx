'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  InnovationType,
  InsuranceLine,
  SentimentType,
  INNOVATION_TYPES,
  INSURANCE_LINES,
  SENTIMENTS,
} from '@/lib/types';

import { useLanguage } from '@/lib/language-context';

export function FilterBar() {
  const { lang: locale } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentInnovationType = searchParams.get('innovation_type') as InnovationType | null;
  const currentInsuranceLine = searchParams.get('insurance_line') as InsuranceLine | null;
  const currentSentiment = searchParams.get('sentiment') as SentimentType | null;

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/cases?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/cases');
  };

  const hasFilters = currentInnovationType || currentInsuranceLine || currentSentiment;

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/60 dark:border-gray-800/60 sticky top-14 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          {/* Innovation Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {locale === 'zh' ? '创新类型:' : 'Type:'}
            </span>
            <div className="flex gap-1">
              {(Object.entries(INNOVATION_TYPES) as [InnovationType, typeof INNOVATION_TYPES[InnovationType]][]).map(
                ([key, value]) => (
                  <button
                    key={key}
                    onClick={() => updateFilter('innovation_type', currentInnovationType === key ? null : key)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      currentInnovationType === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {locale === 'zh' ? value.zh : value.en}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Insurance Line Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {locale === 'zh' ? '险种:' : 'Line:'}
            </span>
            <div className="flex gap-1">
              {(Object.entries(INSURANCE_LINES) as [InsuranceLine, typeof INSURANCE_LINES[InsuranceLine]][]).map(
                ([key, value]) => (
                  <button
                    key={key}
                    onClick={() => updateFilter('insurance_line', currentInsuranceLine === key ? null : key)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      currentInsuranceLine === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {locale === 'zh' ? value.zh : value.en}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {locale === 'zh' ? '类型:' : 'Sentiment:'}
            </span>
            <div className="flex gap-1">
              {(Object.entries(SENTIMENTS) as [SentimentType, typeof SENTIMENTS[SentimentType]][]).map(
                ([key, value]) => (
                  <button
                    key={key}
                    onClick={() => updateFilter('sentiment', currentSentiment === key ? null : key)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      currentSentiment === key
                        ? key === 'positive'
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {value.icon} {locale === 'zh' ? value.zh : value.en}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline"
            >
              {locale === 'zh' ? '清除筛选' : 'Clear filters'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
