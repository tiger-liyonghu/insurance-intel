import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, locale: 'en' | 'zh' = 'en'): string {
  const date = new Date(dateString);

  if (locale === 'zh') {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeTime(dateString: string, locale: 'en' | 'zh' = 'en'): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = [
    { seconds: 31536000, en: 'year', zh: '年' },
    { seconds: 2592000, en: 'month', zh: '月' },
    { seconds: 86400, en: 'day', zh: '天' },
    { seconds: 3600, en: 'hour', zh: '小时' },
    { seconds: 60, en: 'minute', zh: '分钟' },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      if (locale === 'zh') {
        return `${count}${interval.zh}前`;
      }
      return `${count} ${interval.en}${count > 1 ? 's' : ''} ago`;
    }
  }

  return locale === 'zh' ? '刚刚' : 'just now';
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
