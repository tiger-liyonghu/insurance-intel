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
import { MessageSquare, ExternalLink } from 'lucide-react';
import VoteButtons from '@/components/cases/VoteButtons';
import ShareMenu from '@/components/ui/ShareMenu';
import { useLanguage } from '@/lib/language-context';

interface CaseCardProps {
  caseData: Case;
  locale?: 'en' | 'zh';
}

export function CaseCard({ caseData, locale }: CaseCardProps) {
  const { lang } = useLanguage();
  const displayLocale = locale || lang;

  const innovationType = INNOVATION_TYPES[caseData.innovation_type];
  const insuranceLine = INSURANCE_LINES[caseData.insurance_line];
  const sentiment = SENTIMENTS[caseData.sentiment];

  const headline = displayLocale === 'zh' ? caseData.headline_zh : caseData.headline_en;
  const analysis = displayLocale === 'zh' ? caseData.analysis_zh : caseData.analysis_en;
  const summary = truncate(analysis?.layer1 || '', 150);

  return (
    <article className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant={innovationType.color as 'blue' | 'green' | 'purple'}>
          {displayLocale === 'zh' ? innovationType.zh : innovationType.en}
        </Badge>
        <Badge variant={insuranceLine.color as 'orange' | 'red' | 'teal'}>
          {displayLocale === 'zh' ? insuranceLine.zh : insuranceLine.en}
        </Badge>
        <Badge variant={sentiment.color as 'green' | 'red'}>
          {sentiment.icon} {displayLocale === 'zh' ? sentiment.zh : sentiment.en}
        </Badge>
      </div>

      {/* Headline - clickable link */}
      <Link href={`/case?id=${caseData.id}`} className="group">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {headline}
        </h3>
      </Link>

      {/* Summary */}
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
        {summary}
      </p>

      {/* Interactive buttons */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-500">
        <div className="flex items-center gap-3">
          <VoteButtons
            caseId={caseData.id}
            initialUpvotes={caseData.upvotes}
            initialDownvotes={caseData.downvotes}
            size="sm"
          />
          <Link
            href={`/case?id=${caseData.id}#comments`}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="text-xs">0</span>
          </Link>
          <ShareMenu
            url={`/case?id=${caseData.id}`}
            title={headline}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Region */}
          <span className="uppercase text-xs">{caseData.region}</span>

          {/* Date */}
          <span className="text-xs">{formatRelativeTime(caseData.published_at || caseData.created_at, displayLocale)}</span>

          {/* Source link indicator */}
          {caseData.source_urls.length > 0 && (
            <ExternalLink className="w-3.5 h-3.5" />
          )}
        </div>
      </div>

      {/* Companies */}
      {caseData.company_names.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex flex-wrap gap-1">
            {caseData.company_names.slice(0, 3).map((company) => (
              <span
                key={company}
                className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
              >
                {company}
              </span>
            ))}
            {caseData.company_names.length > 3 && (
              <span className="text-xs text-gray-500">
                +{caseData.company_names.length - 3}
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
