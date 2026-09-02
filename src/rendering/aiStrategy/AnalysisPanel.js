'use client';

import React, { useState, useEffect } from 'react';
import styles from './aiStrategy.module.scss';
import { useLanguage } from '@/context/LanguageContext';
import { getScoreColor } from '@/icons/analysisIcons';
import { AnalysisSkeleton, AnalysisErrorState } from './components/AnalysisSkeleton';
import TechnicalScoreSection from './components/TechnicalScoreSection';
import EvidenceSection from './components/EvidenceSection';
import IndicatorsBreakdownSection from './components/IndicatorsBreakdownSection';
import AiIntelligenceSummarySection from './components/AiIntelligenceSummarySection';

export default function AnalysisPanel({ symbol, strategyId, activeAnalysis, onAnalysisLoaded }) {
    const { language, t } = useLanguage();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Main Accordion Toggles
    const [expandedAccordions, setExpandedAccordions] = useState({
        score: true,
        evidence: false,
        trend: false,
        momentum: false,
        volume: false,
        ai: false
    });

    // Score Sub-details Toggles
    const [scoreSubToggles, setScoreSubToggles] = useState({
        trend: true,
        momentum: false,
        volume: false,
        structure: false
    });

    // Evidence Sub-details Toggles
    const [evidenceSubToggles, setEvidenceSubToggles] = useState({
        trend: true,
        momentum: false,
        volume: false,
        structure: false
    });

    const toggleMainAccordion = (key) => {
        setExpandedAccordions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleScoreSub = (key, e) => {
        e.stopPropagation();
        setScoreSubToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleEvidenceSub = (key, e) => {
        e.stopPropagation();
        setEvidenceSubToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

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
        volume_analysis = {}
    } = analysis;

    const scoreColor = getScoreColor(technical_score.label);

    return (
        <div className={styles.analysisPanel}>
            {/* 1. TECHNICAL SCORE ACCORDION */}
            <TechnicalScoreSection
                technicalScore={technical_score}
                trendIndicators={trend_indicators}
                momentumIndicators={momentum_indicators}
                volumeAnalysis={volume_analysis}
                levels={levels}
                pivotPoints={pivot_points}
                isExpanded={expandedAccordions.score}
                onToggle={() => toggleMainAccordion('score')}
                scoreSubToggles={scoreSubToggles}
                onToggleSub={toggleScoreSub}
            />

            {/* 2. EVIDENCE ACCORDION */}
            <EvidenceSection
                evidence={evidence}
                isExpanded={expandedAccordions.evidence}
                onToggle={() => toggleMainAccordion('evidence')}
                evidenceSubToggles={evidenceSubToggles}
                onToggleSub={toggleEvidenceSub}
                title={t('aiStrategy.evidenceTitle', 'EVIDENCE')}
            />

            {/* 3, 4, 5. TREND, MOMENTUM & VOLUME ACCORDIONS */}
            <IndicatorsBreakdownSection
                trendAnalysis={trend_analysis}
                momentum={momentum}
                volumeAnalysis={volume_analysis}
                scoreColor={scoreColor}
                expandedAccordions={expandedAccordions}
                onToggleMain={toggleMainAccordion}
                t={t}
            />

            {/* 6. AI SUMMARY ACCORDION */}
            <AiIntelligenceSummarySection
                aiSummary={ai_summary}
                isExpanded={expandedAccordions.ai}
                onToggle={() => toggleMainAccordion('ai')}
                t={t}
            />
        </div>
    );
}
