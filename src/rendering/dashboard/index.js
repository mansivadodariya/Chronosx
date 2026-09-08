'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.scss';
import { dashboardApi } from '@/lib/api';
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
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');
    const [name, setName] = useState('');
    const [activityFilter, setActivityFilter] = useState('all');
    const [chartTimeframe, setChartTimeframe] = useState('7D');
    const [activeHoverPoint, setActiveHoverPoint] = useState(null);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('dashboard.goodMorning', 'Good Morning');
        if (hour < 17) return t('dashboard.goodAfternoon', 'Good Afternoon');
        if (hour < 21) return t('dashboard.goodEvening', 'Good Evening');
        return t('dashboard.goodNight', 'Good Night');
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
                const [statsRes, recentRes] = await Promise.allSettled([
                    dashboardApi.getStats(userId),
                    dashboardApi.getRecentActivity(userId),
                ]);

                if (!mounted) return;

                const statsPayload =
                    statsRes.status === 'fulfilled' ? (statsRes.value?.data ?? statsRes.value) : null;
                setStats(statsPayload);

                const recentPayload =
                    recentRes.status === 'fulfilled' ? (recentRes.value?.data?.recent_activity ?? recentRes.value) : [];
                setRecentActivity(Array.isArray(recentPayload) ? recentPayload : (recentPayload?.items || []));
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [userId]);

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
        const rawPoints = [];
        const usageByDate = {};

        if (Array.isArray(recentActivity)) {
            recentActivity.forEach((item) => {
                const rawDate = item?.created_at || item?.createdAt || item?.time;
                if (rawDate) {
                    const d = new Date(rawDate);
                    if (!isNaN(d.getTime())) {
                        const key = d.toISOString().split('T')[0];
                        const cost = (item?.type === 'blog' || item?.type === 'analysis') ? 5 : 2;
                        usageByDate[key] = (usageByDate[key] || 0) + cost;
                    }
                }
            });
        }

        const todayChat = stats?.total_chat_history ?? 0;
        const todayAnalysis = stats?.total_analysis_history ?? 0;
        const todayTotalRealCredits = (todayAnalysis * 5) + (todayChat * 2);

        const todayKey = today.toISOString().split('T')[0];
        if (todayTotalRealCredits > 0) {
            usageByDate[todayKey] = Math.max(usageByDate[todayKey] || 0, todayTotalRealCredits);
        }

        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);

            const dateKey = d.toISOString().split('T')[0];
            const dayNum = d.getDate();
            const monthShort = d.toLocaleString('en-US', { month: 'short' });
            const dateFormatted = i === 0 ? 'Today' : `${dayNum} ${monthShort}`;

            const recorded = usageByDate[dateKey];
            const creditsVal = typeof recorded === 'number' ? recorded : 0;

            rawPoints.push({
                dateFormatted,
                dateKey,
                credits: creditsVal,
                isToday: i === 0,
                idx: 6 - i,
            });
        }

        const maxVal = Math.max(...rawPoints.map((p) => p.credits), 10);

        const points = rawPoints.map((p, idx) => {
            const x = 30 + (idx * 105);
            const y = 115 - (p.credits / maxVal) * 85;
            return {
                ...p,
                x,
                y,
            };
        });

        let pathLine = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const curr = points[i];
            const next = points[i + 1];
            const cx = (curr.x + next.x) / 2;
            pathLine += ` C ${cx} ${curr.y}, ${cx} ${next.y}, ${next.x} ${next.y}`;
        }

        const pathArea = `${pathLine} L ${points[points.length - 1].x} 135 L ${points[0].x} 135 Z`;
        const totalUsed = points.reduce((a, b) => a + b.credits, 0);

        return { points, pathLine, pathArea, totalUsed };
    }, [recentActivity, stats]);

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
