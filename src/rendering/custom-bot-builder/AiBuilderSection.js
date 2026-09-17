"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '@/components/sectionHeader';
import styles from './customBotBuilder.module.scss';

const AI_CAPABILITIES = [
  "Create entry conditions",
  "Add or modify indicators",
  "Define exit rules",
  "Set stop-loss and take-profit",
  "Configure risk per trade",
  "Define trading sessions",
  "Set position-sizing rules",
  "Add confirmation conditions",
  "Modify existing bot rules",
  "Explain how the bot works"
];

const INITIAL_MESSAGES = [
  {
    sender: "user",
    text: "Create a EUR/USD trend-following bot using the 20 EMA and 50 EMA."
  },
  {
    sender: "ai",
    text: "Got it! I've generated a trend-following bot configuration for EUR/USD based on EMA crossover with RSI momentum confirmation.",
    config: {
      pair: "EUR/USD",
      timeframe: "15M / 1H",
      entry: "20 EMA > 50 EMA + RSI(14) > 50",
      exit: "30 pips SL / 60 pips TP",
      risk: "1% Equity per trade"
    }
  }
];

export default function AiBuilderSection({ refProp }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (e) => {
    e && e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: `Updated bot parameters based on your request: "${userMsg}". Here is your updated configuration:`,
          config: {
            pair: "EUR/USD",
            timeframe: "15M",
            entry: "20 EMA > 50 EMA + RSI > 55",
            exit: "Trailing Stop 25 pips / TP 75 pips",
            risk: "1.5% Equity per trade"
          }
        }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickPrompt = (promptText) => {
    setInputText(promptText);
  };

  return (
    <section ref={refProp} className={styles.aiBuilderSection}>
      <div className="container">
        <SectionHeader
          badge="AI BOT BUILDER"
          title1="Tell AI What You Want to Trade."
          title2="Build Through Conversation."
          description="You don't need to start with a complicated configuration. Simply describe your trading idea through chat and let ChronosX AI help turn it into a structured bot."
        />

        <div className={styles.aiChatGrid}>
          {/* Left Column: Process Steps & Capabilities */}
          <div>
            <div className={styles.aiProcessCards}>
              <div className={styles.aiProcessCard}>
                <div className={styles.stepNum}>01 — DESCRIBE</div>
                <div className={styles.stepTitle}>Describe Your Idea</div>
                <p className={styles.stepDesc}>Explain your strategy in your own natural words.</p>
              </div>
              <div className={styles.aiProcessCard}>
                <div className={styles.stepNum}>02 — ASK</div>
                <div className={styles.stepTitle}>Ask the AI</div>
                <p className={styles.stepDesc}>Add or modify indicators, rules, or risk settings.</p>
              </div>
              <div className={styles.aiProcessCard}>
                <div className={styles.stepNum}>03 — REVIEW</div>
                <div className={styles.stepTitle}>Review Config</div>
                <p className={styles.stepDesc}>See your idea translated into structured bot rules.</p>
              </div>
              <div className={styles.aiProcessCard}>
                <div className={styles.stepNum}>04 — REFINE</div>
                <div className={styles.stepTitle}>Refine the Bot</div>
                <p className={styles.stepDesc}>Continue chatting until your setup is perfect.</p>
              </div>
            </div>

            {/* What You Can Ask AI */}
            <div className={styles.aiCapabilitiesBox}>
              <h4 className={styles.boxTitle}>What You Can Ask AI To Do</h4>
              <div className={styles.capabilitiesList}>
                {AI_CAPABILITIES.map((cap, i) => (
                  <div key={i} className={styles.capItem}>
                    <span className={styles.dot} />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive AI Chat Simulator */}
          <div className={styles.aiChatSimulator}>
            <div className={styles.chatHeader}>
              <div className={styles.botIdentity}>
                <div className={styles.botAvatar}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                    <rect x="4" y="8" width="16" height="12" rx="2" />
                    <circle cx="9" cy="13" r="1" fill="currentColor" />
                    <circle cx="15" cy="13" r="1" fill="currentColor" />
                  </svg>
                </div>
                <div className={styles.botInfo}>
                  <div className={styles.name}>ChronosX AI Bot Assistant</div>
                  <div className={styles.status}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#18C98B' }} />
                    Active & Ready
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.chatMessagesBody}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${styles.chatBubble} ${msg.sender === 'user' ? styles.userBubble : styles.aiBubble}`}
                >
                  <p style={{ margin: 0 }}>{msg.text}</p>
                  {msg.config && (
                    <div className={styles.configPreviewCard}>
                      <div className={styles.configRow}>
                        <span>Pair:</span> <strong>{msg.config.pair}</strong>
                      </div>
                      <div className={styles.configRow}>
                        <span>Timeframe:</span> <strong>{msg.config.timeframe}</strong>
                      </div>
                      <div className={styles.configRow}>
                        <span>Entry:</span> <strong>{msg.config.entry}</strong>
                      </div>
                      <div className={styles.configRow}>
                        <span>Exit:</span> <strong>{msg.config.exit}</strong>
                      </div>
                      <div className={styles.configRow}>
                        <span>Risk:</span> <strong>{msg.config.risk}</strong>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className={`${styles.chatBubble} ${styles.aiBubble}`}>
                  <em>AI is constructing bot rules...</em>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div style={{ padding: '8px 16px', display: 'flex', gap: '8px', overflowX: 'auto', background: 'rgba(0,0,0,0.2)' }}>
              <button
                type="button"
                onClick={() => handleQuickPrompt("Add 20 pips Trailing Stop Loss")}
                style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', color: '#18C98B', border: '1px solid rgba(24,201,139,0.3)', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                + Add Trailing SL
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrompt("Set risk to 2% per trade")}
                style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', color: '#18C98B', border: '1px solid rgba(24,201,139,0.3)', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                ⚡ Set 2% Risk
              </button>
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className={styles.chatInputBar}>
              <input
                type="text"
                placeholder="Type a message or describe your bot idea..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit">BUILD WITH AI</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
