'use client';

import { useState, useEffect, useCallback } from 'react';

const SNAP_KEYS = {
    ANALYSES: 'chronosx_tradesnap_analyses',
    SELECTED: 'chronosx_tradesnap_selected',
    SHOW: 'chronosx_tradesnap_show_analysis'
};

export function useCreateTradeSnapStore() {
    const [isSharing, setIsSharing] = useState(false);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [showSnapshot, setShowSnapshot] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showAnalysis, setShowAnalysisState] = useState(false);
    const [allAnalyses, setAllAnalysesState] = useState([]);
    const [autoCaptureInterval, setAutoCaptureInterval] = useState(null);
    const [nextScreenshotEndTime, setNextScreenshotEndTime] = useState(null);
    const [shouldAutoAnalyze, setShouldAutoAnalyze] = useState(false);
    const [selectedAnalysis, setSelectedAnalysisState] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Rehydrate tradeSnap persisted analyses on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const savedAnalyses = localStorage.getItem(SNAP_KEYS.ANALYSES);
            if (savedAnalyses) {
                const parsed = JSON.parse(savedAnalyses);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setAllAnalysesState(parsed);
                }
            }

            const savedSelected = localStorage.getItem(SNAP_KEYS.SELECTED);
            if (savedSelected) {
                const parsedSelected = JSON.parse(savedSelected);
                if (parsedSelected) {
                    setSelectedAnalysisState(parsedSelected);
                    setShowAnalysisState(true);
                }
            }
        } catch (err) {
            console.warn('Could not rehydrate tradeSnap analyses from localStorage:', err);
        }
    }, []);

    const setAllAnalyses = useCallback((updater) => {
        setAllAnalysesState((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            if (typeof window !== 'undefined') {
                try {
                    localStorage.setItem(SNAP_KEYS.ANALYSES, JSON.stringify(next));
                } catch (e) {
                    console.warn('Failed to save tradeSnap analyses to localStorage:', e);
                }
            }
            return next;
        });
    }, []);

    const setSelectedAnalysis = useCallback((item) => {
        setSelectedAnalysisState(item);
        if (typeof window !== 'undefined') {
            try {
                if (item) {
                    localStorage.setItem(SNAP_KEYS.SELECTED, JSON.stringify(item));
                } else {
                    localStorage.removeItem(SNAP_KEYS.SELECTED);
                }
            } catch (e) {
                // Ignore
            }
        }
    }, []);

    const setShowAnalysis = useCallback((show) => {
        setShowAnalysisState(show);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(SNAP_KEYS.SHOW, JSON.stringify(show));
            } catch (e) {
                // Ignore
            }
        }
    }, []);

    return {
        isSharing,
        setIsSharing,
        stream,
        setStream,
        capturedImage,
        setCapturedImage,
        showSnapshot,
        setShowSnapshot,
        isAnalyzing,
        setIsAnalyzing,
        showAnalysis,
        setShowAnalysis,
        allAnalyses,
        setAllAnalyses,
        autoCaptureInterval,
        setAutoCaptureInterval,
        nextScreenshotEndTime,
        setNextScreenshotEndTime,
        shouldAutoAnalyze,
        setShouldAutoAnalyze,
        selectedAnalysis,
        setSelectedAnalysis,
        isDetailModalOpen,
        setIsDetailModalOpen
    };
}
