'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Case,
  INNOVATION_TYPES,
  INSURANCE_LINES,
  SENTIMENTS,
} from '@/lib/types';
import { formatRelativeTime, truncate } from '@/lib/utils';
import { ExternalLink, ArrowRight } from 'lucide-react';
import VoteButtons from '@/components/cases/VoteButtons';
import ShareMenu from '@/components/ui/ShareMenu';
import { useLanguage } from '@/lib/language-context';

interface CaseCardProps {
  caseData: Case;
  locale?: 'en' | 'zh';
}

export function CaseCard({ caseData, locale }: CaseCardProps) {
  const { lang, t } = useLanguage();
  const displayLocale = locale || lang;

  const innovationType = INNOVATION_TYPES[caseData.innovation_type];
  const insuranceLine = INSURANCE_LINES[caseData.insurance_line];
  const sentiment = SENTIMENTS[caseData.sentiment];

  const headline = displayLocale === 'zh' ? caseData.headline_zh : caseData.headline_en;
  const analysis = displayLocale === 'zh' ? caseData.analysis_zh : caseData.analysis_en;
  const layer1 = analysis?.layer1 || '';
  const layer2 = analysis?.layer2 || '';

  return (
    <article className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Sentiment accent bar */}
      <div className={`h-1 ${caseData.sentiment === 'positive' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-red-400 to-orange-500'}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Top: badges + time */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={innovationType.color as 'blue' | 'green'} size="sm">
              {displayLocale === 'zh' ? innovationType.zh : innovationType.en}
            </Badge>
            <Badge variant={insuranceLine.color as 'orange' | 'red' | 'teal'} size="sm">
              {displayLocale === 'zh' ? insuranceLine.zh : insuranceLine.en}
            </Badge>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
            {formatRelativeTime(caseData.published_at || caseData.created_at, displayLocale)}
          </span>
        </div>

        {/* Headline */}
        <Link href={`/case?id=${caseData.id}`} className="block mb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
            {headline}
          </h3>
        </Link>

        {/* Layer 1 summary - full display */}
        {layer1 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 leading-relaxed line-clamp-4">
            {layer1}
          </p>
        )}

        {/* Layer 2 preview */}
        {layer2 && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 leading-relaxed line-clamp-2 italic border-l-2 border-gray-200 dark:border-gray-700 pl-3">
            {truncate(layer2, 120)}
          </p>
        )}

        {/* Companies */}
        {caseData.company_names.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {caseData.company_names.slice(0, 3).map((company) => (
              <span
                key={company}
                className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md font-medium"
              >
                {company}
              </span>
            ))}
            {caseData.company_names.length > 3 && (
              <span className="text-xs text-gray-400">
                +{caseData.company_names.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Spacer to push footer down */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <VoteButtons
              caseId={caseData.id}
              initialUpvotes={caseData.upvotes}
              initialDownvotes={caseData.downvotes}
              size="sm"
            />
            <ShareMenu
              url={`/case?id=${caseData.id}`}
              title={headline}
              size="sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="uppercase text-xs text-gray-400 font-medium">{caseData.region}</span>
            {caseData.source_urls.length > 0 && (
              <ExternalLink className="w-3 h-3 text-gray-400" />
            )}
            <Link
              href={`/case?id=${caseData.id}`}
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-0.5 font-medium"
            >
              {t('Read', '\u8be6\u60c5')}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
