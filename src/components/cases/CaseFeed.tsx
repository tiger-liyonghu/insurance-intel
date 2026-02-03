'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/language-context';
import { Badge } from '@/components/ui/badge';
import VoteButtons from './VoteButtons';
import ShareMenu from '@/components/ui/ShareMenu';
import { INNOVATION_TYPES, INSURANCE_LINES, SENTIMENTS } from '@/lib/types';
import type { Case } from '@/lib/types';
import { formatRelativeTime, truncate } from '@/lib/utils';
import { TrendingUp, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface CaseFeedProps {
  initialCases: Case[];
}

export default function CaseFeed({ initialCases }: CaseFeedProps) {
  const { lang, t } = useLanguage();
  const [cases] = useState<Case[]>(initialCases);

  return (
    <div className="space-y-4">
      {cases.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">{t('No cases yet today', '今日暂无案例')}</p>
          <p className="text-sm mt-1">{t('Cases will appear here as they are published', '案例发布后将在此显示')}</p>
        </div>
      )}

      {cases.map((c) => {
        const headline = lang === 'en' ? c.headline_en : c.headline_zh;
        const analysis = lang === 'en' ? c.analysis_en : c.analysis_zh;
        const summary = truncate(analysis?.layer1 || '', 200);
        const innovationType = INNOVATION_TYPES[c.innovation_type as keyof typeof INNOVATION_TYPES];
        const insuranceLine = INSURANCE_LINES[c.insurance_line as keyof typeof INSURANCE_LINES];
        const sentiment = SENTIMENTS[c.sentiment as keyof typeof SENTIMENTS];
        const SentimentIcon = c.sentiment === 'positive' ? TrendingUp : AlertTriangle;

        return (
          <Link href={`/case?id=${c.id}`} key={c.id} className="block">
            <article className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              {/* Header badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {innovationType && (
                  <Badge variant={innovationType.color as 'blue' | 'green' | 'purple'} size="sm">
                    {lang === 'en' ? innovationType.en : innovationType.zh}
                  </Badge>
                )}
                {insuranceLine && (
                  <Badge variant={insuranceLine.color as 'orange' | 'red' | 'teal'} size="sm">
                    {lang === 'en' ? insuranceLine.en : insuranceLine.zh}
                  </Badge>
                )}
                {sentiment && (
                  <Badge variant={sentiment.color as 'green' | 'red'} size="sm">
                    <SentimentIcon size={12} className="inline mr-1" />
                    {lang === 'en' ? sentiment.en : sentiment.zh}
                  </Badge>
                )}
                <span className="ml-auto text-xs text-gray-400">
                  {c.published_at ? formatRelativeTime(c.published_at, lang) : ''}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {headline}
              </h3>

              {/* Summary */}
              {summary && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                  {summary}
                </p>
              )}

              {/* Company names */}
              {c.company_names && c.company_names.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {c.company_names.slice(0, 3).map((name: string) => (
                    <span key={name} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                      {name}
                    </span>
                  ))}
                  {c.company_names.length > 3 && (
                    <span className="text-xs text-gray-400">+{c.company_names.length - 3}</span>
                  )}
                </div>
              )}

              {/* Footer: vote + share + region */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <VoteButtons
                    caseId={c.id}
                    initialUpvotes={c.upvotes || 0}
                    initialDownvotes={c.downvotes || 0}
                    size="sm"
                  />
                  <ShareMenu
                    title={headline || ''}
                    url={typeof window !== 'undefined' ? `${window.location.origin}/case?id=${c.id}` : `/case?id=${c.id}`}
                    size="sm"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  {(c.region || 'global').toUpperCase()}
                  {c.source_urls && c.source_urls.length > 0 && (
                    <ExternalLink size={12} />
                  )}
                </div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
