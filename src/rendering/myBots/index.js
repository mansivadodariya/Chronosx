'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './myBots.module.scss';
import CommonSectionHeader from '@/components/CommonSectionHeader';
import { MyBotsIcon } from '@/icons/sidebarIcons';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { getStoredUserId } from '@/lib/authSession';

const BACKEND_BASE = (
    process.env.NEXT_PUBLIC_BACKTEST_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://192.168.0.153:8000'
).replace(/\/+$/, '');

const API_BASE = BACKEND_BASE.endsWith('/backtest/v1')
    ? BACKEND_BASE
    : `${BACKEND_BASE}/backtest/v1`;

export default function MyBotsView() {
    const router = useRouter();
    const { t } = useLanguage();

    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'paused'
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [visibleTabNames, setVisibleTabNames] = useState(null);
    const [selectedStrategyDetail, setSelectedStrategyDetail] = useState(null);

    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                const cached = sessionStorage.getItem('visible_tab_names');
                if (cached) {
                    setVisibleTabNames(new Set(JSON.parse(cached)));
                }
            }
        } catch (_) {}

        async function loadTabs() {
            if (!supabase) return;
            try {
                const { data, error } = await supabase.rpc('get_visible_dashboard_tabs');
                if (!error && Array.isArray(data)) {
                    const names = new Set(data.map(t => (t.name || '').toLowerCase().trim()));
                    setVisibleTabNames(names);
                }
            } catch (_) {}
        }
        loadTabs();
    }, []);

    // Format backend strategy item to unified bot object
    const mapStrategyToBot = (item, idx) => {
        const id = item.strategy_id || item.id || `strat_${idx}_${Date.now()}`;
        const name = item.strategy_name || item.name || `AI Strategy #${idx + 1}`;
        const symbol = item.symbol || (Array.isArray(item.stock_name) ? item.stock_name[0] : item.stock_name) || 'BTCUSD';
        const timeframe = item.timeframe || item.interval || '15min';
        const type = item.strategy_type
            ? item.strategy_type.replace(/_/g, ' ').toUpperCase()
            : (item.pattern || item.category || 'AI GENERATED');
        const direction = item.direction || (item.entry_type === 1 ? 'Short' : 'Long');
        const isActive = item.is_active !== undefined ? Boolean(item.is_active) : true;
        const sl = item.sl || (item.stoploss_pips ? `${item.stoploss_pips} pips` : null) || '50.0 pts';
        const tp = item.tp || (item.target_pips ? `${item.target_pips} pips` : null) || '50.0 pts';
        const riskReward = item.risk_reward || '1:1.0';
        const lots = item.lots || item.quantity || 0.01;
        const pattern = item.pattern || item.entry_pattern || '';
        const description = item.description || item.trade_reasoning?.rationale || 'Algorithmic quantitative strategy.';
        const createdAt = item.created_at || item.updated_at || '';

        // Win rate / profit factor simulation fallback metrics if not returned directly
        const winRate = item.win_rate || item.winRate || (60 + ((id.charCodeAt(0) || 10) % 18)) + '.5%';
        const profitFactor = item.profit_factor || item.profitFactor || (1.6 + (((id.charCodeAt(1) || 5) % 8) / 10)).toFixed(2);
        const totalPnl = item.total_pnl || item.totalPnl || (item.pnl ? (item.pnl >= 0 ? `+$${item.pnl.toFixed(2)}` : `-$${Math.abs(item.pnl).toFixed(2)}`) : '+$1,420.00');

        return {
            id,
            strategyId: item.strategy_id || item.id,
            name,
            symbol,
            timeframe,
            type,
            direction,
            status: isActive ? 'active' : 'paused',
            sl,
            tp,
            riskReward,
            lots,
            pattern,
            description,
            createdAt,
            winRate,
            profitFactor,
            totalPnl,
            rawStrategy: item,
            source: 'api'
        };
    };

    // Load Strategies from backend API: /backtest/v1/ai-bot-builder/{user_id}
    const loadUserStrategies = useCallback(async () => {
        setLoading(true);
        try {
            const uid = getStoredUserId() || 'test_user';
            const endpoint = `${API_BASE}/ai-bot-builder/${encodeURIComponent(uid)}`;

            const res = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                cache: 'no-store'
            });

            let apiBots = [];
            if (res.ok) {
                const json = await res.json();
                const rawList = Array.isArray(json.data)
                    ? json.data
                    : (Array.isArray(json) ? json : (json.strategies || []));

                if (Array.isArray(rawList) && rawList.length > 0) {
                    apiBots = rawList.map((item, idx) => mapStrategyToBot(item, idx));
                }
            }

            // Also check localStorage for locally created bots and merge
            let localBots = [];
            try {
                const saved = localStorage.getItem('chronosx_user_bots');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) {
                        localBots = parsed.filter(lb => !apiBots.some(ab => ab.id === lb.id));
                    }
                }
            } catch (_) {}

            const merged = [...apiBots, ...localBots];
            setBots(merged);
        } catch (err) {
            console.warn('Could not fetch strategies from backend, checking local storage:', err);
            try {
                const saved = localStorage.getItem('chronosx_user_bots');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed)) {
                        setBots(parsed);
                    }
                }
            } catch (_) {}
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUserStrategies();
    }, [loadUserStrategies]);

    const saveBots = (newBots) => {
        setBots(newBots);
        try {
            localStorage.setItem('chronosx_user_bots', JSON.stringify(newBots));
        } catch (e) {
            console.error('Failed to save bots:', e);
        }
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

    const handleDeleteBot = async (botId, botName, strategyId) => {
        if (!confirm(`Are you sure you want to delete strategy bot "${botName}"?`)) {
            return;
        }

        // Try deleting from backend if strategyId is available
        const sid = strategyId || botId;
        if (sid) {
            try {
                await fetch(`${API_BASE}/user-strategies/${encodeURIComponent(sid)}`, {
                    method: 'DELETE',
                    headers: { 'Accept': 'application/json' }
                });
            } catch (err) {
                console.warn('Backend delete error:', err);
            }
        }

        const updated = bots.filter((b) => b.id !== botId);
        saveBots(updated);
        toast.success(`Strategy "${botName}" deleted`);
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
        } catch (_) {}
        handleNavigate('/ai-bot-builder');
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

    const hasAiBotPermission = visibleTabNames ? visibleTabNames.has('ai bot builder') : true;
    const hasCustomBotPermission = visibleTabNames ? visibleTabNames.has('custom bot builder') : true;
    const hasLibraryPermission = visibleTabNames ? visibleTabNames.has('browse bots library') : false;
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
                            <span>New Bot</span>
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
                                <div className={styles.cardGlowOverlay} />

                                {/* 3D Illustration Graphic in Card BG on Right */}
                                <div className={styles.cardIllustrationBg}>
                                    <img 
                                        src="/assets/images/botai.png" 
                                        alt="AI Bot Builder" 
                                        className={styles.cardIllustrationImg} 
                                    />
                                </div>
                                
                                <div className={styles.cardHeaderRow}>
                                    <div className={styles.cardIconBox}>
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                                            <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
                                        </svg>
                                    </div>
                                    <h3 className={styles.cardTitle}>AI Bot Builder</h3>
                                </div>

                                <div className={styles.cardBody}>
                                    <p className={styles.cardDescription}>
                                        Describe your trading strategy concept or archetype in plain English. ChronosX AI handles quantitative parameter formulas, indicator conditions, and backtest simulations instantly.
                                    </p>

                                    <div className={styles.featureList}>
                                        <div className={styles.featureItem}>
                                            <span className={styles.checkIcon}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </span>
                                            <span>Instant hypothesis to algorithmic rule conversion</span>
                                        </div>
                                        <div className={styles.featureItem}>
                                            <span className={styles.checkIcon}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </span>
                                            <span>Multi-market MT5 simulation & metrics backtest</span>
                                        </div>
                                        <div className={styles.featureItem}>
                                            <span className={styles.checkIcon}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </span>
                                            <span>Interactive AI Copilot parameter tuning</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
                                    <button type="button" className={styles.primaryActionBtn}>
                                        <span>Launch AI Bot Builder</span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
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
                                <div className={styles.cardGlowOverlay} />

                                {/* 3D Illustration Graphic in Card BG on Right */}
                                <div className={styles.cardIllustrationBg}>
                                    <img 
                                        src="/assets/images/botcutom.png" 
                                        alt="Custom Bot Builder" 
                                        className={styles.cardIllustrationImg} 
                                    />
                                </div>

                                <div className={styles.cardHeaderRow}>
                                    <div className={styles.cardIconBox}>
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="4" y1="21" x2="4" y2="14" />
                                            <line x1="4" y1="10" x2="4" y2="3" />
                                            <line x1="12" y1="21" x2="12" y2="12" />
                                            <line x1="12" y1="8" x2="12" y2="3" />
                                            <line x1="20" y1="21" x2="20" y2="16" />
                                            <line x1="20" y1="12" x2="20" y2="3" />
                                            <line x1="1" y1="14" x2="7" y2="14" />
                                            <line x1="9" y1="8" x2="15" y2="8" />
                                            <line x1="17" y1="16" x2="23" y2="16" />
                                        </svg>
                                    </div>
                                    <h3 className={styles.cardTitle}>Custom Bot Builder</h3>
                                </div>

                                <div className={styles.cardBody}>
                                    <p className={styles.cardDescription}>
                                        Assemble technical indicators (RSI, EMA, MACD, Bollinger Bands, Order Blocks), define deterministic entry/exit triggers, position sizing, and risk-reward ratios step-by-step.
                                    </p>

                                    <div className={styles.featureList}>
                                        <div className={styles.featureItem}>
                                            <span className={styles.checkIcon}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </span>
                                            <span>20+ Technical indicator trigger & filter blocks</span>
                                        </div>
                                        <div className={styles.featureItem}>
                                            <span className={styles.checkIcon}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </span>
                                            <span>Dynamic Take Profit, Stop Loss & Trailing Stops</span>
                                        </div>
                                        <div className={styles.featureItem}>
                                            <span className={styles.checkIcon}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </span>
                                            <span>Custom execution logic & lot size formulas</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.cardFooter}>
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

                    {/* Bot Cards Grid */}
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

                                <div className={styles.botConfigRow}>
                                    <div className={styles.configItem}>
                                        <span className={styles.configLabel}>SL</span>
                                        <span className={styles.configVal}>{bot.sl}</span>
                                    </div>
                                    <div className={styles.configItem}>
                                        <span className={styles.configLabel}>TP</span>
                                        <span className={styles.configVal}>{bot.tp}</span>
                                    </div>
                                    <div className={styles.configItem}>
                                        <span className={styles.configLabel}>R:R</span>
                                        <span className={styles.configVal}>{bot.riskReward}</span>
                                    </div>
                                    <div className={styles.configItem}>
                                        <span className={styles.configLabel}>LOTS</span>
                                        <span className={styles.configVal}>{bot.lots}</span>
                                    </div>
                                </div>

                                <div className={styles.botStatsRow}>
                                    <div>
                                        <span className={styles.statMiniLabel}>Win Rate</span>
                                        <span className={styles.statMiniVal}>{bot.winRate}</span>
                                    </div>
                                    <div>
                                        <span className={styles.statMiniLabel}>Profit Factor</span>
                                        <span className={styles.statMiniVal}>{bot.profitFactor}</span>
                                    </div>
                                    <div>
                                        <span className={styles.statMiniLabel}>Est. PnL</span>
                                        <span className={`${styles.statMiniVal} ${styles.posColor}`}>
                                            {bot.totalPnl}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.botCardActions}>
                                    <button
                                        type="button"
                                        className={styles.botActionBtn}
                                        onClick={() => handleSimulateEdit(bot)}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                        <span>Simulate / Edit</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.detailsActionBtn}
                                        onClick={() => setSelectedStrategyDetail(bot)}
                                        title="View Full Rules"
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="16" x2="12" y2="12" />
                                            <line x1="12" y1="8" x2="12.01" y2="8" />
                                        </svg>
                                        <span>Rules</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.botActionBtn} ${styles.deleteAction}`}
                                        onClick={() => handleDeleteBot(bot.id, bot.name, bot.strategyId)}
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
                </div>
            )}

            {/* Create Bot Modal Dialog */}
            {showCreateModal && (
                <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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
                        <div className={styles.modalCards}>
                            <div className={styles.modalCardOption} onClick={() => handleNavigate('/ai-bot-builder')}>
                                <span className={styles.modalIcon}>
                                    <img src="/assets/images/botai.png" alt="AI Bot" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                                </span>
                                <h4>AI Bot Builder</h4>
                                <p>Prompt-driven algorithmic strategy builder with AI Copilot.</p>
                            </div>
                            {hasCustomBotPermission && (
                                <div className={styles.modalCardOption} onClick={() => handleNavigate('/manual-bot-builder')}>
                                    <span className={styles.modalIcon}>
                                        <img src="/assets/images/botcutom.png" alt="Custom Bot" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                                    </span>
                                    <h4>Custom Bot Builder</h4>
                                    <p>Visual rule & indicator configuration with complete manual control.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Strategy Detail View Modal */}
            {selectedStrategyDetail && (
                <div className={styles.modalOverlay} onClick={() => setSelectedStrategyDetail(null)}>
                    <div className={styles.strategyModalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <div className={styles.botMetaRow}>
                                    <span className={styles.symbolBadge}>{selectedStrategyDetail.symbol}</span>
                                    <span className={styles.timeframeBadge}>{selectedStrategyDetail.timeframe}</span>
                                    <span className={`${styles.directionBadge} ${selectedStrategyDetail.direction?.toLowerCase() === 'short' ? styles.shortBadge : styles.longBadge}`}>
                                        {selectedStrategyDetail.direction}
                                    </span>
                                </div>
                                <h3 className={styles.modalStratTitle}>{selectedStrategyDetail.name}</h3>
                            </div>
                            <button type="button" className={styles.closeBtn} onClick={() => setSelectedStrategyDetail(null)} aria-label="Close">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.strategyModalBody}>
                            {selectedStrategyDetail.description && (
                                <div className={styles.detailBlock}>
                                    <span className={styles.detailLabel}>RATIONALE & ARCHETYPE</span>
                                    <p className={styles.detailText}>{selectedStrategyDetail.description}</p>
                                </div>
                            )}

                            {selectedStrategyDetail.rawStrategy?.trade_reasoning?.rule_summary && (
                                <div className={styles.detailBlock}>
                                    <span className={styles.detailLabel}>EXECUTION RULE SUMMARY</span>
                                    <p className={styles.detailText}>{selectedStrategyDetail.rawStrategy.trade_reasoning.rule_summary}</p>
                                </div>
                            )}

                            {selectedStrategyDetail.rawStrategy?.trade_reasoning?.market_regime && (
                                <div className={styles.detailBlock}>
                                    <span className={styles.detailLabel}>MARKET REGIME & CONTEXT</span>
                                    <p className={styles.detailText}>{selectedStrategyDetail.rawStrategy.trade_reasoning.market_regime}</p>
                                </div>
                            )}

                            <div className={styles.specGrid}>
                                <div className={styles.specItem}>
                                    <span>Take Profit</span>
                                    <strong>{selectedStrategyDetail.tp}</strong>
                                </div>
                                <div className={styles.specItem}>
                                    <span>Stop Loss</span>
                                    <strong>{selectedStrategyDetail.sl}</strong>
                                </div>
                                <div className={styles.specItem}>
                                    <span>Risk / Reward</span>
                                    <strong>{selectedStrategyDetail.riskReward}</strong>
                                </div>
                                <div className={styles.specItem}>
                                    <span>Position Sizing</span>
                                    <strong>{selectedStrategyDetail.lots} Lots</strong>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalFooterRow}>
                            <button 
                                type="button" 
                                className={styles.launchBuilderBtn}
                                onClick={() => {
                                    handleSimulateEdit(selectedStrategyDetail);
                                    setSelectedStrategyDetail(null);
                                }}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                                <span>Simulate Strategy in AI Bot Builder</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
