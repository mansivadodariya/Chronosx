'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import styles from '../styles/strategyStudio.module.scss';
import { useStreamingText } from '../utils/streamingRenderer';
import { sanitizeRawJsonText } from '../utils/chatTextFormatter';
import { renderFormattedMarkdown } from '../utils/markdownRenderer';
import { getStoredUser, getStoredUserId, hydrateUserFromProfile } from '@/lib/authSession';
import InteractiveQuestionWizard from './InteractiveQuestionWizard';
import ReadyToProceedCard from './ReadyToProceedCard';
import {
    BotBrainIcon,
    LightningIcon,
    RocketRunIcon,
    ShieldCheckIcon,
    SendPaperAirplaneIcon,
    SlidersTuneIcon,
    LockOutlineIcon,
    ArrowUpIcon,
    CloseXIcon,
    CpuChipIcon,
    SparklesMiniIcon,
    AreaChartIcon,
    HomeBreadcrumbIcon,
    ChevronRightMiniIcon,
    InfoCircleIcon,
    RightArrowSelectedIcon,
    PlusIcon,
    TacticalRouteIcon
} from './StudioIcons';

const STRATEGY_EXPLORE_OPTIONS = [
    'Build a DCA strategy on BTC',
    'Build a grid trading strategy',
    'Backtest my last strategy',
    'Improve my running strategy',
    'Build a momentum strategy from scratch'
];

const EXPLORE_TAGLINES = [
    'Trade with data. Execute with discipline.',
    'Build smarter strategies. Trade with confidence.',
    'Every great trade starts with a clear plan.',
    'Turn your strategy into an intelligent trading bot.',
    'Analyze. Automate. Adapt. Repeat.'
];

const DYNAMIC_LOADING_STAGES = [
    'Formulating quantitative trading blueprint...',
    'Synthesizing indicators & technical signals...',
    'Optimizing entry triggers and risk parameters (SL/TP)...',
    'Compiling algorithmic strategy rules...'
];

const STEP_TITLES = [
    'Market & Timeframe',
    'Strategy Requirements',
    'Risk & Execution',
    'Strategy Blueprint'
];

function getDynamicStepInfo(msg, allMessages, defaultCurrentStep = 2, defaultTotalSteps = 4) {
    if (msg.step_badge) {
        const match = msg.step_badge.match(/Step\s*(\d+)/i);
        const stepNum = match ? parseInt(match[1], 10) : defaultCurrentStep;
        const title = msg.step_title || msg.step_badge.replace(/^Step\s*\d+:\s*/i, '') || STEP_TITLES[stepNum - 1] || 'Strategy Configuration';
        const total = msg.total_steps || defaultTotalSteps;
        const progress = Math.min(100, Math.max(12, Math.round((stepNum / total) * 100)));
        return { stepNum, total, title, badgeText: `Step ${stepNum}: ${title}`, progress };
    }

    if (msg.draft) {
        return {
            stepNum: 4,
            total: 4,
            title: 'Strategy Blueprint Ready',
            badgeText: 'Step 4: Strategy Blueprint Ready',
            progress: 100
        };
    }

    if (msg.current_question?.question_number && msg.current_question?.total_questions) {
        const qNum = msg.current_question.question_number;
        const qTotal = msg.current_question.total_questions;
        const total = 4;
        const stepNum = Math.min(4, Math.max(1, Math.ceil((qNum / qTotal) * 4)));
        const title = msg.step_title || STEP_TITLES[stepNum - 1] || 'Strategy Requirements';
        const progress = Math.min(100, Math.max(15, Math.round((qNum / qTotal) * 100)));
        return { stepNum, total, title, badgeText: `Step ${stepNum}: ${title}`, progress };
    }

    if (msg.step || msg.step_number) {
        const stepNum = parseInt(msg.step || msg.step_number, 10);
        const total = msg.total_steps || defaultTotalSteps;
        const title = msg.step_title || STEP_TITLES[stepNum - 1] || 'Strategy Requirements';
        const progress = Math.min(100, Math.max(15, Math.round((stepNum / total) * 100)));
        return { stepNum, total, title, badgeText: `Step ${stepNum}: ${title}`, progress };
    }

    const aiMessages = (allMessages || []).filter((m) => m.role === 'ai');
    const aiIndex = aiMessages.indexOf(msg);
    const stepNum = Math.min(4, Math.max(1, aiIndex >= 0 ? aiIndex + 1 : defaultCurrentStep));
    const total = 4;
    const title = STEP_TITLES[stepNum - 1] || 'Strategy Requirements';
    const progress = Math.min(100, Math.max(25, Math.round((stepNum / total) * 100)));

    return { stepNum, total, title, badgeText: `Step ${stepNum}: ${title}`, progress };
}

function DynamicChatLoader() {
    const [stageIdx, setStageIdx] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStageIdx((prev) => (prev + 1) % DYNAMIC_LOADING_STAGES.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.dynamicChatLoader}>
            <div className={styles.loaderPulseWrap}>
                <span className={styles.loaderDot} />
                <span className={styles.loaderDot} />
                <span className={styles.loaderDot} />
            </div>
            <span key={stageIdx} className={styles.loaderText}>
                {DYNAMIC_LOADING_STAGES[stageIdx]}
            </span>
        </div>
    );
}

/**
 * StreamingAiBubble — Renders an AI message with fluid character typewriter effect
 */
function StreamingAiBubble({ text, shouldStream, onStreamComplete, onStreamProgress }) {
    const cleanText = useMemo(() => sanitizeRawJsonText(text), [text]);

    const { displayedText, isStreaming, skipToEnd } = useStreamingText(cleanText, {
        msPerChar: 14,
        enabled: shouldStream,
        onComplete: onStreamComplete,
        onProgress: onStreamProgress
    });

    const activeText = shouldStream ? displayedText : cleanText;

    return (
        <div
            className={`${styles.bubble} ${styles.aiBubble}`}
            onClick={isStreaming ? skipToEnd : undefined}
            style={{ cursor: isStreaming ? 'pointer' : 'default' }}
            title={isStreaming ? 'Click to reveal immediately' : undefined}
        >
            {renderFormattedMarkdown(activeText)}
            {isStreaming && <span className={styles.streamingCursorChar}>▌</span>}
        </div>
    );
}

export default function AdvisorChatView({
    messages,
    input,
    setInput,
    onSend,
    onNewChat,
    loading,
    currentDraft,
    onGenerateFromDraft,
    generatingStrategy,
    onChipClick,
    onRunBacktestFromCard,
    marketMode = 'Forex',
    setMarketMode,
    currentStep = 2,
    totalSteps = 4
}) {
    const chatScrollContainerRef = useRef(null);
    const textareaRef = useRef(null);
    const completedStreamsRef = useRef(new Set());
    const [, forceUpdate] = useState(0);

    // Explore / Strategy popup states
    const [isStrategyMenuOpen, setIsStrategyMenuOpen] = useState(false);
    const [isOptionBoxDismissed, setIsOptionBoxDismissed] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (messages.length === 0) {
            completedStreamsRef.current.clear();
            setIsOptionBoxDismissed(false);
            setIsStrategyMenuOpen(false);
        }
    }, [messages.length]);

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

    // Retrieve user's display name
    const userName = useMemo(() => {
        const firstName = user?.first_name || '';
        const lastName = user?.last_name || '';
        const fullName = [firstName, lastName].filter(Boolean).join(' ');
        return fullName || user?.name || user?.full_name || user?.email?.split('@')[0] || 'Trader';
    }, [user]);

    const scrollToBottom = useCallback((smooth = true) => {
        if (chatScrollContainerRef.current) {
            if (smooth) {
                chatScrollContainerRef.current.scrollTo({
                    top: chatScrollContainerRef.current.scrollHeight,
                    behavior: 'smooth'
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
    }, [messages, loading, scrollToBottom]);

    const handleSend = useCallback((textToSend, extraData) => {
        setIsOptionBoxDismissed(true);
        onSend(textToSend, extraData);
    }, [onSend]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !loading) {
                handleSend();
            }
        }
    };

    const isInitialStartingView = messages.length === 0;
    const isLatestAiMessage = messages.length > 0 && messages[messages.length - 1]?.role === 'ai';
    const latestAiMsgIndex = isLatestAiMessage ? messages.length - 1 : -1;
    const latestAiMessage = isLatestAiMessage ? messages[latestAiMsgIndex] : null;

    const latestAiMsgKey = latestAiMsgIndex >= 0
        ? `msg_${latestAiMsgIndex}_${(messages[latestAiMsgIndex].text || '').slice(0, 15)}`
        : null;

    const isLatestAiStreamCompleted = Boolean(
        latestAiMsgKey && completedStreamsRef.current.has(latestAiMsgKey)
    );

    // Rotating Taglines at top of explore screen
    const [taglineIndex, setTaglineIndex] = useState(0);
    const [taglineFading, setTaglineFading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTaglineFading(true);
            setTimeout(() => {
                setTaglineIndex((prev) => (prev + 1) % EXPLORE_TAGLINES.length);
                setTaglineFading(false);
            }, 300);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Render User Message: Format as Image 2 structured Q&A or standard markdown
    const renderUserBubbleContent = (msg) => {
        if (msg.qaList && Array.isArray(msg.qaList) && msg.qaList.length > 0) {
            return (
                <div className={styles.qaListBlock}>
                    {msg.qaList.map((item, idx) => (
                        <div key={idx} className={styles.qaPairItem}>
                            <div className={styles.qaQuestionLabel}>{item.question}</div>
                            <div className={styles.qaAnswerValue}>{item.answer || item.label}</div>
                        </div>
                    ))}
                </div>
            );
        }

        if (typeof msg.text === 'string' && msg.text.includes('\n') && msg.text.includes('?')) {
            const blocks = msg.text.split(/\n\s*\n/);
            const hasStructuredQa = blocks.some((b) => b.includes('?') && b.includes('\n'));
            if (hasStructuredQa) {
                return (
                    <div className={styles.qaListBlock}>
                        {blocks.map((block, bIdx) => {
                            const lines = block.trim().split('\n');
                            if (lines.length >= 2) {
                                const questionLine = lines[0].trim();
                                const answerLine = lines.slice(1).join(' ').trim();
                                return (
                                    <div key={bIdx} className={styles.qaPairItem}>
                                        <div className={styles.qaQuestionLabel}>{questionLine}</div>
                                        <div className={styles.qaAnswerValue}>{answerLine}</div>
                                    </div>
                                );
                            }
                            return <div key={bIdx}>{block}</div>;
                        })}
                    </div>
                );
            }
        }

        return renderFormattedMarkdown(msg.text);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {isInitialStartingView ? (
                /* ── INITIAL EXPLORE HOME SCREEN (IMAGE 1 & 2) ── */
                <div className={styles.studioHomeWrapper}>
                    <div className={styles.exploreHeroArea}>
                        {/* Rotating Tagline Header */}
                        <div className={styles.rotatingTaglineWrap}>
                            <div className={`${styles.taglineText} ${taglineFading ? styles.taglineFadeOut : styles.taglineFadeIn}`}>
                                {EXPLORE_TAGLINES[taglineIndex]}
                            </div>
                        </div>

                        {/* Greeting Hero */}
                        <h1 className={styles.greetingTitleLarge}>
                            Good morning, trader •
                        </h1>
                        <div className={styles.greetingSubName}>
                            {userName}
                        </div>

                        {/* Centered Explore Input Card */}
                        <div className={styles.exploreInputCard}>
                            <textarea
                                className={styles.explorePromptTextarea}
                                placeholder="What would you like to explore?"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={2}
                            />
                            <div className={styles.exploreCardBottom}>
                                <button
                                    type="button"
                                    className={styles.btnNewChat}
                                    onClick={onNewChat}
                                    title="Start a new chat session"
                                >
                                    <PlusIcon size={14} />
                                    <span>New Chat</span>
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.circularSubmitBtn} ${input.trim() ? styles.activeBtn : ''}`}
                                    onClick={onSend}
                                    disabled={loading || !input.trim()}
                                    title="Send Message"
                                >
                                    <ArrowUpIcon size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Category Chips Underneath Input Card */}
                        <div className={styles.categoryChipsRow}>                   
                            <button
                                type="button"
                                className={`${styles.categoryChipBtn} ${isStrategyMenuOpen ? styles.activeChip : ''}`}
                                onClick={() => setIsStrategyMenuOpen((prev) => !prev)}
                            >
                                <CpuChipIcon size={13} color="#18C98B" />
                                <span>Strategy</span>
                            </button>
                        </div>

                        {/* Strategy Options Popup (IMAGE 2) */}
                        {isStrategyMenuOpen && (
                            <div className={styles.strategyMenuPopup}>
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
                                    {STRATEGY_EXPLORE_OPTIONS.map((opt, optIdx) => (
                                        <button
                                            key={optIdx}
                                            type="button"
                                            className={styles.popupOptionItem}
                                            onClick={() => {
                                                setIsStrategyMenuOpen(false);
                                                onChipClick(opt);
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
                /* ── ACTIVE CONVERSATION CHAT VIEW (IMAGE 3) ── */
                <div className={styles.activeChatInnerContainer}>
                    <div className={styles.chatMessagesArea} ref={chatScrollContainerRef}>
                        {messages.map((msg, index) => {
                            const isUser = msg.role === 'user';
                            const isLatestAi = !isUser && index === messages.length - 1;
                            const isFirstAiResponse = !isUser && messages.findIndex((m) => m.role === 'ai') === index;
                            const msgKey = `msg_${index}_${(msg.text || '').slice(0, 15)}`;
                            const hasCompleted = completedStreamsRef.current.has(msgKey);
                            const shouldStream = isLatestAi && !hasCompleted;
                            const showActionOptions = isUser || !isLatestAi || hasCompleted || !shouldStream;

                            return (
                                <React.Fragment key={index}>
                                    {/* Futuristic Circuit Strategy Divider on First AI Message Only */}
                                    {isFirstAiResponse && (
                                        <div className={styles.circuitStrategyDivider}>
                                            <div className={styles.circuitLineLeft}>
                                                <svg className={styles.circuitSvg} viewBox="0 0 160 18" fill="none">
                                                    <path d="M 4 15 L 38 6 L 160 6" stroke="url(#circuitGradGreenLeft)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                                    <circle cx="4" cy="15" r="2.5" fill="#18C98B" />
                                                    <defs>
                                                        <linearGradient id="circuitGradGreenLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                                                            <stop offset="0%" stopColor="#18C98B" stopOpacity="0.8" />
                                                            <stop offset="40%" stopColor="#18C98B" stopOpacity="0.9" />
                                                            <stop offset="100%" stopColor="#18C98B" stopOpacity="1" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                            </div>
                                            <div className={styles.circuitBadge}>
                                                <span>Strategy</span>
                                            </div>
                                            <div className={styles.circuitLineRight}>
                                                <svg className={styles.circuitSvg} viewBox="0 0 160 18" fill="none">
                                                    <path d="M 0 6 L 122 6 L 156 1" stroke="url(#circuitGradGreenRight)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                                    <circle cx="156" cy="1" r="2.5" fill="#18C98B" />
                                                    <defs>
                                                        <linearGradient id="circuitGradGreenRight" x1="0%" y1="0%" x2="100%" y2="0%">
                                                            <stop offset="0%" stopColor="#18C98B" stopOpacity="1" />
                                                            <stop offset="60%" stopColor="#18C98B" stopOpacity="0.9" />
                                                            <stop offset="100%" stopColor="#18C98B" stopOpacity="0.8" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                            </div>
                                        </div>
                                    )}

                                    <div className={`${styles.messageRow} ${isUser ? styles.userRow : ''}`}>
                                        {isUser ? (
                                            <div className={`${styles.bubble} ${styles.userBubble}`}>
                                                {renderUserBubbleContent(msg)}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '86%' }}>
                                                <StreamingAiBubble
                                                    text={msg.text}
                                                    shouldStream={shouldStream}
                                                    onStreamProgress={handleStreamProgress}
                                                    onStreamComplete={() => {
                                                        completedStreamsRef.current.add(msgKey);
                                                        setIsOptionBoxDismissed(false);
                                                        forceUpdate((n) => n + 1);
                                                        setTimeout(() => scrollToBottom(true), 60);
                                                    }}
                                                />

                                                {/* Dynamic Step Indicator Badge */}
                                                {(() => {
                                                    const stepInfo = getDynamicStepInfo(msg, messages, currentStep, totalSteps);
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

                                    {/* Ready to Proceed Card matching Screenshot */}
                                    {showActionOptions && !isUser && msg.draft && (
                                        <ReadyToProceedCard
                                            draft={msg.draft}
                                            onCreateStrategy={(name) => onGenerateFromDraft(msg.draft, name)}
                                            onEnhance={(name) => onSend(`Enhance and optimize strategy rules for ${name}`)}
                                            onModifyStrategy={(name) => onSend(`Modify strategy parameters for ${name}`)}
                                            generatingStrategy={generatingStrategy}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}

                        {/* Active Strategy Generation Stepper Card (Screenshot Bottom) */}
                        {generatingStrategy && (
                            <div className={styles.messageRow}>
                                <ReadyToProceedCard generatingStrategy={true} />
                            </div>
                        )}

                        {loading && !generatingStrategy && (                            <div className={styles.messageRow}>
                                <DynamicChatLoader />
                            </div>
                        )}
                    </div>

                    {/* ── BOTTOM CHAT BAR WITH DOCKED INTERACTIVE QUESTION WIZARD (IMAGE 1 & 2) ── */}
                    <div className={styles.bottomChatInputBar}>
                        {/* Interactive Step-by-Step Question Wizard Docked Above Input Field */}
                        {!isOptionBoxDismissed && !loading && isLatestAiMessage && isLatestAiStreamCompleted && (
                            <InteractiveQuestionWizard
                                latestAiMessage={latestAiMessage}
                                messages={messages}
                                onComplete={(summaryText, qaList) => {
                                    handleSend(summaryText, { qaList });
                                }}
                                onDismiss={() => setIsOptionBoxDismissed(true)}
                                loading={loading}
                            />
                        )}

                        {/* Bottom Textarea + Send Button (Card Layout Matching Image 2) */}
                        <div className={styles.chatInputWrapper}>
                            <textarea
                                ref={textareaRef}
                                className={styles.chatTextarea}
                                placeholder="What would you like to explore?"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={2}
                            />
                            <div className={styles.chatCardBottom}>
                                <button
                                    type="button"
                                    className={styles.btnNewChat}
                                    onClick={onNewChat}
                                    title="Start a new chat session"
                                >
                                    <PlusIcon size={14} />
                                    <span>New Chat</span>
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.circularSubmitBtn} ${input.trim() ? styles.activeBtn : ''}`}
                                    onClick={() => handleSend()}
                                    disabled={loading || !input.trim()}
                                    title="Send Message"
                                >
                                    <ArrowUpIcon size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
