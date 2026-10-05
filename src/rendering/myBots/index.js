'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './myBots.module.scss';
import CommonSectionHeader from '@/components/CommonSectionHeader';
import { MyBotsIcon } from '@/icons/sidebarIcons';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from '@/components/toast';
import { getStoredUserId } from '@/lib/authSession';

import DeleteBotModal from './components/DeleteBotModal';
import StrategyDetailModal from './components/StrategyDetailModal';
import { fetchVisibleTabNames, getVisibleTabNamesSync, checkPermissionInSet } from '@/lib/useTabPermission';
import { mapStrategyToBot } from './utils/botHelpers';

const resolveBacktestApiBase = () => {
    const raw = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKTEST_API_URL || 'http://192.168.0.153:8000').replace(/\/+$/, '');
    return raw.endsWith('/backtest/v1') ? raw : `${raw}/backtest/v1`;
};

export default function MyBots() {
    const router = useRouter();
    const { t } = useLanguage();
    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedStrategyDetail, setSelectedStrategyDetail] = useState(null);
    const [botToDelete, setBotToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [visibleTabNames, setVisibleTabNames] = useState(() => getVisibleTabNamesSync());

    useEffect(() => {
        fetchVisibleTabNames().then(set => {
            if (set) setVisibleTabNames(set);
        });
    }, []);

    // Load Strategies dynamically from backend API
    const loadUserStrategies = useCallback(async () => {
        setLoading(true);
        try {
            const uid = getStoredUserId() || 'test_user';
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('access_token');
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }

            const apiBase = resolveBacktestApiBase();
            const endpoint = `${apiBase}/ai-bot-builder/${encodeURIComponent(uid)}`;
            const res = await fetch(endpoint, {
                method: 'GET',
                headers,
                cache: 'no-store'
            }).catch(() => null);

            let apiBots = [];
            if (res && res.ok) {
                const json = await res.json();
                const rawList = Array.isArray(json.data)
                    ? json.data
                    : (Array.isArray(json) ? json : (json.strategies || []));

                if (Array.isArray(rawList) && rawList.length > 0) {
                    apiBots = rawList.map((item, idx) => mapStrategyToBot(item, idx));
                }
            }

            setBots(apiBots);
        } catch (err) {
            console.warn('Could not fetch strategies from backend:', err);
            setBots([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUserStrategies();
    }, [loadUserStrategies]);

    const saveBots = (newBots) => {
        setBots(newBots);
    };

    const handleToggleBotStatus = (botId) => {
        const updated = bots.map((b) => {
            if (b.id === botId) {
                const newStatus = b.status === 'active' ? 'paused' : 'active';
                toast.success(`Bot "${b.name}" is now ${newStatus.toUpperCase()}`);
                return { ...b, status: newStatus };
            }
            return b;
        });
        saveBots(updated);
    };

    const handleConfirmDelete = async () => {
        if (!botToDelete) return;
        setIsDeleting(true);
        const { id: botId, name: botName, strategyId } = botToDelete;

        const sid = strategyId || botId;
        if (sid) {
            try {
                const apiBase = resolveBacktestApiBase();
                const headers = { 'Accept': 'application/json' };
                if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('access_token');
                    if (token) {
                        headers['Authorization'] = `Bearer ${token}`;
                    }
                }
                await fetch(`${apiBase}/user-strategies/${encodeURIComponent(sid)}`, {
                    method: 'DELETE',
                    headers
                }).catch(() => null);
            } catch (err) {
                console.warn('Backend delete error:', err);
            }
        }

        const updated = bots.filter((b) => b.id !== botId);
        saveBots(updated);
        toast.success(`Strategy "${botName}" deleted`);
        setIsDeleting(false);
        setBotToDelete(null);
    };

    const handleNavigate = (path) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('page:loading:start'));
        }
        router.push(path);
    };

    const handleSimulateEdit = (bot) => {
        try {
            if (bot?.rawStrategy) {
                sessionStorage.setItem('active_selected_strategy', JSON.stringify(bot.rawStrategy));
            }
        } catch (_) { }
        handleNavigate('/ai-bot-builder');
    };

    const handleRunBacktestBot = (bot) => {
        const stratId = bot?.strategyId || bot?.id || bot?.rawStrategy?.strategy_id || bot?.rawStrategy?.id || 'user_bot';
        const stratSymbol = bot?.symbol || (Array.isArray(bot?.rawStrategy?.stock_name) ? bot.rawStrategy.stock_name[0] : bot?.rawStrategy?.stock_name) || 'BTCUSD';
        const stratInterval = bot?.timeframe || bot?.rawStrategy?.interval || bot?.rawStrategy?.timeframe || '15min';
        const stratCapital = bot?.capital || bot?.rawStrategy?.inital_capital || bot?.rawStrategy?.initial_capital || 10000;
        const stratQuantity = bot?.lots || bot?.quantity || bot?.rawStrategy?.quantity || 0.01;
        const stratFromDate = bot?.rawStrategy?.from_date || '';
        const stratToDate = bot?.rawStrategy?.to_date || '';

        try {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('pending_backtest_run', JSON.stringify({
                    strategy_id: stratId,
                    name: bot?.name || 'Custom Bot Strategy',
                    source: 'user_strategies',
                    symbol: stratSymbol,
                    interval: stratInterval,
                    capital: stratCapital,
                    quantity: stratQuantity,
                    from_date: stratFromDate,
                    to_date: stratToDate,
                    raw_strategy: bot?.rawStrategy || bot
                }));
                window.dispatchEvent(new CustomEvent('page:loading:start'));
            }
        } catch (_) { }

        router.push(`/backtest?strategy_id=${encodeURIComponent(stratId)}&name=${encodeURIComponent(bot?.name || '')}&source=user_strategies`);
    };

    const filteredBots = bots.filter((b) => {
        const matchStatus = filterStatus === 'all' || b.status === filterStatus;
        const q = searchQuery.toLowerCase().trim();
        const matchSearch = !q ||
            (b.name && b.name.toLowerCase().includes(q)) ||
            (b.symbol && b.symbol.toLowerCase().includes(q)) ||
            (b.type && b.type.toLowerCase().includes(q)) ||
            (b.pattern && b.pattern.toLowerCase().includes(q));
        return matchStatus && matchSearch;
    });

    const hasAiBotPermission = checkPermissionInSet(visibleTabNames, 'ai bot builder');
    const hasCustomBotPermission = checkPermissionInSet(visibleTabNames, 'custom bot builder');
    const hasLibraryPermission = checkPermissionInSet(visibleTabNames, 'browse bots library');
    const isSingleCard = (hasAiBotPermission ? 1 : 0) + (hasCustomBotPermission ? 1 : 0) === 1;

    const activeCount = bots.filter((b) => b.status === 'active').length;
    const totalPnL = bots.reduce((acc, b) => {
        const numeric = parseFloat(String(b.totalPnl).replace(/[^0-9.-]+/g, '')) || 0;
        return acc + numeric;
    }, 0);

    return (
        <div className={styles.container}>
            {/* Common Section Header */}
            <CommonSectionHeader
                badge="CHRONOSX AI TRADING BOT SUITE"
                icon={<MyBotsIcon width={28} height={28} />}
                title={t('nav.myBots', 'My Trading Bots')}
                subtitle="Manage, monitor, and deploy your algorithmic trading bots with real-time performance analytics."
                rightAction={
                    <div className={styles.headerActions}>
                        <button
                            type="button"
                            className={styles.refreshBtn}
                            onClick={loadUserStrategies}
                            title="Refresh Strategies"
                            disabled={loading}
                        >
                            <svg className={loading ? styles.spinIcon : ''} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                            </svg>
                            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                        </button>
                        <button
                            type="button"
                            className={styles.createBtn}
                            onClick={() => setShowCreateModal(true)}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <span>Create New Bot</span>
                        </button>
                    </div>
                }
            />

            {/* Loading Skeleton */}
            {loading && bots.length === 0 ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.statsSkeleton}>
                        <div className={styles.skeletonBox} />
                        <div className={styles.skeletonBox} />
                        <div className={styles.skeletonBox} />
                    </div>
                    <div className={styles.botsSkeletonGrid}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className={styles.botCardSkeleton}>
                                <div className={styles.skeletonLine} style={{ width: '40%' }} />
                                <div className={styles.skeletonLine} style={{ width: '70%', height: '22px' }} />
                                <div className={styles.skeletonLine} style={{ width: '100%', height: '50px' }} />
                                <div className={styles.skeletonLine} style={{ width: '90%' }} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : bots.length === 0 ? (
                /* Empty State: Creation Cards */
                <div className={styles.emptyStateSection}>
                    <div className={styles.emptyStateHeader}>
                        <h2 className={styles.emptyTitle}>Ready to automate? Create your first trading bot.</h2>
                        <p className={styles.emptySubtitle}>
                            Get started in seconds. Choose whether you want to generate a bot automatically using AI or design custom rules step-by-step.
                        </p>
                    </div>

                    {/* Creation Cards Grid */}
                    <div className={`${styles.twoCardsGrid} ${isSingleCard ? styles.singleCardGrid : ''}`}>
                        {/* CARD 1: Generate with AI (AI Bot Builder) */}
                        {hasAiBotPermission && (
                            <div
                                className={`${styles.creationHeroCard} ${styles.aiCard}`}
                                onClick={() => handleNavigate('/ai-bot-builder')}
                            >
                                <div className={styles.botGlowOverlay} />

                                {/* 3D Illustration Graphic in Card BG on Right */}
                                <div className={styles.botIllustrationBg}>
                                    <img
                                        src="/assets/images/botai.png"
                                        alt="AI Bot Builder"
                                        className={styles.IllustrationImg}
                                    />
                                </div>

                                <div className={styles.botHeaderRow}>
                                    <div className={styles.botIconBox}>
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                                            <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
                                        </svg>
                                    </div>
                                    <h3 className={styles.botTitle}>AI Bot Builder</h3>
                                </div>

                                <div className={styles.botBody}>
                                    <p className={styles.botDescription}>
                                        Describe your trading strategy concept or archetype in plain English. ChronosX AI handles quantitative parameter formulas, indicator conditions, and backtest simulations instantly.
                                    </p>

                                    <div className={styles.featureList}>
                                        <div className={styles.botList}><span className={styles.checkIcon}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></span><span>Instant hypothesis to algorithmic rule conversion</span></div>
                                        <div className={styles.botList}><span className={styles.checkIcon}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></span><span>Multi-market MT5 simulation & metrics backtest</span></div>
                                        <div className={styles.botList}><span className={styles.checkIcon}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></span><span>Interactive AI Copilot parameter tuning</span></div>
                                    </div>
                                </div>

                                <div className={styles.botFooter}>
                                    <button type="button" className={styles.primaryActionBtn}>
                                        <span>Launch AI Bot Builder</span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* CARD 2: Custom Bot Builder */}
                        {hasCustomBotPermission && (
                            <div
                                className={`${styles.creationHeroCard} ${styles.customCard}`}
                                onClick={() => handleNavigate('/manual-bot-builder')}
                            >
                                <div className={styles.botGlowOverlay} />

                                {/* 3D Illustration Graphic in Card BG on Right */}
                                <div className={styles.botIllustrationBg}>
                                    <img
                                        src="/assets/images/botcutom.png"
                                        alt="Custom Bot Builder"
                                        className={styles.IllustrationImg}
                                    />
                                </div>

                                <div className={styles.botHeaderRow}>
                                    <div className={styles.botIconBox}>
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                                            <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                                            <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                                            <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
                                        </svg>
                                    </div>
                                    <h3 className={styles.botTitle}>Custom Bot Builder</h3>
                                </div>

                                <div className={styles.botBody}>
                                    <p className={styles.botDescription}>
                                        Assemble technical indicators (RSI, EMA, MACD, Bollinger Bands, Order Blocks), define deterministic entry/exit triggers, position sizing, and risk-reward ratios step-by-step.
                                    </p>

                                    <div className={styles.featureList}>
                                        <div className={styles.botList}><span className={styles.checkIcon}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></span><span>20+ Technical indicator trigger & filter blocks</span></div>
                                        <div className={styles.botList}><span className={styles.checkIcon}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></span><span>Dynamic Take Profit, Stop Loss & Trailing Stops</span></div>
                                        <div className={styles.botList}><span className={styles.checkIcon}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></span><span>Custom execution logic & lot size formulas</span></div>
                                    </div>
                                </div>

                                <div className={styles.botFooter}>
                                    <button type="button" className={styles.primaryActionBtn}>
                                        <span>Open Custom Bot Builder</span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Shortcut to Browse Library */}
                    {hasLibraryPermission && (
                        <div className={styles.libraryBanner}>
                            <div className={styles.libraryBannerContent}>
                                <div className={styles.bannerIconBox}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                                        <path d="M14 17.5h7M17.5 14v7" />
                                    </svg>
                                </div>
                                <div>
                                    <h4>Want ready-made institutional bots?</h4>
                                    <p>Explore verified pre-built algorithmic templates in our community library.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className={styles.libraryLinkBtn}
                                onClick={() => handleNavigate('/bot-library')}
                            >
                                <span>Browse Bots Library →</span>
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                /* Active Bots Dashboard */
                <div className={styles.dashboardSection}>
                    {/* Metrics Overview Bar */}
                    <div className={styles.statsBar}>
                        <div className={styles.statBox}>
                            <span className={styles.statLabel}>TOTAL STRATEGIES</span>
                            <span className={styles.statVal}>{bots.length}</span>
                        </div>
                        <div className={styles.statBox}>
                            <span className={styles.statLabel}>ACTIVE DEPLOYMENTS</span>
                            <span className={`${styles.statVal} ${styles.activeColor}`}>{activeCount}</span>
                        </div>
                        <div className={styles.statBox}>
                            <span className={styles.statLabel}>EST. STRATEGY PnL</span>
                            <span className={`${styles.statVal} ${totalPnL >= 0 ? styles.posColor : styles.negColor}`}>
                                {totalPnL >= 0 ? `+$${totalPnL.toFixed(2)}` : `-$${Math.abs(totalPnL).toFixed(2)}`}
                            </span>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className={styles.controlRow}>
                        <div className={styles.filterPills}>
                            <button
                                type="button"
                                className={`${styles.filterPill} ${filterStatus === 'all' ? styles.activePill : ''}`}
                                onClick={() => setFilterStatus('all')}
                            >
                                All ({bots.length})
                            </button>
                            <button
                                type="button"
                                className={`${styles.filterPill} ${filterStatus === 'active' ? styles.activePill : ''}`}
                                onClick={() => setFilterStatus('active')}
                            >
                                Active ({activeCount})
                            </button>
                            <button
                                type="button"
                                className={`${styles.filterPill} ${filterStatus === 'paused' ? styles.activePill : ''}`}
                                onClick={() => setFilterStatus('paused')}
                            >
                                Paused ({bots.length - activeCount})
                            </button>
                        </div>

                        <div className={styles.searchBox}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search strategies by name, symbol, pattern..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Bot Cards Grid or No Found State */}
                    {filteredBots.length > 0 ? (
                        <div className={styles.botsGrid}>
                            {filteredBots.map((bot) => (
                                <div key={bot.id} className={styles.botCard}>
                                    <div className={styles.botCardHeader}>
                                        <div className={styles.headerInfo}>
                                            <div className={styles.botMetaRow}>
                                                <span className={styles.symbolBadge}>{bot.symbol || 'BTCUSD'}</span>
                                                <span className={styles.timeframeBadge}>{bot.timeframe || '15m'}</span>
                                                <span className={`${styles.directionBadge} ${bot.direction?.toLowerCase() === 'short' ? styles.shortBadge : styles.longBadge}`}>
                                                    {bot.direction || 'Long'}
                                                </span>
                                                <span className={styles.typeBadge}>{bot.type || 'AI STRATEGY'}</span>
                                            </div>
                                            <h3 className={styles.botName} title={bot.name}>{bot.name}</h3>
                                            {bot.pattern && (
                                                <p className={styles.botPatternText}>{bot.pattern}</p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className={`${styles.statusToggle} ${bot.status === 'active' ? styles.statusActive : styles.statusPaused}`}
                                            onClick={() => handleToggleBotStatus(bot.id)}
                                            title="Toggle live / paused"
                                        >
                                            {bot.status === 'active' ? '● LIVE' : '○ PAUSED'}
                                        </button>
                                    </div>

                                    {bot.description && (
                                        <p className={styles.botDesc}>{bot.description}</p>
                                    )}

                                    <div className={styles.statsGrid}>
                                        <div className={`${styles.metricCardBox} ${styles.statBoxTarget}`}>
                                            <span className={styles.metricCardIcon}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <circle cx="12" cy="12" r="6" />
                                                    <circle cx="12" cy="12" r="2" />
                                                </svg>
                                            </span>
                                            <span className={styles.metricCardValue}>{bot.tp || '50 pts'}</span>
                                            <span className={styles.metricCardLabel}>Target</span>
                                        </div>

                                        <div className={`${styles.metricCardBox} ${styles.statBoxSl}`}>
                                            <span className={styles.metricCardIcon}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                                                    <polyline points="17 18 23 18 23 12" />
                                                </svg>
                                            </span>
                                            <span className={styles.metricCardValue}>{bot.sl || '25 pts'}</span>
                                            <span className={styles.metricCardLabel}>Stop Loss</span>
                                        </div>

                                        <div className={`${styles.metricCardBox} ${styles.statBoxWr}`}>
                                            <span className={styles.metricCardIcon}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                                    <polyline points="17 6 23 6 23 12" />
                                                </svg>
                                            </span>
                                            <span className={styles.metricCardValue}>{bot.winRate || '0%'}</span>
                                            <span className={styles.metricCardLabel}>Win Rate</span>
                                        </div>

                                        <div className={`${styles.metricCardBox} ${styles.statBoxPnl}`}>
                                            <span className={styles.metricCardIcon}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="18" y1="20" x2="18" y2="10" />
                                                    <line x1="12" y1="20" x2="12" y2="4" />
                                                    <line x1="6" y1="20" x2="6" y2="14" />
                                                </svg>
                                            </span>
                                            <span className={styles.metricCardValue}>{bot.totalPnl || bot.profitFactor || '1.85'}</span>
                                            <span className={styles.metricCardLabel}>Est. PnL</span>
                                        </div>
                                    </div>

                                    <div className={styles.winRateSection}>
                                        <div className={styles.winRateHeader}>
                                            <span className={styles.winRateLabel}>Win Rate</span>
                                            <span className={styles.winRatePct}>{bot.winRate || '0%'}</span>
                                        </div>
                                        <div className={styles.progressTrack}>
                                            <div
                                                className={styles.progressFill}
                                                style={{
                                                    width: `${Math.min(100, Math.max(0, parseFloat(String(bot.winRate || '0').replace(/[^0-9.]/g, '')) || 0))}%`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.botCardActions}>
                                        <button
                                            type="button"
                                            className={styles.botActionBtn}
                                            onClick={() => handleRunBacktestBot(bot)}
                                        >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                                                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                                                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                                                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                                            </svg>
                                            <span>Run Backtest</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.detailsActionBtn}
                                            onClick={() => setSelectedStrategyDetail(bot)}
                                            title="View Full Rules"
                                        >
                                            <span>Rules</span>
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.deleteAction}
                                            onClick={() => setBotToDelete(bot)}
                                            title="Delete Strategy"
                                        >
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noResultsBox}>
                            <div className={styles.noResultsIcon}>
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    <line x1="8" y1="11" x2="14" y2="11" />
                                </svg>
                            </div>
                            <h3 className={styles.noResultsTitle}>No Matching Strategies Found</h3>
                            <p className={styles.noResultsDesc}>
                                {searchQuery
                                    ? <>No trading strategies matched your search &ldquo;<strong>{searchQuery}</strong>&rdquo;{filterStatus !== 'all' ? ` in ${filterStatus} status` : ''}.</>
                                    : <>No trading strategies found with status &ldquo;<strong>{filterStatus}</strong>&rdquo;.</>
                                }
                            </p>
                            <div className={styles.noResultsActions}>
                                <button
                                    type="button"
                                    className={styles.clearSearchBtn}
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilterStatus('all');
                                    }}
                                >
                                    <span>Reset Filters & Search</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create Bot Modal Dialog */}
            {showCreateModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
                    <div className={`${styles.modalContent} ${isSingleCard ? styles.singleModalContent : ''}`} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Create New Trading Bot</h3>
                            <button type="button" className={styles.closeBtn} onClick={() => setShowCreateModal(false)} aria-label="Close">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <p className={styles.modalSub}>Select your preferred bot creation method:</p>
                        <div className={`${styles.modalCards} ${isSingleCard ? styles.singleModalCards : ''}`}>
                            {hasAiBotPermission && (
                                <div className={styles.modalCardOption} onClick={() => handleNavigate('/ai-bot-builder')}>
                                    <div className={styles.modalCardHeader}>
                                        <div className={styles.modalIconBox}>
                                            <img src="/assets/images/botai.png" alt="AI Bot" className={styles.modalIllustrationImg} />
                                        </div>
                                        <span className={styles.modalBadge}>AI Copilot</span>
                                    </div>
                                    <h4>AI Bot Builder</h4>
                                    <p>Prompt-driven algorithmic strategy builder with AI Copilot & instant MT5 simulations.</p>
                                    <div className={styles.modalCardAction}>
                                        <span>Launch AI Builder</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                            {hasCustomBotPermission && (
                                <div className={styles.modalCardOption} onClick={() => handleNavigate('/manual-bot-builder')}>
                                    <div className={styles.modalCardHeader}>
                                        <div className={styles.modalIconBox}>
                                            <img src="/assets/images/botcutom.png" alt="Custom Bot" className={styles.modalIllustrationImg} />
                                        </div>
                                        <span className={styles.modalBadge}>Visual Studio</span>
                                    </div>
                                    <h4>Custom Bot Builder</h4>
                                    <p>Visual rule & indicator configuration with complete manual parameter control.</p>
                                    <div className={styles.modalCardAction}>
                                        <span>Launch Studio</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Strategy Detail View Modal */}
            <StrategyDetailModal
                strategy={selectedStrategyDetail}
                onClose={() => setSelectedStrategyDetail(null)}
                onSimulate={handleSimulateEdit}
                onRunBacktest={handleRunBacktestBot}
            />

            {/* Custom Delete Confirmation Modal */}
            <DeleteBotModal
                isOpen={!!botToDelete}
                bot={botToDelete}
                onClose={() => setBotToDelete(null)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />
        </div>
    );
}
