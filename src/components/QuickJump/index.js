'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import styles from './quickJump.module.scss';
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
    BotBuilderIcon,
} from '@/icons/sidebarIcons';

const HomeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const LiveAnalysisIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

const SubCalculatorIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="16" y1="14" x2="16" y2="18" />
        <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01" />
    </svg>
);

const SubNewsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8" />
        <path d="M15 18h-5" />
        <path d="M10 6h8v4h-8V6Z" />
    </svg>
);

// --- Quick Jump Navigation Items Dynamic Generator ---
const getQuickJumpSections = (t) => [
    {
        categoryKey: 'general',
        category: t('quickJump.catGeneral', 'General'),
        items: [
            {
                id: 'home',
                title: t('nav.home', 'Home'),
                subtitle: t('quickJump.homeSub', 'Return to ChronosX main landing'),
                href: '/',
                keywords: ['home', 'landing', 'main', 'start'],
                icon: <HomeIcon />,
            },
            {
                id: 'dashboard',
                title: t('nav.dashboard', 'Dashboard'),
                subtitle: t('quickJump.dashboardSub', 'Executive account overview & KPI analytics'),
                href: '/dashboard',
                keywords: ['dashboard', 'kpi', 'stats', 'analytics', 'overview', 'pnl'],
                icon: <DashboardGridIcon />,
            },
            {
                id: 'profile',
                title: t('quickJump.profileTitle', 'Trader Profile'),
                subtitle: t('quickJump.profileSub', 'Security, personal details & settings'),
                href: '/profile',
                keywords: ['profile', 'settings', 'user', 'account', 'security', 'preferences'],
                icon: <ProfileUserIcon />,
            },
        ],
    },
    {
        categoryKey: 'trading',
        category: t('quickJump.catTrading', 'Trading'),
        items: [
            {
                id: 'signal-terminal',
                title: t('nav.liveMarketScanner', 'Signal Terminal'),
                subtitle: t('quickJump.liveScannerSub', 'Live algorithmic market scanner, momentum radar & alerts'),
                href: '/signal-terminal',
                keywords: ['signal', 'terminal', 'live', 'scanner', 'trading', 'chart', 'watchlist', 'mt5', 'stream', 'order', 'forex', 'market', 'analysis'],
                icon: <LiveAnalysisIcon />,
            },
            {
                id: 'trading-signal',
                title: t('nav.strategyHub', 'AI Trading Signal'),
                subtitle: t('quickJump.strategyHubSub', 'Automated strategy signals & quantitative algorithms'),
                href: '/trading-signal',
                keywords: ['signals', 'strategy', 'core', 'bot', 'algo', 'supertrend', 'ema', 'automated', 'engine', 'playbooks', 'hub'],
                icon: <AiStrategyIcon />,
            },
            {
                id: 'chart-scanner',
                title: t('nav.chartScanner', 'AI Chart Scanner'),
                subtitle: t('quickJump.chartScannerSub', 'Instant vision AI chart screenshot analysis & scanner'),
                href: '/chart-scanner',
                keywords: ['chart', 'scanner', 'snap', 'vision', 'camera', 'scan', 'screenshot', 'pattern', 'confluence'],
                icon: <AiTradeSparkIcon />,
            },
            {
                id: 'trade-advisor',
                title: t('nav.tradeAudit', 'AI Past Trade Analyzer'),
                subtitle: t('quickJump.tradeAuditSub', 'Statement audit, behavioral flaws & trade ledger review'),
                href: '/trade-advisor',
                keywords: ['past trade', 'analyzer', 'advisor', 'audit', 'past', 'history', 'statement', 'analysis', 'fomo', 'report', 'ledger', 'csv'],
                icon: <AiTradeAnalysisIcon />,
            },
            {
                id: 'ai-bot-builder',
                title: t('nav.strategyStudio', 'AI Bot Builder'),
                subtitle: t('quickJump.strategyStudioSub', 'Interactive AI strategy and algorithmic bot builder'),
                href: '/ai-bot-builder',
                keywords: ['bot', 'builder', 'strategy', 'studio', 'algo', 'automation', 'create', 'prompt'],
                icon: <BotBuilderIcon />,
            },
        ],
    },
    {
        categoryKey: 'copilot',
        category: t('quickJump.catCopilot', 'Copilot & AI'),
        items: [
            {
                id: 'market-assistant',
                title: t('nav.marketAssistant', 'AI Market Assistant'),
                subtitle: t('quickJump.marketAssistantSub', 'Interactive multi-turn trading copilot & market assistant'),
                href: '/market-assistant',
                keywords: ['chat', 'assistant', 'copilot', 'bot', 'ask', 'prompt', 'talk', 'gpt', 'trading', 'market'],
                icon: <AiChatBotIcon />,
            },
        ],
    },
    {
        categoryKey: 'tools',
        category: t('quickJump.catTools', 'Tools & Insights'),
        items: [
            {
                id: 'economic-calendar',
                title: t('nav.economicCalendar', 'Economic Calendar'),
                subtitle: t('quickJump.calendarSub', 'Real-time high impact macroeconomic news and events'),
                href: '/calendar',
                keywords: ['calendar', 'news', 'events', 'nfp', 'cpi', 'fomc', 'interest rate'],
                icon: <CalendarIcon />,
            },
            {
                id: 'forex-calculator',
                title: t('nav.forexCalculator', 'Forex Calculator'),
                subtitle: t('quickJump.calculatorSub', 'Pip value, risk reward, margin and lot position sizing'),
                href: '/calculator',
                keywords: ['calculator', 'pip', 'margin', 'lots', 'sizing', 'risk', 'reward', 'leverage'],
                icon: <SubCalculatorIcon />,
            },
            {
                id: 'market-news',
                title: t('nav.marketNews', 'Market News'),
                subtitle: t('quickJump.marketNewsSub', 'Financial markets headline news & sentiment feeds'),
                href: '/news',
                keywords: ['news', 'market', 'headlines', 'fx', 'sentiment', 'central bank'],
                icon: <SubNewsIcon />,
            },
            {
                id: 'education',
                title: t('nav.education', 'Education'),
                subtitle: t('quickJump.educationSub', 'Master trading fundamentals, psychology & markets at Edufins'),
                href: 'https://edufins.com',
                isExternal: true,
                keywords: ['education', 'learn', 'courses', 'edufins', 'academy', 'trading guide'],
                icon: <SubCalculatorIcon />,
            },
        ],
    },
    {
        categoryKey: 'account',
        category: t('quickJump.catAccount', 'Account & Broker'),
        items: [
            {
                id: 'affiliate',
                title: t('nav.affiliate', 'Affiliate Program'),
                subtitle: t('quickJump.affiliateSub', 'Referral tracking, tier commissions & crypto withdrawals'),
                href: '/affiliate',
                keywords: ['affiliate', 'referral', 'commission', 'withdraw', 'crypto', 'usdt', 'earn', 'invite', 'partner'],
                icon: <AffiliateIcon />,
            },
            {
                id: 'subscription-plans',
                title: t('nav.plans', 'Subscription Plans'),
                subtitle: t('quickJump.plansSub', 'Upgrade to Pro, Institutional tiers & active quotas'),
                href: '/subscription-plans',
                keywords: ['plans', 'subscription', 'upgrade', 'pro', 'pricing', 'tier', 'membership'],
                icon: <CrownIcon />,
            },
            {
                id: 'broker',
                title: t('nav.broker', 'Associated Brokers'),
                subtitle: t('quickJump.brokerSub', 'Connect MT4/MT5 accounts, broker API & credentials'),
                href: '/brokers',
                keywords: ['broker', 'mt5', 'mt4', 'metatrader', 'account', 'deposit', 'credentials'],
                icon: <BrokerBankIcon />,
            },
            {
                id: 'credit-history',
                title: t('nav.creditHistory', 'Credit History'),
                subtitle: t('quickJump.creditHistorySub', 'Review AI token usage, credits and transaction logs'),
                href: '/credit-history',
                keywords: ['credits', 'tokens', 'history', 'billing', 'balance', 'usage'],
                icon: <CreditShieldIcon />,
            },
        ],
    },
];

export default function QuickJump({ isCollapsed = false }) {
    const { t } = useLanguage();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeCategoryKey, setActiveCategoryKey] = useState('all');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const itemRefs = useRef([]);
    const resultsListRef = useRef(null);

    const categories = useMemo(() => [
        { key: 'all', label: t('quickJump.catAll', 'All') },
        { key: 'trading', label: t('quickJump.catTrading', 'Trading') },
        { key: 'general', label: t('quickJump.catGeneral', 'General') },
        { key: 'copilot', label: t('quickJump.catCopilot', 'Copilot & AI') },
        { key: 'tools', label: t('quickJump.catTools', 'Tools & Insights') },
        { key: 'account', label: t('quickJump.catAccount', 'Account & Broker') },
    ], [t]);

    const sections = useMemo(() => getQuickJumpSections(t), [t]);

    // Explicit mouse wheel scrolling support
    const handleListWheel = (e) => {
        if (resultsListRef.current) {
            resultsListRef.current.scrollTop += e.deltaY;
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    // Open/Close toggle
    const handleOpen = () => {
        setIsOpen(true);
        setQuery('');
        setActiveCategoryKey('all');
        setSelectedIndex(0);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    // Global Cmd+K / Ctrl+K listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Filtered results by query AND activeCategoryKey
    const filteredSections = useMemo(() => {
        const q = query.trim().toLowerCase();

        return sections.map((section) => {
            // Check if section matches category filter
            if (activeCategoryKey !== 'all' && section.categoryKey !== activeCategoryKey) {
                return { ...section, items: [] };
            }

            const matchedItems = section.items.filter((item) => {
                if (!q) return true;
                return (
                    item.title.toLowerCase().includes(q) ||
                    item.subtitle.toLowerCase().includes(q) ||
                    item.keywords.some((k) => k.toLowerCase().includes(q)) ||
                    section.category.toLowerCase().includes(q)
                );
            });

            return {
                ...section,
                items: matchedItems,
            };
        }).filter((section) => section.items.length > 0);
    }, [query, activeCategoryKey, sections]);

    // Flattened items list for keyboard selection
    const flatItems = useMemo(() => {
        return filteredSections.flatMap((sec) => sec.items);
    }, [filteredSections]);

    // Reset selected index when flat items change
    useEffect(() => {
        setSelectedIndex(0);
    }, [query, activeCategoryKey]);

    // Auto-focus input when modal opens & handle body overflow
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            if (typeof window !== 'undefined' && window.lenis) {
                window.lenis.stop();
            }
            setTimeout(() => {
                inputRef.current?.focus();
            }, 60);

            return () => {
                document.body.style.overflow = originalOverflow;
                if (typeof window !== 'undefined' && window.lenis) {
                    window.lenis.start();
                }
            };
        }
    }, [isOpen]);

    // Keyboard navigation inside modal
    const handleModalKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            handleClose();
            return;
        }

        if (flatItems.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % flatItems.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const target = flatItems[selectedIndex];
            if (target) {
                handleNavigate(target.href);
            }
        }
    };

    // Scroll active item into view
    useEffect(() => {
        if (itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex]?.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth',
            });
        }
    }, [selectedIndex]);

    const handleNavigate = (href) => {
        handleClose();
        if (typeof href === 'string' && (href.startsWith('http://') || href.startsWith('https://'))) {
            window.open(href, '_blank', 'noopener,noreferrer');
        } else {
            router.push(href);
        }
    };

    // Modal portal content
    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.modalBackdrop} onClick={handleClose}>
                    <motion.div
                        className={styles.modalCard}
                        data-lenis-prevent="true"
                        onWheel={handleListWheel}
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.94, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* 1. Search Header Area */}
                        <div className={styles.searchHeaderArea}>
                            <div className={styles.searchIconWrap}>
                                <svg
                                    className={styles.searchIcon}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                className={styles.searchInput}
                                placeholder={t('quickJump.inputPlaceholder', 'Type a page name, bot, or setting...')}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleModalKeyDown}
                            />
                            <div className={styles.headerActions}>
                                {query && (
                                    <button
                                        type="button"
                                        className={styles.clearBtn}
                                        onClick={() => setQuery('')}
                                        title={t('quickJump.clear', 'Clear')}
                                    >
                                        {t('quickJump.clear', 'Clear')}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className={styles.closeBtn}
                                    onClick={handleClose}
                                    title={t('quickJump.close', 'Close (Esc)')}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* 2. Quick Category Filter Chips */}
                        <div className={styles.filterBar}>
                            {categories.map((cat) => (
                                <button
                                    key={cat.key}
                                    type="button"
                                    className={`${styles.filterChip} ${activeCategoryKey === cat.key ? styles.filterChipActive : ''}`}
                                    onClick={() => setActiveCategoryKey(cat.key)}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* 3. Results / Options List */}
                        <div 
                                ref={resultsListRef} 
                                className={styles.resultsList}
                                onWheel={handleListWheel}
                                data-lenis-prevent="true"
                                tabIndex={0}
                            >
                            {flatItems.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <p>{t('quickJump.noResultsPrefix', 'No matching locations found for')} "{query}"</p>
                                    <span>{t('quickJump.searchHint', 'Try searching for "Trading", "Dashboard", "Strategy", or "Calendar"')}</span>
                                </div>
                            ) : (
                                (() => {
                                    let itemCounter = 0;
                                    return filteredSections.map((section) => (
                                        <div key={section.category} className={styles.sectionGroup}>
                                            <div className={styles.categoryHeader}>
                                                {section.category}
                                            </div>
                                            {section.items.map((item) => {
                                                const currentIndex = itemCounter++;
                                                const isSelected = selectedIndex === currentIndex;
                                                return (
                                                    <div
                                                        key={item.id}
                                                        ref={(el) => (itemRefs.current[currentIndex] = el)}
                                                        className={`${styles.itemRow} ${isSelected ? styles.itemActive : ''}`}
                                                        onClick={() => handleNavigate(item.href)}
                                                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                                                    >
                                                        <div className={styles.itemLeft}>
                                                            <div className={styles.itemIconWrap}>
                                                                {item.icon}
                                                            </div>
                                                            <div className={styles.itemInfo}>
                                                                <span className={styles.itemTitle}>{item.title}</span>
                                                                <span className={styles.itemSubtitle}>{item.subtitle}</span>
                                                            </div>
                                                        </div>
                                                        <div className={styles.itemRight}>
                                                            <span className={styles.categoryTag}>{section.category}</span>
                                                            <div className={styles.actionBadge}>
                                                                <span>{t('quickJump.jump', 'Jump')}</span>
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ));
                                })()
                            )}
                        </div>

                        {/* 4. Footer with Keyboard Hints */}
                        <div className={styles.modalFooter}>
                            <div className={styles.footerHints}>
                                <span className={styles.hintItem}>
                                    <kbd>↑</kbd><kbd>↓</kbd> {t('quickJump.navigateHint', 'Navigate')}
                                </span>
                                <span className={styles.hintItem}>
                                    <kbd>↵</kbd> {t('quickJump.openHint', 'Open')}
                                </span>
                                <span className={styles.hintItem}>
                                    <kbd>esc</kbd> {t('quickJump.closeHint', 'Close')}
                                </span>
                            </div>
                            <div className={styles.footerRight}>
                                <span className={styles.resultsCount}>
                                    {flatItems.length} {flatItems.length === 1 ? t('quickJump.item', 'item') : t('quickJump.items', 'items')}
                                </span>
                                <span className={styles.chronosXTag}>
                                    <span className={styles.pulsingDot}></span>
                                    CHRONOSX
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <>
            {/* 1. SIDEBAR TRIGGER BUTTON */}
            {!isCollapsed ? (
                <button
                    type="button"
                    className={styles.triggerBtn}
                    onClick={handleOpen}
                    title={t('quickJump.triggerShortcut', 'Quick jump (⌘K)')}
                >
                    <div className={styles.triggerLeft}>
                        <svg
                            className={styles.triggerIcon}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <span className={styles.triggerText}>{t('quickJump.trigger', 'Quick jump...')}</span>
                    </div>
                    <span className={styles.shortcutBadge}>⌘ K</span>
                </button>
            ) : (
                <button
                    type="button"
                    className={styles.collapsedTriggerBtn}
                    onClick={handleOpen}
                    aria-label={t('quickJump.triggerShortcut', 'Quick jump (⌘K)')}
                >
                    <svg
                        className={styles.triggerIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span className={styles.tooltip}>{t('quickJump.triggerShortcut', 'Quick jump (⌘K)')}</span>
                </button>
            )}

            {/* 2. COMMAND PALETTE POPUP MODAL (RENDERED VIA PORTAL TO BODY FOR PERFECT CENTERING) */}
            {mounted && typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null}
        </>
    );
}
