'use client';

import React, { useRef, useEffect } from 'react';
import styles from '../styles/strategyStudio.module.scss';
import {
    BotBrainIcon,
    LightningIcon,
    RocketRunIcon,
    ShieldCheckIcon,
    SendPaperAirplaneIcon,
    ChartTrendIcon,
    SlidersTuneIcon
} from './StudioIcons';

const STRATEGY_STARTERS = [
    {
        id: 'donchian',
        title: 'Donchian Breakout Model',
        desc: 'Multi-timeframe channel high/low breakout with ATR trailing stoploss rules.',
        icon: <ChartTrendIcon size={16} />,
        prompt: 'Design a trend following Donchian channel breakout strategy on XAUUSD 15min with ATR risk management.'
    },
    {
        id: 'ema-cross',
        title: 'EMA 20/50 Trend Confluence',
        desc: 'Exponential moving average crossovers with RSI volume filter & pullback entries.',
        icon: <SlidersTuneIcon size={16} />,
        prompt: 'Create an EMA 20 and 50 crossover strategy on EURUSD with RSI confirmation and 1:2 risk reward.'
    },
    {
        id: 'bollinger',
        title: 'Bollinger Mean Reversion',
        desc: 'Standard deviation envelope rejection & oversold/overbought bounce signals.',
        icon: <LightningIcon size={16} />,
        prompt: 'Build a Bollinger Bands mean reversion setup for BTCUSD scalping with strict stop losses.'
    },
    {
        id: 'liquidity',
        title: 'Liquidity Sweep & ICT Scalp',
        desc: 'Institutional order block absorption & tight risk:reward session breakout setups.',
        icon: <BotBrainIcon size={16} />,
        prompt: 'Formulate an institutional liquidity sweep strategy with order blocks and breakout validation on GBPUSD.'
    }
];

export default function AdvisorChatView({
    messages,
    input,
    setInput,
    onSend,
    loading,
    currentDraft,
    onGenerateFromDraft,
    generatingStrategy,
    onChipClick,
    onRunBacktestFromCard
}) {
    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    const isInitialStartingView = messages.length <= 1;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <div className={styles.chatMessagesArea}>
                {isInitialStartingView ? (
                    <div className={styles.welcomeStarterWrap}>
                        <div className={styles.welcomeHero}>
                            <h2>
                                What strategy do you want to <span className={styles.titleLime}>build?</span>
                            </h2>
                            <p>Select a quantitative model archetype or describe your trading hypothesis below</p>
                        </div>

                        <div className={styles.welcomeCardsGrid}>
                            {STRATEGY_STARTERS.map((starter) => (
                                <button
                                    key={starter.id}
                                    type="button"
                                    className={styles.starterCard}
                                    onClick={() => onChipClick(starter.prompt)}
                                >
                                    <div className={styles.cardIconWrap}>
                                        {starter.icon}
                                    </div>
                                    <div className={styles.cardTextWrap}>
                                        <span className={styles.cardTitle}>{starter.title}</span>
                                        <span className={styles.cardSubtitle}>{starter.desc}</span>
                                    </div>
                                    <div className={styles.cardArrow}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m9 18 6-6-6-6" />
                                        </svg>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className={styles.chipsContainer} style={{ marginLeft: 0, marginTop: 4 }}>
                            {['Trend Following', 'Donchian Breakout', 'EMA Crossover', 'Bollinger Breakout', 'Scalping'].map((chip, chipIdx) => (
                                <button
                                    key={chipIdx}
                                    type="button"
                                    className={styles.chipBtn}
                                    onClick={() => onChipClick(chip)}
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isUser = msg.role === 'user';
                        return (
                            <React.Fragment key={index}>
                                <div className={`${styles.messageRow} ${isUser ? styles.userRow : ''}`}>
                                    <div className={`${styles.avatar} ${isUser ? styles.userAvatar : styles.aiAvatar}`}>
                                        {isUser ? 'Y' : <BotBrainIcon size={14} color="#040605" />}
                                    </div>
                                    <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.aiBubble}`}>
                                        {msg.text}
                                    </div>
                                </div>

                                {/* Suggestions Chips Row */}
                                {!isUser && msg.suggestions?.length > 0 && (
                                    <div className={styles.chipsContainer}>
                                        {msg.suggestions.map((chip, chipIdx) => (
                                            <button
                                                key={chipIdx}
                                                type="button"
                                                className={`${styles.chipBtn} ${index < messages.length - 1 ? styles.disabledChip : ''}`}
                                                onClick={() => onChipClick(chip)}
                                            >
                                                {chip}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Blueprint Draft Card if present */}
                                {!isUser && msg.draft && (
                                    <div className={styles.draftCard}>
                                        <div className={styles.draftHeader}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <ShieldCheckIcon size={16} color="#18C98B" />
                                                <span>Strategy Blueprint Ready</span>
                                            </div>
                                            <span className={styles.panelBadge}>Validated</span>
                                        </div>
                                        <div className={styles.draftBadgesGrid}>
                                            <div className={styles.draftBadge}>
                                                Asset: <strong>{msg.draft.instrument || 'XAUUSD'}</strong>
                                            </div>
                                            <div className={styles.draftBadge}>
                                                Interval: <strong>{msg.draft.timeframe || '15min'}</strong>
                                            </div>
                                            <div className={styles.draftBadge}>
                                                Pattern: <strong>{msg.draft.entry_pattern || 'Breakout'}</strong>
                                            </div>
                                            <div className={styles.draftBadge}>
                                                TP: <strong>{msg.draft.target_pips} pts</strong>
                                            </div>
                                            <div className={styles.draftBadge}>
                                                SL: <strong>{msg.draft.stoploss_pips} pts</strong>
                                            </div>
                                        </div>
                                        <div className={styles.draftActionRow}>
                                            <button
                                                type="button"
                                                className={styles.btnNeonRunBacktest}
                                                style={{ fontSize: '11px', padding: '6px 12px' }}
                                                onClick={() => onGenerateFromDraft(msg.draft)}
                                                disabled={generatingStrategy}
                                            >
                                                <LightningIcon size={13} color="#040605" />
                                                <span>{generatingStrategy ? 'Generating Spec...' : 'Generate Strategy JSON'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.btnToolbarManual}
                                                style={{ fontSize: '11px', padding: '6px 12px' }}
                                                onClick={onRunBacktestFromCard}
                                            >
                                                <RocketRunIcon size={13} />
                                                <span>Run Backtest Now</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })
                )}

                {loading && (
                    <div className={styles.messageRow}>
                        <div className={`${styles.avatar} ${styles.aiAvatar}`}>
                            <BotBrainIcon size={14} color="#040605" />
                        </div>
                        <div className={`${styles.bubble} ${styles.aiBubble}`} style={{ color: '#18C98B' }}>
                            <span>Formulating strategy rules and quantitative constraints...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className={styles.chatInputBar}>
                <div className={styles.chatInputWrapper}>
                    <textarea
                        ref={textareaRef}
                        className={styles.chatTextarea}
                        placeholder="Describe your strategy idea (e.g., Donchian on XAUUSD, EMA Crossover)..."
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            if (textareaRef.current) {
                                textareaRef.current.style.height = 'auto';
                                textareaRef.current.style.height = `${Math.max(42, Math.min(textareaRef.current.scrollHeight, 110))}px`;
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        rows={2}
                    />
                    <button
                        type="button"
                        className={styles.sendBtn}
                        onClick={onSend}
                        disabled={loading || !input.trim()}
                        title="Send Message"
                    >
                        <SendPaperAirplaneIcon size={15} color="#040605" />
                    </button>
                </div>
            </div>
        </div>
    );
}
