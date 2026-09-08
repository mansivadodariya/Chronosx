'use client';

import { useState, useCallback } from 'react';
import { MOCK_LIVE_DATA, MOCK_STRATEGY_SIGNAL, MOCK_SCANNER_DATA } from '@/rendering/aiStrategy/strategyUtils';

export function useCreateAiStrategyStore() {
    const [selectedSymbol, setSelectedSymbol] = useState('XAU/USD');
    const [selectedSymbolPriceInfo, setSelectedSymbolPriceInfo] = useState(null);
    const [selectedStrategyId, setSelectedStrategyId] = useState('');
    const [activeAnalysis, setActiveAnalysis] = useState(null);
    const [refreshCounter, setRefreshCounter] = useState(0);

    const [globalTimeframe, setGlobalTimeframe] = useState('1h');
    const [selectedStrategySymbol, setSelectedStrategySymbol] = useState('XAUUSD');
    const [activeSignals, setActiveSignals] = useState({});
    const [strategyAnalysis, setStrategyAnalysis] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);

    const [logs, setLogs] = useState([
        { id: 'init', time: new Date().toLocaleTimeString(), text: 'Terminal initialized. Booting streams for 6 pairs...', isSystem: true }
    ]);

    const [liveData, setLiveData] = useState(MOCK_LIVE_DATA);
    const [scannerData, setScannerData] = useState(MOCK_SCANNER_DATA);
    const [scannerLoading, setScannerLoading] = useState(false);
    const [strategySignal, setStrategySignal] = useState(MOCK_STRATEGY_SIGNAL);

    const addLog = useCallback((message, isSystem = false) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs((prev) => {
            const nextLogs = [
                ...prev,
                { id: Math.random().toString(), time: timestamp, text: message, isSystem }
            ];
            if (nextLogs.length > 80) {
                return nextLogs.slice(nextLogs.length - 80);
            }
            return nextLogs;
        });
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([{ id: 'clear', time: new Date().toLocaleTimeString(), text: 'Log cleared.', isSystem: true }]);
    }, []);

    const handleHourlyRefresh = useCallback(() => {
        setRefreshCounter(prev => prev + 1);
        addLog('Triggering automatic hourly refresh at HH:01:00...', true);
    }, [addLog]);

    return {
        selectedSymbol,
        setSelectedSymbol,
        selectedSymbolPriceInfo,
        setSelectedSymbolPriceInfo,
        selectedStrategyId,
        setSelectedStrategyId,
        activeAnalysis,
        setActiveAnalysis,
        refreshCounter,
        setRefreshCounter,
        globalTimeframe,
        setGlobalTimeframe,
        selectedStrategySymbol,
        setSelectedStrategySymbol,
        activeSignals,
        setActiveSignals,
        strategyAnalysis,
        setStrategyAnalysis,
        analysisLoading,
        setAnalysisLoading,
        logs,
        setLogs,
        addLog,
        clearLogs,
        handleHourlyRefresh,
        liveData,
        setLiveData,
        scannerData,
        setScannerData,
        scannerLoading,
        setScannerLoading,
        strategySignal,
        setStrategySignal
    };
}
