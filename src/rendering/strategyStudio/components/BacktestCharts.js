'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from '../styles/strategyStudio.module.scss';
import { useTheme } from '@/context/ThemeContext';
import { AreaChartIcon, PieChartIcon } from './StudioIcons';
import ChartSkeletonLoader from './ChartSkeletonLoader';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
    loading: () => <ChartSkeletonLoader type="area" />
});

const formatShortDate = (dateStr) => {
    if (!dateStr || dateStr === 'Start') return 'Start';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) {
            // If date string is like "2026-08-04", try manual parse
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthIdx = parseInt(parts[1], 10) - 1;
                return `${months[monthIdx] || parts[1]} ${parseInt(parts[2], 10)}`;
            }
            return dateStr;
        }
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
        return dateStr;
    }
};

export default function BacktestCharts({
    results = null,
    roundTrips = [],
    initialCapital = 10000,
    wins = 0,
    losses = 0,
    totalPnL = 0,
    totalTrades = 0
}) {
    const { theme } = useTheme();
    const isDark = theme !== 'light';
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Equity Curve Data (Optimized for instant loading)
    const equityData = useMemo(() => {
        const safeTrips = Array.isArray(roundTrips) ? roundTrips : [];
        if (safeTrips.length > 0) {
            const rawPoints = [{ date: 'Start', balance: initialCapital }, ...safeTrips.map(t => ({
                date: t.exitDate ? t.exitDate.split(' ')[0] : `T${t.index}`,
                balance: Number(t.runningBalance) || initialCapital
            }))];

            // Downsample if over 150 points for instant 60 FPS rendering
            const maxPoints = 120;
            let sampled = rawPoints;
            if (rawPoints.length > maxPoints) {
                const step = Math.ceil(rawPoints.length / maxPoints);
                sampled = rawPoints.filter((_, idx) => idx === 0 || idx === rawPoints.length - 1 || idx % step === 0);
            }

            const rawDates = sampled.map(p => p.date);
            const formattedLabels = rawDates.map(d => formatShortDate(d));
            const balances = sampled.map(p => p.balance);

            return { rawDates, labels: formattedLabels, balances };
        }

        // When no individual round-trip array but real backend results with plot / PnL exist
        const rawCandles = results?.candles || results?.plot || results?.stats?.plot || [];
        const finalPnl = Number(totalPnL || results?.pnl || results?.stats?.pnl || 0);
        const finalBalance = parseFloat((initialCapital + finalPnl).toFixed(2));

        if (Array.isArray(rawCandles) && rawCandles.length > 1) {
            const step = Math.ceil(rawCandles.length / 30);
            const sampledCandles = rawCandles.filter((_, idx) => idx === 0 || idx === rawCandles.length - 1 || idx % step === 0);
            const n = sampledCandles.length;
            const rawDates = sampledCandles.map(c => (c.time || c.Date || c.date || '').split(' ')[0]);
            const formattedLabels = rawDates.map(d => formatShortDate(d));
            const balances = sampledCandles.map((_, idx) => {
                const progress = idx / (n - 1);
                return parseFloat((initialCapital + finalPnl * progress).toFixed(2));
            });
            return { rawDates, labels: formattedLabels, balances };
        }

        return {
            rawDates: ['Start', 'End'],
            labels: ['Start', 'Current'],
            balances: [initialCapital, finalBalance]
        };
    }, [roundTrips, initialCapital, results, totalPnL]);

    const isProfitable = equityData.balances[equityData.balances.length - 1] >= initialCapital;
    const primaryColor = isProfitable ? '#18C98B' : '#F43F5E';

    const equityChartOptions = {
        chart: {
            type: 'area',
            height: 240,
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 350, dynamicAnimation: { enabled: false } }
        },
        stroke: {
            curve: 'smooth',
            width: 2.5,
            colors: [primaryColor]
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.35,
                opacityTo: 0.02,
                stops: [0, 95, 100],
                colorStops: [
                    { offset: 0, color: primaryColor, opacity: 0.38 },
                    { offset: 100, color: primaryColor, opacity: 0.0 }
                ]
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: equityData.labels,
            tickAmount: 6,
            labels: {
                style: { colors: isDark ? '#94A3B8' : '#64748B', fontSize: '10px', fontWeight: 500 },
                rotate: 0,
                hideOverlappingLabels: true,
                maxHeight: 32
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                style: { colors: isDark ? '#94A3B8' : '#64748B', fontSize: '10px', fontWeight: 500 },
                formatter: (val) => `$${Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            }
        },
        grid: {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            strokeDashArray: 3
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
            x: {
                formatter: (val, opts) => {
                    const raw = equityData.rawDates[opts?.dataPointIndex];
                    return raw ? `Date: ${raw}` : `Point: ${val}`;
                }
            },
            y: {
                formatter: (val) => `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }
        }
    };

    const equitySeries = [
        {
            name: 'Portfolio Balance',
            data: equityData.balances
        }
    ];

    // Outcome Doughnut Chart Data
    const displayTotalTrades = totalTrades || (wins + losses) || (Array.isArray(roundTrips) ? roundTrips.length : 0);
    const winPercent = displayTotalTrades > 0 ? ((wins / displayTotalTrades) * 100).toFixed(1) : '0';

    const outcomeChartOptions = {
        chart: {
            type: 'donut',
            height: 250,
            background: 'transparent',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 600,
                animateGradually: { enabled: true, delay: 150 },
                dynamicAnimation: { enabled: true, speed: 350 }
            }
        },
        labels: ['Winning Trades', 'Losing Trades'],
        colors: ['#18C98B', '#FF4D6D'],
        stroke: {
            show: false,
            width: 0
        },
        dataLabels: { enabled: false },
        plotOptions: {
            pie: {
                expandOnClick: false,
                donut: {
                    size: '72%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '11px',
                            fontWeight: 600,
                            color: isDark ? '#94A3B8' : '#64748B',
                            offsetY: -6
                        },
                        value: {
                            show: true,
                            fontSize: '26px',
                            fontWeight: 800,
                            color: isDark ? '#FFFFFF' : '#0F172A',
                            offsetY: 2,
                            formatter: (val) => val
                        },
                        total: {
                            show: true,
                            label: 'TOTAL TRADES',
                            color: isDark ? '#94A3B8' : '#64748B',
                            fontSize: '10px',
                            fontWeight: 700,
                            formatter: () => `${displayTotalTrades}`
                        }
                    }
                }
            }
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            labels: {
                colors: isDark ? '#E2E8F0' : '#334155'
            },
            fontSize: '11px',
            fontWeight: 600,
            markers: {
                width: 9,
                height: 9,
                radius: 10
            },
            formatter: (seriesName, opts) => {
                const count = opts.w.globals.series[opts.seriesIndex];
                const pct = displayTotalTrades > 0 ? ((count / displayTotalTrades) * 100).toFixed(0) : 0;
                return `${seriesName}: ${count} (${pct}%)`;
            },
            itemMargin: {
                horizontal: 10,
                vertical: 2
            }
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
            y: {
                formatter: (val) => `${val} trades (${totalTrades > 0 ? ((val / totalTrades) * 100).toFixed(1) : 0}%)`
            }
        },
        states: {
            hover: {
                filter: { type: 'darken', value: 0.1 }
            },
            active: {
                filter: { type: 'none' }
            }
        }
    };

    const outcomeSeries = [wins, losses];

    return (
        <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                    <h3><AreaChartIcon size={15} color="#18C98B" /> Cumulative Equity Curve ($)</h3>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Portfolio Progression</span>
                </div>
                <div style={{ minHeight: '240px' }}>
                    {!mounted || !equityData || equityData.balances.length === 0 ? (
                        <ChartSkeletonLoader type="area" />
                    ) : (
                        <ReactApexChart
                            key={`equity_${roundTrips.length}_${theme}`}
                            options={equityChartOptions}
                            series={equitySeries}
                            type="area"
                            height={240}
                        />
                    )}
                </div>
            </div>

            <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                    <h3><PieChartIcon size={15} color="#18C98B" /> Trade Outcome Distribution</h3>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Win Rate: {winPercent}%</span>
                </div>
                <div style={{ minHeight: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!mounted || totalTrades === 0 ? (
                        <ChartSkeletonLoader type="donut" />
                    ) : (
                        <ReactApexChart
                            key={`outcome_${totalTrades}_${theme}`}
                            options={outcomeChartOptions}
                            series={outcomeSeries}
                            type="donut"
                            height={250}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

