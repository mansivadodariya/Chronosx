'use client';

import React, { useState, useEffect } from 'react';
import styles from './aiStrategy.module.scss';
import { useLanguage } from '@/context/LanguageContext';
import { getScoreColor } from '@/icons/analysisIcons';
import { AnalysisSkeleton, AnalysisErrorState } from './components/AnalysisSkeleton';
import TechnicalScoreSection from './components/TechnicalScoreSection';
import TrendSection from './components/TrendSection';
import MomentumSection from './components/MomentumSection';
import StructureSection from './components/StructureSection';
import AiIntelligenceSummarySection from './components/AiIntelligenceSummarySection';

export default function AnalysisPanel({ symbol, strategyId, activeAnalysis, onAnalysisLoaded }) {
    const { language, t } = useLanguage();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch analysis data from REST endpoint
    const fetchAnalysisData = async () => {
        if (!symbol) return;
        setLoading(true);
        setError(null);

        const cleanSymbol = symbol.replace('/', '').toUpperCase();
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.thetradermaster.com'}/api/v1/chart/analysis?symbol=${cleanSymbol}&lang=${language}`;

        try {
            const res = await fetch(url, {
                headers: {
                    'accept': 'application/json',
                    'Accept-Language': language,
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            if (!res.ok) throw new Error('Failed to fetch analysis details');
            const data = await res.json();

            if (data.success && data.analysis) {
                setAnalysis(data.analysis);
                if (onAnalysisLoaded) {
                    onAnalysisLoaded(data.analysis);
                }
            } else {
                throw new Error('Analysis fetch unsuccessful');
            }
        } catch (err) {
            console.error('Error fetching analysis:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysisData();
    }, [symbol, strategyId]);

    if (loading) {
        return <AnalysisSkeleton />;
    }

    if (error || !analysis) {
        return <AnalysisErrorState symbol={symbol} onRetry={fetchAnalysisData} />;
    }

    const {
        technical_score = {},
        ai_summary = {},
        evidence = {},
        levels = {},
        trend_indicators = {},
        momentum_indicators = {},
        pivot_points = {},
        trend_analysis = {},
        momentum = {},
    } = analysis;

    const scoreColor = getScoreColor(technical_score.label);

    return (
        <div className={styles.analysisPanel}>
            {/* 1. MASTER TECHNICAL SCORE (Speedometer + Overview Pillars) */}
            <TechnicalScoreSection
                technicalScore={technical_score}
            />

            {/* 2. TREND SECTION (Trend Speedometer + All SMA/EMA Data + Trend Evidence Together) */}
            <TrendSection
                trendIndicators={trend_indicators}
                trendAnalysis={trend_analysis}
                evidence={evidence.trend}
                trendScore={technical_score?.breakdown?.trend?.score || 25}
                maxScore={technical_score?.breakdown?.trend?.max || 25}
            />

            {/* 3. MOMENTUM SECTION (Visual Sliders + All Momentum Indicators + Momentum Evidence Together) */}
            <MomentumSection
                momentumIndicators={momentum_indicators}
                momentum={momentum}
                evidence={evidence.momentum}
            />

            {/* 4. STRUCTURE SECTION (Progress Bar + 5 Key Levels + Structure Evidence Together) */}
            <StructureSection
                levels={levels}
                pivotPoints={pivot_points}
                evidence={evidence.structure}
                structureScore={technical_score?.breakdown?.structure?.score || 12}
                maxScore={technical_score?.breakdown?.structure?.max || 25}
            />

            {/* 5. AI INTELLIGENCE SYNTHESIS */}
            <AiIntelligenceSummarySection
                aiSummary={ai_summary}
                t={t}
            />
        </div>
    );
}
