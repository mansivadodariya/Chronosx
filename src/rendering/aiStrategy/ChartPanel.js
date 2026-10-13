'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts';
import styles from './aiStrategy.module.scss';
import { useTheme } from '@/context/ThemeContext';
import { parseCandleTimestamp } from '@/lib/chartStore';

import { getMsUntilNextHourOOne, formatPairCurrency, generateFallbackCandles, EyeToggleIcon } from './utils/chartHelpers';

export default function ChartPanel({ symbol, strategyId, timeframe = '1H', nearestSupport, nearestResistance, onRefreshNeeded, livePriceInfo }) {
    const containerRef = useRef(null);
    const chartRef = useRef(null);
    const { theme } = useTheme();
    const isDark = theme !== 'light';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [priceInfo, setPriceInfo] = useState(null);
    const prevPriceRef = useRef(0);
    const [tickClass, setTickClass] = useState('normal');

    // Safety Watchdog: Never let chart overlay get stuck for more than 2.5s
    useEffect(() => {
        if (loading) {
            const safetyTimer = setTimeout(() => {
                setLoading(false);
            }, 2500);
            return () => clearTimeout(safetyTimer);
        }
    }, [loading]);

    const [hoveredData, setHoveredData] = useState(null);
    const [dotPositions, setDotPositions] = useState(null);
    const [visibleIndicators, setVisibleIndicators] = useState({
        ema20: true,
        ema50: true,
        supertrend: true
    });

    const toggleIndicator = (key) => {
        setVisibleIndicators(prev => {
            const nextState = !prev[key];
            const series = chartRef.current?.series?.[key];
            if (series) {
                series.applyOptions({ visible: nextState });
            }
            return { ...prev, [key]: nextState };
        });
    };

    const chartDataRef = useRef({
        candles: [],
        ema20Map: new Map(),
        ema50Map: new Map(),
        supertrendMap: new Map()
    });

    const refreshTimeoutRef = useRef(null);

    // Fetch and populate chart data
    const fetchAndPlotData = async () => {
        if (!symbol) return;
        setLoading(true);
        setError(null);

        const cleanSymbol = symbol.replace('/', '').replace(' ', '').toUpperCase();
        const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
        const effectiveStrategyId = strategyId || '3e8d2b78-0e86-4fdf-9759-338276db1742';
        let url = `${baseUrl}/api/v1/chart/candles?symbol=${cleanSymbol}&timeframe=${timeframe}&strategy_id=${effectiveStrategyId}`;

        let candlesList = [];

        try {
            const res = await fetch(url, {
                headers: {
                    'accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (res.ok) {
                const data = await res.json();
                candlesList = Array.isArray(data?.candles) ? data.candles : [];
            }
        } catch (err) {
            console.error('Error fetching candles from API:', err);
        }

        if (candlesList.length === 0) {
            candlesList = generateFallbackCandles(cleanSymbol, timeframe);
        }

        try {
            if (!chartRef.current || !containerRef.current) {
                setLoading(false);
                return;
            }

            const chart = chartRef.current.chart;
            const series = chartRef.current.series;

            // Format candles for Lightweight Charts (AI Chat Palette: Bullish #26a69a, Bearish #ef5350)
            const candleData = [];
            const volumeData = [];
            const ema20Data = [];
            const ema50Data = [];
            const supertrendData = [];

            candlesList.forEach((c) => {
                const ts = parseCandleTimestamp(c.time || c.timestamp);

                const o = parseFloat(c.open);
                const h = parseFloat(c.high);
                const l = parseFloat(c.low);
                const cl = parseFloat(c.close);
                const vol = parseInt(c.tick_volume || 0);

                candleData.push({ time: ts, open: o, high: h, low: l, close: cl });

                volumeData.push({
                    time: ts,
                    value: vol,
                    color: cl >= o ? 'rgba(38, 166, 154, 0.35)' : 'rgba(239, 83, 80, 0.35)',
                });

                if (c.ema20 !== null && c.ema20 !== undefined) {
                    ema20Data.push({ time: ts, value: c.ema20 });
                }
                if (c.ema50 !== null && c.ema50 !== undefined) {
                    ema50Data.push({ time: ts, value: c.ema50 });
                }
                if (c.supertrend_value !== null && c.supertrend_value !== undefined) {
                    supertrendData.push({
                        time: ts,
                        value: c.supertrend_value,
                        color: c.supertrend_direction === 1 ? '#26a69a' : '#ef5350',
                    });
                }
            });

            // Set data into series
            series.candle.setData(candleData);
            series.volume.setData(volumeData);
            series.ema20.setData(ema20Data);
            series.ema50.setData(ema50Data);
            series.supertrend.setData(supertrendData);

            const ema20Map = new Map();
            const ema50Map = new Map();
            const supertrendMap = new Map();

            ema20Data.forEach(d => ema20Map.set(d.time, d.value));
            ema50Data.forEach(d => ema50Map.set(d.time, d.value));
            supertrendData.forEach(d => supertrendMap.set(d.time, d));

            chartDataRef.current = {
                candles: candleData,
                ema20Map,
                ema50Map,
                supertrendMap
            };

            if (candleData.length > 0) {
                const lastCandle = candleData[candleData.length - 1];
                const prevCandle = candleData.length > 1 ? candleData[candleData.length - 2] : lastCandle;
                const price = lastCandle.close;
                const change = price - prevCandle.close;
                const changePct = prevCandle.close > 0 ? (change / prevCandle.close) * 100 : 0;

                const t = lastCandle.time;
                const lastEma20 = ema20Map.get(t);
                const lastEma50 = ema50Map.get(t);
                const lastSupertrend = supertrendMap.get(t);

                setPriceInfo({
                    open: lastCandle.open,
                    high: lastCandle.high,
                    low: lastCandle.low,
                    close: lastCandle.close,
                    price,
                    change,
                    changePct,
                    ema20: lastEma20,
                    ema50: lastEma50,
                    supertrend: lastSupertrend?.value,
                    supertrendColor: lastSupertrend?.color
                });
            } else {
                setPriceInfo(null);
            }

            // S/R price lines
            if (chartRef.current.priceLines) {
                chartRef.current.priceLines.forEach(pl => {
                    try { series.candle.removePriceLine(pl); } catch (e) { }
                });
            }
            chartRef.current.priceLines = [];

            const numSupport = Number(nearestSupport);
            if (nearestSupport !== undefined && nearestSupport !== null && !isNaN(numSupport) && isFinite(numSupport)) {
                const sLine = series.candle.createPriceLine({
                    price: numSupport,
                    color: 'rgba(38, 166, 154, 0.8)',
                    lineWidth: 1,
                    lineStyle: 2,
                    title: `S: ${numSupport.toFixed(4)}`,
                });
                chartRef.current.priceLines.push(sLine);
            }

            const numResistance = Number(nearestResistance);
            if (nearestResistance !== undefined && nearestResistance !== null && !isNaN(numResistance) && isFinite(numResistance)) {
                const rLine = series.candle.createPriceLine({
                    price: numResistance,
                    color: 'rgba(239, 83, 80, 0.8)',
                    lineWidth: 1,
                    lineStyle: 2,
                    title: `R: ${numResistance.toFixed(4)}`,
                });
                chartRef.current.priceLines.push(rLine);
            }

            if (containerRef.current) {
                const r = containerRef.current.getBoundingClientRect();
                if (r.width > 0 && r.height > 0) {
                    chart.applyOptions({ width: r.width, height: r.height });
                }
            }

            // Set default initial zoom to zoomed out view with right offset space (matching Image 2)
            const totalBars = candleData.length;
            if (totalBars > 0) {
                const visibleBars = Math.min(totalBars, 110);
                chart.timeScale().applyOptions({
                    barSpacing: 6.5,
                    rightOffset: 20,
                });
                chart.timeScale().setVisibleLogicalRange({
                    from: totalBars - visibleBars,
                    to: totalBars + 20,
                });
            } else {
                chart.timeScale().fitContent();
            }

        } catch (err) {
            console.error('Error rendering candles:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Initialize Chart (Matching AI Chat Dark Background & Theme)
    useEffect(() => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const initialHeight = rect.height > 100 ? rect.height : (containerRef.current.clientHeight || 480);
        const initialWidth = rect.width > 100 ? rect.width : (containerRef.current.clientWidth || 600);

        const isLight = theme === 'light';
        const chart = createChart(containerRef.current, {
            width: initialWidth,
            height: initialHeight,
            layout: {
                background: { type: 'solid', color: 'transparent' },
                textColor: isLight ? '#475569' : '#94A3B8',
                fontSize: 11,
                fontFamily: "'Inter', sans-serif",
                attributionLogo: false,
            },
            grid: {
                vertLines: { color: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)' },
            },
            crosshair: {
                vertLine: { color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)', width: 1 },
                horzLine: { color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)', width: 1 },
            },
            handleScroll: {
                mouseWheel: false,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: false,
            },
            handleScale: {
                axisPressedMouseMove: {
                    time: true,
                    price: true,
                },
                axisDoubleClickReset: {
                    time: true,
                    price: true,
                },
                mouseWheel: false,
                pinch: true,
            },
            timeScale: {
                borderColor: isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.12)',
                timeVisible: true,
                secondsVisible: false,
                rightOffset: 20,
                barSpacing: 6.5,
                minBarSpacing: 2,
                rightBarStaysOnScroll: true,
            },
            rightPriceScale: {
                borderColor: isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.12)',
                scaleMargins: { top: 0.08, bottom: 0.12 },
            },
        });

        // Add series with AI Chat color palette (#26a69a / #ef5350)
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderUpColor: '#26a69a',
            borderDownColor: '#ef5350',
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        const volumeSeries = chart.addSeries(HistogramSeries, {
            priceFormat: { type: 'volume' },
            priceScaleId: 'volume',
        });
        chart.priceScale('volume').applyOptions({
            scaleMargins: { top: 0.82, bottom: 0 },
        });

        const ema20Series = chart.addSeries(LineSeries, {
            color: '#60A5FA',
            lineWidth: 1.5,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
        });

        const ema50Series = chart.addSeries(LineSeries, {
            color: '#F59E0B',
            lineWidth: 1.5,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
        });

        const supertrendSeries = chart.addSeries(LineSeries, {
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
        });

        chartRef.current = {
            chart,
            series: {
                candle: candleSeries,
                volume: volumeSeries,
                ema20: ema20Series,
                ema50: ema50Series,
                supertrend: supertrendSeries,
            },
            priceLines: [],
        };

        const handleResize = () => {
            if (containerRef.current && chartRef.current?.chart) {
                const r = containerRef.current.getBoundingClientRect();
                if (r.width > 0 && r.height > 0) {
                    chartRef.current.chart.applyOptions({ width: r.width, height: r.height });
                }
            }
        };
        window.addEventListener('resize', handleResize);

        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Crosshair move subscription
        chart.subscribeCrosshairMove((param) => {
            if (!param.time) {
                setHoveredData(null);
                setDotPositions(null);
                return;
            }

            const t = param.time;
            const data = chartDataRef.current;
            if (!data.candles || data.candles.length === 0) return;

            const idx = data.candles.findIndex(c => c.time === t);
            if (idx !== -1) {
                const hoveredCandle = data.candles[idx];
                const prevCandle = idx > 0 ? data.candles[idx - 1] : hoveredCandle;

                const open = hoveredCandle.open;
                const high = hoveredCandle.high;
                const low = hoveredCandle.low;
                const close = hoveredCandle.close;

                const change = close - prevCandle.close;
                const changePct = prevCandle.close > 0 ? (change / prevCandle.close) * 100 : 0;

                const ema20 = data.ema20Map.get(t);
                const ema50 = data.ema50Map.get(t);
                const supertrendObj = data.supertrendMap.get(t);

                setHoveredData({
                    open,
                    high,
                    low,
                    close,
                    change,
                    changePct,
                    isBullish: close >= open,
                    ema20,
                    ema50,
                    supertrend: supertrendObj?.value,
                    supertrendColor: supertrendObj?.color
                });

                const chartInstance = chartRef.current.chart;
                const seriesInstance = chartRef.current.series;
                const timeScale = chartInstance.timeScale();

                const x = timeScale.timeToCoordinate(t);
                const positions = {};
                if (x !== null) {
                    if (ema20 !== undefined && ema20 !== null) {
                        const y = seriesInstance.ema20.priceToCoordinate(ema20);
                        if (y !== null) positions.ema20 = { x, y, color: '#38bdf8' };
                    }
                    if (ema50 !== undefined && ema50 !== null) {
                        const y = seriesInstance.ema50.priceToCoordinate(ema50);
                        if (y !== null) positions.ema50 = { x, y, color: '#00E5FF' };
                    }
                    if (supertrendObj?.value !== undefined && supertrendObj?.value !== null) {
                        const y = seriesInstance.supertrend.priceToCoordinate(supertrendObj.value);
                        if (y !== null) positions.supertrend = { x, y, color: supertrendObj.color };
                    }
                }
                setDotPositions(positions);
            } else {
                setHoveredData(null);
                setDotPositions(null);
            }
        });

        const containerEl = containerRef.current;
        const handleWheelZoom = (e) => {
            const targetEl = e.target;
            if (
                targetEl &&
                (targetEl.closest('[class*="dropdown"]') ||
                    targetEl.closest('[class*="Dropdown"]') ||
                    targetEl.closest('[class*="tickerSearch"]') ||
                    targetEl.closest('[class*="tickerList"]') ||
                    targetEl.closest('[class*="modal"]') ||
                    targetEl.closest('[class*="Modal"]') ||
                    targetEl.closest('[class*="menu"]') ||
                    targetEl.closest('[class*="Menu"]') ||
                    targetEl.closest('[class*="popup"]') ||
                    targetEl.closest('[class*="settings"]') ||
                    targetEl.closest('[class*="control"]') ||
                    targetEl.closest('[class*="pill"]') ||
                    targetEl.closest('[class*="Pill"]') ||
                    targetEl.closest('input, select, textarea, button'))
            ) {
                // Allow natural scrolling inside dropdown menus, search results, and popups
                return;
            }

            if (e.cancelable) {
                e.preventDefault();
            }
            e.stopPropagation();

            if (!chartRef.current?.chart) return;
            const timeScale = chartRef.current.chart.timeScale();
            const currentSpacing = timeScale.options().barSpacing || 6.5;

            // Wheel UP (e.deltaY < 0) -> Zoom IN (increase candle width)
            // Wheel DOWN (e.deltaY > 0) -> Zoom OUT (decrease candle width)
            const zoomIn = e.deltaY < 0;
            const zoomMultiplier = zoomIn ? 1.15 : 0.87;
            const nextSpacing = Math.max(2, Math.min(80, currentSpacing * zoomMultiplier));

            timeScale.applyOptions({
                barSpacing: nextSpacing,
                rightBarStaysOnScroll: true,
            });
        };

        if (containerEl) {
            containerEl.addEventListener('wheel', handleWheelZoom, { passive: false });
        }

        fetchAndPlotData();

        return () => {
            if (containerEl) {
                containerEl.removeEventListener('wheel', handleWheelZoom);
            }
            if (resizeObserver) resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
            chart.remove();
            chartRef.current = null;
        };
    }, [symbol, timeframe, theme, isDark]);

    useEffect(() => {
        if (chartRef.current) {
            fetchAndPlotData();
        }
    }, [symbol, strategyId, timeframe, nearestSupport, nearestResistance]);

    useEffect(() => {
        const scheduleNextRefresh = () => {
            const delay = getMsUntilNextHourOOne();

            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }

            refreshTimeoutRef.current = setTimeout(() => {
                if (onRefreshNeeded) {
                    onRefreshNeeded();
                }
                scheduleNextRefresh();
            }, delay);
        };

        scheduleNextRefresh();

        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, [symbol, strategyId, timeframe, onRefreshNeeded]);

    useEffect(() => {
        prevPriceRef.current = 0;
        setTickClass('normal');
        setHoveredData(null);
        setDotPositions(null);
    }, [symbol]);

    const activePrice = (livePriceInfo && livePriceInfo.symbol === symbol) ? livePriceInfo : priceInfo;

    useEffect(() => {
        if (!activePrice) return;
        const currentPrice = activePrice.price;
        const prevPrice = prevPriceRef.current;
        if (prevPrice > 0 && currentPrice !== prevPrice) {
            setTickClass(currentPrice > prevPrice ? 'upTick' : 'downTick');
            const timer = setTimeout(() => setTickClass('normal'), 600);
            return () => clearTimeout(timer);
        }
        prevPriceRef.current = currentPrice;
    }, [activePrice]);

    const displayOpen = hoveredData ? hoveredData.open : activePrice?.open;
    const displayHigh = hoveredData ? hoveredData.high : activePrice?.high;
    const displayLow = hoveredData ? hoveredData.low : activePrice?.low;
    const displayClose = hoveredData ? hoveredData.close : (activePrice?.close || activePrice?.price);
    const displayChange = hoveredData ? hoveredData.change : activePrice?.change;
    const displayChangePct = hoveredData ? hoveredData.changePct : activePrice?.changePct;

    const isBullish = hoveredData
        ? hoveredData.isBullish
        : (displayChange !== undefined ? displayChange >= 0 : true);

    const colorClass = isBullish ? styles.itemBullish : styles.itemBearish;

    return (
        <div className={styles.chartPanel}>
            <div className={styles.chartPanelHeader}>
                <div className={styles.chartTitleArea}>
                    <h3>{symbol}</h3>
                    <span className={styles.chartTimeframeBadge}>{timeframe}</span>
                </div>

                {loading && !activePrice ? (
                    <div className={styles.chartHeaderOHLCSkeleton}>
                        <div className={`${styles.skeletonPulse} ${styles.ohlcSkelBox}`} />
                        <div className={`${styles.skeletonPulse} ${styles.ohlcSkelBox}`} />
                        <div className={`${styles.skeletonPulse} ${styles.ohlcSkelBox}`} />
                        <div className={`${styles.skeletonPulse} ${styles.ohlcSkelBox}`} />
                    </div>
                ) : activePrice ? (
                    <div className={styles.chartHeaderOHLCInfo}>
                        <div className={styles.ohlcItem}>
                            <span className={styles.ohlcLabel}>O</span>
                            <span className={`${styles.ohlcValue} ${colorClass}`}>
                                {formatPairCurrency(displayOpen, symbol)}
                            </span>
                        </div>
                        <div className={styles.ohlcItem}>
                            <span className={styles.ohlcLabel}>H</span>
                            <span className={`${styles.ohlcValue} ${colorClass}`}>
                                {formatPairCurrency(displayHigh, symbol)}
                            </span>
                        </div>
                        <div className={styles.ohlcItem}>
                            <span className={styles.ohlcLabel}>L</span>
                            <span className={`${styles.ohlcValue} ${colorClass}`}>
                                {formatPairCurrency(displayLow, symbol)}
                            </span>
                        </div>
                        <div className={styles.ohlcItem}>
                            <span className={styles.ohlcLabel}>C</span>
                            <span className={`${styles.ohlcValue} ${colorClass}`}>
                                {formatPairCurrency(displayClose, symbol)}
                            </span>
                        </div>
                        {displayChange !== undefined && displayChangePct !== undefined && (
                            <div className={styles.ohlcItem}>
                                <span className={`${styles.ohlcValue} ${colorClass}`}>
                                    {displayChange >= 0 ? '+' : ''}{formatPairCurrency(displayChange, symbol)} ({displayChange >= 0 ? '+' : ''}{displayChangePct.toFixed(2)}%)
                                </span>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            <div className={styles.chartCanvasContainer} style={{ cursor: 'crosshair' }}>
                {loading && (
                    <div className={styles.chartOverlay}>
                        <div className={styles.chartSpinner} />
                        <span>Loading chart data...</span>
                    </div>
                )}
                {error && (
                    <div className={styles.chartOverlay}>
                        <span className={styles.chartErrorText}>Error: {error}</span>
                        <button onClick={fetchAndPlotData} className={styles.chartRetryBtn}>Retry</button>
                    </div>
                )}
                <div ref={containerRef} className={styles.chartCanvas} style={{ cursor: 'crosshair' }} />

                {/* Render Indicator Dots Overlay tracking the crosshair */}
                {dotPositions && (
                    <div className={styles.chartDotsOverlay}>
                        {Object.entries(dotPositions).map(([key, pos]) => (
                            <div
                                key={key}
                                className={styles.chartIndicatorDot}
                                style={{
                                    left: `${pos.x}px`,
                                    top: `${pos.y}px`,
                                    backgroundColor: pos.color
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Custom Chart Legend with Interactive Eye Visibility Toggles */}
            <div className={styles.chartLegendContainer}>
                <div className={styles.chartLegend}>
                    <button
                        type="button"
                        className={`${styles.legendItem} ${!visibleIndicators.ema20 ? styles.legendDisabled : ''}`}
                        onClick={() => toggleIndicator('ema20')}
                        title={visibleIndicators.ema20 ? 'Hide EMA 20' : 'Show EMA 20'}
                    >
                        <span className={`${styles.legendColor} ${styles.ema20}`} />
                        <span>EMA 20</span>
                        <EyeToggleIcon visible={visibleIndicators.ema20} className={styles.eyeIcon} />
                    </button>
                    <button
                        type="button"
                        className={`${styles.legendItem} ${!visibleIndicators.ema50 ? styles.legendDisabled : ''}`}
                        onClick={() => toggleIndicator('ema50')}
                        title={visibleIndicators.ema50 ? 'Hide EMA 50' : 'Show EMA 50'}
                    >
                        <span className={`${styles.legendColor} ${styles.ema50}`} />
                        <span>EMA 50</span>
                        <EyeToggleIcon visible={visibleIndicators.ema50} className={styles.eyeIcon} />
                    </button>
                    <button
                        type="button"
                        className={`${styles.legendItem} ${!visibleIndicators.supertrend ? styles.legendDisabled : ''}`}
                        onClick={() => toggleIndicator('supertrend')}
                        title={visibleIndicators.supertrend ? 'Hide SuperTrend' : 'Show SuperTrend'}
                    >
                        <span className={`${styles.legendColor} ${styles.supertrend}`} />
                        <span>SuperTrend</span>
                        <EyeToggleIcon visible={visibleIndicators.supertrend} className={styles.eyeIcon} />
                    </button>
                </div>
            </div>
        </div>
    );
}
