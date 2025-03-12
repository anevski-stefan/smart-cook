'use client';

import { useState, useEffect } from 'react';
import { translations } from '../translations';

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string ? `${K}` | `${K}.${NestedKeyOf<T[K]>}` : never }[keyof T]
  : never;

type TranslationValue = string | Record<string, unknown>;

const LANG_COOKIE = 'NEXT_LOCALE';
const DEFAULT_LOCALE = 'en';

export function useTranslation() {
  const [locale, setLocale] = useState<keyof typeof translations>(DEFAULT_LOCALE);

  useEffect(() => {
    // Get the locale from cookie on client side
    const savedLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith(LANG_COOKIE))
      ?.split('=')[1];

    if (savedLocale && Object.keys(translations).includes(savedLocale)) {
      setLocale(savedLocale as keyof typeof translations);
    }
  }, []);

  const t = (key: NestedKeyOf<typeof translations[typeof locale]>) => {
    try {
      const keys = key.split('.');
      let current: TranslationValue = translations[locale] || translations[DEFAULT_LOCALE];
      
      if (!current) {
        console.error(`No translations found for locale: ${locale}`);
        return key;
      }

      for (const k of keys) {
        if (!current || typeof current !== 'object') {
          console.error(`Translation path error: ${key} at key ${k}`, { current, locale, translations });
          return key;
        }
        current = (current as Record<string, TranslationValue>)[k];
        if (current === undefined) {
          console.error(`Missing translation for key: ${key} at ${k}`, { locale, translations });
          return key;
        }
      }
      
      if (typeof current !== 'string') {
        console.error(`Translation value error: ${key} is not a string`, { current, locale });
        return key;
      }
      
      return current;
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error);
      return key;
    }
  };

  const changeLocale = (newLocale: keyof typeof translations) => {
    setLocale(newLocale);
    // Save the locale in a cookie
    document.cookie = `${LANG_COOKIE}=${newLocale};path=/;max-age=31536000`; // 1 year
  };

  return {
    t,
    locale,
    changeLocale,
    translations,
  };
} 