'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getTranslation, SUPPORTED_LOCALES, RTL_LOCALES } from '@/locales';

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

  useEffect(() => {
    try {
      let storedLang = localStorage.getItem('app_language');
      // Migrate legacy 'ph' code to 'fil'
      if (storedLang === 'ph') {
        storedLang = 'fil';
        localStorage.setItem('app_language', 'fil');
      }

      if (storedLang && SUPPORTED_LOCALES.includes(storedLang)) {
        setLanguageState(storedLang);
        const isRtl = RTL_LOCALES.includes(storedLang);
        document.documentElement.setAttribute('lang', storedLang);
        document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
      } else {
        document.documentElement.setAttribute('lang', 'en');
        document.documentElement.setAttribute('dir', 'ltr');
      }
    } catch (e) {
      console.warn('Could not read language from localStorage:', e);
    }
  }, []);

  const setLanguage = useCallback((lang) => {
    if (!SUPPORTED_LOCALES.includes(lang)) return;
    setLanguageState(lang);
    try {
      localStorage.setItem('app_language', lang);
    } catch (e) {
      console.warn('Could not save language to localStorage:', e);
    }
    if (typeof document !== 'undefined') {
      const isRtl = RTL_LOCALES.includes(lang);
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    }
  }, []);

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

  return (
    <LanguageContext.Provider value={{ language, dir, isRTL, isPending: false, setLanguage, toggleLanguage, t, tDynamic }}>
      <motion.div
        key={language}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }}
        style={{ width: '100%', minHeight: '100%' }}
      >
        {children}
      </motion.div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
