'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import styles from './languageToggle.module.scss';

/* Crisp Vector Flags for Supported Languages */
const USFlag = () => (
  <svg width="18" height="13" viewBox="0 0 640 480" className={styles.flagSvg} aria-hidden="true">
    <g fillRule="evenodd">
      <path fill="#bd3d44" d="M0 0h640v480H0z"/>
      <path stroke="#fff" strokeWidth="37" d="M0 55.4h640M0 129.2h640M0 203h640M0 277h640M0 350.8h640M0 424.6h640"/>
      <path fill="#192f5d" d="M0 0h260v260H0z"/>
      <circle cx="45" cy="45" r="16" fill="#fff"/>
      <circle cx="130" cy="45" r="16" fill="#fff"/>
      <circle cx="215" cy="45" r="16" fill="#fff"/>
      <circle cx="87.5" cy="87.5" r="16" fill="#fff"/>
      <circle cx="172.5" cy="87.5" r="16" fill="#fff"/>
      <circle cx="45" cy="130" r="16" fill="#fff"/>
      <circle cx="130" cy="130" r="16" fill="#fff"/>
      <circle cx="215" cy="130" r="16" fill="#fff"/>
      <circle cx="87.5" cy="172.5" r="16" fill="#fff"/>
      <circle cx="172.5" cy="172.5" r="16" fill="#fff"/>
      <circle cx="45" cy="215" r="16" fill="#fff"/>
      <circle cx="130" cy="215" r="16" fill="#fff"/>
      <circle cx="215" cy="215" r="16" fill="#fff"/>
    </g>
  </svg>
);

const SAFlag = () => (
  <svg width="18" height="13" viewBox="0 0 640 480" className={styles.flagSvg} aria-hidden="true">
    <path fill="#006c35" d="M0 0h640v480H0z"/>
    <path fill="#fff" d="M160 210c40-3 120-3 220 0-15-6-40-12-80-12-50 0-90 6-140 12zm-20 30c50 4 150 4 270 0-25 8-70 14-140 14-70 0-110-6-130-14z"/>
    <path fill="#fff" d="M190 260h200v6H190zm-15-3h15v12h-15z"/>
  </svg>
);

const PHFlag = () => (
  <svg width="18" height="13" viewBox="0 0 640 480" className={styles.flagSvg} aria-hidden="true">
    <path fill="#0038a8" d="M0 0h640v240H0z"/>
    <path fill="#ce1126" d="M0 240h640v240H0z"/>
    <path fill="#fff" d="M0 0l277.1 240L0 480z"/>
    <circle cx="92" cy="240" r="32" fill="#fcd116"/>
    <circle cx="35" cy="120" r="12" fill="#fcd116"/>
    <circle cx="35" cy="360" r="12" fill="#fcd116"/>
    <circle cx="210" cy="240" r="12" fill="#fcd116"/>
  </svg>
);

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', Flag: USFlag },
  { code: 'ar', label: 'Arabic', native: 'العربية', Flag: SAFlag },
  { code: 'ph', label: 'Filipino', native: 'Filipino', Flag: PHFlag },
];

export default function LanguageToggle({ className = '', variant = 'default' }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const CurrentFlag = currentLang.Flag;

  return (
    <div className={`${styles.wrapper} ${className}`} ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${styles.toggleButton} ${styles[variant]} ${isOpen ? styles.btnActive : ''}`}
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <span className={styles.flagWrap}>
          <CurrentFlag />
        </span>
        
        <span className={styles.label}>
          {currentLang.native}
        </span>

        <span className={`${styles.chevronIcon} ${isOpen ? styles.rotated : ''}`}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.dropdownMenu}
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {LANGUAGES.map((item) => {
              const ItemFlag = item.Flag;
              const isSelected = language === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  className={`${styles.dropdownOption} ${isSelected ? styles.activeOption : ''}`}
                  onClick={() => handleSelectLanguage(item.code)}
                >
                  <div className={styles.optionLeft}>
                    <span className={styles.flagWrap}>
                      <ItemFlag />
                    </span>
                    <span className={styles.optionLabel}>{item.native}</span>
                    <span className={styles.optionSubLabel}>({item.label})</span>
                  </div>

                  {isSelected && (
                    <svg className={styles.checkIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
