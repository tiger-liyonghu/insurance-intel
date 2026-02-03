'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Case,
  InnovationType,
  InsuranceLine,
  INNOVATION_TYPES,
  INSURANCE_LINES,
} from '@/lib/types';

interface MatrixGridProps {
  cases: Case[];
  locale?: 'en' | 'zh';
}

type MatrixCell = {
  innovationType: InnovationType;
  insuranceLine: InsuranceLine;
  case: Case | null;
};

export function MatrixGrid({ cases, locale = 'en' }: MatrixGridProps) {
  // Build matrix data
  const innovationTypes: InnovationType[] = ['product', 'marketing', 'cx'];
  const insuranceLines: InsuranceLine[] = ['property', 'health', 'life'];

  const getCaseForCell = (it: InnovationType, il: InsuranceLine): Case | null => {
    return (
      cases.find(
        (c) => c.innovation_type === it && c.insurance_line === il
      ) || null
    );
  };

  const matrix: MatrixCell[][] = insuranceLines.map((il) =>
    innovationTypes.map((it) => ({
      innovationType: it,
      insuranceLine: il,
      case: getCaseForCell(it, il),
    }))
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"></th>
            {innovationTypes.map((it) => {
              const typeInfo = INNOVATION_TYPES[it];
              return (
                <th key={it} className="p-3 text-center">
                  <Badge variant={typeInfo.color as 'blue' | 'green' | 'purple'} size="md">
                    {locale === 'zh' ? typeInfo.zh : typeInfo.en}
                  </Badge>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, rowIndex) => {
            const lineInfo = INSURANCE_LINES[insuranceLines[rowIndex]];
            return (
              <tr key={insuranceLines[rowIndex]}>
                <td className="p-3">
                  <Badge variant={lineInfo.color as 'orange' | 'red' | 'teal'} size="md">
                    {locale === 'zh' ? lineInfo.zh : lineInfo.en}
                  </Badge>
                </td>
                {row.map((cell) => (
                  <td
                    key={`${cell.innovationType}-${cell.insuranceLine}`}
                    className="p-2"
                  >
                    <MatrixCellCard cell={cell} locale={locale} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MatrixCellCard({ cell, locale }: { cell: MatrixCell; locale: 'en' | 'zh' }) {
  const { case: caseData } = cell;

  if (!caseData) {
    return (
      <div className="h-32 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <span className="text-gray-400 dark:text-gray-600 text-sm">
          {locale === 'zh' ? '暂无案例' : 'No case yet'}
        </span>
      </div>
    );
  }

  const headline = locale === 'zh' ? caseData.headline_zh : caseData.headline_en;
  const sentimentColor = caseData.sentiment === 'positive' ? 'border-green-400' : 'border-red-400';

  return (
    <Link href={`/cases/${caseData.id}`}>
      <div
        className={`h-32 bg-white dark:bg-gray-900 rounded-lg border-l-4 ${sentimentColor} shadow-sm hover:shadow-md transition-shadow p-3 flex flex-col`}
      >
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
            {headline}
          </h4>
          {caseData.company_names.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {caseData.company_names[0]}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="uppercase">{caseData.region}</span>
          <span className="flex items-center gap-2">
            <span>👍 {caseData.upvotes}</span>
            <span>👎 {caseData.downvotes}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
