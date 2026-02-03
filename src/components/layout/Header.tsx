'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/language-context';
import { List, Globe } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { lang, toggleLang, t } = useLanguage();

  const navItems = [
    { href: '/cases', label: 'Cases', labelZh: '\u6848\u4f8b', icon: List },
  ];

  return (
    <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200/60 dark:border-gray-800/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-bold text-sm">II</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight">
                Insurance Intel
              </h1>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
                {t('Global Innovation Intelligence', '\u5168\u7403\u4fdd\u9669\u521b\u65b0\u60c5\u62a5')}
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{lang === 'en' ? item.label : item.labelZh}</span>
                </Link>
              );
            })}

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-700 ml-1"
              title={lang === 'en' ? 'Switch to Chinese' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? '\u4e2d\u6587' : 'EN'}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
