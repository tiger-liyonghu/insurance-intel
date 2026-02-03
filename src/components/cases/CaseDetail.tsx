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
import { ExternalLink, Globe, Building2, Calendar } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import VoteButtons from '@/components/cases/VoteButtons';
import ShareMenu from '@/components/ui/ShareMenu';
import CommentSection from '@/components/cases/CommentSection';

interface CaseDetailProps {
  caseData: Case;
}

const LAYER_BADGE_CLASSES = [
  'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
  'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400',
  'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
  'bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400',
  'bg-fuchsia-100 dark:bg-fuchsia-900 text-fuchsia-600 dark:text-fuchsia-400',
];

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
      {/* Header card */}
      <header className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-6">
        {/* Accent bar */}
        <div className={`h-1.5 ${caseData.sentiment === 'positive' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-red-400 to-orange-500'}`} />

        <div className="p-6">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
            {headline}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              {(caseData.region || 'global').toUpperCase()}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(caseData.published_at || caseData.created_at, lang)}
            </span>
            {caseData.company_names.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                {caseData.company_names.join(', ')}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
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
        </div>
      </header>

      {/* Analysis Layers */}
      <div className="space-y-4">
        {(['layer1', 'layer2', 'layer3', 'layer4', 'layer5'] as const).map((layerKey, index) => {
          const layerInfo = analysisLayers[layerKey];
          const content = analysis[layerKey];
          return (
            <section
              key={layerKey}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${LAYER_BADGE_CLASSES[index]}`}>
                  {index + 1}
                </span>
                {lang === 'zh' ? layerInfo.zh : layerInfo.en}
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-[15px]">
                  {content}
                </p>
              </div>
            </section>
          );
        })}
      </div>

      {/* Sources */}
      {caseData.source_urls.length > 0 && (
        <section className="mt-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('Sources', '\u6765\u6e90')}
          </h2>
          <ul className="space-y-2">
            {caseData.source_urls.map((url, index) => {
              let hostname = url;
              try { hostname = new URL(url).hostname; } catch {}
              return (
                <li key={index}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    {hostname}
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Comment Section */}
      <CommentSection caseId={caseData.id} />
    </article>
  );
}
