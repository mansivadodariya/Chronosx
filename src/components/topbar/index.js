'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './topbar.module.scss';
import { dashboardApi } from '@/lib/api';
import { getStoredUser, getStoredUserId, hydrateUserFromProfile } from '@/lib/authSession';
import { CREDITS_UPDATED_EVENT } from '@/lib/credits';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/languageToggle';
import ThemeToggle from '@/components/themeToggle';
import { supabase } from '@/lib/supabaseClient';
import { CreditCardIcon } from '@/icons/creditIcon';

const ROUTE_TITLE_MAP = {
  '/dashboard': 'nav.dashboard|Dashboard',
  '/chart-scanner': 'nav.chartScanner|AI Chart Scanner',
  '/ai-chart-scanner': 'nav.chartScanner|AI Chart Scanner',
  '/trade-audit': 'nav.tradeAudit|AI Past Trade Analyzer',
  '/ai-trade-audit': 'nav.tradeAudit|AI Past Trade Analyzer',
  '/trade-advisor': 'nav.tradeAudit|AI Past Trade Analyzer',
  '/ai-trade-advisor': 'nav.tradeAudit|AI Past Trade Analyzer',
  '/strategy-studio': 'nav.strategyStudio|AI Bot Builder',
  '/ai-strategy-studio': 'nav.strategyStudio|AI Bot Builder',
  '/market-assistant': 'nav.marketAssistant|AI Market Assistant',
  '/ai-market-assistant': 'nav.marketAssistant|AI Market Assistant',
  '/live-scanner': 'nav.liveMarketScanner|Signal Terminal',
  '/live-market-scanner': 'nav.liveMarketScanner|Signal Terminal',
  '/signal-terminal': 'nav.liveMarketScanner|Signal Terminal',
  '/trading-signal': 'nav.strategyHub|AI Trading Signal',
  '/ai-trading-signal': 'nav.strategyHub|AI Trading Signal',
  '/strategy-hub': 'nav.strategyHub|AI Trading Signal',
  '/ai-strategy-hub': 'nav.strategyHub|AI Trading Signal',
  '/strategy-core': 'nav.strategyHub|AI Trading Signal',
  '/ai-strategy-core': 'nav.strategyHub|AI Trading Signal',
  '/strategy-hub/live': 'nav.liveMarketScanner|Signal Terminal',
  '/strategy-hub/strategy': 'nav.strategyPlaybooks|Strategy Signal',
  '/strategy-signal': 'nav.strategyPlaybooks|Strategy Signal',
  '/tools': 'nav.tools|Tools',
  '/calendar': 'nav.economicCalendar|Economic Calendar',
  '/economic-calendar': 'nav.economicCalendar|Economic Calendar',
  '/calculator': 'nav.forexCalculator|Forex Calculator',
  '/forex-calculator': 'nav.forexCalculator|Forex Calculator',
  '/news': 'nav.marketNews|Market News',
  '/market-news': 'nav.marketNews|Market News',
  '/credit-history': 'nav.creditHistory|Credit History',
  '/plans': 'nav.plans|Subscription Plans',
  '/subscription-plans': 'nav.plans|Subscription Plans',
  '/broker': 'nav.broker|Associated Brokers',
  '/brokers': 'nav.broker|Associated Brokers',
  '/profile': 'nav.profile|Profile',
  '/settings': 'nav.settings|Settings',
};

const Topbar = ({ onMenuClick }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleTabNames, setVisibleTabNames] = useState(null);

  const currentEntry = Object.entries(ROUTE_TITLE_MAP).find(([route]) =>
    pathname === route || pathname?.startsWith(`${route}/`)
  );

  const pageTitle = (() => {
    if (!currentEntry) return '';
    const [tKey, defaultVal] = currentEntry[1].split('|');
    return t(tKey, defaultVal);
  })();

  const fetchCredits = async (userId) => {
    if (!userId) return;
    try {
      const res = await dashboardApi.getStats(userId);
      setCredits(res?.data?.available_credits ?? 0);
    } catch (err) {
      if (!err?.message?.includes('Session expired')) { /* skip */ }
    }
  };

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem('visible_tab_names');
        if (cached) {
          setVisibleTabNames(new Set(JSON.parse(cached)));
        }
      }
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    async function loadVisibleTabs() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase.rpc('get_visible_dashboard_tabs');
        if (!error && Array.isArray(data)) {
          const arr = data.map(tab => (tab.name || '').toLowerCase());
          setVisibleTabNames(new Set(arr));
        }
      } catch (e) {
        console.warn('Failed to load visible tabs in topbar:', e);
      }
    }
    loadVisibleTabs();
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const parsed = getStoredUser();
        const userId = getStoredUserId();
        if (!parsed && !userId) {
          router.replace('/login');
          return;
        }
        await hydrateUserFromProfile(userId, parsed || { id: userId, user_id: userId });
        await fetchCredits(userId);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    init();
    window.addEventListener('user:updated', init);
    return () => window.removeEventListener('user:updated', init);
  }, [router]);

  useEffect(() => {
    const onCreditsUpdated = (e) => {
      const next = e?.detail?.available_credits;
      if (next !== undefined && next !== null) {
        setCredits(next);
      }
    };
    window.addEventListener(CREDITS_UPDATED_EVENT, onCreditsUpdated);
    return () => window.removeEventListener(CREDITS_UPDATED_EVENT, onCreditsUpdated);
  }, []);

  const hasPlansPermission = visibleTabNames ? visibleTabNames.has('subscription plans') : true;

  if (loading) {
    return (
      <div className={styles.topbar}>
        <div className={styles.left}>
          <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          {pageTitle && <h1 className={styles.pageTitle}>{pageTitle}</h1>}
        </div>
        <div className={styles.right}>
          <div className={styles.skeletonCredits} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.topbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        {pageTitle && <h1 className={styles.pageTitle}>{pageTitle}</h1>}
      </div>

      <div className={styles.right}>
        {/* Language Selector */}
        <LanguageToggle />

        {/* Light / Dark Theme Toggle */}
        <ThemeToggle />

        {/* Credits Badge */}
        <div
          className={styles.credits}
          onClick={() => {
            if (hasPlansPermission) {
              router.push('/subscription-plans');
            }
          }}
          role="button"
          tabIndex={0}
          title={hasPlansPermission ? t('topbar.clickToUpgrade', 'View subscription plans') : ''}
        >
          <CreditCardIcon />
          <span>{credits ?? 0} {t('topbar.credits', 'credits')}</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
