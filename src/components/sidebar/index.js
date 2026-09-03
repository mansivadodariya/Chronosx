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
} from '@/icons/sidebarIcons';
import { clearAuthSession, getStoredUser, getStoredUserId, hydrateUserFromProfile } from '@/lib/authSession';
import { useLanguage } from '@/context/LanguageContext';
import { getBidiProps } from '@/lib/bidi';
import { supabase } from '@/lib/supabaseClient';
import QuickJump from '@/components/QuickJump';

const BrandTextLogo = "/assets/logo/logo.png";
const SmallLogo = "/assets/logo/smallLogo.png";

const LiveAnalysisIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const StrategyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const SubCalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="4" width="18" height="17" rx="3" />
    <path d="M16 2v4M8 2v4M3 9h18" />
    <circle cx="8" cy="13" r="0.8" fill="currentColor" />
    <circle cx="12" cy="13" r="0.8" fill="currentColor" />
    <circle cx="16" cy="13" r="0.8" fill="currentColor" />
    <circle cx="8" cy="17" r="0.8" fill="currentColor" />
    <circle cx="12" cy="17" r="0.8" fill="currentColor" />
  </svg>
);

const SubCalculatorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="16" y1="14" x2="16" y2="18" />
    <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01" />
  </svg>
);

const SubNewsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8" />
    <path d="M15 18h-5" />
    <path d="M10 6h8v4h-8V6Z" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const getMainNav = (t) => [
  { label: t('nav.dashboard', 'Dashboard'), href: "/dashboard", icon: DashboardGridIcon },
  { label: t('nav.aiTrade', 'AI Trade'), href: "/trade-snap", icon: AiTradeSparkIcon },
  { label: t('nav.aiTradeAnalysis', 'AI Trade analysis'), href: "/trade-analysis", icon: AiTradeAnalysisIcon },
  { label: t('nav.aiChat', 'AI Chat'), href: "/ai-assistant", icon: AiChatBotIcon },
  {
    label: t('nav.aiStrategy', 'AI Strategy'),
    href: "/ai-strategy",
    icon: AiStrategyIcon,
    subItems: [
      { label: t('nav.liveAnalysis', 'Live Analysis'), href: "/ai-strategy/live", icon: LiveAnalysisIcon },
      { label: t('nav.aiStrategy', 'AI Strategy'), href: "/ai-strategy/strategy", icon: StrategyIcon },
    ]
  },
  {
    label: t('nav.tools', 'Tools'),
    href: "/tools",
    icon: ToolsIcon,
    subItems: [
      { label: t('nav.economicCalendar', 'Economic Calendar'), href: "/calendar", icon: SubCalendarIcon },
      { label: t('nav.forexCalculator', 'Forex Calculator'), href: "/calculator", icon: SubCalculatorIcon },
    ]
  },
  { label: t('nav.plans', 'Subscription Plans'), href: "/subscription-plans", icon: CrownIcon },
  { label: t('nav.broker', 'Broker'), href: "/broker", icon: BrokerBankIcon },
  { label: t('nav.profile', 'Settings'), href: "/profile", icon: ProfileUserIcon },
];

/** Match current route to nav item (handles trailing slashes and nested paths). */
function isNavItemActive(pathname, href) {
  if (!pathname || !href) return false;
  const current = pathname.split('?')[0].replace(/\/$/, '') || '/';
  const target = href.replace(/\/$/, '') || '/';
  return current === target || current.startsWith(`${target}/`);
}

const NavItem = ({ item, pathname, onNavigate, isCollapsed }) => {
  const Icon = item.icon;
  const router = useRouter();
  const isParentActive = isNavItemActive(pathname, item.href);
  const isAnySubActive = item.subItems?.some(sub => isNavItemActive(pathname, sub.href));
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
                if (typeof window !== 'undefined' && pathname !== item.subItems[0].href) {
                  window.dispatchEvent(new CustomEvent('page:loading:start'));
                }
                router.push(item.subItems[0].href);
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
                  const isSubActive = isNavItemActive(pathname, sub.href);
                  const SubIcon = sub.icon;
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
              const targetHref = item.subItems[0].href;
              if (!isAnySubActive && pathname !== targetHref) {
                // If not currently on any subpage, open and navigate to first subitem
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
              const isSubActive = isNavItemActive(pathname, sub.href);
              const SubIcon = sub.icon;
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

const NavSkeleton = ({ count = 6, isCollapsed }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 8px', margin: '8px 0' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '44px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            gap: '12px'
          }}
        >
          <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: 'rgba(24, 201, 139, 0.1)' }} />
          {!isCollapsed && (
            <div style={{ width: '65%', height: '14px', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />
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

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [visibleTabNames, setVisibleTabNames] = useState(null);
  const [tabsLoading, setTabsLoading] = useState(false);
  const profileRef = useRef(null);

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
      if (!supabase) {
        setTabsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.rpc('get_visible_dashboard_tabs');
        if (!error && Array.isArray(data)) {
          const arr = data.map(t => (t.name || '').toLowerCase());
          const names = new Set(arr);
          setVisibleTabNames(names);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('visible_tab_names', JSON.stringify(arr));
          }
        }
      } catch (e) {
        console.warn('Failed to load visible tabs in sidebar:', e);
      } finally {
        setTabsLoading(false);
      }
    }
    loadVisibleTabs();
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
    '/trade-snap': 'AI Trade',
    '/trade-analysis': 'AI Trade analysis',
    '/ai-trade-analysis': 'AI Trade analysis',
    '/ai-assistant': 'AI Chat',
    '/ai-strategy': 'AI Strategy',
    '/ai-strategy/live': 'AI Strategy',
    '/ai-strategy/strategy': 'AI Strategy',
    '/tools': 'Tools',
    '/calendar': 'Economic Calendar',
    '/economic-calendar': 'Economic Calendar',
    '/calculator': 'Forex Calculator',
    '/credit-history': 'Credit History',
    '/plans': 'Subscription Plans',
    '/subscription-plans': 'Subscription Plans',
    '/broker': 'Broker',
    '/brokers': 'Broker',
    '/profile': 'Profile',
    '/settings': 'Profile',
  };

  const rawNav = getMainNav(t);
  const mainNav = useMemo(() => {
    if (!visibleTabNames || visibleTabNames.size === 0) return rawNav;

    return rawNav.map(item => {
      const parentTabName = (ROUTE_TAB_MAP[item.href] || item.label || '').toLowerCase();

      // If item has sub-items (Tools, AI Strategy), filter sub-items based on Supabase permissions
      if (item.subItems && item.subItems.length > 0) {
        const filteredSubItems = item.subItems.filter(sub => {
          const subTabName = (ROUTE_TAB_MAP[sub.href] || sub.label || '').toLowerCase();
          return visibleTabNames.has(subTabName) || visibleTabNames.has(parentTabName);
        });

        if (filteredSubItems.length > 0) {
          return { ...item, subItems: filteredSubItems };
        }
        return visibleTabNames.has(parentTabName) ? item : null;
      }

      // Settings/Profile is always accessible
      if (parentTabName === 'profile' || parentTabName === 'settings') return item;

      // Single menu item check
      return visibleTabNames.has(parentTabName) ? item : null;
    }).filter(Boolean);
  }, [rawNav, visibleTabNames]);

  const hasPlansPermission = visibleTabNames && visibleTabNames.size > 0
    ? visibleTabNames.has('subscription plans')
    : true;

  const hasBrokerPermission = visibleTabNames && visibleTabNames.size > 0
    ? visibleTabNames.has('broker')
    : true;

  return (
    <>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
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
        <div className={styles.sidebarmenu}>
          {tabsLoading && !visibleTabNames ? (
            <NavSkeleton count={8} isCollapsed={isCollapsed} />
          ) : (
            mainNav.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                pathname={pathname}
                onNavigate={handleNavigate}
                isCollapsed={isCollapsed}
              />
            ))
          )}
        </div>

        {/* Bottom Section: Upgrade Card & Profile Card */}
        <div className={styles.bottomSection}>
          {/* Upgrade to Pro Card - links to subscription plans */}
          {hasPlansPermission && (
            !isCollapsed ? (
              <Link
                href="/subscription-plans"
                className={styles.upgradeCard}
                onClick={handleNavigate}
              >
                <div className={styles.upgradeIcon}>
                  <CrownIcon />
                </div>
                <div className={styles.upgradeText}>
                  <span className={styles.upgradeSub}>{t('sidebar.upgradeTo', 'Upgrade to')}</span>
                  <span className={styles.upgradeMain}>{t('sidebar.proAccount', 'Pro Account')}</span>
                </div>
                <div
                  className={styles.upgradeArrowBtn}
                  aria-hidden="true"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#040300" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ) : (
              <div className={styles.compactUpgradeBox}>
                <Link
                  href="/subscription-plans"
                  className={styles.compactUpgradeBtn}
                  onClick={handleNavigate}
                  aria-label={t('sidebar.upgradeToPro', 'Upgrade to Pro')}
                >
                  <CrownIcon />
                  <span className={styles.tooltip}>
                    {t('sidebar.upgradeToPro', 'Upgrade to Pro')}
                  </span>
                </Link>
              </div>
            )
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
                    <span>{t('nav.profile', 'Profile')}</span>
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
