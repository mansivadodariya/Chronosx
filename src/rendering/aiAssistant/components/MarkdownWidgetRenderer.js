'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import styles from '../aiAssistant.module.scss';
import { useTheme } from '@/context/ThemeContext';
import { getBidiProps, bidiMarkdownComponents } from '@/lib/bidi';
import { ATR } from 'technicalindicators';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const WIDGET_REGEX = /(\[WIDGET:[A-Z_]+(?::[A-Z0-9/_-]+)?\])/gi;

const normalizeAssetSymbol = (symbol = '') => String(symbol).replace('/', '').toUpperCase();

const getAssetData = (visualData, symbol) => {
    const assets = visualData?.assets || {};
    const cleanSymbol = normalizeAssetSymbol(symbol);
    return assets[cleanSymbol] || assets[symbol] || assets[symbol?.replace('/', '')];
};

// ─── Support & Resistance calculation ──────────────────────────────────────────
const LEFT = 8;
const RIGHT = 8;

const strengthStars = (score) => {
    if (typeof score === 'string') return score;
    if (score >= 8) return 'Strong';
    if (score >= 4) return 'Medium';
    return 'Weak';
};

const normalizeBackendLevels = (levels) => {
    if (!Array.isArray(levels)) return null;
    return levels.map(level => {
        if (typeof level === 'number') return { price: level, strength: 5 };
        if (level && typeof level === 'object') {
            const price = Number(level.price ?? level.value ?? level.level ?? 0);
            const strength = level.strength ?? level.touches ?? 5;
            return { price, strength };
        }
        return null;
    }).filter(Boolean);
};

const calculateSupportResistance = (candles) => {
    if (!candles?.length) return { support: [], resistance: [] };
    const highs = candles.map(c => Number(c.high));
    const lows = candles.map(c => Number(c.low));
    const closes = candles.map(c => Number(c.close));

    const atrValues = ATR.calculate({ period: 14, high: highs, low: lows, close: closes });
    const atrThreshold = atrValues.length ? atrValues[atrValues.length - 1] * 0.7 : 0.0008;

    const minMove = atrThreshold * 1.5;
    const pivotHighs = [];
    let lastPH = null;
    for (let i = LEFT; i < highs.length - RIGHT; i++) {
        const val = highs[i];
        if (lastPH !== null && Math.abs(val - lastPH) < minMove) continue;
        let ok = true;
        for (let j = i - LEFT; j <= i + RIGHT; j++) {
            if (j !== i && highs[j] >= val) { ok = false; break; }
        }
        if (ok) { pivotHighs.push({ price: val, index: i }); lastPH = val; }
    }

    const pivotLows = [];
    let lastPL = null;
    for (let i = LEFT; i < lows.length - RIGHT; i++) {
        const val = lows[i];
        if (lastPL !== null && Math.abs(val - lastPL) < minMove) continue;
        let ok = true;
        for (let j = i - LEFT; j <= i + RIGHT; j++) {
            if (j !== i && lows[j] <= val) { ok = false; break; }
        }
        if (ok) { pivotLows.push({ price: val, index: i }); lastPL = val; }
    }

    return {
        support: pivotLows.slice(-3).map(p => ({ price: p.price, strength: 6 })),
        resistance: pivotHighs.slice(-3).map(p => ({ price: p.price, strength: 6 }))
    };
};

// Seeded deterministic pseudo-random generator so mock candles NEVER change across re-renders
function pseudoRandom(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function() {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

function getSymbolSeed(symbol = 'XAUUSD') {
    let hash = 0;
    const str = String(symbol).toUpperCase();
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) || 12345;
}

// Global cache for mock candles so candles remain 100% stable across renders
const MOCK_CANDLES_CACHE = new Map();

const generateMockCandles = (symbol = 'XAUUSD', count = 40) => {
    const cleanSym = String(symbol).replace('/', '').toUpperCase();
    const cacheKey = `${cleanSym}_${count}`;
    if (MOCK_CANDLES_CACHE.has(cacheKey)) {
        return MOCK_CANDLES_CACHE.get(cacheKey);
    }

    const rand = pseudoRandom(getSymbolSeed(cleanSym));
    const base = cleanSym.includes('BTC') ? 92000 : cleanSym.includes('XAU') ? 2720 : cleanSym.includes('JPY') ? 154.5 : 1.085;
    
    // Stable reference timestamp so candle dates on X-axis do not drift or change
    const baseTime = 1726650000;
    const candles = [];
    let cur = base;

    for (let i = count; i >= 0; i--) {
        const t = baseTime - (i * 3600);
        const change = (rand() - 0.49) * (base * 0.004);
        const open = cur;
        const close = open + change;
        const high = Math.max(open, close) + rand() * (base * 0.002);
        const low = Math.min(open, close) - rand() * (base * 0.002);
        cur = close;
        candles.push({ timestamp: new Date(t * 1000).toISOString(), open, high, low, close });
    }

    MOCK_CANDLES_CACHE.set(cacheKey, candles);
    return candles;
};

// ─── 1. Candlestick Price Chart Widget ─────────────────────────────────────────
export const InlineCandlestickWidget = React.memo(function InlineCandlestickWidget({ symbol = 'XAUUSD', visualData, isDark = true }) {
    const [showSR, setShowSR] = useState(true);
    const assetData = useMemo(() => getAssetData(visualData, symbol), [visualData, symbol]);

    const rawOhlc = useMemo(() => {
        return assetData?.ohlc_data?.ohlc_1h || assetData?.candles || generateMockCandles(symbol, 40);
    }, [assetData, symbol]);

    const rawSupport = assetData?.horizontal_levels?.supports ?? assetData?.horizontal_levels?.support ?? assetData?.support;
    const rawResistance = assetData?.horizontal_levels?.resistances ?? assetData?.horizontal_levels?.resistance ?? assetData?.resistance;

    const backendSupport = useMemo(() => normalizeBackendLevels(rawSupport), [rawSupport]);
    const backendResistance = useMemo(() => normalizeBackendLevels(rawResistance), [rawResistance]);

    const supportLevels = useMemo(() => {
        return backendSupport !== null ? backendSupport : calculateSupportResistance(rawOhlc).support;
    }, [backendSupport, rawOhlc]);

    const resistanceLevels = useMemo(() => {
        return backendResistance !== null ? backendResistance : calculateSupportResistance(rawOhlc).resistance;
    }, [backendResistance, rawOhlc]);

    const series = useMemo(() => {
        const candleSeries = {
            name: 'Candles',
            type: 'candlestick',
            data: rawOhlc.map((d) => ({
                x: new Date(d.timestamp || (d.time ? d.time * 1000 : 0)),
                y: [parseFloat(d.open), parseFloat(d.high), parseFloat(d.low), parseFloat(d.close)]
            }))
        };

        const createLevelLine = ({ price, strength }, rank, type) => ({
            name: `${type === 'support' ? 'S' : 'R'}${rank + 1} ${strengthStars(strength)}`,
            type: 'line',
            data: [
                { x: new Date(rawOhlc[0]?.timestamp || (rawOhlc[0]?.time ? rawOhlc[0].time * 1000 : 0)), y: price },
                { x: new Date(rawOhlc[rawOhlc.length - 1]?.timestamp || (rawOhlc[rawOhlc.length - 1]?.time ? rawOhlc[rawOhlc.length - 1].time * 1000 : 0)), y: price }
            ]
        });

        const supportSeriesArr = supportLevels.map((z, i) => createLevelLine(z, i, 'support'));
        const resistanceSeriesArr = resistanceLevels.map((z, i) => createLevelLine(z, i, 'resistance'));

        return [candleSeries, ...(showSR ? [...supportSeriesArr, ...resistanceSeriesArr] : [])];
    }, [rawOhlc, supportLevels, resistanceLevels, showSR]);

    const options = useMemo(() => {
        const yAxisAnnotations = showSR ? [
            ...supportLevels.map(({ price, strength }) => ({
                y: price,
                borderColor: '#10b981',
                strokeDashArray: 4,
                label: {
                    borderColor: '#10b981',
                    style: { color: '#fff', background: '#10b981', fontSize: '10px' },
                    text: `S ${price.toFixed(price > 100 ? 2 : 4)}`
                }
            })),
            ...resistanceLevels.map(({ price, strength }) => ({
                y: price,
                borderColor: '#ef4444',
                strokeDashArray: 4,
                label: {
                    borderColor: '#ef4444',
                    style: { color: '#fff', background: '#ef4444', fontSize: '10px' },
                    text: `R ${price.toFixed(price > 100 ? 2 : 4)}`
                }
            }))
        ] : [];

        const seriesColors = showSR
            ? ['transparent', ...supportLevels.map(() => '#10b981'), ...resistanceLevels.map(() => '#ef4444')]
            : ['transparent'];
        const strokeWidths = showSR ? [1, ...supportLevels.map(() => 1.5), ...resistanceLevels.map(() => 1.5)] : [1];
        const dashArrays = showSR ? [0, ...supportLevels.map(() => 4), ...resistanceLevels.map(() => 4)] : [0];

        return {
            chart: {
                type: 'candlestick',
                background: 'transparent',
                toolbar: { show: true, tools: { download: false, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true } },
                animations: { enabled: false, dynamicAnimation: { enabled: false } }
            },
            title: {
                text: `${symbol} Price Action & Key Levels`,
                align: 'left',
                margin: 10,
                style: { color: '#18C98B', fontSize: '13px', fontWeight: 700 }
            },
            legend: {
                show: true,
                position: 'top',
                horizontalAlign: 'right',
                labels: { colors: isDark ? '#FFFFFF' : '#1E293B' }
            },
            theme: { mode: isDark ? 'dark' : 'light' },
            xaxis: {
                type: 'datetime',
                labels: { style: { colors: isDark ? 'rgba(255, 255, 255, 0.65)' : '#475569' } },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: {
                tooltip: { enabled: true },
                labels: {
                    style: { colors: isDark ? 'rgba(255, 255, 255, 0.65)' : '#475569' },
                    formatter: (val) => val?.toFixed(val > 100 ? 2 : 4) ?? val
                }
            },
            grid: { borderColor: isDark ? 'rgba(24, 201, 139, 0.15)' : 'rgba(226, 232, 240, 0.9)', strokeDashArray: 4 },
            annotations: { yaxis: yAxisAnnotations },
            stroke: { width: strokeWidths, curve: 'straight', dashArray: dashArrays },
            colors: seriesColors,
            plotOptions: {
                candlestick: { colors: { upward: '#10b981', downward: '#ef4444' }, wick: { useFillColor: true } }
            },
            tooltip: { theme: isDark ? 'dark' : 'light', x: { format: 'dd MMM HH:mm' } }
        };
    }, [symbol, isDark, showSR, supportLevels, resistanceLevels]);

    return (
        <div className={`${styles.inlineWidgetCard} ${styles.pdfGraphBreak} pdfGraphBreak pdfPageBreakBefore`}>
            <div className={styles.inlineWidgetHeader}>
                <span className={styles.inlineWidgetTitle}>{symbol}</span>
                <button
                    type="button"
                    className={`${styles.srToggleBtn} ${showSR ? styles.srToggleActive : ''}`}
                    onClick={() => setShowSR(v => !v)}
                >
                    S/R Levels
                </button>
            </div>
            <Chart options={options} series={series} type="candlestick" height={320} width="100%" />
        </div>
    );
});

// ─── 2. Sentiment Radar Widget ────────────────────────────────────────────────
export const InlineSentimentRadarWidget = React.memo(function InlineSentimentRadarWidget({ symbol = 'XAUUSD', visualData, isDark = true }) {
    const assetData = useMemo(() => getAssetData(visualData, symbol), [visualData, symbol]);
    const scores = useMemo(() => {
        return assetData?.sentiment_scores || assetData?.indicators?.voting_scores || assetData?.indicators?.['4H']?.voting_scores || {};
    }, [assetData]);

    const normalizeScore = (val, fallback = 70) => {
        if (typeof val === 'number') {
            if (val >= -10 && val <= 10) return (val + 10) * 5;
            return Math.min(100, Math.max(0, val));
        }
        return fallback;
    };

    const series = useMemo(() => [{
        name: 'Market Sentiment',
        data: [
            normalizeScore(scores.trend ?? scores.trend_score, 80),
            normalizeScore(scores.momentum ?? scores.momentum_score, 75),
            normalizeScore(scores.volatility ?? scores.volatility_score, 50),
            normalizeScore(scores.overall ?? scores.overall_score, 72)
        ]
    }], [scores]);

    const options = useMemo(() => ({
        chart: {
            type: 'radar',
            background: 'transparent',
            toolbar: { show: false },
            animations: { enabled: false }
        },
        theme: { mode: isDark ? 'dark' : 'light' },
        labels: ['Trend', 'Momentum', 'Volatility', 'Overall'],
        yaxis: { show: false, min: 0, max: 100 },
        fill: {
            opacity: 0.35,
            type: 'gradient',
            gradient: {
                shade: isDark ? 'dark' : 'light',
                gradientToColors: ['#10B981'],
                shadeIntensity: 1,
                stops: [0, 100]
            }
        },
        stroke: { width: 2, colors: ['#18C98B'] },
        markers: {
            size: 5,
            colors: ['#18C98B'],
            strokeWidth: 2,
            strokeColors: isDark ? '#000000' : '#FFFFFF'
        },
        plotOptions: {
            radar: {
                polygons: {
                    strokeColors: isDark ? 'rgba(24, 201, 139, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                    connectorColors: isDark ? 'rgba(24, 201, 139, 0.15)' : 'rgba(16, 185, 129, 0.15)'
                }
            }
        },
        tooltip: { theme: isDark ? 'dark' : 'light' }
    }), [isDark]);

    return (
        <div className={`${styles.inlineWidgetCard} ${styles.pdfGraphBreak} pdfGraphBreak pdfPageBreakBefore`}>
            <div className={styles.inlineWidgetHeader}>
                <span className={styles.inlineWidgetTitle}>Market Sentiment: {symbol}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Chart options={options} series={series} type="radar" height={260} width="100%" />
            </div>
        </div>
    );
});

// ─── 3. Main Widget-Aware Markdown Renderer ───────────────────────────────────
const RenderMarkdownWithWidgets = React.memo(function RenderMarkdownWithWidgets({ 
    content = '', 
    visualData = null, 
    defaultSymbol = 'XAUUSD',
    isStreaming = false,
    onComplete,
    forceLight = false
}) {
    const { theme } = useTheme();
    const isDark = forceLight ? false : (theme !== 'light');

    const words = React.useMemo(() => {
        if (!content) return [];
        return content.split(' ');
    }, [content]);

    const [revealedWordCount, setRevealedWordCount] = useState(isStreaming ? 0 : words.length);
    const [isStreamingFinished, setIsStreamingFinished] = useState(!isStreaming);

    useEffect(() => {
        if (!isStreaming) {
            setRevealedWordCount(words.length);
            setIsStreamingFinished(true);
            return;
        }

        if (words.length === 0) {
            setIsStreamingFinished(true);
            return;
        }

        setRevealedWordCount(0);
        setIsStreamingFinished(false);

        let currentIdx = 0;
        const intervalId = setInterval(() => {
            const step = words.length > 300 ? 6 : words.length > 100 ? 3 : 1;
            currentIdx = Math.min(words.length, currentIdx + step);
            setRevealedWordCount(currentIdx);

            if (currentIdx >= words.length) {
                clearInterval(intervalId);
                setIsStreamingFinished(true);
                if (onComplete) onComplete();
            }
        }, 45);

        return () => clearInterval(intervalId);
    }, [content, isStreaming, words.length, onComplete]);

    const displayContent = useMemo(() => {
        if (isStreamingFinished) return content;
        return words.slice(0, revealedWordCount).join(' ');
    }, [isStreamingFinished, content, words, revealedWordCount]);

    const parts = useMemo(() => {
        if (!displayContent) return [];
        return displayContent.split(WIDGET_REGEX);
    }, [displayContent]);

    if (!content) return null;

    return (
        <div className={styles.chatMarkdown}>
            {parts.map((part, index) => {
                const widgetMatch = part.match(/\[WIDGET:([A-Z_]+)(?::([A-Z0-9/_-]+))?\]/i);
                if (widgetMatch) {
                    const widgetType = widgetMatch[1].toUpperCase();
                    const symbol = widgetMatch[2] ? normalizeAssetSymbol(widgetMatch[2]) : normalizeAssetSymbol(defaultSymbol);

                    if (widgetType === 'SENTIMENT_RADAR') {
                        return (
                            <div key={`widget-${index}-${symbol}`} className={`${styles.pdfSection} pdfSection`} data-pdf-section="widget">
                                <InlineSentimentRadarWidget symbol={symbol} visualData={visualData} isDark={isDark} />
                            </div>
                        );
                    }
                    if (widgetType === 'CANDLESTICK') {
                        return (
                            <div key={`widget-${index}-${symbol}`} className={`${styles.pdfSection} pdfSection`} data-pdf-section="widget">
                                <InlineCandlestickWidget symbol={symbol} visualData={visualData} isDark={isDark} />
                            </div>
                        );
                    }
                }

                if (!part.trim()) return null;

                return (
                    <div key={`md-${index}`} className={`${styles.pdfSection} pdfSection`} data-pdf-section="text">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={bidiMarkdownComponents}
                        >
                            {part}
                        </ReactMarkdown>
                    </div>
                );
            })}
            {!isStreamingFinished && (
                <span className={styles.typewriterCursor} aria-hidden="true">▌</span>
            )}
        </div>
    );
});

export default RenderMarkdownWithWidgets;
