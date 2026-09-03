'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from './aiAssistant.module.scss';
import HistoryButton from '@/components/historyButton';
import { toast } from '@/components/toast';
import { fxApi } from '@/lib/api';
import { getStoredUserId } from '@/lib/authSession';
import { syncCreditsAfterAction, notifyCreditsUpdated } from '@/lib/credits';
import { historyDeletes } from '@/lib/historyDeletes';
import ReportPanel from './ReportPanel';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import TradingViewChartPane, { PAIR_GROUPS, ALL_PAIRS, SYMBOL_DATABASE, normalizeSymbol } from './TradingViewChartPane';
import ImagePreviewModal from './ImagePreviewModal';
import ChatMessageList from './components/ChatMessageList';
import ChatInputBar from './components/ChatInputBar';
import AssistantModals from './components/AssistantModals';
import { parseAssistantResponse, buildAssistantMessage } from './utils/chatResponseParser';

const Logo = '/assets/logo/smallLogo.png';

export { PAIR_GROUPS, ALL_PAIRS, SYMBOL_DATABASE, normalizeSymbol };

const AiAssistant = ({ initialTab, initialOpenId } = {}) => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const isDark = theme !== 'light';

    // Authentication & Identification
    const [userId, setUserId] = useState(null);

    // Chat State
    const [chatHistory, setChatHistory] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [selectedPair, setSelectedPair] = useState('XAU/USD');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [attachDropdownOpen, setAttachDropdownOpen] = useState(false);
    const [attachmentDraft, setAttachmentDraft] = useState(null);
    const [previewAttachment, setPreviewAttachment] = useState(null);

    // Loading & Network state
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [pendingRequest, setPendingRequest] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [pendingDeleteItem, setPendingDeleteItem] = useState(null);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);

    // Active Mode Tab State ('deep' | 'news' | 'image' | null)
    const [activeAnalysisMode, setActiveAnalysisMode] = useState(null);

    // Resizable Splitter State (default 46% chat / 54% graph pane)
    const [chatWidthPercent, setChatWidthPercent] = useState(46);
    const [isDragging, setIsDragging] = useState(false);

    // PDF Exporting State
    const [exportData, setExportData] = useState(null);

    // Refs
    const dropdownRef = useRef(null);
    const attachDropdownRef = useRef(null);
    const chatEndRef = useRef(null);
    const exportRef = useRef(null);
    const gridRef = useRef(null);
    const fileInputRef = useRef(null);
    const chartPaneRef = useRef(null);
    const activeRequestIdRef = useRef(null);
    const textareaRef = useRef(null);

    // Quick Action Chip & Mode Tab Handlers
    const handleGenerateFromImageClick = () => {
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
    };

    const handleDeepAnalysisClick = () => {
        setActiveAnalysisMode(prev => prev === 'deep' ? null : 'deep');
        setTimeout(() => textareaRef.current?.focus(), 60);
    };

    const handleMacroNewsClick = () => {
        setActiveAnalysisMode(prev => prev === 'news' ? null : 'news');
        setTimeout(() => textareaRef.current?.focus(), 60);
    };

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
    }, [isDragging]);

    // Fetch user details on mount
    useEffect(() => {
        const syncUserId = () => {
            const id = getStoredUserId();
            if (id) setUserId(id);
        };
        syncUserId();
        window.addEventListener('user:updated', syncUserId);
        return () => window.removeEventListener('user:updated', syncUserId);
    }, []);

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
    }, []);

    // Scroll to bottom on new chat messages
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, pendingRequest]);

    // Fetch history
    const fetchChatHistory = async (uid) => {
        setLoadingHistory(true);
        try {
            const data = await fxApi.getQuestionHistory(uid);
            let historyList = Array.isArray(data) ? data : (data?.data || data?.questions || []);
            historyList = historyList.filter(item => item?.is_delete !== true);
            setChatHistory(historyList);
        } catch (err) {
            console.warn("Could not fetch chat history:", err.message);
            setChatHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (userId) fetchChatHistory(userId);
    }, [userId]);

    // Deep-link support
    useEffect(() => {
        if (!initialOpenId || chatHistory.length === 0) return;
        const matchId = (item, index) =>
            String(item?.id || item?.created_at || item?.createdAt || index) === String(initialOpenId);
        const found = chatHistory.find((it, idx) => matchId(it, idx));
        if (found) handleSelectChat(found);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialOpenId, chatHistory]);

    // Actions
    const handleCreateNew = () => {
        activeRequestIdRef.current = null;
        setPendingRequest(false);
        setHistoryModalOpen(false);
        setSelectedChat(null);
        setCurrentConversationId(null);
        setChatMessages([]);
        setChatInput('');
        setActiveAnalysisMode(null);
        setAttachmentDraft(null);
        setPreviewAttachment(null);
        setChatWidthPercent(35);
        if (typeof window !== 'undefined' && window.history?.replaceState) {
            const url = new URL(window.location.href);
            url.searchParams.delete('open');
            window.history.replaceState({}, '', url.toString());
        }
        [100, 200, 300, 400].forEach((ms) => {
            setTimeout(() => window.dispatchEvent(new Event('resize')), ms);
        });
    };

    const handleSelectChat = async (item) => {
        const convId = item?.id || item?.conversation_id || item?.history_id || item?._id || item?.question_id || item?.uuid;
        setHistoryModalOpen(false);
        setSelectedChat(item);
        setCurrentConversationId(convId || null);
        setChatWidthPercent(60);
        [100, 200, 300, 400].forEach((ms) => {
            setTimeout(() => window.dispatchEvent(new Event('resize')), ms);
        });

        const fallbackFromItem = () => {
            const loaded = [];
            let latestPair = item?.pair || item?.detected_pair || null;

            if (Array.isArray(item?.chats) && item.chats.length > 0) {
                item.chats.forEach((c) => {
                    const q = c.question || c.message || c.input_data || c.prompt;
                    const a = c.response || c.answer || c.output_data || c.output || c.result;
                    const p = c.pair || c.detected_pair || latestPair;
                    if (p) latestPair = p;
                    if (q) loaded.push({ role: 'user', content: q, pair: p || null });
                    if (a) {
                        let res = a;
                        if (typeof res === 'string') { try { res = JSON.parse(res); } catch {} }
                        loaded.push(buildAssistantMessage(parseAssistantResponse(res)));
                    }
                });
            } else if (Array.isArray(item?.messages) && item.messages.length > 0) {
                item.messages.forEach((m) => {
                    const q = m.question || m.message || (m.role === 'user' ? (m.content || m.text) : null);
                    const a = m.answer || m.response || (m.role === 'assistant' ? (m.answer || m.content || m.text) : null);
                    const p = m.pair || m.detected_pair || latestPair;
                    if (p) latestPair = p;
                    if (q) loaded.push({ role: 'user', content: q, pair: p || null });
                    if (a) {
                        let res = a;
                        if (typeof res === 'string') { try { res = JSON.parse(res); } catch {} }
                        loaded.push(buildAssistantMessage(parseAssistantResponse(res)));
                    }
                });
            }

            if (loaded.length === 0) {
                const question = item.question || item.message || item.first_question || item.input_data || item.input || item.prompt || item.title || item.name || getQuestionText(item) || '';
                const rawResponse = item.response || item.answer || item.output_data || item.output || item.result || item.full_report || item.ai_response || item.data || item.text || item.description || null;

                if (question) {
                    loaded.push({ role: 'user', content: question, pair: latestPair || null });
                }
                if (rawResponse) {
                    let resolved = rawResponse;
                    if (typeof resolved === 'string') {
                        try { resolved = JSON.parse(resolved); } catch {}
                    }
                    loaded.push(buildAssistantMessage(parseAssistantResponse(resolved)));
                } else if (question) {
                    loaded.push({ role: 'assistant', content: 'Historical analysis data loaded.' });
                }
            }

            if (loaded.length > 0) {
                setChatMessages(loaded);
            }
            if (latestPair && ALL_PAIRS.includes(latestPair)) {
                setSelectedPair(latestPair);
            }
        };

        if (convId) {
            setPendingRequest(true);
            try {
                const res = await fxApi.getConversationHistory(convId);
                const fullData = res?.data || res;
                const rawMessages = fullData?.messages || fullData?.chats || fullData?.history || fullData?.conversation || fullData?.items || (Array.isArray(fullData?.data) ? fullData.data : (Array.isArray(fullData) ? fullData : []));

                const loadedMessages = [];
                let latestPair = item?.pair || item?.detected_pair || null;

                if (Array.isArray(rawMessages) && rawMessages.length > 0) {
                    rawMessages.forEach((m) => {
                        const userText = m.question || m.message || m.input_data || m.input || m.prompt || m.first_question || m.user_query || (m.role === 'user' ? (m.content || m.text) : null);
                        const ans = m.answer || m.response || m.output_data || m.output || m.result || m.full_report || m.ai_response || (m.role === 'assistant' ? (m.answer || m.content || m.text || m.response) : null);
                        const p = m.pair || m.detected_pair || latestPair;
                        if (p) latestPair = p;

                        if (userText) {
                            loadedMessages.push({
                                role: 'user',
                                content: userText,
                                pair: p || null,
                                timeframe: m.timeframe || null
                            });
                        }

                        if (ans) {
                            let resolved = ans;
                            if (typeof resolved === 'string') {
                                try { resolved = JSON.parse(resolved); } catch {}
                            }
                            const parsed = parseAssistantResponse(resolved);
                            loadedMessages.push(buildAssistantMessage(parsed));
                        } else if (m.role === 'assistant' && (m.content || m.text)) {
                            loadedMessages.push({
                                role: 'assistant',
                                content: m.content || m.text
                            });
                        }
                    });
                }

                if (loadedMessages.length > 0) {
                    setChatMessages(loadedMessages);
                    if (latestPair && ALL_PAIRS.includes(latestPair)) {
                        setSelectedPair(latestPair);
                    }
                } else {
                    fallbackFromItem();
                }
            } catch (err) {
                console.error("Failed to load conversation history:", err);
                fallbackFromItem();
            } finally {
                setPendingRequest(false);
            }
        } else {
            fallbackFromItem();
        }
    };

    const handleSendChatMessage = async () => {
        const text = chatInput.trim();
        const activeAttachment = attachmentDraft;
        const currentMode = activeAnalysisMode;

        if (!text && !activeAttachment && !currentMode) return;

        let userMsgText = text;
        if (!userMsgText) {
            if (currentMode === 'deep') {
                userMsgText = `Deep Market Analysis & Setup for ${selectedPair}`;
            } else if (currentMode === 'news') {
                userMsgText = `Macro News & Catalysts Analysis for ${selectedPair}`;
            } else if (currentMode === 'image') {
                userMsgText = `Technical chart diagnosis for ${selectedPair}`;
            } else {
                userMsgText = `Analyze chart setup for ${selectedPair}`;
            }
        }

        const newUserMsg = {
            role: 'user',
            content: userMsgText,
            pair: selectedPair,
            attachment: activeAttachment ? { ...activeAttachment } : null
        };

        setChatMessages(prev => [...prev, newUserMsg]);
        setChatInput('');
        setAttachmentDraft(null);
        setActiveAnalysisMode(null);
        setPendingRequest(true);

        const requestId = Date.now();
        activeRequestIdRef.current = requestId;

        try {
            const formData = new FormData();
            formData.append('question', userMsgText);
            formData.append('pair', selectedPair);
            if (currentConversationId) {
                formData.append('conversation_id', currentConversationId);
            }

            if (activeAttachment?.url) {
                if (activeAttachment.url.startsWith('data:')) {
                    const resBlob = await fetch(activeAttachment.url);
                    const blob = await resBlob.blob();
                    formData.append('image', blob, activeAttachment.name || 'chart.png');
                } else {
                    formData.append('image_url', activeAttachment.url);
                }
            }

            const rawResp = await fxApi.askQuestion(formData);
            if (activeRequestIdRef.current !== requestId) return;

            const parsed = parseAssistantResponse(rawResp);
            setChatMessages(prev => [...prev, buildAssistantMessage(parsed)]);

            if (userId) {
                syncCreditsAfterAction(userId);
                notifyCreditsUpdated();
            }
            if (rawResp?.conversation_id) {
                setCurrentConversationId(rawResp.conversation_id);
            }
            if (userId) {
                fetchChatHistory(userId);
            }
        } catch (err) {
            if (activeRequestIdRef.current !== requestId) return;
            console.error("AI Assistant request error:", err);
            toast.error(err?.message || 'Failed to process analysis request');
        } finally {
            if (activeRequestIdRef.current === requestId) {
                setPendingRequest(false);
            }
        }
    };

    const handleOptionClick = (optionLabel) => {
        setChatInput(optionLabel);
        setTimeout(() => handleSendChatMessage(), 50);
    };

    const openDeleteConfirm = (e, type, index, item) => {
        e.stopPropagation();
        setPendingDeleteItem({ type, index, item });
        setConfirmDeleteOpen(true);
    };

    const closeDeleteConfirm = () => {
        setPendingDeleteItem(null);
        setConfirmDeleteOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!pendingDeleteItem) return;
        const { item } = pendingDeleteItem;
        const id = item?.id || item?.conversation_id || item?.history_id;
        closeDeleteConfirm();

        if (id) {
            try {
                historyDeletes.add(id);
                await fxApi.deleteQuestionHistory(id);
                setChatHistory(prev => prev.filter(h => (h.id || h.conversation_id || h.history_id) !== id));
                if (currentConversationId === id) {
                    handleCreateNew();
                }
                toast.success('History item deleted');
            } catch (err) {
                console.error("Delete history error:", err);
                toast.error('Failed to delete history item');
            }
        }
    };

    const handleDownloadFullReport = (reportContent, visualData) => {
        setExportData({ fullReport: reportContent, visualData });
    };

    useEffect(() => {
        if (!exportData) return;

        const generatePdf = async () => {
            try {
                toast('Preparing PDF download...');
                const html2pdf = (await import('html2pdf.js')).default;
                await new Promise((resolve) => setTimeout(resolve, 500));

                const element = exportRef.current;
                if (!element) throw new Error("Export element not found");

                const opt = {
                    margin: 15,
                    filename: 'market-analysis-report.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', windowWidth: 800, width: 800 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
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
    }, [exportData]);

    const getQuestionText = (item) => item.title || item.name || item.first_question || item.question || item.message || item.input_data || 'Untitled Conversation';

    return (
        <div className={styles.aiAssistant}>
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
                        handleSendChatMessage={handleSendChatMessage}
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
                        background: '#ffffff',
                        zIndex: -1000
                    }}
                >
                    <div ref={exportRef} className={styles.pdfExporting}>
                        <ReportPanel
                            inline
                            fullReport={exportData.fullReport}
                            visualData={exportData.visualData}
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
