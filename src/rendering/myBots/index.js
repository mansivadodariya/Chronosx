'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './myBots.module.scss';
import CommonSectionHeader from '@/components/CommonSectionHeader';
import { MyBotsIcon } from '@/icons/sidebarIcons';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';

export default function MyBotsView() {
    const router = useRouter();
    const { t } = useLanguage();

    const [bots, setBots] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'paused'
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [visibleTabNames, setVisibleTabNames] = useState(null);

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

    useEffect(() => {
        try {
            const saved = localStorage.getItem('chronosx_user_bots');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setBots(parsed);
                }
            }
        } catch (e) {
            console.error('Failed to load user bots:', e);
        }
    }, []);

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
                toast.success(`Bot "${b.name}" is now ${newStatus}`);
                return { ...b, status: newStatus };
            }
            return b;
        });
        saveBots(updated);
    };

    const handleDeleteBot = (botId, botName) => {
        if (confirm(`Are you sure you want to delete bot "${botName}"?`)) {
            const updated = bots.filter((b) => b.id !== botId);
            saveBots(updated);
            toast.success(`Bot "${botName}" deleted`);
        }
    };

    const handleNavigate = (path) => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('page:loading:start'));
        }
        router.push(path);
    };

    const filteredBots = bots.filter((b) => {
        const matchStatus = filterStatus === 'all' || b.status === filterStatus;
        const matchSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            b.type?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchStatus && matchSearch;
    });

    const hasAiBotPermission = visibleTabNames ? visibleTabNames.has('ai bot builder') : true;
    const hasCustomBotPermission = visibleTabNames ? visibleTabNames.has('custom bot builder') : true;
    const hasLibraryPermission = visibleTabNames ? visibleTabNames.has('browse bots library') : false;
    const isSingleCard = (hasAiBotPermission ? 1 : 0) + (hasCustomBotPermission ? 1 : 0) === 1;

    const activeCount = bots.filter((b) => b.status === 'active').length;
    const totalPnL = bots.reduce((acc, b) => acc + (parseFloat(b.totalPnl) || 0), 0);

    return (
        <div className={styles.container}>
            {/* Common Section Header */}
            <CommonSectionHeader
                badge="CHRONOSX AI TRADING BOT SUITE"
                icon={<MyBotsIcon width={28} height={28} />}
                title={t('nav.myBots', 'My Trading Bots')}
                subtitle="Manage, monitor, and deploy your algorithmic trading bots with real-time performance analytics."
                rightAction={
                    bots.length > 0 ? (
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
                    ) : null
                }
            />

            {/* Empty State: Creation Cards */}
            {bots.length === 0 ? (
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
                            <span className={styles.statLabel}>TOTAL BOTS</span>
                            <span className={styles.statVal}>{bots.length}</span>
                        </div>
                        <div className={styles.statBox}>
                            <span className={styles.statLabel}>ACTIVE BOTS</span>
                            <span className={`${styles.statVal} ${styles.activeColor}`}>{activeCount}</span>
                        </div>
                        <div className={styles.statBox}>
                            <span className={styles.statLabel}>CUMULATIVE PnL</span>
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
                                placeholder="Search by bot name or symbol..."
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
                                    <div>
                                        <div className={styles.botMetaRow}>
                                            <span className={styles.symbolBadge}>{bot.symbol || 'XAUUSD'}</span>
                                            <span className={styles.timeframeBadge}>{bot.timeframe || '15m'}</span>
                                            <span className={styles.typeBadge}>{bot.type || 'AI Generated'}</span>
                                        </div>
                                        <h3 className={styles.botName}>{bot.name}</h3>
                                    </div>
                                    <button
                                        type="button"
                                        className={`${styles.statusToggle} ${bot.status === 'active' ? styles.statusActive : styles.statusPaused}`}
                                        onClick={() => handleToggleBotStatus(bot.id)}
                                    >
                                        {bot.status === 'active' ? '● LIVE' : '○ PAUSED'}
                                    </button>
                                </div>

                                <div className={styles.botStatsRow}>
                                    <div>
                                        <span className={styles.statMiniLabel}>Win Rate</span>
                                        <span className={styles.statMiniVal}>{bot.winRate || '64.2%'}</span>
                                    </div>
                                    <div>
                                        <span className={styles.statMiniLabel}>Profit Factor</span>
                                        <span className={styles.statMiniVal}>{bot.profitFactor || '1.85'}</span>
                                    </div>
                                    <div>
                                        <span className={styles.statMiniLabel}>Net PnL</span>
                                        <span className={`${styles.statMiniVal} ${styles.posColor}`}>
                                            {bot.totalPnl || '+$1,420.00'}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.botCardActions}>
                                    <button
                                        type="button"
                                        className={styles.botActionBtn}
                                        onClick={() => handleNavigate('/ai-bot-builder')}
                                    >
                                        Simulate / Edit
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.botActionBtn} ${styles.deleteAction}`}
                                        onClick={() => handleDeleteBot(bot.id, bot.name)}
                                    >
                                        Delete
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
        </div>
    );
}
