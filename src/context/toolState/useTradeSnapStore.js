'use client';

import { useState } from 'react';

export function useCreateTradeSnapStore() {
    const [isSharing, setIsSharing] = useState(false);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [showSnapshot, setShowSnapshot] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [allAnalyses, setAllAnalyses] = useState([]);
    const [autoCaptureInterval, setAutoCaptureInterval] = useState(null);
    const [nextScreenshotEndTime, setNextScreenshotEndTime] = useState(null);
    const [shouldAutoAnalyze, setShouldAutoAnalyze] = useState(false);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
