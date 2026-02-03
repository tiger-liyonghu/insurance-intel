'use client';

import { Badge } from '@/components/ui/badge';
import {
  Case,
  INNOVATION_TYPES,
  INSURANCE_LINES,
  SENTIMENTS,
  ANALYSIS_LAYERS_POSITIVE,
  ANALYSIS_LAYERS_NEGATIVE,
} from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { ExternalLink, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import VoteButtons from '@/components/cases/VoteButtons';
import ShareMenu from '@/components/ui/ShareMenu';
import CommentSection from '@/components/cases/CommentSection';

interface CaseDetailProps {
  caseData: Case;
}

export function CaseDetail({ caseData }: CaseDetailProps) {
  const { lang, t } = useLanguage();

  const innovationType = INNOVATION_TYPES[caseData.innovation_type];
  const insuranceLine = INSURANCE_LINES[caseData.insurance_line];
  const sentiment = SENTIMENTS[caseData.sentiment];

  const headline = lang === 'zh' ? caseData.headline_zh : caseData.headline_en;
  const analysis = lang === 'zh' ? caseData.analysis_zh : caseData.analysis_en;
  const analysisLayers =
    caseData.sentiment === 'positive' ? ANALYSIS_LAYERS_POSITIVE : ANALYSIS_LAYERS_NEGATIVE;

  return (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={innovationType.color as 'blue' | 'green' | 'purple'} size="md">
            {lang === 'zh' ? innovationType.zh : innovationType.en}
          </Badge>
          <Badge variant={insuranceLine.color as 'orange' | 'red' | 'teal'} size="md">
            {lang === 'zh' ? insuranceLine.zh : insuranceLine.en}
          </Badge>
          <Badge variant={sentiment.color as 'green' | 'red'} size="md">
            {sentiment.icon} {lang === 'zh' ? sentiment.zh : sentiment.en}
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {headline}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Globe className="w-4 h-4" />
            {(caseData.region || 'global').toUpperCase()}
          </span>
          <span>
            {t('Published ', '发布于 ')}
            {formatDate(caseData.published_at || caseData.created_at, lang)}
          </span>
          {caseData.company_names.length > 0 && (
            <span>
              {caseData.company_names.join(', ')}
            </span>
          )}
        </div>

        {/* Voting + Share */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <VoteButtons
            caseId={caseData.id}
            initialUpvotes={caseData.upvotes}
            initialDownvotes={caseData.downvotes}
            size="md"
          />
          <ShareMenu
            url={typeof window !== 'undefined' ? window.location.href : `/case?id=${caseData.id}`}
            title={headline}
          />
        </div>
      </header>

      {/* Analysis Layers */}
      <div className="space-y-6">
        {(['layer1', 'layer2', 'layer3', 'layer4', 'layer5'] as const).map((layerKey, index) => {
          const layerInfo = analysisLayers[layerKey];
          const content = analysis[layerKey];

          return (
            <section
              key={layerKey}
              className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
            >
              <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-bold">
                  {index + 1}
                </span>
                {lang === 'zh' ? layerInfo.zh : layerInfo.en}
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {content}
                </p>
              </div>
            </section>
          );
        })}
      </div>

      {/* Sources */}
      {caseData.source_urls.length > 0 && (
        <section className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('Sources', '来源')}
          </h2>
          <ul className="space-y-2">
            {caseData.source_urls.map((url, index) => (
              <li key={index}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {new URL(url).hostname}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Comment Section */}
      <CommentSection caseId={caseData.id} />
    </article>
  );
}
