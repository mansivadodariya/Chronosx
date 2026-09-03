'use client';

import { useEffect, useRef } from 'react';
import { CandlestickSeries, LineSeries, AreaSeries, HistogramSeries } from 'lightweight-charts';
import { fetchChartCandlesOnce, subscribeLiveCandles } from '@/lib/chartStore';
import { generateMockCandles, getSymbolPrecision } from '../utils/indicatorCalculations';

export default function useChartDataLoader({
    chartRef,
    seriesRef,
    volumeSeriesRef,
    candlesDataRef,
    activeSymbolClean,
    currentTimeframe,
    chartType,
    currentChartTypeRef,
    bullishColor,
    bearishColor,
    setLoading,
    setLatestCandle,
    updateIndicators
}) {
    const wsRef = useRef(null);

    // Fallback real-time tick simulator if WS endpoint offline
    const startMockTickSimulator = (isMounted) => {
        const interval = setInterval(() => {
            if (!isMounted || !seriesRef.current) return;
            setLatestCandle((prev) => {
                if (!prev) return prev;
                const priceDelta = (Math.random() - 0.495) * (prev.close * 0.0008);
                const newClose = Number((prev.close + priceDelta).toFixed(2));
                const newHigh = Math.max(prev.high, newClose);
                const newLow = Math.min(prev.low, newClose);
                const newVol = Math.floor(Math.random() * 2000) + 500;
                const updated = {
                    ...prev,
                    high: newHigh,
                    low: newLow,
                    close: newClose,
                    value: newClose,
                };
                try {
                    seriesRef.current.update(updated);
                    if (volumeSeriesRef.current) {
                        volumeSeriesRef.current.update({
                            time: prev.time,
                            value: newVol,
                            color: newClose >= prev.open ? 'rgba(38, 166, 154, 0.7)' : 'rgba(239, 83, 80, 0.7)',
                        });
                    }
                } catch {}
                return updated;
            });
        }, 1000);
        return () => clearInterval(interval);
    };

    useEffect(() => {
        let isMounted = true;

        async function loadChartData() {
            setLoading(true);
            setLatestCandle(null);
            candlesDataRef.current = [];
            if (seriesRef.current) {
                try { seriesRef.current.setData([]); } catch {}
            }
            if (volumeSeriesRef.current) {
                try { volumeSeriesRef.current.setData([]); } catch {}
            }

            if (!chartRef.current) {
                await new Promise((r) => setTimeout(r, 60));
                if (!chartRef.current || !isMounted) {
                    if (isMounted) setLoading(false);
                    return;
                }
            }

            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }

            try {
                let rawCandles = [];
                try {
                    const json = await fetchChartCandlesOnce(activeSymbolClean, currentTimeframe);
                    rawCandles = json.candles || json.data || json || [];
                } catch (err) {
                    console.warn('REST candles fetch notice:', err.message);
                }

                if (!Array.isArray(rawCandles) || rawCandles.length === 0) {
                    const baseVal = activeSymbolClean.includes('XAU')
                        ? 2720
                        : activeSymbolClean.includes('BTC')
                        ? 92000
                        : 1.085;
                    rawCandles = generateMockCandles(600, baseVal, currentTimeframe, activeSymbolClean);
                }

                const formattedCandles = rawCandles
                    .map((c) => {
                        let timeVal = c.time || c.timestamp;
                        if (typeof timeVal === 'string') {
                            if (timeVal.includes('T')) {
                                timeVal = Math.floor(new Date(timeVal).getTime() / 1000);
                            } else if (!isNaN(Number(timeVal))) {
                                timeVal = Number(timeVal);
                            } else {
                                timeVal = Math.floor(new Date(timeVal).getTime() / 1000);
                            }
                        } else {
                            timeVal = Number(timeVal);
                        }

                        const openPrice = parseFloat(c.open);
                        const highPrice = parseFloat(c.high);
                        const lowPrice = parseFloat(c.low);
                        const closePrice = parseFloat(c.close);
                        const volumeVal = parseFloat(c.volume || c.tick_volume || c.vol || 0);

                        return {
                            time: timeVal,
                            open: openPrice,
                            high: highPrice,
                            low: lowPrice,
                            close: closePrice,
                            value: closePrice,
                            volume: volumeVal,
                            volumeColor: closePrice >= openPrice ? 'rgba(38, 166, 154, 0.7)' : 'rgba(239, 83, 80, 0.7)',
                        };
                    })
                    .filter((c) => !isNaN(c.time) && !isNaN(c.close));

                formattedCandles.sort((a, b) => a.time - b.time);
                candlesDataRef.current = formattedCandles;

                if (!isMounted || !chartRef.current) {
                    if (isMounted) setLoading(false);
                    return;
                }

                if (!volumeSeriesRef.current) {
                    const volumeSeries = chartRef.current.addSeries(HistogramSeries, {
                        priceFormat: { type: 'volume' },
                        priceScaleId: 'volume',
                    });
                    chartRef.current.priceScale('volume').applyOptions({
                        scaleMargins: {
                            top: 0.8,
                            bottom: 0,
                        },
                    });
                    volumeSeriesRef.current = volumeSeries;
                }

                if (!seriesRef.current || currentChartTypeRef.current !== chartType) {
                    if (seriesRef.current) {
                        try { chartRef.current.removeSeries(seriesRef.current); } catch {}
                    }
                    if (chartType === 'line') {
                        seriesRef.current = chartRef.current.addSeries(LineSeries, {
                            color: '#18C98B',
                            lineWidth: 2,
                        });
                    } else if (chartType === 'area') {
                        seriesRef.current = chartRef.current.addSeries(AreaSeries, {
                            topColor: 'rgba(24, 201, 139, 0.46)',
                            bottomColor: 'rgba(24, 201, 139, 0.0)',
                            lineColor: '#18C98B',
                            lineWidth: 2,
                        });
                    } else {
                        seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
                            upColor: bullishColor,
                            borderUpColor: bullishColor,
                            wickUpColor: bullishColor,
                            downColor: bearishColor,
                            borderDownColor: bearishColor,
                            wickDownColor: bearishColor,
                        });
                    }
                    currentChartTypeRef.current = chartType;
                }

                const { precision, minMove } = getSymbolPrecision(activeSymbolClean);
                seriesRef.current.applyOptions({
                    priceFormat: {
                        type: 'price',
                        precision: precision,
                        minMove: minMove,
                    },
                });

                seriesRef.current.setData(formattedCandles);
                try {
                    chartRef.current.timeScale().fitContent();
                } catch {}
                if (isMounted) setLoading(false);

                if (volumeSeriesRef.current) {
                    try {
                        volumeSeriesRef.current.setData(
                            formattedCandles.map((c) => ({
                                time: c.time,
                                value: c.volume || Math.floor(Math.random() * 2500) + 400,
                                color: c.volumeColor,
                            }))
                        );
                    } catch (e) {
                        console.warn('Volume series non-critical notice:', e);
                    }
                }
                if (updateIndicators) {
                    try {
                        updateIndicators(formattedCandles);
                    } catch (e) {
                        console.warn('Indicator update non-critical notice:', e);
                    }
                }
                const last = formattedCandles[formattedCandles.length - 1];
                if (last) setLatestCandle(last);
                try {
                    chartRef.current.timeScale().applyOptions({
                        barSpacing: 9,
                        rightOffset: 8,
                    });
                    chartRef.current.timeScale().scrollToRealtime();
                } catch (e) {}
            } catch (err) {
                console.error('Error rendering chart data:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }

            let unsubscribeWS = null;
            let mockCleanup = null;
            try {
                unsubscribeWS = subscribeLiveCandles(activeSymbolClean, currentTimeframe, (bar) => {
                    if (!isMounted) return;
                    setLoading(false);
                    let timeVal = bar.time || bar.timestamp;
                    if (typeof timeVal === 'string') {
                        if (timeVal.includes('T')) {
                            timeVal = Math.floor(new Date(timeVal).getTime() / 1000);
                        } else if (!isNaN(Number(timeVal))) {
                            timeVal = Number(timeVal);
                        } else {
                            timeVal = Math.floor(new Date(timeVal).getTime() / 1000);
                        }
                    } else {
                        timeVal = Number(timeVal);
                    }

                    const openPrice = parseFloat(bar.open);
                    const closePrice = parseFloat(bar.close);
                    const volumeVal = parseFloat(bar.volume || bar.tick_volume || bar.vol || 0);

                    const updatedBar = {
                        time: timeVal,
                        open: openPrice,
                        high: parseFloat(bar.high),
                        low: parseFloat(bar.low),
                        close: closePrice,
                        value: closePrice,
                    };

                    if (seriesRef.current) {
                        seriesRef.current.update(updatedBar);
                    }
                    if (volumeSeriesRef.current) {
                        volumeSeriesRef.current.update({
                            time: timeVal,
                            value: volumeVal || Math.floor(Math.random() * 2000) + 500,
                            color: closePrice >= openPrice ? 'rgba(38, 166, 154, 0.7)' : 'rgba(239, 83, 80, 0.7)',
                        });
                    }
                    setLatestCandle(updatedBar);
                });
            } catch {
                if (isMounted) setLoading(false);
                mockCleanup = startMockTickSimulator(isMounted);
            }

            return () => {
                if (unsubscribeWS) unsubscribeWS();
                if (mockCleanup) mockCleanup();
            };
        }

        loadChartData();

        return () => {
            isMounted = false;
        };
    }, [activeSymbolClean, currentTimeframe, chartType]);
}
