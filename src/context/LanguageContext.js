  'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { getTranslation, loadLocaleData, SUPPORTED_LOCALES, RTL_LOCALES, translations, normalizeLocale } from '@/locales';

const LanguageContext = createContext({
  language: 'en',
  dir: 'ltr',
  isRTL: false,
  isPending: false,
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key, fallback, variables) => fallback || key,
  tDynamic: (item, keyEn) => '',
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [, setLoadedVersion] = useState(0);

  useEffect(() => {
    try {
      let detectedLang = null;

      // 1. Check URL query parameter (e.g. ?lang=arabic or ?lang=ar)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const langQuery = urlParams.get('lang') || urlParams.get('locale');
        if (langQuery) {
          detectedLang = normalizeLocale(langQuery);
        }

        // 2. Check URL path prefix (e.g. /arabic or /ar or /spanish)
        if (!detectedLang) {
          const pathSegments = window.location.pathname.split('/').filter(Boolean);
          if (pathSegments.length > 0) {
            detectedLang = normalizeLocale(pathSegments[0]);
          }
        }
      }

      // 3. Fallback to localStorage or cookie
      if (!detectedLang) {
        let storedLang = localStorage.getItem('app_language');
        if (storedLang === 'ph') storedLang = 'fil';
        detectedLang = normalizeLocale(storedLang);
      }

      const activeLang = detectedLang && SUPPORTED_LOCALES.includes(detectedLang) ? detectedLang : 'en';

      setLanguageState(activeLang);
      localStorage.setItem('app_language', activeLang);
      document.cookie = `app_language=${activeLang}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `NEXT_LOCALE=${activeLang}; path=/; max-age=31536000; SameSite=Lax`;

      const isRtl = RTL_LOCALES.includes(activeLang);
      document.documentElement.setAttribute('lang', activeLang);
      document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

      if (activeLang !== 'en' && !translations[activeLang]) {
        loadLocaleData(activeLang).then(() => {
          setLoadedVersion((v) => v + 1);
        });
      }
    } catch (e) {
      console.warn('Could not initialize language context:', e);
    }
  }, []);

  const setLanguage = useCallback((lang, updateUrl = true) => {
    const canonical = normalizeLocale(lang);
    if (!canonical || !SUPPORTED_LOCALES.includes(canonical)) return;
    setLanguageState(canonical);
    try {
      localStorage.setItem('app_language', canonical);
      document.cookie = `app_language=${canonical}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `NEXT_LOCALE=${canonical}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      console.warn('Could not save language to localStorage:', e);
    }
    if (typeof document !== 'undefined') {
      const isRtl = RTL_LOCALES.includes(canonical);
      document.documentElement.setAttribute('lang', canonical);
      document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

      // Update URL in browser address bar (e.g. /zh, /ar, /es, /en or /zh/about-us)
      if (updateUrl && typeof window !== 'undefined' && window.history) {
        try {
          const currentPath = window.location.pathname;
          const segments = currentPath.split('/').filter(Boolean);
          const firstSeg = segments[0]?.toLowerCase();
          const existingLang = normalizeLocale(firstSeg);
          const cleanSegments = existingLang ? segments.slice(1) : segments;
          
          const newPath = cleanSegments.length > 0 
            ? `/${canonical}/${cleanSegments.join('/')}` 
            : `/${canonical}`;

          const targetFull = `${newPath}${window.location.search}${window.location.hash}`;
          if (targetFull !== `${currentPath}${window.location.search}${window.location.hash}`) {
            window.history.pushState({ lang: canonical }, '', targetFull);
          }
        } catch (err) {
          console.warn('Could not update browser history URL:', err);
        }
      }
    }

    if (canonical !== 'en' && !translations[canonical]) {
      loadLocaleData(canonical).then(() => {
        setLoadedVersion((v) => v + 1);
      });
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      const urlLang = pathSegments.length > 0 ? normalizeLocale(pathSegments[0]) : null;
      if (urlLang && SUPPORTED_LOCALES.includes(urlLang)) {
        setLanguage(urlLang, false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setLanguage]);

  const toggleLanguage = useCallback(() => {
    const currentIndex = SUPPORTED_LOCALES.indexOf(language);
    const nextIndex = (currentIndex + 1) % SUPPORTED_LOCALES.length;
    setLanguage(SUPPORTED_LOCALES[nextIndex]);
  }, [language, setLanguage]);

  const t = useCallback((key, fallback = '', variables = null) => {
    return getTranslation(language, key, fallback, variables);
  }, [language]);

  /** Helper to translate dynamic backend data objects (e.g. backend fields with _en / _ar / _es etc.) */
  const tDynamic = useCallback((item, fieldEn = 'title', fieldAr, fieldPh) => {
    if (!item) return '';
    const localizedKey = fieldEn + '_' + language;
    if (item[localizedKey]) return item[localizedKey];
    
    // Legacy fallbacks
    if (language === 'ar' && fieldAr && item[fieldAr]) return item[fieldAr];
    if ((language === 'fil' || language === 'ph') && fieldPh && item[fieldPh]) return item[fieldPh];

    return item[fieldEn] || item[fieldEn + '_en'] || item[fieldAr] || item[fieldPh] || '';
  }, [language]);

  const isRTL = RTL_LOCALES.includes(language);
  const dir = isRTL ? 'rtl' : 'ltr';

  const value = useMemo(() => ({
    language,
    dir,
    isRTL,
    isPending: false,
    setLanguage,
    toggleLanguage,
    t,
    tDynamic
  }), [language, dir, isRTL, setLanguage, toggleLanguage, t, tDynamic]);

  return (
    <LanguageContext.Provider value={{ language, dir, isRTL, isPending: false, setLanguage, toggleLanguage, t, tDynamic }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);