'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/hooks/useTranslation';

export default function LocaleSetter() {
  const pathname = usePathname();

  useEffect(() => {
    const segments = pathname.split('/');
    let currentLocale: Locale = 'ar'; // Default
    if (segments.length > 1 && segments[1] === 'en') {
      currentLocale = 'en';
    }
    
    document.documentElement.lang = currentLocale;
    if (currentLocale === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [pathname]);

  return null;
}
