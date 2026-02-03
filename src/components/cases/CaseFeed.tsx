'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { Badge } from '@/components/ui/badge';
import VoteButtons from './VoteButtons';
import ShareMenu from '@/components/ui/ShareMenu';
import { INNOVATION_TYPES, INSURANCE_LINES, SENTIMENTS } from '@/lib/types';
import type { Case } from '@/lib/types';
import { formatRelativeTime, truncate } from '@/lib/utils';
import { TrendingUp, AlertTriangle, ExternalLink, ArrowRight } from 'lucide-react';
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
        <div className="text-center py-16 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-lg font-medium">{t('No cases yet today', '\u4eca\u65e5\u6682\u65e0\u6848\u4f8b')}</p>
          <p className="text-sm mt-1">{t('Cases will appear here as they are published', '\u6848\u4f8b\u53d1\u5e03\u540e\u5c06\u5728\u6b64\u663e\u793a')}</p>
        </div>
      )}

      {cases.map((c) => {
        const headline = lang === 'en' ? c.headline_en : c.headline_zh;
        const analysis = lang === 'en' ? c.analysis_en : c.analysis_zh;
        const layer1 = analysis?.layer1 || '';
        const layer2 = analysis?.layer2 || '';
        const innovationType = INNOVATION_TYPES[c.innovation_type as keyof typeof INNOVATION_TYPES];
        const insuranceLine = INSURANCE_LINES[c.insurance_line as keyof typeof INSURANCE_LINES];
        const sentiment = SENTIMENTS[c.sentiment as keyof typeof SENTIMENTS];
        const SentimentIcon = c.sentiment === 'positive' ? TrendingUp : AlertTriangle;

        return (
          <article key={c.id} className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300">
            {/* Accent bar */}
            <div className={`h-1 ${c.sentiment === 'positive' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-red-400 to-orange-500'}`} />

            <div className="p-5">
              {/* Header: badges + time */}
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

              {/* Headline */}
              <Link href={`/case?id=${c.id}`} className="block">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                  {headline}
                </h3>
              </Link>

              {/* Layer 1 - full summary */}
              {layer1 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 leading-relaxed line-clamp-4">
                  {layer1}
                </p>
              )}

              {/* Layer 2 - preview with left border */}
              {layer2 && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 leading-relaxed line-clamp-2 italic border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                  {truncate(layer2, 150)}
                </p>
              )}

              {/* Company tags */}
              {c.company_names && c.company_names.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {c.company_names.slice(0, 4).map((name: string) => (
                    <span key={name} className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md font-medium">
                      {name}
                    </span>
                  ))}
                  {c.company_names.length > 4 && (
                    <span className="text-xs text-gray-400">+{c.company_names.length - 4}</span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
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
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-medium uppercase">{(c.region || 'global')}</span>
                  {c.source_urls && c.source_urls.length > 0 && (
                    <ExternalLink size={12} className="text-gray-400" />
                  )}
                  <Link
                    href={`/case?id=${c.id}`}
                    className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-0.5 font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t('Read more', '\u9605\u8bfb\u5168\u6587')}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
