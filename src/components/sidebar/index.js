"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import styles from "./sidebar.module.scss";
import {
  DashboardGridIcon,
  AiTradeSparkIcon,
  AiChatBotIcon,
  AiStrategyIcon,
  CalendarIcon,
  ToolsIcon,
  CreditShieldIcon,
  BrokerBankIcon,
  ProfileUserIcon,
  CrownIcon,
  AiTradeAnalysisIcon,
  AffiliateIcon,
  LiveAnalysisIcon,
  StrategyIcon,
  BotBuilderIcon,
  PredefinedStrategyIcon,
  MyBotsIcon,
  AiBotSparkIcon,
  CustomBotIcon,
  BotLibraryIcon,
  SubCalendarIcon,
  SubCalculatorIcon,
  EducationIcon,
  ChevronLeftIcon,
  LogoutIcon,
  LandingHomeIcon,
} from '@/icons/sidebarIcons';
import { clearAuthSession, getStoredUser, getStoredUserId, hydrateUserFromProfile } from '@/lib/authSession';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { getBidiProps } from '@/lib/bidi';
import { supabase } from '@/lib/supabaseClient';
import { fetchVisibleTabNames, getVisibleTabNamesSync } from '@/lib/useTabPermission';
import QuickJump from '@/components/QuickJump';
import SidebarSubscriptionWidget from './SidebarSubscriptionWidget';

const BrandDarkLogo = "/assets/logo/darklogo.png";
const BrandLightLogo = "/assets/logo/logo.png";
const SmallLogo = "/assets/logo/smallLogo.png";

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const getNavSections = (t) => [
  {
    title: null,
    items: [
      { label: t('nav.dashboard', 'Dashboard'), href: "/dashboard", icon: DashboardGridIcon },
      { label: t('nav.marketAssistant', 'AI Market Assistant'), href: "/market-assistant", icon: AiChatBotIcon },
      { label: t('nav.chartScanner', 'AI Chart Scanner'), href: "/chart-scanner", icon: AiTradeSparkIcon },
      { label: t('nav.tradeAudit', 'AI Past Trade Analyzer'), href: "/trade-advisor", icon: AiTradeAnalysisIcon },
      {
        label: t('nav.strategyHub', 'AI Trading Signal'),
        href: "/trading-signal",
        icon: AiStrategyIcon,
        subItems: [
          { label: t('nav.strategySignal', 'Strategy Signal'), href: "/strategy-signal", icon: StrategyIcon },
          { label: t('nav.signalTerminal', 'Signal Terminal'), href: "/signal-terminal", icon: LiveAnalysisIcon },
          { label: t('nav.predefinedStrategies', 'Predefined Strategies'), href: "/predefined-strategies", icon: PredefinedStrategyIcon },
        ]
      },
      {
        label: t('nav.aiTradingBot', 'AI Trading Bot'),
        href: "/my-bots",
        icon: BotBuilderIcon,
        subItems: [
          { label: t('nav.myBots', 'My Bots'), href: "/my-bots", icon: MyBotsIcon },
          { label: t('nav.aiBotBuilder', 'AI Bot Builder'), href: "/ai-bot-builder", icon: AiBotSparkIcon },
          { label: t('nav.customBotBuilder', 'Custom Bot Builder'), href: "/manual-bot-builder", icon: CustomBotIcon },
          { label: t('nav.botLibrary', 'Browse Bots Library'), href: "/bot-library", icon: BotLibraryIcon },
        ]
      },
    ]
  },
  {
    title: t('sidebar.more', 'MORE'),
    items: [
      {
        label: t('nav.tools', 'Tools'),
        href: "/tools",
        icon: ToolsIcon,
        subItems: [
          { label: t('nav.economicCalendar', 'Economic Calendar'), href: "/calendar", icon: SubCalendarIcon },
          { label: t('nav.forexCalculator', 'Forex Calculator'), href: "/calculator", icon: SubCalculatorIcon },
          { label: t('nav.education', 'Education'), href: "https://edufins.com", icon: EducationIcon, isExternal: true },
        ]
      },
      { label: t('nav.plans', 'Subscription Plans'), href: "/subscription-plans", icon: CrownIcon },
      { label: t('nav.broker', 'Associated Brokers'), href: "/brokers", icon: BrokerBankIcon },
      { label: t('nav.affiliate', 'Affiliate Program'), href: "/affiliate", icon: AffiliateIcon },
      { label: t('nav.profile', 'Settings'), href: "/profile", icon: ProfileUserIcon },
    ]
  }
];

/** Match current route to nav item (handles trailing slashes and nested paths). */
function isNavItemActive(pathname, href, search = '') {
  if (!pathname || !href) return false;
  const current = pathname.split('?')[0].replace(/\/$/, '') || '/';
  const target = href.replace(/\/$/, '') || '/';
  if (current === target || current.startsWith(`${target}/`)) return true;

  // Handle /backtest and /backtesting route matching to AI Trading Bot or AI Trading Signal
  if (current === '/backtest' || current === '/backtesting') {
    let queryStr = search;
    if (!queryStr && typeof window !== 'undefined') {
      queryStr = window.location.search || '';
    }
    const params = new URLSearchParams(queryStr);
    const source = (params.get('source') || '').toLowerCase();

    // If redirected from Predefined Strategies / AI Trading Signal
    if (source === 'trading_strategies' || source.includes('signal') || source.includes('trading_strat')) {
      if (target === '/predefined-strategies' || target === '/trading-signal') {
        return true;
      }
    } else {
      // Default: redirected from My Bots / Bot Builder (AI Trading Bot suite)
      if (target === '/my-bots' || target === '/ai-trading-bot') {
        return true;
      }
    }
  }

  return false;
}

const NavItem = ({ item, pathname, onNavigate, isCollapsed }) => {
  const Icon = item.icon;
  const router = useRouter();
  const [currentSearch, setCurrentSearch] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentSearch(window.location.search || '');
    }
  }, [pathname]);

  const isParentActive = isNavItemActive(pathname, item.href, currentSearch);
  const isAnySubActive = item.subItems?.some(sub => isNavItemActive(pathname, sub.href, currentSearch));
  const isActive = isParentActive || isAnySubActive;

  const [isOpen, setIsOpen] = useState(isActive);

  useEffect(() => {
    setIsOpen(Boolean(isActive));
  }, [isActive, pathname]);

  if (item.subItems) {
    if (isCollapsed) {
      return (
        <div className={`${styles.menuGroup} ${styles.collapsedMenuGroup}`}>
          <div
            className={styles.menu}
            data-active={isActive ? 'true' : undefined}
            onClick={() => {
              if (item.subItems && item.subItems.length > 0) {
                const targetHref = item.subItems.find(s => !s.isExternal)?.href || item.subItems[0].href;
                if (typeof window !== 'undefined' && pathname !== targetHref) {
                  window.dispatchEvent(new CustomEvent('page:loading:start'));
                }
                router.push(targetHref);
                onNavigate?.();
              }
            }}
          >
            <div className={styles.icon}>
              <Icon />
            </div>
            <div className={styles.flyoutMenu}>
              <div className={styles.flyoutHeader}>{item.label}</div>
              <div className={styles.flyoutList}>
                {item.subItems.map(sub => {
                  const isSubActive = isNavItemActive(pathname, sub.href, currentSearch);
                  const SubIcon = sub.icon;
                  if (sub.isExternal) {
                    return (
                      <a
                        key={sub.href}
                        href={sub.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.flyoutLink}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate?.();
                        }}
                      >
                        <div className={styles.subMenuIcon}>
                          <SubIcon />
                        </div>
                        <span>{sub.label}</span>
                      </a>
                    );
                  }
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={styles.flyoutLink}
                      data-active={isSubActive ? 'true' : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate?.();
                      }}
                    >
                      <div className={styles.subMenuIcon}>
                        <SubIcon />
                      </div>
                      <span>{sub.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.menuGroup}>
        <div
          className={styles.menu}
          data-active={isActive ? 'true' : undefined}
          onClick={() => {
            if (item.subItems && item.subItems.length > 0) {
              const targetHref = item.subItems.find(s => !s.isExternal)?.href || item.subItems[0].href;
              if (!isAnySubActive && pathname !== targetHref) {
                // If not currently on any subpage, open and navigate to first internal subitem
                setIsOpen(true);
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('page:loading:start'));
                }
                router.push(targetHref);
                onNavigate?.();
              } else {
                // If already on a subpage, toggle collapse/expand
                setIsOpen(prev => !prev);
              }
            }
          }}
        >
          <div className={styles.icon}>
            <Icon />
          </div>
          <span>{item.label}</span>
          <div
            className={`${styles.chevron} ${isOpen ? styles.rotated : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(prev => !prev);
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
        {isOpen && (
          <div className={styles.subItemsList}>
            {item.subItems.map(sub => {
              const isSubActive = isNavItemActive(pathname, sub.href, currentSearch);
              const SubIcon = sub.icon;
              if (sub.isExternal) {
                return (
                  <a
                    key={sub.href}
                    href={sub.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.subMenuLink}
                    onClick={onNavigate}
                  >
                    <div className={styles.subMenuIcon}>
                      <SubIcon />
                    </div>
                    <span>{sub.label}</span>
                  </a>
                );
              }
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={styles.subMenuLink}
                  data-active={isSubActive ? 'true' : undefined}
                  onClick={onNavigate}
                >
                  <div className={styles.subMenuIcon}>
                    <SubIcon />
                  </div>
                  <span>{sub.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={styles.menu}
      data-active={isActive ? 'true' : undefined}
      aria-current={isActive ? 'page' : undefined}
      onClick={onNavigate}
    >
      <div className={styles.icon}>
        <Icon />
      </div>
      {!isCollapsed && <span>{item.label}</span>}
      {isCollapsed && <span className={styles.tooltip}>{item.label}</span>}
    </Link>
  );
};

const NavSkeleton = ({ count = 7, isCollapsed }) => {
  return (
    <div className={styles.navSkeletonWrap}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={styles.navSkeletonItem}
        >
          <div className={styles.navSkeletonIcon} />
          {!isCollapsed && (
            <div
              className={styles.navSkeletonText}
              style={{ width: `${55 + (i % 4) * 12}%` }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const Sidebar = ({ onClose, isCollapsed = false, onToggleCollapse }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const BrandTextLogo = theme === 'light' ? BrandDarkLogo : BrandLightLogo;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [visibleTabNames, setVisibleTabNames] = useState(() => getVisibleTabNamesSync());
  const [tabsLoading, setTabsLoading] = useState(() => !getVisibleTabNamesSync());
  const profileRef = useRef(null);
  const sidebarMenuRef = useRef(null);

  useEffect(() => {
    fetchVisibleTabNames()
      .then((names) => {
        if (names) {
          setVisibleTabNames(names);
        }
      })
      .finally(() => {
        setTabsLoading(false);
      });
  }, []);


  useEffect(() => {
    async function loadUser() {
      const stored = getStoredUser();
      if (stored) setUser(stored);

      const uid = getStoredUserId();
      if (uid && (!stored?.first_name && !stored?.last_name && !stored?.name)) {
        const hydrated = await hydrateUserFromProfile(uid, stored);
        if (hydrated) setUser(hydrated);
      }
    }
    loadUser();

    window.addEventListener('user:updated', loadUser);
    return () => window.removeEventListener('user:updated', loadUser);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstName = user?.first_name || '';
  const lastName = user?.last_name || '';
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || user?.name || user?.email || 'User Profile';

  const initials = (() => {
    if (firstName || lastName) {
      return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
    }
    if (user?.name) {
      const parts = user.name.trim().split(/\s+/);
      return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase() || 'U';
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  })();

  const handleNavigate = () => {
    onClose?.();
  };

  const doLogout = () => {
    clearAuthSession();
    router.replace('/login');
  };

  const ROUTE_TAB_MAP = {
    '/dashboard': 'Dashboard',
    '/chart-scanner': 'AI Chart Scanner',
    '/ai-chart-scanner': 'AI Chart Scanner',
    '/trade-audit': 'AI Past Trade Analyzer',
    '/ai-trade-audit': 'AI Past Trade Analyzer',
    '/trade-advisor': 'AI Past Trade Analyzer',
    '/ai-trade-advisor': 'AI Past Trade Analyzer',
    '/my-bots': 'My Bots',
    '/ai-bot-builder': 'AI Bot Builder',
    '/manual-bot-builder': 'Custom Bot Builder',
    '/custom-bot-builder': 'Custom Bot Builder',
    '/bot-library': 'Browse Bots Library',
    '/browse-bots': 'Browse Bots Library',
    '/bot-builder': 'AI Bot Builder',
    '/strategy-studio': 'AI Bot Builder',
    '/ai-strategy-studio': 'AI Bot Builder',
    '/backtest': 'Backtest',
    '/backtesting': 'Backtest',
    '/market-assistant': 'AI Market Assistant',
    '/ai-market-assistant': 'AI Market Assistant',
    '/trading-signal': 'AI Trading Signal',
    '/ai-trading-signal': 'AI Trading Signal',
    '/strategy-hub': 'AI Trading Signal',
    '/ai-strategy-hub': 'AI Trading Signal',
    '/strategy-core': 'AI Trading Signal',
    '/ai-strategy-core': 'AI Trading Signal',
    '/strategy-hub/live': 'Signal Terminal',
    '/strategy-hub/strategy': 'Strategy Signal',
    '/strategy-signal': 'Strategy Signal',
    '/predefined-strategies': 'Predefined Strategies',
    '/live-scanner': 'Signal Terminal',
    '/live-market-scanner': 'Signal Terminal',
    '/signal-terminal': 'Signal Terminal',
    '/tools': 'Tools',
    '/calendar': 'Economic Calendar',
    '/economic-calendar': 'Economic Calendar',
    '/calculator': 'Forex Calculator',
    '/forex-calculator': 'Forex Calculator',
    '/news': 'Market News',
    '/market-news': 'Market News',
    '/credit-history': 'Credit History',
    '/plans': 'Subscription Plans',
    '/subscription-plans': 'Subscription Plans',
    '/broker': 'Associated Brokers',
    '/brokers': 'Associated Brokers',
    '/affiliate': 'Affiliate',
    '/dashboard/affiliate': 'Affiliate',
    '/profile': 'Profile',
    '/settings': 'Profile',
  };

  const rawSections = getNavSections(t);
  const navSections = useMemo(() => {
    if (tabsLoading || !visibleTabNames) return [];

    const checkTabVisible = (tabLabel, routeHref) => {
      const lowerLabel = (tabLabel || '').toLowerCase().trim();
      const mapped = (ROUTE_TAB_MAP[routeHref] || '').toLowerCase().trim();

      // Affiliate & Education (Edufins external link) & Settings/Profile & Custom Bot Builder are always accessible
      if (lowerLabel.includes('affiliate') || mapped.includes('affiliate')) return true;
      if (lowerLabel.includes('education') || lowerLabel.includes('edufins') || routeHref?.includes('edufins')) return true;
      if (lowerLabel === 'profile' || lowerLabel === 'settings' || mapped === 'profile') return true;
      if (lowerLabel.includes('custom bot') || mapped.includes('custom bot') || routeHref?.includes('manual-bot-builder') || routeHref?.includes('custom-bot-builder')) return true;

      // Group parent container check: "AI Trading Bot" is shown if the parent tab itself is enabled, or if any of its sub-items is enabled
      if (lowerLabel === 'ai trading bot' || mapped === 'ai trading bot') {
        return true;
      }

      // Backtest is visible if either "Backtest" or "Backtesting" tab permission is enabled in Supabase
      if (lowerLabel === 'backtest' || mapped === 'backtest') {
        return visibleTabNames.has('backtest') || visibleTabNames.has('backtesting');
      }

      // Past Trade Analyzer matches both new and legacy tab names
      if (
        lowerLabel.includes('past trade') ||
        lowerLabel.includes('trade audit') ||
        lowerLabel.includes('trade advisor') ||
        mapped.includes('past trade') ||
        mapped.includes('trade audit') ||
        mapped.includes('trade advisor') ||
        routeHref?.includes('trade-advisor') ||
        routeHref?.includes('trade-audit')
      ) {
        return (
          visibleTabNames.has('ai past trade analyzer') ||
          visibleTabNames.has('past trade analyzer') ||
          visibleTabNames.has('ai trade advisor') ||
          visibleTabNames.has('trade advisor') ||
          visibleTabNames.has('ai trade audit') ||
          visibleTabNames.has('trade audit') ||
          visibleTabNames.has('ai trade analysis')
        );
      }

      // Exact 1-to-1 check against standardized dashboard_tabs permissions
      return visibleTabNames.has(mapped) || visibleTabNames.has(lowerLabel);
    };

    return rawSections.map(section => {
      const filteredItems = section.items.map(item => {
        const parentTabName = (ROUTE_TAB_MAP[item.href] || item.label || '').toLowerCase();

        // If item has sub-items (Tools, AI Trading Signal), filter sub-items individually
        if (item.subItems && item.subItems.length > 0) {
          const isParentGroupEnabled = checkTabVisible(item.label, item.href);
          if (!isParentGroupEnabled) return null;

          const filteredSubItems = item.subItems.filter(sub => checkTabVisible(sub.label, sub.href));

          if (filteredSubItems.length > 0) {
            return { ...item, subItems: filteredSubItems };
          }
          return null;
        }

        // Settings/Profile is always accessible
        if (
          parentTabName.includes('profile') ||
          parentTabName.includes('settings') ||
          parentTabName.includes('affiliate') ||
          item.href === '/affiliate' ||
          item.href === '/dashboard/affiliate'
        ) return item;

        // Single menu item check
        return checkTabVisible(item.label, item.href) ? item : null;
      }).filter(Boolean);

      return {
        ...section,
        items: filteredItems
      };
    }).filter(section => section.items.length > 0);
  }, [rawSections, visibleTabNames, tabsLoading]);

  const hasPlansPermission = !tabsLoading && visibleTabNames && visibleTabNames.size > 0
    ? visibleTabNames.has('subscription plans')
    : false;

  const hasBrokerPermission = !tabsLoading && visibleTabNames && visibleTabNames.size > 0
    ? (visibleTabNames.has('associated brokers') || visibleTabNames.has('associated broker') || visibleTabNames.has('broker') || visibleTabNames.has('brokers'))
    : false;

  return (
    <>
      <aside 
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
        data-lenis-prevent="true"
        onWheel={(e) => {
          if (sidebarMenuRef.current) {
            sidebarMenuRef.current.scrollTop += e.deltaY;
          }
        }}
      >
        {/* Brand Logo Header */}
        <div className={styles.logoHeader}>
          {!isCollapsed ? (
            <div className={styles.logo} onClick={() => router.push('/')}>
              <img src={BrandTextLogo} alt="CHRONOS X" />
            </div>
          ) : (
            <div className={styles.logoMark} onClick={() => router.push('/')}>
              <img src={SmallLogo} alt="ChronosX" className={styles.smallLogoImg} />
              <span className={styles.tooltip}>ChronosX</span>
            </div>
          )}
          {onToggleCollapse && (
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? t('sidebar.expand', 'Expand sidebar') : t('sidebar.collapse', 'Collapse sidebar')}
            >
              {language === 'ar'
                ? (isCollapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />)
                : (isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />)
              }
              <span className={styles.tooltip}>
                {isCollapsed ? t('sidebar.expand', 'Expand sidebar') : t('sidebar.collapse', 'Collapse sidebar')}
              </span>
            </button>
          )}
        </div>

        {/* Quick Jump Search Button & Command Palette */}
        <div className={styles.quickJumpWrapper}>
          <QuickJump isCollapsed={isCollapsed} />
        </div>

        {/* Navigation Menu List */}
        <div 
          className={styles.sidebarmenu} 
          ref={sidebarMenuRef}
          data-lenis-prevent="true"
          onWheel={(e) => {
            e.stopPropagation();
          }}
        >
          {tabsLoading || !visibleTabNames ? (
            <NavSkeleton count={7} isCollapsed={isCollapsed} />
          ) : (
            navSections.map((section, sIndex) => (
              <div key={section.title || sIndex} className={styles.navSectionBlock}>
                {!isCollapsed && section.title ? (
                  <div className={styles.navSectionHeader}>
                    {section.title}
                  </div>
                ) : (
                  sIndex > 0 && isCollapsed && <div className={styles.collapsedDivider} />
                )}
                {section.items.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    onNavigate={handleNavigate}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {/* Bottom Section: Upgrade Card & Profile Card */}
        <div className={styles.bottomSection}>
          {/* Active Plan / Upgrade to Pro Widget */}
          {hasPlansPermission && (
            <SidebarSubscriptionWidget
              isCollapsed={isCollapsed}
              onNavigate={handleNavigate}
            />
          )}

          {/* User Profile Card */}
          <div className={styles.profileWrapper} ref={profileRef}>
            <div
              className={`${styles.userProfileCard} ${isCollapsed ? styles.collapsedProfileCard : ''}`}
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              aria-expanded={profileDropdownOpen}
            >
              <div className={styles.avatarBox}>
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt={displayName} className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatarInitials}>{initials}</div>
                )}
              </div>

              {!isCollapsed && (
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{displayName}</span>
                  <span className={styles.userSubtitle}>{t('sidebar.viewManage', 'View & Manage')}</span>
                </div>
              )}

              {!isCollapsed && (
                <div className={styles.chevronBox}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#18C98B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: profileDropdownOpen ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              )}

              {isCollapsed && (
                <span className={styles.tooltip}>{displayName}</span>
              )}
            </div>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  className={`${styles.profileMenuDropdown} ${isCollapsed ? styles.collapsedMenuDropdown : ''}`}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  <div className={styles.dropdownHeader}>
                    <p className={styles.dropdownName}>{displayName}</p>
                    {user?.email && <p className={styles.dropdownEmail}>{user.email}</p>}
                  </div>

                  <div className={styles.dropdownDivider} />

                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleNavigate();
                      router.push('/profile');
                    }}
                  >
                    <ProfileUserIcon />
                    <span>{t('nav.profile', 'Settings')}</span>
                  </button>

                  <button
                    type="button"
                    className={styles.dropdownItem}
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleNavigate();
                      router.push('/');
                    }}
                  >
                    <LandingHomeIcon width={18} height={18} />
                    <span>{t('nav.home', 'Home')}</span>
                  </button>

                  <button
                    type="button"
                    className={`${styles.dropdownItem} ${styles.logoutOption}`}
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setConfirmOpen(true);
                    }}
                  >
                    <LogoutIcon />
                    <span>{t('nav.logout', 'Log out')}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Confirm Logout Modal */}
      {confirmOpen && (
        <div className={styles.confirmOverlay} onClick={() => setConfirmOpen(false)}>
          <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
            <h3>{t('topbar.logoutConfirmTitle', 'Log out?')}</h3>
            <p>{t('topbar.logoutConfirmMessage', 'Are you sure you want to log out?')}</p>
            <div className={styles.confirmActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setConfirmOpen(false)}>{t('topbar.cancel', 'Cancel')}</button>
              <button type="button" className={styles.confirmLogoutBtn} onClick={doLogout}>{t('nav.logout', 'Log out')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
