'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './aiAssistant.module.scss';
import HistoryButton from '@/components/historyButton';
import { toast } from '@/components/toast';
import ReportPanel from './ReportPanel';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import TradingViewChartPane, { PAIR_GROUPS, ALL_PAIRS, SYMBOL_DATABASE, normalizeSymbol } from './TradingViewChartPane';
import ImagePreviewModal from './ImagePreviewModal';
import ChatMessageList from './components/ChatMessageList';
import ChatInputBar from './components/ChatInputBar';
import AssistantModals from './components/AssistantModals';
import { useAiAssistantStore } from '@/context/toolState';

const Logo = '/assets/logo/smallLogo.png';

export { PAIR_GROUPS, ALL_PAIRS, SYMBOL_DATABASE, normalizeSymbol };

const AiAssistant = ({ initialTab, initialOpenId } = {}) => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const isDark = theme !== 'light';

    const {
        userId,
        chatHistory,
        selectedChat,
        currentConversationId,
        chatMessages,
        chatInput,
        setChatInput,
        selectedPair,
        setSelectedPair,
        dropdownOpen,
        setDropdownOpen,
        attachDropdownOpen,
        setAttachDropdownOpen,
        attachmentDraft,
        setAttachmentDraft,
        previewAttachment,
        setPreviewAttachment,
        loadingHistory,
        isLoadingChat,
        pendingRequest,
        confirmDeleteOpen,
        setConfirmDeleteOpen,
        pendingDeleteItem,
        setPendingDeleteItem,
        historyModalOpen,
        setHistoryModalOpen,
        activeAnalysisMode,
        setActiveAnalysisMode,
        chatWidthPercent,
        setChatWidthPercent,
        exportData,
        setExportData,
        handleCreateNew,
        handleSelectChat,
        handleSendChatMessage,
        handleConfirmDelete
    } = useAiAssistantStore();

    const [isDragging, setIsDragging] = useState(false);

    // Refs
    const dropdownRef = useRef(null);
    const attachDropdownRef = useRef(null);
    const chatEndRef = useRef(null);
    const exportRef = useRef(null);
    const gridRef = useRef(null);
    const fileInputRef = useRef(null);
    const chartPaneRef = useRef(null);
    const textareaRef = useRef(null);

    // Quick Action Chip & Mode Tab Handlers
    const handleGenerateFromImageClick = useCallback(() => {
        let draft = null;
        if (chartPaneRef.current) {
            const dataUrl = chartPaneRef.current.getScreenshotDataUrl();
            if (dataUrl) {
                draft = {
                    name: `${normalizeSymbol(selectedPair)}_chart.png`,
                    url: dataUrl,
                    type: 'image/png'
                };
                setAttachmentDraft(draft);
            }
        }
        setActiveAnalysisMode('image');
        setTimeout(() => textareaRef.current?.focus(), 60);
    }, [selectedPair, setAttachmentDraft, setActiveAnalysisMode]);

    const handleDeepAnalysisClick = useCallback(() => {
        setActiveAnalysisMode(prev => prev === 'deep' ? null : 'deep');
        setTimeout(() => textareaRef.current?.focus(), 60);
    }, [setActiveAnalysisMode]);

    const handleMacroNewsClick = useCallback(() => {
        setActiveAnalysisMode(prev => prev === 'news' ? null : 'news');
        setTimeout(() => textareaRef.current?.focus(), 60);
    }, [setActiveAnalysisMode]);

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setAttachmentDraft({
                url: event.target.result,
                name: file.name || 'Image Attachment'
            });
            setSelectedPair('No Pair');
        };
        reader.readAsDataURL(file);
        setSelectedPair('No Pair');
        e.target.value = '';
    };

    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        setAttachmentDraft({
                            url: event.target.result,
                            name: file.name || 'Pasted Screenshot.png'
                        });
                        setSelectedPair('No Pair');
                    };
                    reader.readAsDataURL(file);
                    setSelectedPair('No Pair');
                    break;
                }
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setAttachmentDraft({
                    url: event.target.result,
                    name: file.name || 'Image Attachment'
                });
                setSelectedPair('No Pair');
            };
            reader.readAsDataURL(file);
            setSelectedPair('No Pair');
        }
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    useEffect(() => {
        if (!isDragging) return;

        let animationFrameId = null;

        const handleMouseMove = (e) => {
            if (!gridRef.current) return;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            animationFrameId = requestAnimationFrame(() => {
                if (!gridRef.current) return;
                const rect = gridRef.current.getBoundingClientRect();
                const offsetX = e.clientX - rect.left;
                const totalWidth = rect.width;
                const newPercent = (offsetX / totalWidth) * 100;
                const clamped = Math.max(20, Math.min(60, newPercent));
                setChatWidthPercent(clamped);
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isDragging, setChatWidthPercent]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (attachDropdownRef.current && !attachDropdownRef.current.contains(e.target)) {
                setAttachDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setDropdownOpen, setAttachDropdownOpen]);

    // Scroll to bottom on new chat messages
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, pendingRequest]);

    // Deep-link support
    useEffect(() => {
        if (!initialOpenId || chatHistory.length === 0) return;
        const matchId = (item, index) =>
            String(item?.id || item?.created_at || item?.createdAt || index) === String(initialOpenId);
        const found = chatHistory.find((it, idx) => matchId(it, idx));
        if (found) handleSelectChat(found);
    }, [initialOpenId, chatHistory, handleSelectChat]);

    const handleOptionClick = useCallback((optionLabel) => {
        setChatInput(optionLabel);
        setTimeout(() => handleSendChatMessage(optionLabel), 50);
    }, [setChatInput, handleSendChatMessage]);

    const openDeleteConfirm = (e, type, index, item) => {
        e.stopPropagation();
        setPendingDeleteItem({ type, index, item });
        setConfirmDeleteOpen(true);
    };

    const closeDeleteConfirm = () => {
        setPendingDeleteItem(null);
        setConfirmDeleteOpen(false);
    };

    const handleDownloadFullReport = useCallback((reportContent, visualData, symbol) => {
        setExportData({ fullReport: reportContent, visualData, symbol: symbol || selectedPair });
    }, [setExportData, selectedPair]);

    useEffect(() => {
        if (!exportData) return;

        const generatePdf = async () => {
            try {
                toast('Preparing PDF download with market charts...');
                const html2pdf = (await import('html2pdf.js')).default;
                await new Promise((resolve) => setTimeout(resolve, 1000));

                const element = exportRef.current;
                if (!element) throw new Error("Export element not found");

                const cleanPair = (exportData.symbol && exportData.symbol !== 'No Pair')
                    ? exportData.symbol.replace(/[^A-Z0-9]/g, '').toUpperCase()
                    : 'MARKET';

                const opt = {
                    margin: [10, 10, 10, 10],
                    filename: `${cleanPair}_Trade_Analysis_Report.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#0b0f17', windowWidth: 800, width: 800 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                };

                await html2pdf().set(opt).from(element).save();
                toast.success('Report downloaded successfully!');
            } catch (err) {
                console.error('PDF download error:', err);
                if (exportData.fullReport) {
                    const blob = new Blob([exportData.fullReport], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'market-analysis-report.md';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            } finally {
                setExportData(null);
            }
        };

        generatePdf();
    }, [exportData, setExportData]);

    const getQuestionText = (item) => item.title || item.name || item.first_question || item.question || item.message || item.input_data || 'Untitled Conversation';

    return (
        <div className={`${styles.aiAssistant} ${isDark ? styles.isDark : styles.isLight}`}>
            <div
                ref={gridRef}
                className={`${styles.splitLayoutGrid} ${isDragging ? styles.isDraggingGrid : ''}`}
                style={{
                    gridTemplateColumns: `minmax(380px, ${chatWidthPercent}%) 10px minmax(360px, 1fr)`,
                    transition: isDragging ? 'none' : 'grid-template-columns 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                {/* Center / Left Panel: Chatbot conversation view */}
                <div className={styles.chatSingleBody} data-lenis-prevent="true">
                    <div className={styles.chatCard} data-lenis-prevent="true">
                        <div className={`${styles.chatHeader} ${chatWidthPercent <= 42 ? styles.compactHeader : ''}`}>
                            <div className={styles.headerInfo}>
                                <h3>{t('aiAssistant.copilotTitle', 'ChronosX Copilot')}</h3>
                                <span>{t('aiAssistant.activePair', 'Active Pair')}: {selectedPair}</span>
                            </div>
                            <div className={styles.headerAction}>
                                <button
                                    type="button"
                                    className={styles.createNewBtn}
                                    onClick={handleCreateNew}
                                    title={t('aiAssistant.createNewChat', 'Create New Chat')}
                                >
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
                                    </svg>
                                    <span>{t('aiAssistant.createNewChat', 'Create New Chat')}</span>
                                </button>
                                <HistoryButton
                                    text={t('aiAssistant.history', 'History')}
                                    onClick={() => setHistoryModalOpen(true)}
                                    className={styles.historyHeaderBtn}
                                />
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <ChatMessageList
                            chatMessages={chatMessages}
                            isLoadingChat={isLoadingChat}
                            pendingRequest={pendingRequest}
                            selectedPair={selectedPair}
                            chatEndRef={chatEndRef}
                            t={t}
                            handleDeepAnalysisClick={handleDeepAnalysisClick}
                            handleGenerateFromImageClick={handleGenerateFromImageClick}
                            handleMacroNewsClick={handleMacroNewsClick}
                            setPreviewAttachment={setPreviewAttachment}
                            handleDownloadFullReport={handleDownloadFullReport}
                            handleOptionClick={handleOptionClick}
                        />
                    </div>

                    {/* Chat input box */}
                    <ChatInputBar
                        textareaRef={textareaRef}
                        chatInput={chatInput}
                        setChatInput={setChatInput}
                        handleSendChatMessage={() => handleSendChatMessage()}
                        handlePaste={handlePaste}
                        handleDrop={handleDrop}
                        pendingRequest={pendingRequest}
                        activeAnalysisMode={activeAnalysisMode}
                        setActiveAnalysisMode={setActiveAnalysisMode}
                        selectedPair={selectedPair}
                        setSelectedPair={setSelectedPair}
                        attachmentDraft={attachmentDraft}
                        setAttachmentDraft={setAttachmentDraft}
                        setPreviewAttachment={setPreviewAttachment}
                        fileInputRef={fileInputRef}
                        handleFileSelect={handleFileSelect}
                        attachDropdownRef={attachDropdownRef}
                        attachDropdownOpen={attachDropdownOpen}
                        setAttachDropdownOpen={setAttachDropdownOpen}
                        dropdownRef={dropdownRef}
                        dropdownOpen={dropdownOpen}
                        setDropdownOpen={setDropdownOpen}
                        handleGenerateFromImageClick={handleGenerateFromImageClick}
                        handleDeepAnalysisClick={handleDeepAnalysisClick}
                        handleMacroNewsClick={handleMacroNewsClick}
                        isDark={isDark}
                        t={t}
                    />
                </div>

                {/* Resizable Splitter Line Handle */}
                <div
                    className={`${styles.resizerSplitter} ${isDragging ? styles.resizerActive : ''}`}
                    onMouseDown={handleMouseDown}
                    title="Drag to resize panels"
                >
                    <div className={styles.resizerLine} />
                </div>

                {/* Right Panel: TradingView Chart Pane */}
                <div className={styles.chartSingleBody}>
                    <TradingViewChartPane
                        ref={chartPaneRef}
                        symbol={selectedPair}
                        onSymbolChange={(newSymbol) => {
                            if (!newSymbol || newSymbol === 'No Pair' || newSymbol === 'NO_PAIR' || String(newSymbol).toUpperCase().includes('NO PAIR')) {
                                setSelectedPair('XAU/USD');
                                return;
                            }
                            const match = ALL_PAIRS.find(p => p.replace(/[^A-Z0-9]/g, '') === newSymbol.toUpperCase());
                            setSelectedPair(match || newSymbol);
                        }}
                        onAttachScreenshot={(attachment) => {
                            setAttachmentDraft(attachment);
                        }}
                    />
                </div>
            </div>

            {/* Modals */}
            <AssistantModals
                confirmDeleteOpen={confirmDeleteOpen}
                closeDeleteConfirm={closeDeleteConfirm}
                handleConfirmDelete={handleConfirmDelete}
                pendingDeleteItem={pendingDeleteItem}
                historyModalOpen={historyModalOpen}
                setHistoryModalOpen={setHistoryModalOpen}
                loadingHistory={loadingHistory}
                chatHistory={chatHistory}
                selectedChat={selectedChat}
                handleSelectChat={handleSelectChat}
                openDeleteConfirm={openDeleteConfirm}
                getQuestionText={getQuestionText}
                t={t}
            />

            {exportData && (
                <div
                    style={{
                        position: 'absolute',
                        left: '-9999px',
                        top: '-9999px',
                        width: '800px',
                        background: '#0b0f17',
                        zIndex: -1000
                    }}
                >
                    <div ref={exportRef} className={styles.pdfExporting}>
                        <ReportPanel
                            inline
                            fullReport={exportData.fullReport}
                            visualData={exportData.visualData}
                            symbol={exportData.symbol}
                            isLoading={false}
                        />
                    </div>
                </div>
            )}

            <ImagePreviewModal
                attachment={previewAttachment}
                onClose={() => setPreviewAttachment(null)}
            />
        </div>
    );
};

export default AiAssistant;
