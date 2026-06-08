import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { translations, type Language } from '../i18n/translations';

type NestedKey = string;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: NestedKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getNested(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('mk-lang');
    return (stored === 'mr' || stored === 'en') ? stored : 'en';
  });

  useEffect(() => {
    localStorage.setItem('mk-lang', language);
    document.documentElement.lang = language === 'mr' ? 'mr' : 'en';
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);

  const t = (key: NestedKey) => getNested(translations[language] as Record<string, unknown>, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
