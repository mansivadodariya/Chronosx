'use client';

import React from 'react';
import styles from '../styles/strategyStudio.module.scss';
import BacktestResultsView from './BacktestResultsView';
import {
    LightningIcon,
    RefreshResetIcon,
    ArrowUpIcon,
    ArrowLeftBackIcon,
    PlayBacktestIcon
} from './StudioIcons';

export default function AiChatStreamView({
    chatContainerRef,
    chatScrollRef,
    messages,
    advisorLoading,
    currentDraft,
    symbol,
    interval,
    capital,
    results,
    roundTrips,
    generatingStrategy,
    simulationLoading,
    chatInput,
    setChatInput,
    onSendMessage,
    onGenerateStrategy,
    onRunBacktest,
    onResetSession,
    onBackToExplore
}) {
    return (
        <div 
            ref={chatContainerRef}
            className={styles.tradezeeChatViewContainer}
            data-lenis-prevent="true"
            onWheel={(e) => {
                if (chatScrollRef.current) {
                    chatScrollRef.current.scrollTop += e.deltaY;
                }
            }}
        >
            {/* Chat Stream Messages Area */}
            <div 
                className={styles.tradezeeChatScrollArea} 
                ref={chatScrollRef}
                data-lenis-prevent="true"
            >
                <div className={styles.tradezeeChatStream} data-lenis-prevent="true">
                    {messages.map((msg, idx) => (
                        <React.Fragment key={idx}>
                            {msg.role === 'user' ? (
                                <div className={styles.chatUserRow}>
                                    <div className={styles.chatUserBubble}>{msg.text}</div>
                                </div>
                            ) : (
                                <div className={styles.chatAiRow}>
                                    <div className={styles.chatAiContentWrap}>
                                        <div className={styles.chatAiBubble}>{msg.text}</div>

                                        {/* Suggestion Chips */}
                                        {msg.suggestions && msg.suggestions.length > 0 && (
                                            <div className={styles.chatSuggestionChipsRow}>
                                                {msg.suggestions.map((sug, sIdx) => (
                                                    <button
                                                        key={sIdx}
                                                        type="button"
                                                        className={styles.chatSuggestionChip}
                                                        onClick={() => onSendMessage(sug)}
                                                    >
                                                        {sug}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Strategy Blueprint Card */}
                                        {(msg.draft || currentDraft) && (
                                            <div className={styles.chatBlueprintCard}>
                                                <div className={styles.chatBlueprintHeader}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <LightningIcon size={14} color="#18C98B" />
                                                        <span>Strategy Blueprint Ready</span>
                                                    </div>
                                                    <span style={{ fontSize: '11px', color: '#18C98B', fontWeight: '600' }}>Validated</span>
                                                </div>

                                                <div className={styles.chatBlueprintParams}>
                                                    <div className={styles.chatBlueprintParamBadge}>
                                                        Asset: <strong>{msg.draft?.instrument || currentDraft?.instrument || symbol}</strong>
                                                    </div>
                                                    <div className={styles.chatBlueprintParamBadge}>
                                                        Interval: <strong>{msg.draft?.timeframe || currentDraft?.timeframe || interval}</strong>
                                                    </div>
                                                    <div className={styles.chatBlueprintParamBadge}>
                                                        Pattern: <strong>{msg.draft?.pattern || currentDraft?.pattern || 'Donchian Breakout'}</strong>
                                                    </div>
                                                    <div className={styles.chatBlueprintParamBadge}>
                                                        TP: <strong>{msg.draft?.target_pips || currentDraft?.target_pips || 50} pts</strong>
                                                    </div>
                                                    <div className={styles.chatBlueprintParamBadge}>
                                                        SL: <strong>{msg.draft?.stoploss_pips || currentDraft?.stoploss_pips || 25} pts</strong>
                                                    </div>
                                                </div>

                                                <div className={styles.chatBlueprintActions}>
                                                    <button
                                                        type="button"
                                                        className={styles.btnChatBlueprintPrimary}
                                                        onClick={() => onGenerateStrategy(msg.draft || currentDraft)}
                                                        disabled={generatingStrategy}
                                                    >
                                                        <LightningIcon size={13} color="#040605" />
                                                        <span>{generatingStrategy ? 'Generating JSON...' : 'Generate Strategy JSON'}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={styles.btnChatBlueprintSecondary}
                                                        onClick={() => onRunBacktest()}
                                                        disabled={simulationLoading}
                                                    >
                                                        <PlayBacktestIcon size={13} color="#18C98B" />
                                                        <span>{simulationLoading ? 'Simulating...' : 'Run Backtest Now'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}

                    {advisorLoading && (
                        <div className={styles.chatAiRow}>
                            <div className={styles.chatLoadingBubble}>
                                <span className={styles.typingDot} />
                                <span className={styles.typingDot} />
                                <span className={styles.typingDot} />
                            </div>
                        </div>
                    )}

                    {/* Backtest Simulation Results */}
                    {results && roundTrips.length > 0 && (
                        <div style={{ marginTop: '16px', width: '100%' }}>
                            <BacktestResultsView
                                results={results}
                                roundTrips={roundTrips}
                                initialCapital={capital}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Pinned Bottom Floating Glass Input Bar */}
            <div 
                className={styles.tradezeeChatBottomBar}
                data-lenis-prevent="true"
                onWheel={(e) => {
                    if (chatScrollRef.current) {
                        chatScrollRef.current.scrollTop += e.deltaY;
                    }
                }}
            >
                <div className={styles.tradezeeChatBottomCard} data-lenis-prevent="true">
                    <textarea
                        className={styles.inputPromptTextarea}
                        placeholder="Describe your strategy idea (e.g., Donchian on XAUUSD, EMA Crossover)..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSendMessage();
                            }
                        }}
                        rows={1}
                    />
                    <div className={styles.cardBottomActions}>
                        <div className={styles.cardBottomActionsLeft}>
                            <button
                                type="button"
                                className={styles.btnBottomAction}
                                onClick={onBackToExplore}
                                title="Back to Explore"
                            >
                                <ArrowLeftBackIcon size={12} />
                                <span>Explore</span>
                            </button>
                            <button
                                type="button"
                                className={styles.btnBottomAction}
                                onClick={onResetSession}
                                title="New Chat"
                            >
                                <RefreshResetIcon size={12} />
                                <span>New Chat</span>
                            </button>
                        </div>
                        <button
                            type="button"
                            className={`${styles.circleSendButton} ${chatInput.trim() ? styles.hasValue : ''}`}
                            onClick={() => onSendMessage()}
                            title="Send Message"
                        >
                            <ArrowUpIcon size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
