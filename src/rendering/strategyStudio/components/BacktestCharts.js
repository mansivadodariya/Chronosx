'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import styles from '../styles/strategyStudio.module.scss';
import { useTheme } from '@/context/ThemeContext';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function BacktestCharts({
    roundTrips = [],
    initialCapital = 10000,
    wins = 0,
    losses = 0
}) {
    const { theme } = useTheme();
    const isDark = theme !== 'light';

    // Equity Curve Data
    const equityData = useMemo(() => {
        const labels = ['Start', ...roundTrips.map(t => (t.exitDate ? t.exitDate.split(' ')[0] : `T${t.index}`))];
        const balances = [initialCapital, ...roundTrips.map(t => t.runningBalance)];
        return { labels, balances };
    }, [roundTrips, initialCapital]);

    const isProfitable = equityData.balances[equityData.balances.length - 1] >= initialCapital;
    const primaryColor = isProfitable ? '#18C98B' : '#F43F5E';

    const equityChartOptions = {
        chart: {
            type: 'area',
            height: 240,
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true, easing: 'easeinout', speed: 600 }
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
                    { offset: 0, color: primaryColor, opacity: 0.4 },
                    { offset: 100, color: primaryColor, opacity: 0.0 }
                ]
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: equityData.labels,
            labels: {
                style: { colors: isDark ? '#64748B' : '#94A3B8', fontSize: '10px' },
                rotate: 0,
                hideOverlappingLabels: true,
                maxHeight: 40
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                style: { colors: isDark ? '#64748B' : '#94A3B8', fontSize: '10px' },
                formatter: (val) => `$${Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            }
        },
        grid: {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            strokeDashArray: 3
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
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
    const outcomeChartOptions = {
        chart: {
            type: 'donut',
            height: 240,
            background: 'transparent'
        },
        labels: ['Winning Trades', 'Losing Trades'],
        colors: ['#18C98B', '#F43F5E'],
        stroke: {
            colors: [isDark ? '#0B100E' : '#FFFFFF'],
            width: 3
        },
        dataLabels: { enabled: false },
        plotOptions: {
            pie: {
                donut: {
                    size: '72%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total Trades',
                            color: isDark ? '#94A3B8' : '#64748B',
                            fontSize: '11px',
                            formatter: () => `${wins + losses}`
                        }
                    }
                }
            }
        },
        legend: {
            position: 'bottom',
            labels: {
                colors: isDark ? '#CBD5E1' : '#475569'
            },
            fontSize: '11px'
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light'
        }
    };

    const outcomeSeries = [wins, losses];

    return (
        <div className={styles.chartsGrid}>
            <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                    <h3>📈 Cumulative Equity Curve ($)</h3>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Portfolio Progression</span>
                </div>
                <div style={{ minHeight: '240px' }}>
                    <ReactApexChart
                        options={equityChartOptions}
                        series={equitySeries}
                        type="area"
                        height={240}
                    />
                </div>
            </div>

            <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                    <h3>📊 Trade Outcome Distribution</h3>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Wins vs Losses</span>
                </div>
                <div style={{ minHeight: '240px' }}>
                    <ReactApexChart
                        options={outcomeChartOptions}
                        series={outcomeSeries}
                        type="donut"
                        height={240}
                    />
                </div>
            </div>
        </div>
    );
}
