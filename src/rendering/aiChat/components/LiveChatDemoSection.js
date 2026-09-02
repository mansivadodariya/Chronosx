'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authNavigate } from '@/lib/authRedirect';
import { QUICK_PROMPTS } from '../constants/aiChatData';
import styles from '../aiChat.module.scss';

export default function LiveChatDemoSection({
    demoRef,
    selectedPrompt,
    onSelectPrompt,
    isGenerating,
    customInput,
    setCustomInput,
    onCustomSubmit,
    onCopySetup
}) {
    const router = useRouter();

    return (
        <section ref={demoRef} id="live-demo" className={styles.liveDemoSection}>
            <div className="container">
                <div className={styles.sectionHeaderCenter}>
                    <div className={styles.sectionBadge}>
                        <span>✦ LIVE INTERACTIVE CHAT DEMO</span>
                    </div>
                    <h2 className={styles.sectionTitle}>
                        EXPERIENCE THE AI COPILOT IN ACTION
                    </h2>
                    <p className={styles.sectionSubtitle}>
                        Inspect zero-delay price quotes, automated support/resistance levels, and calculated risk-to-reward setups.
                    </p>
                </div>

                {/* Interactive Cockpit Container */}
                <div className={styles.terminalCockpit}>
                    {/* Terminal Top Window Bar */}
                    <div className={styles.terminalHeader}>
                        <div className={styles.terminalControls}>
                            <span className={`${styles.dot} ${styles.dotRed}`} />
                            <span className={`${styles.dot} ${styles.dotYellow}`} />
                            <span className={`${styles.dot} ${styles.dotGreen}`} />
                            <span className={styles.terminalBrand}>
                                CHRONOSX // AI TRADING COPILOT TERMINAL
                            </span>
                        </div>

                        {/* Preset Tabs Switcher */}
                        <div className={styles.terminalTabs}>
                            {QUICK_PROMPTS.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => onSelectPrompt(p)}
                                    className={`${styles.termTabBtn} ${selectedPrompt.id === p.id ? styles.termTabActive : ''}`}
                                >
                                    {p.demoData.pair}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Terminal Chat Stream Area */}
                    <div className={styles.chatStreamArea}>
                        {/* 1. Trader Question Bubble */}
                        <div className={styles.traderMessageRow}>
                            <div className={styles.traderAvatar}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div className={styles.traderBubble}>
                                <div className={styles.bubbleSender}>Trader</div>
                                <p className={styles.bubbleText}>
                                    &ldquo;{selectedPrompt.demoData.userPrompt}&rdquo;
                                </p>
                            </div>
                        </div>

                        {/* 2. AI Assistant Structured Institutional Setup */}
                        <div className={styles.aiMessageRow}>
                            <div className={styles.aiAvatar}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="10" rx="2" />
                                    <circle cx="12" cy="5" r="2" />
                                    <path d="M12 7v4" />
                                    <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth="2.5" />
                                    <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth="2.5" />
                                </svg>
                            </div>
                            <div className={styles.aiResponseCard}>
                                <div className={styles.aiCardHeader}>
                                    <div className={styles.aiSenderInfo}>
                                        <span className={styles.aiName}>AI Assistant</span>
                                        <span className={styles.aiTag}>QUANT COPILOT</span>
                                        <span className={styles.aiPairBadge}>{selectedPrompt.demoData.pair}</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={onCopySetup}
                                        className={styles.copyBtn}
                                        title="Copy Trade Setup to Clipboard"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                        </svg>
                                        <span>Copy Setup</span>
                                    </button>
                                </div>

                                <AnimatePresence mode="wait">
                                    {isGenerating ? (
                                        <motion.div
                                            key="loader"
                                            className={styles.aiGeneratingBox}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <div className={styles.typingIndicator}>
                                                <span />
                                                <span />
                                                <span />
                                            </div>
                                            <p>Analyzing live MT5 tick streams &amp; computing optimal parameters...</p>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="content"
                                            className={styles.aiSetupContent}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {/* Main Setup Title */}
                                            <div className={styles.setupTitleRow}>
                                                <div className={styles.setupTitleIconBox}>
                                                    {selectedPrompt.icon}
                                                </div>
                                                <h4 className={styles.setupTitle}>
                                                    {selectedPrompt.demoData.title}
                                                </h4>
                                            </div>

                                            {/* Core Market Telemetry Grid */}
                                            <div className={styles.telemetryGrid}>
                                                <div className={styles.telemetryItem}>
                                                    <span className={styles.telLabel}>Current Live Price</span>
                                                    <span className={styles.telPrice}>{selectedPrompt.demoData.price}</span>
                                                </div>

                                                <div className={styles.telemetryItem}>
                                                    <span className={styles.telLabel}>Trend Direction</span>
                                                    <span className={selectedPrompt.demoData.trendType === 'bullish' ? styles.telBullish : styles.telNeutral}>
                                                        ● {selectedPrompt.demoData.trend}
                                                    </span>
                                                </div>

                                                <div className={styles.telemetryItem}>
                                                    <span className={styles.telLabel}>Resistance Levels</span>
                                                    <span className={styles.telVal}>{selectedPrompt.demoData.resistance}</span>
                                                </div>

                                                <div className={styles.telemetryItem}>
                                                    <span className={styles.telLabel}>Support Levels</span>
                                                    <span className={styles.telVal}>{selectedPrompt.demoData.support}</span>
                                                </div>
                                            </div>

                                            {/* Execution & Risk-to-Reward Plan Card */}
                                            <div className={styles.tradePlanBox}>
                                                <div className={styles.planHeader}>
                                                    <div className={styles.targetIconBox}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <circle cx="12" cy="6" r="2" />
                                                        </svg>
                                                    </div>
                                                    <h5>TRADE SETUP PLAN:</h5>
                                                </div>

                                                <div className={styles.planItemsGrid}>
                                                    <div className={styles.planRow}>
                                                        <span className={styles.planKey}>Entry Zone:</span>
                                                        <span className={styles.planValHighlight}>{selectedPrompt.demoData.setup.entryZone}</span>
                                                    </div>

                                                    <div className={styles.planRow}>
                                                        <span className={styles.planKey}>Stop Loss:</span>
                                                        <span className={styles.planValSl}>{selectedPrompt.demoData.setup.stopLoss}</span>
                                                    </div>

                                                    <div className={styles.planRow}>
                                                        <span className={styles.planKey}>Take Profit 1:</span>
                                                        <span className={styles.planValTp}>{selectedPrompt.demoData.setup.takeProfit1}</span>
                                                    </div>

                                                    <div className={styles.planRow}>
                                                        <span className={styles.planKey}>Take Profit 2:</span>
                                                        <span className={styles.planValTp}>{selectedPrompt.demoData.setup.takeProfit2}</span>
                                                    </div>

                                                    <div className={styles.planRow}>
                                                        <span className={styles.planKey}>Risk-Reward Ratio:</span>
                                                        <span className={styles.planValRrr}>{selectedPrompt.demoData.setup.rrr}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Optional Indicator or Risk Calc Breakdown */}
                                            {selectedPrompt.demoData.calcMetrics && (
                                                <div className={styles.calcBreakdownBox}>
                                                    <div className={styles.calcHeader}>
                                                        <div className={styles.calcIconBox}>
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                                <polyline points="9 12 11 14 15 10" />
                                                            </svg>
                                                        </div>
                                                        <h5>POSITION SIZING &amp; MATHEMATICAL AUDIT</h5>
                                                    </div>
                                                    <div className={styles.calcGrid}>
                                                        <div className={styles.calcItem}>
                                                            <span>Balance:</span>
                                                            <strong>{selectedPrompt.demoData.calcMetrics.accountBalance}</strong>
                                                        </div>
                                                        <div className={styles.calcItem}>
                                                            <span>Risk Allocation:</span>
                                                            <strong>{selectedPrompt.demoData.calcMetrics.riskPercent} ({selectedPrompt.demoData.calcMetrics.dollarRisk})</strong>
                                                        </div>
                                                        <div className={styles.calcItem}>
                                                            <span>Stop Loss:</span>
                                                            <strong>{selectedPrompt.demoData.calcMetrics.stopLossPips}</strong>
                                                        </div>
                                                        <div className={styles.calcItem}>
                                                            <span>Exact Lot Size:</span>
                                                            <strong className={styles.lotHighlight}>{selectedPrompt.demoData.calcMetrics.recommendedLots}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedPrompt.demoData.indicators && (
                                                <div className={styles.indicatorsRow}>
                                                    {selectedPrompt.demoData.indicators.map((ind, i) => (
                                                        <div key={i} className={styles.indPill}>
                                                            <span className={styles.indName}>{ind.name}:</span>
                                                            <span className={styles.indStatus}>{ind.status}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Critical Economic Notice */}
                                            <div className={styles.alertNoteBox}>
                                                <div className={styles.alertIconBox}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                                        <line x1="12" y1="9" x2="12" y2="13" />
                                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                                    </svg>
                                                </div>
                                                <p>
                                                    <strong>Note:</strong> {selectedPrompt.demoData.note}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Input Command Bar */}
                    <div className={styles.terminalInputBar}>
                        <form onSubmit={onCustomSubmit} className={styles.inputForm}>
                            <div className={styles.inputPrefix}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Type your trading question or pair analysis request here..."
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                className={styles.chatInputField}
                            />
                            <button
                                type="button"
                                onClick={() => authNavigate(router, '/ai-assistant')}
                                className={styles.launchFullDeskBtn}
                            >
                                <span>Open in Live AI Desk</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
