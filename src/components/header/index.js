"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authNavigate, getAuthHref, isUserLoggedIn } from '@/lib/authRedirect';
import { useLanguage } from '@/context/LanguageContext';
import { DashboardGridIcon } from '@/icons/sidebarIcons';
import { useTheme } from '@/context/ThemeContext';
import styles from './header.module.scss';
import Button from '../button';
import ThemeToggle from '../themeToggle';
import LanguageToggle from '../languageToggle';
import { useTabPermission } from '@/lib/useTabPermission';

const DarkLogo = '/assets/logo/logo.png';
const LightLogo = '/assets/logo/darklogo.png';
const RightIcon = '/assets/icons/right.svg';

export default function Header() {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const activeLogo = theme === 'light' ? LightLogo : DarkLogo;
    const router = useRouter();
    const pathname = usePathname();
    const hasPlansPermission = useTabPermission('Subscription Plans');
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [openMobileDropdown, setOpenMobileDropdown] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const updateAuth = () => {
            setIsLoggedIn(isUserLoggedIn());
        };
        updateAuth();
        window.addEventListener('user:updated', updateAuth);
        window.addEventListener('auth:logout', updateAuth);
        window.addEventListener('storage', updateAuth);
        window.addEventListener('focus', updateAuth);
        return () => {
            window.removeEventListener('user:updated', updateAuth);
            window.removeEventListener('auth:logout', updateAuth);
            window.removeEventListener('storage', updateAuth);
            window.removeEventListener('focus', updateAuth);
        };
    }, [pathname]);

    useEffect(() => {
        let ticking = false;
        let isScrolledState = false;

        const handleScroll = () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                ticking = false;
                const isPastThreshold = window.scrollY > 20;
                if (isPastThreshold !== isScrolledState) {
                    isScrolledState = isPastThreshold;
                    setScrolled(isPastThreshold);
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menus on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
        setOpenMobileDropdown(null);
    }, [pathname]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1024) {
                setMobileMenuOpen(false);
                setOpenMobileDropdown(null);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleMobileDropdown = (label) => {
        setOpenMobileDropdown(prev => (prev === label ? null : label));
    };

    const productDropdownItems = useMemo(() => [
        {
            label: t('header.products.chartScanner.title', 'AI Chart Scanner'),
            desc: t('header.products.chartScanner.desc', 'Multi-timeframe technical pattern detection & neural OCR chart vision'),
            href: '/ai-chart-scanner',
            badge: t('header.products.chartScanner.badge', 'POPULAR'),
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18" />
                    <path d="m7 14 4-4 4 2 5-6" />
                    <circle cx="7" cy="14" r="1.5" fill="currentColor" />
                    <circle cx="11" cy="10" r="1.5" fill="currentColor" />
                    <circle cx="15" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="20" cy="6" r="1.5" fill="currentColor" />
                </svg>
            )
        },
        {
            label: t('header.products.marketAssistant.title', 'AI Market Assistant'),
            desc: t('header.products.marketAssistant.desc', 'Real-time conversational market intelligence & instant insights'),
            href: '/ai-market-assistant',
            badge: t('header.products.marketAssistant.badge', 'LIVE AI'),
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    <circle cx="9" cy="12" r="1" fill="currentColor" />
                    <circle cx="12" cy="12" r="1" fill="currentColor" />
                    <circle cx="15" cy="12" r="1" fill="currentColor" />
                </svg>
            )
        },
        {
            label: t('header.products.strategyHub.title', 'AI Strategy Core'),
            desc: t('header.products.strategyHub.desc', 'Algorithmic backtesting, quantitative playbooks & strategy signals'),
            href: '/ai-strategy-core',
            badge: t('header.products.strategyHub.badge', 'QUANT'),
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h3l3-7 4 14 3-8 2 4h4" />
                    <circle cx="9" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="13" cy="19" r="1.5" fill="currentColor" />
                </svg>
            )
        }
    ], [t]);

    const tradingToolsDropdownItems = useMemo(() => [
        {
            label: t('header.tradingTools.tradeAudit.title', 'AI Past Trade Analyzer'),
            desc: t('header.tradingTools.tradeAudit.desc', 'Review historical trading data to evaluate performance, pinpoint mistakes, and track win rates.'),
            href: '/ai-trade-advisor',
            badge: t('header.tradingTools.tradeAudit.badge', 'AI ADVISOR'),
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
            )
        },
        {
            label: t('header.tradingTools.strategyCreate.title', 'Custom Bot Builder'),
            desc: t('header.tradingTools.strategyCreate.desc', 'Build, backtest & automate custom trading bots & algorithmic strategies'),
            href: '/custom-bot-builder',
            badge: t('header.tradingTools.strategyCreate.badge', 'AI BOT'),
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
                </svg>
            )
        },
        {
            label: t('header.tradingTools.backtesting.title', 'Backtesting'),
            desc: t('header.tradingTools.backtesting.desc', 'High-speed historical simulation, win-rate metrics & Sharpe ratio'),
            href: '/backtesting',
            badge: t('header.tradingTools.backtesting.badge', 'SIMULATOR'),
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M12 7v5l3 3" />
                </svg>
            )
        },

    ], [t]);

    const companyDropdownItems = useMemo(() => [
        {
            label: t('header.company.aboutUs.title', 'About Us'),
            desc: t('header.company.aboutUs.desc', 'Our mission, institutional AI infrastructure & executive leadership'),
            href: '/about-us',
            badge: t('header.company.aboutUs.badge', 'VISION'),
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            )
        },
        {
            label: t('header.company.affiliate.title', 'Affiliate Program'),
            desc: t('header.company.affiliate.desc', 'Earn up to 20% recurring commissions sharing ChronosX'),
            href: '/affiliate-program',
            badge: t('header.company.affiliate.badge', 'EARN 20%'),
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            )
        },
        {
            label: t('header.company.economicCalendar.title', 'Economic Calendar'),
            desc: t('header.company.economicCalendar.desc', 'Real-time global macro events, central bank rates & high-impact releases'),
            href: '/economic-calendar',
            badge: t('header.company.economicCalendar.badge', 'LIVE CALENDAR'),
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            )
        },
        {
            label: t('header.company.news.title', 'News'),
            desc: t('header.company.news.desc', 'Curated financial headlines, market updates & breaking economic catalysts'),
            href: '/market-news',
            badge: t('header.company.news.badge', 'DAILY'),
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                    <path d="M18 14h-8" />
                    <path d="M15 18h-5" />
                    <path d="M10 6h8v4h-8V6Z" />
                </svg>
            )
        },
        {
            label: t('header.company.forexCalculator.title', 'Forex Calculator'),
            desc: t('header.company.forexCalculator.desc', 'Precision pip value, position sizing, lot size & risk calculator'),
            href: '/forex-calculator',
            badge: t('header.company.forexCalculator.badge', 'UTILITY'),
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="16" y1="14" x2="16" y2="18" />
                    <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01" />
                </svg>
            )
        },
        {
            label: t('header.company.blog.title', 'Blog'),
            desc: t('header.company.blog.desc', 'In-depth quant trading strategies, technical breakdowns & research'),
            href: '/blogs',
            badge: t('header.company.blog.badge', 'INSIGHTS'),
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
            )
        },

    ], [t]);

    const navItems = useMemo(() => {
        const items = [
            {
                label: t('header.productsTab', 'Products'),
                href: getAuthHref('/'),
                hasDropdown: true,
                dropdownTag: t('header.aiTradingEcosystem', 'AI TRADING ECOSYSTEM'),
                dropdownFooter: t('header.aiTradingEcosystemDesc', 'Powered by ChronosX Real-Time Neural Engines'),
                dropdownItems: productDropdownItems
            },
            {
                label: t('header.tradingToolsTab', 'Trading Tools'),
                href: getAuthHref('/'),
                hasDropdown: true,
                dropdownTag: t('header.quantExecutionSuite', 'QUANTITATIVE EXECUTION SUITE'),
                dropdownFooter: t('header.quantExecutionSuiteDesc', 'Multi-Broker Execution & Zero-Latency Routing'),
                dropdownItems: tradingToolsDropdownItems
            },
            {
                label: t('header.companyTab', 'Company'),
                href: '/about-us',
                hasDropdown: true,
                twoColumns: true,
                dropdownTag: t('header.companyResources', 'COMPANY & RESOURCES'),
                dropdownFooter: t('header.companyResourcesDesc', 'ChronosX Global Financial Intelligence Network'),
                dropdownItems: companyDropdownItems
            },
        ];

        if (hasPlansPermission) {
            items.push({ label: t('header.pricingTab', 'Pricing'), href: '/plans' });
        }

        items.push({ label: t('header.contactUsTab', 'Contact Us'), href: '/contact-us' });

        return items;
    }, [t, productDropdownItems, tradingToolsDropdownItems, companyDropdownItems, hasPlansPermission]);

    const isLinkActive = (item) => {
        if (!pathname) return false;
        const current = pathname.split('?')[0].replace(/\/$/, '') || '/';
        const target = (item.href || '').split('#')[0].replace(/\/$/, '') || '/';

        // For dropdown menus, only activate if user is visiting a specific non-root subpage
        if (item.hasDropdown && item.dropdownItems) {
            const isChildActive = item.dropdownItems.some(sub => {
                const subHref = (sub.href || '').split('#')[0].replace(/\/$/, '');
                if (!subHref || subHref === '/') return false;
                return current === subHref || current.startsWith(`${subHref}/`);
            });
            if (isChildActive) return true;
        }

        // If target is root '/' or hash anchor, do not activate as an active navigation tab on homepage
        if (target === '/' || item.href?.startsWith('/#') || item.href?.startsWith('#')) {
            return false;
        }

        return current === target || current.startsWith(`${target}/`);
    };

    return (
        <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
            <div className='container'>
                <div className={`${styles.headerAlignment} ${scrolled ? styles.alignmentScrolled : ''}`}>
                    {/* Brand Logo */}
                    <div className={styles.logo}>
                        <Link href="/" aria-label="ChronosX Home">
                            <img src={activeLogo} alt="ChronosX Logo" />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className={styles.menu} aria-label="Main Navigation">
                        <ul>
                            {navItems.map((item) => {
                                const active = isLinkActive(item);
                                const isItemOpen = activeDropdown === item.label;

                                if (item.hasDropdown) {
                                    return (
                                        <li
                                            key={item.label}
                                            className={`${styles.dropdownParent} ${active ? styles.active : ''} ${isItemOpen ? styles.dropdownOpen : ''}`}
                                            onMouseEnter={() => setActiveDropdown(item.label)}
                                            onMouseLeave={() => setActiveDropdown(null)}
                                        >
                                            <button
                                                type="button"
                                                className={styles.dropdownTrigger}
                                                aria-expanded={isItemOpen}
                                                onClick={() => setActiveDropdown(prev => prev === item.label ? null : item.label)}
                                            >
                                                <span>{item.label}</span>
                                                <svg
                                                    className={styles.chevron}
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </button>

                                            {/* Hover Dropdown Menu */}
                                            <div className={`${styles.dropdownMenu} ${item.twoColumns ? styles.twoColMenu : ''}`}>
                                                <div className={styles.dropdownCard}>
                                                    <div className={styles.dropdownHeaderTag}>
                                                        <span>{item.dropdownTag}</span>
                                                    </div>

                                                    <div className={`${styles.dropdownGrid} ${item.twoColumns ? styles.twoColGrid : ''}`}>
                                                        {item.dropdownItems.map((subItem) => (
                                                            <Link
                                                                key={subItem.label}
                                                                href={subItem.href}
                                                                className={styles.dropdownItem}
                                                                onClick={() => setActiveDropdown(null)}
                                                            >
                                                                <div className={styles.itemIconBox}>
                                                                    {subItem.icon}
                                                                </div>
                                                                <div className={styles.itemContent}>
                                                                    <div className={styles.itemTitleRow}>
                                                                        <span className={styles.itemTitle}>{subItem.label}</span>
                                                                        {subItem.badge && (
                                                                            <span className={styles.itemBadge}>{subItem.badge}</span>
                                                                        )}
                                                                    </div>
                                                                    <p className={styles.itemDesc}>{subItem.desc}</p>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>

                                                    <div className={styles.dropdownFooter}>
                                                        <span className={styles.footerGlowDot} />
                                                        <span>{item.dropdownFooter}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                }

                                return (
                                    <li key={item.label} className={active ? styles.active : ''}>
                                        <Link href={item.href}>
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Right Desktop CTA */}
                    <div className={styles.desktopAction}>
                        <LanguageToggle variant="headerNav" />
                        <ThemeToggle />
                        <Button
                            text={isLoggedIn ? t('nav.dashboard', 'Dashboard') : t('nav.getStarted', 'Get Started')}
                            icon={isLoggedIn ? DashboardGridIcon : RightIcon}
                            onClick={() => {
                                if (isLoggedIn) {
                                    router.push('/dashboard');
                                } else {
                                    authNavigate(router, '/dashboard');
                                }
                            }}
                        />
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button
                        type="button"
                        className={`${styles.hamburgerBtn} ${mobileMenuOpen ? styles.hamburgerActive : ''}`}
                        onClick={() => setMobileMenuOpen(prev => !prev)}
                        aria-label="Toggle navigation menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        <span className={styles.line} />
                        <span className={styles.line} />
                        <span className={styles.line} />
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className={styles.mobileDrawer}
                        initial={{ opacity: 0, y: -20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.96 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="container">
                            <div className={styles.drawerCard}>
                                <ul className={styles.drawerNavList}>
                                    {navItems.map((item) => {
                                        const active = isLinkActive(item);
                                        const isMobileOpen = openMobileDropdown === item.label;

                                        if (item.hasDropdown) {
                                            return (
                                                <li key={item.label} className={styles.mobileDropdownItem}>
                                                    <button
                                                        type="button"
                                                        className={`${styles.drawerLink} ${styles.mobileDropdownTrigger} ${active ? styles.drawerLinkActive : ''}`}
                                                        onClick={() => toggleMobileDropdown(item.label)}
                                                    >
                                                        <span>{item.label}</span>
                                                        <svg
                                                            className={`${styles.mobileChevron} ${isMobileOpen ? styles.mobileChevronOpen : ''}`}
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <polyline points="6 9 12 15 18 9" />
                                                        </svg>
                                                    </button>

                                                    <AnimatePresence>
                                                        {isMobileOpen && (
                                                            <motion.div
                                                                className={styles.mobileSubList}
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                {item.dropdownItems.map((sub) => (
                                                                    <Link
                                                                        key={sub.label}
                                                                        href={sub.href}
                                                                        className={styles.mobileSubLink}
                                                                        onClick={() => setMobileMenuOpen(false)}
                                                                    >
                                                                        <div className={styles.subIconWrap}>{sub.icon}</div>
                                                                        <div className={styles.subContent}>
                                                                            <div className={styles.subTitleRow}>
                                                                                <span className={styles.subTitle}>{sub.label}</span>
                                                                                {sub.badge && (
                                                                                    <span className={`${styles.subBadge} ${sub.badge === 'COMING SOON' || sub.badge === 'قريباً' || sub.badge === 'MALAPIT NA' ? styles.comingSoonBadge : ''}`}>
                                                                                        {sub.badge}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <span className={styles.subDesc}>{sub.desc}</span>
                                                                        </div>
                                                                    </Link>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </li>
                                            );
                                        }

                                        return (
                                            <li key={item.label}>
                                                <Link
                                                    href={item.href}
                                                    className={`${styles.drawerLink} ${active ? styles.drawerLinkActive : ''}`}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                >
                                                    <span>{item.label}</span>
                                                    {active && <span className={styles.activeDot} />}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>

                                <div className={styles.drawerDivider} />

                                <div className={styles.drawerToolsRow}>
                                    <LanguageToggle variant="headerNav" />
                                    <ThemeToggle />
                                </div>

                                <div className={styles.drawerCta}>
                                    <Button
                                        text={isLoggedIn ? t('nav.dashboard', 'Dashboard') : t('nav.getStarted', 'Get Started')}
                                        icon={isLoggedIn ? DashboardGridIcon : RightIcon}
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            if (isLoggedIn) {
                                                router.push('/dashboard');
                                            } else {
                                                authNavigate(router, '/dashboard');
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
