// src/hooks/useTranslation.ts
'use client';

import { usePathname, useRouter as useNextRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

export type Locale = 'ar' | 'en';

export default function useTranslation() {
  const nextRouter = useNextRouter();
  const currentPathname = usePathname();
  
  const [locale, setLocale] = useState<Locale>('ar'); // Default to 'ar'
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const segments = currentPathname.split('/');
    let detectedLocale: Locale = 'ar'; // Default locale
    if (segments.length > 1 && segments[1] === 'en') {
      detectedLocale = 'en';
    }
    setLocale(detectedLocale);
  }, [currentPathname]);

  useEffect(() => {
    if (locale) {
      setReady(false); // Set ready to false before loading new translations
      import(`@/locales/${locale}.json`)
        .then((module) => {
          setTranslations(module.default);
          setReady(true);
        })
        .catch(err => {
          console.error(`Failed to load translations for locale: ${locale}`, err);
          setTranslations({}); // Clear translations on error
          setReady(true); // Still ready, but with no translations
        });
    }
  }, [locale]);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let translation = translations[key] || key;
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return translation;
  }, [translations]);

  const changeLanguage = useCallback((newLocale: Locale) => {
    if (newLocale === locale) return; // No change if same locale

    let newPath;
    // Default locale 'ar' does not have a prefix
    // 'en' locale has /en/ prefix
    if (currentPathname.startsWith('/en/')) { // Current is English
      if (newLocale === 'ar') { // Switching to Arabic (default)
        newPath = currentPathname.substring(3); // Remove /en prefix
        if (newPath === '') newPath = '/'; // Handle /en -> /
      } else { // Switching to English (already English) - should not happen due to check above
        newPath = currentPathname;
      }
    } else { // Current is Arabic (no prefix, or root path)
      if (newLocale === 'en') { // Switching to English
        newPath = `/en${currentPathname === '/' ? '' : currentPathname}`; // Add /en prefix
      } else { // Switching to Arabic (already Arabic) - should not happen
        newPath = currentPathname;
      }
    }
    
    if (newPath !== currentPathname) {
      nextRouter.push(newPath);
    }
  }, [currentPathname, locale, nextRouter]);

  return { t, currentLocale: locale, changeLanguage, ready };
}
