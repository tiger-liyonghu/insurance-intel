'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (en: string, zh: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: (en) => en,
});

function getInitialLang(): Language {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem('preferred_lang');
  if (saved === 'en' || saved === 'zh') return saved;
  const browserLang = navigator.language || '';
  if (browserLang.startsWith('zh')) return 'zh';
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    setLang(getInitialLang());
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'en' ? 'zh' : 'en';
      localStorage.setItem('preferred_lang', next);
      return next;
    });
  }, []);

  const t = useCallback(
    (en: string, zh: string) => (lang === 'en' ? en : zh),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
