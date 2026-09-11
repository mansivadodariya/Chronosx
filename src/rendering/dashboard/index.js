'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.scss';
import { dashboardApi } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';
import { CREDITS_UPDATED_EVENT } from '@/lib/credits';
import { getStoredUserId } from '@/lib/authSession';
import { useLanguage } from '@/context/LanguageContext';
import {
    getUserNameFromLocalStorage,
    extractCleanText,
    exportDashboardPdf
} from './utils/dashboardHelpers';
import DashboardHeroSection from './components/DashboardHeroSection';
import DashboardStatsCards from './components/DashboardStatsCards';
import DashboardRecentActivities from './components/DashboardRecentActivities';
import DashboardToolsGrid from './components/DashboardToolsGrid';

export default function Dashboard() {
    const router = useRouter();
    const { t } = useLanguage();
    const [userId, setUserId] = useState('');
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [creditHistory, setCreditHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');
    const [name, setName] = useState('');
    const [activityFilter, setActivityFilter] = useState('all');
    const [chartTimeframe, setChartTimeframe] = useState('7D');
    const [activeHoverPoint, setActiveHoverPoint] = useState(null);

    const getGreeting = () => {
        return t('dashboard.hello', 'Hello');
    };

    useEffect(() => {
        const syncUser = () => {
            setUserId(getStoredUserId());
            setName(getUserNameFromLocalStorage());
            setGreeting(getGreeting());
        };
        syncUser();
        window.addEventListener('user:updated', syncUser);
        return () => window.removeEventListener('user:updated', syncUser);
    }, []);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const [statsRes, recentRes, creditHistoryRes] = await Promise.allSettled([
                    dashboardApi.getStats(userId),
                    dashboardApi.getRecentActivity(userId),
                    supabase
                        ? supabase
                            .from('credit_history')
                            .select('*')
                            .eq('user_id', userId)
                            .order('created_at', { ascending: false })
                        : Promise.resolve({ data: [] }),
                ]);

                if (!mounted) return;

                const statsPayload =
                    statsRes.status === 'fulfilled' ? (statsRes.value?.data ?? statsRes.value) : null;
                setStats(statsPayload);

                const recentPayload =
                    recentRes.status === 'fulfilled' ? (recentRes.value?.data?.recent_activity ?? recentRes.value) : [];
                setRecentActivity(Array.isArray(recentPayload) ? recentPayload : (recentPayload?.items || []));

                const creditHistoryPayload =
                    creditHistoryRes.status === 'fulfilled' ? (creditHistoryRes.value?.data || []) : [];
                setCreditHistory(Array.isArray(creditHistoryPayload) ? creditHistoryPayload : []);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [userId]);

    // Live update when credits are updated anywhere across the app
    useEffect(() => {
        if (!userId || !supabase) return;
        const refetchCredits = async () => {
            try {
                const { data } = await supabase
                    .from('credit_history')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false });
                if (Array.isArray(data)) {
                    setCreditHistory(data);
                }
            } catch (err) {
                console.warn('Failed to refetch credit_history:', err);
            }
        };
        window.addEventListener(CREDITS_UPDATED_EVENT, refetchCredits);
        return () => window.removeEventListener(CREDITS_UPDATED_EVENT, refetchCredits);
    }, [userId]);

    const totalAccountCredits = useMemo(() => {
        if (!Array.isArray(creditHistory) || creditHistory.length === 0) {
            return stats?.total_credits ?? 0;
        }
        const added = creditHistory
            .filter(c => {
                const type = String(c?.transaction_type || '').toLowerCase();
                return type === 'add' || type === 'deposit';
            })
            .reduce((sum, c) => sum + (Number(c?.amount) || 0), 0);
        return added > 0 ? added : (stats?.total_credits ?? 0);
    }, [creditHistory, stats]);

    const handleExportPdf = () => {
        exportDashboardPdf({ name, stats });
    };

    const recents = useMemo(() => {
        const normalize = (item, index) => {
            const type = item?.type || item?.activity_type || item?.kind || "";
            const normalizedType = String(type).toLowerCase().includes("blog") ? "blog" : "chat";

            const rawSummary = item?.summary || item?.response || item?.short_response || item?.shortResponse || item?.answer || item?.content || "";
            const summary = extractCleanText(rawSummary);
            const rawTitle = item?.title || item?.question || item?.message || "Recent item";
            const title = extractCleanText(rawTitle);

            return {
                type: normalizedType,
                id: item?.id || item?.activity_id || item?.chat_id || item?.created_at || index,
                title: typeof title === 'string' && title.length > 0 ? title : "Recent item",
                summary,
                pair: item?.pair || item?.symbol || "",
                created_at: item?.created_at || item?.createdAt || item?.time || "",
            };
        };

        const list = (Array.isArray(recentActivity) ? recentActivity : [])
            .map(normalize)
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

        if (activityFilter === 'chat') {
            return list.filter(i => i.type === 'chat').slice(0, 4);
        }
        if (activityFilter === 'blog') {
            return list.filter(i => i.type === 'blog').slice(0, 4);
        }
        return list.slice(0, 4);
    }, [recentActivity, activityFilter]);

    const openRecent = (item) => {
        const params = new URLSearchParams();
        params.set('tab', item.type);
        params.set('open', String(item.id));
        router.push(`/market-assistant?${params.toString()}`);
    };

    const dailyCreditChartData = useMemo(() => {
        const today = new Date();
        const numDays = chartTimeframe === '90D' ? 90 : chartTimeframe === '30D' ? 30 : 7;

        // Group real deductions from Supabase credit_history by user local date (YYYY-MM-DD)
        const usageByDate = {};
        if (Array.isArray(creditHistory)) {
            creditHistory.forEach((item) => {
                const type = String(item?.transaction_type || '').toLowerCase();
                const isDeduction = type === 'deduct' || type === 'debit' || (type !== 'add' && type !== 'deposit');
                if (isDeduction && item?.created_at) {
                    const d = new Date(item.created_at);
                    if (!isNaN(d.getTime())) {
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        const key = `${year}-${month}-${day}`;
                        usageByDate[key] = (usageByDate[key] || 0) + (Number(item.amount) || 0);
                    }
                }
            });
        }

        const rawPoints = [];
        for (let i = numDays - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;

            const dayNum = d.getDate();
            const monthShort = d.toLocaleString('en-US', { month: 'short' });
            const dateFormatted = i === 0 ? t('dashboard.today', 'Today') : `${dayNum} ${monthShort}`;

            const recorded = usageByDate[dateKey];
            const creditsVal = typeof recorded === 'number' ? recorded : 0;

            rawPoints.push({
                dateFormatted,
                dateKey,
                credits: creditsVal,
                isToday: i === 0,
                idx: numDays - 1 - i,
            });
        }

        const maxVal = Math.max(...rawPoints.map((p) => p.credits), 10);
        const totalPoints = rawPoints.length;

        const points = rawPoints.map((p, idx) => {
            const ratio = totalPoints > 1 ? idx / (totalPoints - 1) : 0;
            const x = 50 + ratio * 900; // 50 to 950 across viewBox 1000
            const xPercent = ratio * 90 + 5; // 5% to 95%
            const y = 145 - (p.credits / maxVal) * 110; // 35 to 145 in viewBox 170
            const yPercent = (y / 170) * 100;
            return {
                ...p,
                x,
                y,
                xPercent,
                yPercent
            };
        });

        let pathLine = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const curr = points[i];
            const next = points[i + 1];
            const cx = (curr.x + next.x) / 2;
            pathLine += ` C ${cx} ${curr.y}, ${cx} ${next.y}, ${next.x} ${next.y}`;
        }

        const pathArea = `${pathLine} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;
        const totalUsed = points.reduce((sum, p) => sum + p.credits, 0);

        // Compute clean milestone labels for X-axis
        let labels = [];
        if (numDays === 7) {
            labels = points;
        } else {
            const step = Math.floor((totalPoints - 1) / 5);
            const labelIndices = new Set();
            for (let s = 0; s < totalPoints; s += step) {
                labelIndices.add(s);
            }
            labelIndices.add(totalPoints - 1);
            labels = points.filter((_, idx) => labelIndices.has(idx));
        }

        const displayPoints = numDays === 7
            ? points
            : points.filter((p, idx) => p.credits > 0 || p.isToday || idx % 5 === 0);

        return { points, displayPoints, labels, pathLine, pathArea, totalUsed };
    }, [creditHistory, chartTimeframe, t]);

    return (
        <div className={styles.modernDashboard}>
            {/* Holographic Hero Terminal & Daily Stats Side Card */}
            <div className={styles.topHeroRowGrid}>
                <DashboardHeroSection
                    greeting={greeting}
                    name={name}
                    dailyCreditChartData={dailyCreditChartData}
                    chartTimeframe={chartTimeframe}
                    setChartTimeframe={setChartTimeframe}
                    activeHoverPoint={activeHoverPoint}
                    setActiveHoverPoint={setActiveHoverPoint}
                />

                <DashboardStatsCards
                    loading={loading}
                    stats={stats}
                    totalAccountCredits={totalAccountCredits}
                    handleExportPdf={handleExportPdf}
                    router={router}
                />
            </div>

            {/* Split Section: Recent Activity & AI Quick Hub */}
            <div className={styles.splitBottomGrid}>
                <DashboardRecentActivities
                    loading={loading}
                    recents={recents}
                    activityFilter={activityFilter}
                    setActivityFilter={setActivityFilter}
                    openRecent={openRecent}
                />

                <DashboardToolsGrid />
            </div>
        </div>
    );
}
