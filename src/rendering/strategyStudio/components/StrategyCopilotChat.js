'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import styles from '../styles/strategyStudio.module.scss';
import StudioComposerCard from './StudioComposerCard';
import {
    ClockIntervalIcon,
    CpuChipIcon,
    SparklesMiniIcon,
    CloseXIcon,
    EditPencilIcon,
    RocketRunIcon,
    InfoCircleIcon,
} from './StudioIcons';
import InteractiveQuestionWizard from './InteractiveQuestionWizard';
import { getDynamicStepInfo } from '../utils/chatUiHelpers';
import { getStoredUser, getStoredUserId, hydrateUserFromProfile } from '@/lib/authSession';
import { useLanguage } from '@/context/LanguageContext';
import { fetchIndicatorsFromSupabase, getStrategyExploreSuggestions } from '@/lib/indicatorsData';
import { renderFormattedMarkdown } from '../utils/markdownRenderer';
import { useStreamingText } from '../utils/streamingRenderer';
import StrategyBacktestCard from './StrategyBacktestCard';
import StrategySpecCard from './StrategySpecCard';
import WhatToIncludePopup from './WhatToIncludePopup';
import { useReducedMotion } from '@/hooks/useReducedMotion';

import { StreamingAiBubble, CircuitStrategyDivider, DynamicThinkingLoader, InteractiveErrorBubble } from './StudioChatBubbles';
import { categorizeChatError } from '../utils/strategyApi';

const EXPLORE_TAGLINES = [
    'Start with a message, ChronosX takes it from there',
    'Trade with data. Execute with discipline.',
    'Build smarter strategies. Trade with confidence.',
    'Every great trade starts with a clear plan.',
    'Turn your strategy into an intelligent trading bot.',
    'Analyze. Automate. Adapt. Repeat.'
];

export default function StrategyCopilotChat({
    messages = [],
    inputState,
    ctaButtons = [],
    busy = false,
    resp = null,
    metadata = null,
    indIndex = {},
    formErrors = [],
    result = null,
    onSaveDraft,
    onSendMessage,
    onRetryMessage,
    onRunBacktest,
    onOpenHistory,
    onNewChat,
    onOpenModifyForm,
    isEditingForm = false,
}) {
    const { t } = useLanguage();
    const prefersReducedMotion = useReducedMotion();

    const [inputValue, setInputValue] = useState('');
    const [isStrategyMenuOpen, setIsStrategyMenuOpen] = useState(false);
    const [isWhatToIncludeOpen, setIsWhatToIncludeOpen] = useState(false);
    const [isOptionBoxDismissed, setIsOptionBoxDismissed] = useState(false);
    const [user, setUser] = useState(null);
    const [dynamicOptions, setDynamicOptions] = useState(() => getStrategyExploreSuggestions());
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

    const strategyMenuRef = useRef(null);

    // Reset wizard dismissal when a new AI message arrives
    useEffect(() => {
        if (messages.length === 0) {
            completedStreamsRef.current.clear();
            setIsOptionBoxDismissed(false);
        } else {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg?.role === 'ai') {
                setIsOptionBoxDismissed(false);
            }
        }
    }, [messages]);

    // Close Strategy dropdown when clicking outside
    useEffect(() => {
        if (!isStrategyMenuOpen) return;

        const handleClickOutside = (e) => {
            if (strategyMenuRef.current && !strategyMenuRef.current.contains(e.target)) {
                if (e.target.closest && e.target.closest(`.${styles.categoryChipsRow}`)) {
                    return;
                }
                setIsStrategyMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isStrategyMenuOpen]);

    const handleAppendPromptText = useCallback((sentence) => {
        setInputValue((prev) => {
            const trimmed = (prev || '').trim();
            if (!trimmed) return sentence;
            const endsWithPunct = /[.!?]$/.test(trimmed);
            return `${trimmed}${endsWithPunct ? '' : '.'} ${sentence}`;
        });
    }, []);

    const chatScrollContainerRef = useRef(null);
    const completedStreamsRef = useRef(new Set());
    const [, forceUpdate] = useState(0);

    // Load indicators for explore recommendations
    useEffect(() => {
        let isMounted = true;
        fetchIndicatorsFromSupabase()
            .then((indicators) => {
                if (isMounted && indicators) {
                    setDynamicOptions(getStrategyExploreSuggestions(indicators));
                }
            })
            .catch(() => {});
        return () => {
            isMounted = false;
        };
    }, []);

    // Load user auth session
    useEffect(() => {
        async function loadUser() {
            const stored = getStoredUser();
            if (stored) setUser(stored);

            const uid = getStoredUserId();
            if (uid && (!stored?.first_name && !stored?.last_name && !stored?.name)) {
                const hydrated = await hydrateUserFromProfile(uid, stored);
                if (hydrated) setUser(hydrated);
            }
        }
        loadUser();

        window.addEventListener('user:updated', loadUser);
        return () => window.removeEventListener('user:updated', loadUser);
    }, []);

    // User's display name
    const userName = useMemo(() => {
        const firstName = user?.first_name || '';
        const lastName = user?.last_name || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ');
        return fullName || user?.name || user?.full_name || user?.email?.split('@')[0] || 'Trader';
    }, [user]);

    // Dynamic greeting based on time of day
    const dynamicGreeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            return t('strategyStudio.greetingMorning', 'Good morning, trader');
        }
        if (hour >= 12 && hour < 17) {
            return t('strategyStudio.greetingAfternoon', 'Good afternoon, trader');
        }
        return t('strategyStudio.greetingEvening', 'Good evening, trader');
    }, [t]);

    // Rotating Taglines at top of explore screen - Disabled for reduced motion
    const [taglineIndex, setTaglineIndex] = useState(0);
    const [taglineFading, setTaglineFading] = useState(false);

    useEffect(() => {
        // Skip rotation entirely if user prefers reduced motion
        if (prefersReducedMotion) return;

        const interval = setInterval(() => {
            setTaglineFading(true);
            setTimeout(() => {
                setTaglineIndex((prev) => (prev + 1) % EXPLORE_TAGLINES.length);
                setTaglineFading(false);
            }, 300);
        }, 5000);
        return () => clearInterval(interval);
    }, [prefersReducedMotion]);

    // Suggestions as user types
    const typedSuggestions = useMemo(() => {
        const trimmed = (inputValue || '').trim().toLowerCase();
        if (!trimmed) return [];
        return dynamicOptions
            .filter((opt) => {
                const optLower = opt.toLowerCase();
                return optLower.includes(trimmed) && optLower !== trimmed;
            })
            .slice(0, 5);
    }, [inputValue, dynamicOptions]);

    const showTypedSuggestions = typedSuggestions.length > 0;

    // Auto-scroll chat to bottom
    const scrollToBottom = useCallback((smooth = true) => {
        if (chatScrollContainerRef.current) {
            if (smooth) {
                chatScrollContainerRef.current.scrollTo({
                    top: chatScrollContainerRef.current.scrollHeight,
                    behavior: 'smooth',
                });
            } else {
                chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
            }
        }
    }, []);

    const handleStreamProgress = useCallback(() => {
        if (chatScrollContainerRef.current) {
            chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        scrollToBottom(true);
    }, [messages, busy, scrollToBottom]);

    const isLatestAiMessage = messages.length > 0 && messages[messages.length - 1]?.role === 'ai';
    const latestAiMsgIndex = isLatestAiMessage ? messages.length - 1 : -1;
    const rawLatestAiMsg = isLatestAiMessage ? messages[latestAiMsgIndex] : null;

    const latestAiMessage = useMemo(() => {
        if (!rawLatestAiMsg) return null;
        return {
            ...resp,
            ...rawLatestAiMsg,
            questions: rawLatestAiMsg.questions || resp?.questions,
            options: rawLatestAiMsg.options || resp?.options,
            cta_buttons: rawLatestAiMsg.cta_buttons || resp?.cta_buttons || ctaButtons,
            ctaButtons: rawLatestAiMsg.ctaButtons || resp?.cta_buttons || ctaButtons,
            current_question: rawLatestAiMsg.current_question || resp?.current_question,
            step: rawLatestAiMsg.step || resp?.step,
            step_title: rawLatestAiMsg.step_title || resp?.step_title,
            step_badge: rawLatestAiMsg.step_badge || resp?.step_badge,
            total_steps: rawLatestAiMsg.total_steps || resp?.total_steps,
        };
    }, [rawLatestAiMsg, resp, ctaButtons]);

    const latestAiMsgKey = latestAiMsgIndex >= 0
        ? `msg_${latestAiMsgIndex}_${(messages[latestAiMsgIndex].text || '').slice(0, 15)}`
        : null;

    const isLatestAiStreamCompleted = Boolean(
        !latestAiMsgKey || completedStreamsRef.current.has(latestAiMsgKey) || rawLatestAiMsg?.fromHistory
    );

    const handleSend = (textToSend, extra = {}) => {
        const trimmed = (typeof textToSend === 'string' ? textToSend : inputValue || '').trim();
        if (!trimmed || busy) return;
        onSendMessage(trimmed, extra);
        setInputValue('');
    };

    const handleKeyDown = (e) => {
        if (showTypedSuggestions && typedSuggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestionIndex((prev) => (prev + 1) % typedSuggestions.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestionIndex((prev) => (prev - 1 + typedSuggestions.length) % typedSuggestions.length);
                return;
            }
            if (e.key === 'Tab') {
                e.preventDefault();
                const chosen = typedSuggestions[activeSuggestionIndex] || typedSuggestions[0];
                if (chosen) {
                    setInputValue(chosen);
                    setActiveSuggestionIndex(0);
                }
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                setActiveSuggestionIndex(0);
                return;
            }
        }
    };

    const isInitialStartingView = messages.length === 0;
    const placeholderText =
        inputState?.placeholder || t('strategyStudio.inputPlaceholder', 'What would you like to explore?');
    const summary = resp?.strategy_summary;
    const isReady = resp?.stage === 'review';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative' }}>
            {/* ── TOP RIGHT HEADER ACTIONS (History button matching original ChronosX UI) ── */}
            <div className={styles.advisorChatTopHeader}>
                <div className={styles.advisorChatTopRight}>
                    {/* New Chat Button in header when active in chat */}
                    {!isInitialStartingView && onNewChat && (
                        <button
                            type="button"
                            className={styles.btnHistory}
                            onClick={onNewChat}
                            title="Start new conversation"
                            style={{ marginRight: '6px' }}
                        >
                            <span>New Chat</span>
                        </button>
                    )}

                    {onOpenHistory && (
                        <button
                            type="button"
                            className={styles.btnHistory}
                            onClick={onOpenHistory}
                            title="View chat history"
                        >
                            <ClockIntervalIcon size={15} color="#18C98B" />
                            <span>{t('strategyStudio.history', 'History')}</span>
                        </button>
                    )}
                </div>
            </div>

            {isInitialStartingView ? (
                /* ── INITIAL EXPLORE HOME SCREEN (EXACT PREVIOUS LOOK) ── */
                <div className={styles.studioHomeWrapper}>
                    <div className={`${styles.exploreHeroArea} ${(isWhatToIncludeOpen || isStrategyMenuOpen) ? styles.exploreHeroAreaWithPopup : ''}`}>
                        {/* Rotating Tagline Header */}
                        <div className={styles.rotatingTaglineWrap}>
                            <div className={`${styles.taglineText} ${taglineFading ? styles.taglineFadeOut : styles.taglineFadeIn}`}>
                                {EXPLORE_TAGLINES[taglineIndex]}
                            </div>
                        </div>

                        {/* Greeting Hero */}
                        <h1 className={styles.greetingTitleLarge}>
                            {dynamicGreeting}
                        </h1>
                        <div className={styles.greetingSubName}>
                            {userName}
                        </div>

                        {/* Centered Explore Input Card */}
                        <StudioComposerCard
                            isExploreMode={true}
                            input={inputValue}
                            setInput={setInputValue}
                            placeholder={placeholderText}
                            onSend={handleSend}
                            loading={busy}
                            onNewChat={null}
                            typedSuggestions={typedSuggestions}
                            showTypedSuggestions={showTypedSuggestions}
                            activeSuggestionIndex={activeSuggestionIndex}
                            setActiveSuggestionIndex={setActiveSuggestionIndex}
                            onKeyDown={handleKeyDown}
                            t={t}
                        />

                        {/* Category Chips Underneath Input Card */}
                        <div className={styles.categoryChipsRow}>
                            <button
                                type="button"
                                className={`${styles.categoryChipBtn} ${isWhatToIncludeOpen ? styles.activeChip : ''}`}
                                onClick={() => {
                                    setIsWhatToIncludeOpen((prev) => !prev);
                                    setIsStrategyMenuOpen(false);
                                }}
                            >
                                <SparklesMiniIcon size={13} color="#18C98B" />
                                <span>What to include</span>
                            </button>
                            <button
                                type="button"
                                className={`${styles.categoryChipBtn} ${isStrategyMenuOpen ? styles.activeChip : ''}`}
                                onClick={() => {
                                    setIsStrategyMenuOpen((prev) => !prev);
                                    setIsWhatToIncludeOpen(false);
                                }}
                            >
                                <CpuChipIcon size={13} color="#18C98B" />
                                <span>Strategy</span>
                            </button>
                        </div>

                        {/* What to Include Question & Suggestion Popup */}
                        <WhatToIncludePopup
                            isOpen={isWhatToIncludeOpen}
                            onClose={() => setIsWhatToIncludeOpen(false)}
                            onAppendText={handleAppendPromptText}
                        />

                        {/* Strategy Options Popup */}
                        {isStrategyMenuOpen && (
                            <div ref={strategyMenuRef} className={styles.strategyMenuPopup}>
                                <div className={styles.popupHeader}>
                                    <div className={styles.popupHeaderTitle}>
                                        <CpuChipIcon size={15} color="#18C98B" />
                                        <span>Strategy</span>
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.popupCloseBtn}
                                        onClick={() => setIsStrategyMenuOpen(false)}
                                        title="Close"
                                    >
                                        <CloseXIcon size={14} />
                                    </button>
                                </div>
                                <div className={styles.popupOptionsList}>
                                    {dynamicOptions.map((opt, optIdx) => (
                                        <button
                                            key={optIdx}
                                            type="button"
                                            className={styles.popupOptionItem}
                                            onClick={() => {
                                                setIsStrategyMenuOpen(false);
                                                setInputValue(opt);
                                            }}
                                        >
                                            <SparklesMiniIcon size={14} color="#18C98B" />
                                            <span>{opt}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* ── ACTIVE CONVERSATION CHAT VIEW ── */
                <div className={styles.activeChatInnerContainer}>
                    <div className={styles.chatMessagesArea} ref={chatScrollContainerRef}>
                        {messages.map((msg, index) => {
                            const isUser = msg.role === 'user';
                            const isLatestAi = !isUser && index === messages.length - 1;
                            const isFirstAiResponse = !isUser && messages.findIndex((m) => m.role === 'ai') === index;
                            const msgKey = `msg_${index}_${(msg.text || '').slice(0, 15)}`;
                            const hasCompleted = completedStreamsRef.current.has(msgKey);
                            const shouldStream = isLatestAi && !hasCompleted && !msg.fromHistory;

                            if (msg.role === 'error' || msg.errorType || (msg.role === 'sys' && /error|failed to fetch|credit|unreachable|unavailable/i.test(msg.text))) {
                                const errorData = msg.errorType ? msg : {
                                    ...msg,
                                    ...categorizeChatError(msg.text, 0),
                                    retryPayload: msg.retryPayload || { userText: messages[index - 1]?.text, payload: { message: messages[index - 1]?.text } },
                                };
                                return (
                                    <div key={msg.id || index} className={styles.messageRow}>
                                        <InteractiveErrorBubble
                                            error={errorData}
                                            onRetry={onRetryMessage}
                                            isRetrying={busy}
                                        />
                                    </div>
                                );
                            }

                            if (msg.role === 'sys') {
                                return (
                                    <div key={msg.id || index} className={styles.messageRow} style={{ justifyContent: 'center' }}>
                                        <div className={styles.msgSys}>{msg.text}</div>
                                    </div>
                                );
                            }

                            if (msg.isThinking || (typeof msg.text === 'string' && msg.text.trim().toLowerCase().startsWith('thinking'))) {
                                return null;
                            }

                            return (
                                <React.Fragment key={msg.id || index}>
                                    {/* Circuit Strategy Divider on First AI Response */}
                                    {isFirstAiResponse && <CircuitStrategyDivider />}

                                    <div className={`${styles.messageRow} ${isUser ? styles.userRow : ''}`}>
                                        {isUser ? (
                                            <div className={`${styles.bubble} ${styles.userBubble}`}>
                                                {msg.qaList && Array.isArray(msg.qaList) && msg.qaList.length > 0 ? (
                                                    <div className={styles.qaListBlock}>
                                                        {msg.qaList.map((item, qIdx) => (
                                                            <div key={qIdx} className={styles.qaPairItem}>
                                                                <div className={styles.qaQuestionLabel}>{item.question}</div>
                                                                <div className={styles.qaAnswerValue}>{item.answer || item.label}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    renderFormattedMarkdown(msg.text)
                                                )}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '86%' }}>
                                                <StreamingAiBubble
                                                    text={msg.text}
                                                    shouldStream={shouldStream}
                                                    onStreamProgress={handleStreamProgress}
                                                    onStreamComplete={() => {
                                                        completedStreamsRef.current.add(msgKey);
                                                        forceUpdate((n) => n + 1);
                                                        setTimeout(() => scrollToBottom(true), 60);
                                                    }}
                                                />
                                                {(() => {
                                                    const stepInfo = getDynamicStepInfo(msg, messages);
                                                    if (!stepInfo) return null;
                                                    return (
                                                        <div className={styles.stepIndicatorPill}>
                                                            <div className={styles.stepIndicatorLeft}>
                                                                <span className={styles.stepMiniDot} />
                                                                <span>{stepInfo.badgeText}</span>
                                                            </div>
                                                            <div className={styles.stepMiniBar}>
                                                                <span style={{ width: `${stepInfo.progress}%` }} />
                                                            </div>
                                                            <div className={styles.stepIndicatorRight}>
                                                                <span title={`Step ${stepInfo.stepNum} of ${stepInfo.total} (${stepInfo.progress}% completed)`}>
                                                                    <InfoCircleIcon size={13} color="#94A3B8" />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                </React.Fragment>
                            );
                        })}

                        {/* Transient Dynamic Thinking Loader (Transparent background & rotating quantitative stages) */}
                        {busy && (
                            <div className={styles.messageRow}>
                                <DynamicThinkingLoader />
                            </div>
                        )}

                        {/* In-Chat Strategy Draft Specification Card with Dynamic JSON Viewer */}
                        {Boolean(resp?.json_fulfilled) && (
                            <div className={styles.messageRow} style={{ marginTop: '8px' }}>
                                <StrategySpecCard
                                    strategy={resp?.strategy}
                                    summary={summary}
                                    onOpenModifyForm={onOpenModifyForm}
                                    onRunBacktest={onRunBacktest}
                                    busy={busy}
                                    isFormOpen={isEditingForm}
                                />
                            </div>
                        )}

                        {/* Backtest Results in Continued Chat */}
                        {result && (
                            <div className={styles.messageRow} style={{ marginTop: '10px' }}>
                                <div style={{ width: '100%' }}>
                                    <StrategyBacktestCard result={result} />
                                </div>
                            </div>
                        )}

                    </div>

                    {/* ── BOTTOM DOCKED COMPOSER BAR WITH INTERACTIVE QUESTION WIZARD ── */}
                    <div className={styles.bottomChatInputBar}>
                        {!isOptionBoxDismissed && !busy && isLatestAiStreamCompleted && (
                            <InteractiveQuestionWizard
                                latestAiMessage={latestAiMessage}
                                messages={messages}
                                onComplete={(summaryText, qaList) => {
                                    handleSend(summaryText, { qaList });
                                }}
                                onDismiss={() => setIsOptionBoxDismissed(true)}
                                loading={busy}
                            />
                        )}
                        <StudioComposerCard
                            isExploreMode={false}
                            input={inputValue}
                            setInput={setInputValue}
                            placeholder={placeholderText}
                            onSend={handleSend}
                            loading={busy}
                            onNewChat={onNewChat}
                            typedSuggestions={typedSuggestions}
                            showTypedSuggestions={showTypedSuggestions}
                            activeSuggestionIndex={activeSuggestionIndex}
                            setActiveSuggestionIndex={setActiveSuggestionIndex}
                            onKeyDown={handleKeyDown}
                            t={t}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
