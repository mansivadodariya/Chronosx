'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import styles from './aiStrategy.module.scss';
import { SearchIcon } from '@/icons/aiStrategyIcons';
import { useLanguage } from '@/context/LanguageContext';
import { unifiedSocket, cleanPairSymbol } from '@/lib/unifiedSocket';

const PAIRS = [
    "XAU/USD",
    "EUR/USD",
    "GBP/USD",
    "GBP/JPY",
    "EUR/JPY",
    "USD/CAD"
];

function getMockInitialData(pair) {
    const symUpper = pair.toUpperCase().replace("/", "").replace(" ", "");
    let basePrice = 1.16027;
    let spread = 0.00001;

    if (symUpper === "EURUSD") {
        basePrice = 1.16027;
        spread = 0.00001;
    } else if (symUpper === "GBPUSD") {
        basePrice = 1.35431;
        spread = 0.00004;
    } else if (symUpper.includes("XAU") || symUpper.includes("GOLD")) {
        basePrice = 4457.58;
        spread = 0.25;
    } else if (symUpper.includes("BTC")) {
        basePrice = 78562.99;
        spread = 5.00;
    } else if (symUpper.includes("NIFTY")) {
        basePrice = 23500.00;
        spread = 0.05;
    } else if (symUpper.endsWith("JPY")) {
        basePrice = 155.247;
        spread = 0.004;
    } else if (symUpper === "USDCAD") {
        basePrice = 1.36495;
        spread = 0.00002;
    }

    const now = Math.floor(Date.now() / 1000);
    return {
        "5m": { time: now - 120, open: basePrice, high: basePrice + spread * 2, low: basePrice - spread * 2, close: basePrice, tick_volume: 480 },
        "15m": { time: now - 340, open: basePrice, high: basePrice + spread * 4, low: basePrice - spread * 4, close: basePrice, tick_volume: 1250 },
        "1h": { time: now - 1800, open: basePrice, high: basePrice + spread * 8, low: basePrice - spread * 8, close: basePrice, tick_volume: 5240 },
        "1d": { time: now - 43200, open: basePrice, high: basePrice + spread * 20, low: basePrice - spread * 20, close: basePrice, tick_volume: 42100 }
    };
}

function getBidAskPrices(candle, symbol) {
    if (!candle || candle.close === undefined || candle.close === null) {
        return { bid: '-', ask: '-' };
    }
    const close = Number(candle.close);
    const symUpper = (symbol || '').toUpperCase().replace('/', '').replace(' ', '');
    let spread = 0.00001;
    let decimals = 5;

    if (symUpper === 'EURUSD') {
        spread = 0.00001;
        decimals = 5;
    } else if (symUpper === 'GBPUSD') {
        spread = 0.00004;
        decimals = 5;
    } else if (symUpper.endsWith('JPY')) {
        spread = 0.003;
        decimals = 3;
    } else if (symUpper.includes('XAU') || symUpper.includes('GOLD')) {
        spread = 0.25;
        decimals = 2;
    } else if (symUpper.includes('BTC')) {
        spread = 5.00;
        decimals = 2;
    } else if (symUpper.includes('NIFTY')) {
        spread = 0.05;
        decimals = 2;
    } else if (symUpper.length === 6) {
        spread = 0.00002;
        decimals = 5;
    } else {
        spread = 0.01;
        decimals = 2;
    }

    const bid = close;
    const ask = close + spread;

    return {
        bid: bid.toFixed(decimals),
        ask: ask.toFixed(decimals)
    };
}

// Separate component for watchlist list item matching image 2
const WatchlistItem = memo(({ pair, isActive, globalTimeframe, addLog, onClick, onPriceUpdate }) => {
    const [liveData, setLiveData] = useState(null);
    const [wsStatus, setWsStatus] = useState('disconnected');
    const [tickClass, setTickClass] = useState('normal');

    const lastWsTickTime = useRef(0);
    const prevPriceRef = useRef(0);

    // Initial Seed
    useEffect(() => {
        setLiveData(getMockInitialData(pair));
    }, [pair]);

    // Unified WebSocket Subscription
    useEffect(() => {
        const pairClean = cleanPairSymbol(pair);

        if (isActive) {
            unifiedSocket.switchSubscription({ symbol: pairClean, timeframe: globalTimeframe });
        }

        const unsubStatus = unifiedSocket.subscribeStatus((status) => {
            setWsStatus(status);
        });

        const unsubPrice = unifiedSocket.subscribePrice((priceObj) => {
            if (!priceObj) return;
            lastWsTickTime.current = Date.now();
            const newPrice = parseFloat(priceObj.price);
            if (!isNaN(newPrice)) {
                setLiveData((prev) => {
                    const durations = ["5m", "15m", "1h", "1d"];
                    const next = { ...(prev || getMockInitialData(pair)) };
                    durations.forEach((tf) => {
                        const oldC = next[tf] || { open: newPrice, high: newPrice, low: newPrice, close: newPrice, tick_volume: 0 };
                        next[tf] = {
                            ...oldC,
                            close: newPrice,
                            high: Math.max(oldC.high || newPrice, newPrice),
                            low: Math.min(oldC.low || newPrice, newPrice),
                            tick_volume: (oldC.tick_volume || 0) + 1
                        };
                    });
                    return next;
                });
            }
        }, pairClean);

        return () => {
            unsubPrice();
            unsubStatus();
        };
    }, [pair, isActive, globalTimeframe]);

    // Local price simulator fallback
    useEffect(() => {
        const checkAndSimulate = () => {
            const now = Date.now();
            setLiveData(prevData => {
                if (!prevData) return prevData;

                const nowSec = Math.floor(now / 1000);
                const durations = { "5m": 300, "15m": 900, "1h": 3600, "1d": 86400 };
                const nextData = { ...prevData };

                for (const tf in durations) {
                    const dur = durations[tf];
                    const candle = nextData[tf];
                    if (!candle) continue;

                    const currentCandleStart = nowSec - (nowSec % dur);
                    if (candle.time < currentCandleStart) {
                        const lastClose = candle.close;
                        nextData[tf] = {
                            ...candle,
                            time: currentCandleStart,
                            open: lastClose, high: lastClose, low: lastClose, close: lastClose,
                            tick_volume: 0
                        };
                    }
                }

                const lastTick = lastWsTickTime.current || 0;
                if (now - lastTick > 1500) {
                    const candle = nextData[globalTimeframe];
                    if (candle) {
                        const symUpper = pair.toUpperCase().replace("/", "").replace(" ", "");
                        const tickSize = symUpper.endsWith("JPY") ? 0.001 : (symUpper.includes("XAU") || symUpper.includes("GOLD")) ? 0.01 : symUpper.includes("BTC") ? 0.5 : symUpper.includes("NIFTY") ? 0.05 : 0.00001;
                        const moveTicks = Math.floor(Math.random() * 5) - 2;
                        if (moveTicks !== 0) {
                            const change = moveTicks * tickSize;
                            const newClose = Number(candle.close) + change;
                            nextData[globalTimeframe] = {
                                ...candle,
                                close: newClose,
                                high: newClose > Number(candle.high) ? newClose : Number(candle.high),
                                low: newClose < Number(candle.low) ? newClose : Number(candle.low)
                            };
                        }
                    }
                }
                return nextData;
            });
        };

        const timer = setInterval(checkAndSimulate, 1000);
        return () => clearInterval(timer);
    }, [pair, globalTimeframe]);

    // Flash animation on ticks
    const candle = liveData ? liveData[globalTimeframe] : null;
    const currentPrice = candle?.close || 0;

    useEffect(() => {
        if (!currentPrice) return;
        const prevPrice = prevPriceRef.current;
        if (prevPrice > 0 && currentPrice !== prevPrice) {
            setTickClass(currentPrice > prevPrice ? 'upTick' : 'downTick');
            const timer = setTimeout(() => setTickClass('normal'), 600);
            return () => clearTimeout(timer);
        }
        prevPriceRef.current = currentPrice;
    }, [currentPrice]);

    useEffect(() => {
        if (isActive && onPriceUpdate && candle) {
            const parsedClose = Number(candle.close);
            const parsedOpen = Number(candle.open);
            const parsedHigh = Number(candle.high);
            const parsedLow = Number(candle.low);
            onPriceUpdate({
                symbol: pair,
                price: parsedClose,
                open: parsedOpen,
                high: parsedHigh,
                low: parsedLow,
                close: parsedClose,
                change: parsedClose - parsedOpen,
                changePct: parsedOpen > 0 ? ((parsedClose - parsedOpen) / parsedOpen) * 100 : 0
            });
        }
    }, [isActive, onPriceUpdate, candle, pair]);

    const changeVal = candle ? candle.close - candle.open : 0;
    const changePct = candle && candle.open > 0 ? (changeVal / candle.open) * 100 : 0;
    const isPositive = changeVal >= 0;
    const isNegative = changeVal < 0;

    const { bid, ask } = getBidAskPrices(candle, pair);
    const isNifty = pair.includes('NIFTY');

    const pctClass = isNifty 
        ? styles.pctRef 
        : isNegative 
        ? styles.pctDown 
        : styles.pctUp;

    const priceClass = isNifty
        ? styles.priceRef
        : isNegative
        ? styles.priceDown
        : styles.priceUp;

    const rowToneClass = isNifty
        ? styles.rowNeutral
        : isNegative
        ? styles.rowBearish
        : styles.rowBullish;

    return (
        <div
            onClick={onClick}
            className={`${styles.quoteWatchlistItem} ${rowToneClass} ${isActive ? styles.quoteActiveItem : ''} ${tickClass === 'upTick' ? styles.itemUpTick : tickClass === 'downTick' ? styles.itemDownTick : ''}`}
        >
            <div className={styles.quoteItemLeft}>
                <span className={styles.quoteSymbolName}>{pair}</span>
            </div>

            <div className={styles.quoteItemRight}>
                <span className={`${styles.quotePrice} ${priceClass}`}>{bid}</span>
                <span className={`${styles.quoteChangePct} ${pctClass}`}>
                    {isNifty ? 'REF' : `${isPositive ? '+' : ''}${changePct.toFixed(2)}%`}
                </span>
            </div>
        </div>
    );
});

WatchlistItem.displayName = 'WatchlistItem';

export default function WatchlistPanel({ selectedSymbol, onSelectSymbol, globalTimeframe, addLog, activeAnalysis, onActivePriceUpdate }) {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPairs = PAIRS.filter(pair =>
        pair.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={styles.watchlistPanel}>
            {/* Watchlist Header */}
            <div className={styles.watchlistHeader}>
                <h3>{t('aiStrategy.watchlistTitle', 'Watchlist')}</h3>
            </div>

            {/* Search Box */}
            <div className={styles.watchlistSearchContainer}>
                <SearchIcon className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder={t('aiStrategy.searchPairs', 'Search pairs...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.watchlistSearchInput}
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className={styles.searchClearBtn}>×</button>
                )}
            </div>

            {/* Quote Columns Header */}
            <div className={styles.quoteColumnHeader}>
                <div className={styles.colHeaderLeft}>
                    <span>{t('aiStrategy.colSymbol', 'Symbol')}</span>
                </div>
                <div className={styles.colHeaderRight}>
                    <span className={styles.colHeaderPrice}>{t('aiStrategy.colPrice', 'Price')}</span>
                </div>
            </div>

            {/* Pairs Quote List */}
            <div className={styles.watchlistItemsList}>
                {filteredPairs.length > 0 ? (
                    filteredPairs.map(pair => {
                        const isSelected = selectedSymbol
                            ? pair.replace('/', '').replace(' ', '').toUpperCase() === selectedSymbol.replace('/', '').replace(' ', '').toUpperCase()
                            : false;

                        return (
                            <WatchlistItem
                                key={pair}
                                pair={pair}
                                isActive={isSelected}
                                globalTimeframe={globalTimeframe}
                                addLog={addLog}
                                onClick={() => onSelectSymbol(pair)}
                                onPriceUpdate={isSelected ? onActivePriceUpdate : null}
                            />
                        );
                    })
                ) : (
                    <div className={styles.noPairsFound}>No pairs match "{searchQuery}"</div>
                )}
            </div>
        </div>
    );
}
