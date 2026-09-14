'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { getWsCandidateUrls, cleanPairSymbol } from '@/lib/unifiedSocket';
import InstrumentIcon from './InstrumentIcon';
import styles from '../dashboard.module.scss';

export const DEFAULT_MARKET_OVERVIEW_ITEMS = [
    // Popular
    {
        symbol: 'EURUSD',
        pair_name: 'EUR/USD',
        display_name: 'Euro / U.S. Dollar',
        price: 1.08245,
        change_24h: 0.45,
        change_24h_display: '+0.45%',
        trend: [1.0810, 1.0813, 1.0818, 1.0821, 1.0819, 1.0823, 1.08245],
        category: 'Forex',
        is_popular: true,
        icon: '🇪🇺🇺🇸'
    },
    {
        symbol: 'GBPUSD',
        pair_name: 'GBP/USD',
        display_name: 'British Pound / U.S. Dollar',
        price: 1.29570,
        change_24h: -0.23,
        change_24h_display: '-0.23%',
        trend: [1.2990, 1.2982, 1.2974, 1.2965, 1.2968, 1.2960, 1.29570],
        category: 'Forex',
        is_popular: true,
        icon: '🇬🇧🇺🇸'
    },
    {
        symbol: 'XAUUSD',
        pair_name: 'XAU/USD',
        display_name: 'Gold / U.S. Dollar',
        price: 2329.65,
        change_24h: 0.85,
        change_24h_display: '+0.85%',
        trend: [2315.0, 2318.5, 2322.0, 2326.4, 2324.2, 2327.9, 2329.65],
        category: 'Commodities',
        is_popular: true,
        icon: '🥇'
    },
    {
        symbol: 'USDJPY',
        pair_name: 'USD/JPY',
        display_name: 'U.S. Dollar / Japanese Yen',
        price: 155.673,
        change_24h: 0.12,
        change_24h_display: '+0.12%',
        trend: [155.20, 155.35, 155.48, 155.40, 155.55, 155.62, 155.673],
        category: 'Forex',
        is_popular: true,
        icon: '🇺🇸🇯🇵'
    },
    {
        symbol: 'BTCUSD',
        pair_name: 'BTC/USD',
        display_name: 'Bitcoin / U.S. Dollar',
        price: 66542.21,
        change_24h: -1.34,
        change_24h_display: '-1.34%',
        trend: [67400.0, 67250.0, 67000.0, 66850.0, 66720.0, 66600.0, 66542.21],
        category: 'Crypto',
        is_popular: true,
        icon: '₿'
    },

    // Forex Extended
    {
        symbol: 'AUDUSD',
        pair_name: 'AUD/USD',
        display_name: 'Australian Dollar / U.S. Dollar',
        price: 0.65420,
        change_24h: 0.31,
        change_24h_display: '+0.31%',
        trend: [0.6510, 0.6520, 0.6532, 0.6528, 0.6536, 0.6540, 0.65420],
        category: 'Forex',
        is_popular: false,
        icon: '🇦🇺🇺🇸'
    },
    {
        symbol: 'USDCAD',
        pair_name: 'USD/CAD',
        display_name: 'U.S. Dollar / Canadian Dollar',
        price: 1.38120,
        change_24h: -0.18,
        change_24h_display: '-0.18%',
        trend: [1.3850, 1.3842, 1.3835, 1.3828, 1.3822, 1.3815, 1.38120],
        category: 'Forex',
        is_popular: false,
        icon: '🇺🇸🇨🇦'
    },
    {
        symbol: 'USDCHF',
        pair_name: 'USD/CHF',
        display_name: 'U.S. Dollar / Swiss Franc',
        price: 0.88450,
        change_24h: 0.05,
        change_24h_display: '+0.05%',
        trend: [0.8835, 0.8838, 0.8841, 0.8839, 0.8843, 0.8844, 0.88450],
        category: 'Forex',
        is_popular: false,
        icon: '🇺🇸🇨🇭'
    },

    // Crypto Extended
    {
        symbol: 'ETHUSD',
        pair_name: 'ETH/USD',
        display_name: 'Ethereum / U.S. Dollar',
        price: 3485.50,
        change_24h: 2.15,
        change_24h_display: '+2.15%',
        trend: [3410.0, 3425.0, 3445.0, 3460.0, 3452.0, 3470.0, 3485.50],
        category: 'Crypto',
        is_popular: false,
        icon: '⟠'
    },
    {
        symbol: 'SOLUSD',
        pair_name: 'SOL/USD',
        display_name: 'Solana / U.S. Dollar',
        price: 158.40,
        change_24h: 4.82,
        change_24h_display: '+4.82%',
        trend: [150.2, 152.0, 154.5, 153.8, 156.2, 157.5, 158.40],
        category: 'Crypto',
        is_popular: false,
        icon: '◎'
    },
    {
        symbol: 'BNBUSD',
        pair_name: 'BNB/USD',
        display_name: 'BNB / U.S. Dollar',
        price: 584.20,
        change_24h: 0.76,
        change_24h_display: '+0.76%',
        trend: [578.0, 579.5, 581.0, 582.5, 581.8, 583.4, 584.20],
        category: 'Crypto',
        is_popular: false,
        icon: '🔶'
    },

    // Commodities Extended
    {
        symbol: 'XAGUSD',
        pair_name: 'XAG/USD',
        display_name: 'Silver / U.S. Dollar',
        price: 29.85,
        change_24h: 1.42,
        change_24h_display: '+1.42%',
        trend: [29.20, 29.35, 29.50, 29.62, 29.55, 29.74, 29.85],
        category: 'Commodities',
        is_popular: false,
        icon: '🥈'
    }
];

function MiniSparkline({ data = [], isPositive = true }) {
    if (!Array.isArray(data) || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 84;
    const height = 26;
    const padding = 2;

    const points = data
        .map((val, idx) => {
            const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
            const y = height - padding - ((val - min) / range) * (height - padding * 2);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');

    const strokeColor = isPositive ? '#10B981' : '#F43F5E';

    return (
        <svg width={width} height={height} className={styles.overviewSparklineSvg} viewBox={`0 0 ${width} ${height}`}>
            <polyline
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    );
}

function formatPrice(val) {
    const num = Number(val);
    if (isNaN(num)) return '—';
    if (num >= 1000) {
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (num >= 10) {
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 });
    }
    return num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 5 });
}

export default function DashboardMarketOverview({ initialItems = [], userId = '' }) {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('Popular');
    const [items, setItems] = useState(() => {
        if (Array.isArray(initialItems) && initialItems.length > 0) {
            const disallowed = ['USOIL', 'UKOIL', 'US30', 'US500', 'SPX500', 'USTEC', 'NAS100', 'GER40'];
            return initialItems.filter(i => !disallowed.includes(cleanPairSymbol(i.symbol)) && (i.category || '').toLowerCase() !== 'indices');
        }
        return DEFAULT_MARKET_OVERVIEW_ITEMS;
    });

    const [priceFlashMap, setPriceFlashMap] = useState({});
    const wsRef = useRef(null);
    const flashTimersRef = useRef({});

    // Sync if initialItems updates from stats API
    useEffect(() => {
        if (Array.isArray(initialItems) && initialItems.length > 0) {
            setItems((prev) => {
                const map = new Map(initialItems.map(i => [cleanPairSymbol(i.symbol), i]));
                return prev.map(p => map.get(cleanPairSymbol(p.symbol)) || p);
            });
        }
    }, [initialItems]);

    // WebSocket Live Updates Connection
    useEffect(() => {
        let isMounted = true;
        const candidates = getWsCandidateUrls('XAUUSD', 'H1', 'default');
        let currentCandidateIdx = 0;

        const connectSocket = () => {
            if (!isMounted) return;
            const wsUrl = candidates[currentCandidateIdx % candidates.length];

            try {
                const ws = new WebSocket(wsUrl);
                wsRef.current = ws;

                ws.onopen = () => {
                    if (!isMounted) return;
                    try {
                        ws.send(JSON.stringify({ action: 'get_market_overview' }));
                    } catch (_) {}
                };

                ws.onmessage = (event) => {
                    if (!isMounted) return;
                    try {
                        const payload = JSON.parse(event.data);

                        // 1. Bulk market overview update
                        if (payload.type === 'market_overview_update' && (payload.data?.all || Array.isArray(payload.data))) {
                            const newOverview = payload.data.all || payload.data;
                            if (Array.isArray(newOverview) && newOverview.length > 0) {
                                setItems((prev) => {
                                    const updateMap = new Map(newOverview.map(item => [cleanPairSymbol(item.symbol), item]));
                                    return prev.map(oldItem => {
                                        const found = updateMap.get(cleanPairSymbol(oldItem.symbol));
                                        if (found) {
                                            return {
                                                ...oldItem,
                                                ...found,
                                                trend: found.trend || found.sparkline || oldItem.trend
                                            };
                                        }
                                        return oldItem;
                                    });
                                });
                            }
                        }

                        // 2. Individual live price ticks
                        if (payload.type === 'price_update' && payload.symbol) {
                            const symClean = cleanPairSymbol(payload.symbol);
                            const newPrice = Number(payload.price);
                            if (!isNaN(newPrice)) {
                                setItems((prev) =>
                                    prev.map((item) => {
                                        if (cleanPairSymbol(item.symbol) === symClean) {
                                            const oldPrice = item.price;
                                            const flashDir = newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : null;

                                            if (flashDir) {
                                                setPriceFlashMap(m => ({ ...m, [symClean]: flashDir }));
                                                if (flashTimersRef.current[symClean]) clearTimeout(flashTimersRef.current[symClean]);
                                                flashTimersRef.current[symClean] = setTimeout(() => {
                                                    setPriceFlashMap(m => ({ ...m, [symClean]: null }));
                                                }, 700);
                                            }

                                            const changeNum = payload.change_percent ?? payload.change_24h ?? item.change_24h;
                                            const changeDisplay = changeNum !== undefined
                                                ? (changeNum >= 0 ? `+${changeNum.toFixed(2)}%` : `${changeNum.toFixed(2)}%`)
                                                : item.change_24h_display;

                                            const updatedTrend = Array.isArray(item.trend)
                                                ? [...item.trend.slice(1), newPrice]
                                                : [newPrice];

                                            return {
                                                ...item,
                                                price: newPrice,
                                                change_24h: typeof changeNum === 'number' ? changeNum : item.change_24h,
                                                change_24h_display: changeDisplay,
                                                trend: updatedTrend
                                            };
                                        }
                                        return item;
                                    })
                                );
                            }
                        }
                    } catch (err) {
                        // ignore JSON parse errors
                    }
                };

                ws.onerror = () => {
                    try { ws.close(); } catch (_) {}
                };

                ws.onclose = () => {
                    if (!isMounted) return;
                    currentCandidateIdx++;
                    setTimeout(connectSocket, 4000);
                };
            } catch (e) {
                if (isMounted) {
                    currentCandidateIdx++;
                    setTimeout(connectSocket, 4000);
                }
            }
        };

        connectSocket();

        return () => {
            isMounted = false;
            if (wsRef.current) {
                try { wsRef.current.close(); } catch (_) {}
            }
            Object.values(flashTimersRef.current).forEach(t => clearTimeout(t));
        };
    }, []);

    // Filter items based on active tab
    const filteredItems = useMemo(() => {
        if (activeTab === 'Popular') {
            return items.filter(i => i.is_popular);
        }
        return items.filter(i => (i.category || '').toLowerCase() === activeTab.toLowerCase());
    }, [items, activeTab]);

    const categories = ['Popular', 'Forex', 'Crypto', 'Commodities'];

    return (
        <div className={styles.marketOverviewCard}>
            {/* 1. Header Row */}
            <div className={styles.overviewHeader}>
                <div className={styles.overviewTitleWrap}>
                    <div className={styles.overviewIconPulse}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18C98B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                    </div>
                    <div className={styles.overviewTitleText}>
                        <h3>{t('dashboard.marketOverviewTitle', 'Market Overview')}</h3>
                        <span className={styles.liveStreamBadge}>{t('dashboard.liveStream', 'LIVE STREAM')}</span>
                    </div>
                </div>

                {/* 2. Category Filter Tabs */}
                <div className={styles.overviewTabsRow}>
                    {categories.map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`${styles.overviewTabBtn} ${activeTab === tab ? styles.overviewTabActive : ''}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Instruments Table */}
            <div className={styles.overviewTableWrapper}>
                <div className={styles.overviewTableHeader}>
                    <div className={styles.colInstrument}>Instrument</div>
                    <div className={styles.colPrice}>Price</div>
                    <div className={styles.colTrend}>Sparkline Trend</div>
                    <div className={styles.colChange}>24h Change</div>
                </div>

                <div className={styles.overviewTableBody}>
                    {filteredItems.map((item) => {
                        const isPositive = (item.change_24h ?? 0) >= 0;
                        const symClean = cleanPairSymbol(item.symbol);
                        const flashState = priceFlashMap[symClean];

                        return (
                            <Link
                                href="/signal-terminal"
                                key={item.symbol}
                                className={`${styles.overviewRow} ${flashState === 'up' ? styles.flashUp : flashState === 'down' ? styles.flashDown : ''}`}
                            >
                                {/* Instrument info */}
                                <div className={styles.colInstrument}>
                                    <InstrumentIcon symbol={item.symbol} />
                                    <div className={styles.instrumentMeta}>
                                        <span className={styles.instrumentPair}>{item.pair_name || item.symbol}</span>
                                        <span className={styles.instrumentDisplay}>{item.display_name}</span>
                                    </div>
                                </div>

                                {/* Live Price */}
                                <div className={`${styles.colPrice} ${flashState === 'up' ? styles.priceUp : flashState === 'down' ? styles.priceDown : ''}`}>
                                    {formatPrice(item.price)}
                                </div>

                                {/* Sparkline */}
                                <div className={styles.colTrend}>
                                    <MiniSparkline data={item.trend} isPositive={isPositive} />
                                </div>

                                {/* 24h Change */}
                                <div className={styles.colChange}>
                                    <span className={`${styles.changePill} ${isPositive ? styles.pillPositive : styles.pillNegative}`}>
                                        {item.change_24h_display || (isPositive ? `+${(item.change_24h || 0).toFixed(2)}%` : `${(item.change_24h || 0).toFixed(2)}%`)}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* 4. Footer Link */}
            <div className={styles.overviewFooter}>
                <Link href="/signal-terminal" className={styles.viewAllMarketsLink}>
                    <span>{t('dashboard.viewAllMarkets', 'View All Markets')}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}
