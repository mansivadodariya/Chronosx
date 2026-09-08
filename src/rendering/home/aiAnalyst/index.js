"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './aiAnalyst.module.scss';
import SectionHeader from '@/components/sectionHeader';

// Embedded Mini Sparkline Chart Component inside Bot Response
function MiniTrendGraph({ symbol = "PLTR", entry = "85.80", target = "94.20", rr = "1:3.4" }) {
  return (
    <motion.div 
      className={styles.miniGraphCard}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className={styles.miniGraphHeader}>
        <div className={styles.miniTickerGroup}>
          <span className={styles.tickerTag}>{symbol}</span>
          <span className={styles.trendStatus}>▲ BREAKOUT (+6.72%)</span>
        </div>
        <span className={styles.rrPill}>R:R {rr}</span>
      </div>

      {/* SVG Neon Mini Sparkline Graph */}
      <div className={styles.svgSparklineWrapper}>
        <svg viewBox="0 0 320 64" className={styles.sparklineSvg} preserveAspectRatio="none">
          <defs>
            <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <filter id="neonGlowSpark" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#6EE7B7" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Target Baseline Dotted Line */}
          <line x1="10" y1="12" x2="310" y2="12" stroke="#10B981" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />
          {/* Stop Loss Baseline Dotted Line */}
          <line x1="10" y1="52" x2="310" y2="52" stroke="#EF4444" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />

          {/* Area Fill under curve */}
          <path
            d="M 10 48 Q 60 46, 110 38 T 210 28 T 280 16 L 305 14 L 305 60 L 10 60 Z"
            fill="url(#sparklineGrad)"
          />

          {/* Glowing Curve Line */}
          <path
            d="M 10 48 Q 60 46, 110 38 T 210 28 T 280 16 L 305 14"
            fill="none"
            stroke="#6EE7B7"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#neonGlowSpark)"
          />

          {/* Glowing Target Pulsing Dot */}
          <circle cx="305" cy="14" r="3.5" fill="#6EE7B7" />
          <circle cx="305" cy="14" r="6" fill="none" stroke="#6EE7B7" strokeWidth="1" opacity="0.8">
            <animate attributeName="r" values="3.5;8;3.5" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <div className={styles.miniGraphFooter}>
        <span>SL Target: <strong className={styles.slText}>${entry}</strong></span>
        <span>TP Target: <strong className={styles.tpText}>${target}</strong></span>
      </div>
    </motion.div>
  );
}

const conversationFlow = [
  {
    user: "Top 3 names with breakouts this hour?",
    showGraph: true,
    graphData: { symbol: "PLTR", entry: "85.80", target: "94.20", rr: "1:3.4" },
    bot: [
      "Here are the top 3 breakout leaders with >2.4x volume surge:",
      "1. PLTR ($88.41) — Broke 20-day resistance at $86.20 with +6.72% candle close.",
      "2. NVDA ($138.20) — Bullish flag breakout confirmed on 15m timeframe.",
      "3. AMD ($164.50) — MACD golden cross with institutional block buying."
    ]
  },
  {
    user: "What's the risk-to-reward on PLTR right now?",
    showGraph: true,
    graphData: { symbol: "PLTR", entry: "85.80", target: "94.20", rr: "1:3.4" },
    bot: [
      "Stop loss recommended at $85.80 (below previous resistance turned support).",
      "Current Risk/Reward ratio is 1:3.4 with initial target at $94.20 on strong volume confirmation."
    ]
  },
  {
    user: "Any volume divergence on BTC 4H chart?",
    showGraph: true,
    graphData: { symbol: "BTC/USD", entry: "64,200", target: "68,900", rr: "1:3.8" },
    bot: [
      "RSI bullish divergence detected at $64,200 support.",
      "Selling pressure dropped 42% over last 3 candles while price holds above 50 EMA."
    ]
  }
];

const featurePoints = [
  {
    num: "01",
    title: "Reads what the platform shows.",
    desc: "Indicator state, heat-list rank, open ticker, your watchlist — ChronosX answers in that frame, not from thin air."
  },
  {
    num: "02",
    title: "Indicators are the source of truth.",
    desc: "ChronosX quotes the algorithm and the indicators verbatim. It does not invent signals or override them."
  },
  {
    num: "03",
    title: "Knows when to say 'I don't know.'",
    desc: "Surfaces the underlying number or chart instead of guessing. No false confidence."
  }
];

// Typewriter Bot Message Streamer with embedded mini chart
function TypewriterBotMessage({ lines, showGraph, graphData, onComplete }) {
  const [displayedLines, setDisplayedLines] = useState([""]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTypingDone, setIsTypingDone] = useState(false);

  useEffect(() => {
    if (!lines || lines.length === 0) return;

    if (currentLineIndex < lines.length) {
      const targetLine = lines[currentLineIndex];
      if (currentCharIndex < targetLine.length) {
        const timeout = setTimeout(() => {
          setDisplayedLines((prev) => {
            const next = [...prev];
            next[currentLineIndex] = targetLine.slice(0, currentCharIndex + 1);
            return next;
          });
          setCurrentCharIndex((prev) => prev + 1);
        }, 10);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setDisplayedLines((prev) => [...prev, ""]);
          setCurrentLineIndex((prev) => prev + 1);
          setCurrentCharIndex(0);
        }, 60);
        return () => clearTimeout(timeout);
      }
    } else {
      setIsTypingDone(true);
      if (onComplete) onComplete();
    }
  }, [lines, currentLineIndex, currentCharIndex, onComplete]);

  return (
    <div className={styles.botBubble}>
      <div className={styles.botHeaderLabelRow}>
        <span className={styles.botSenderLabel}>CHRONOSX AI</span>
        <span className={styles.botBadge}>VERIFIED SIGNAL</span>
      </div>
      <div className={styles.botContent}>
        {displayedLines.map((line, idx) => (
          <p key={idx} className={styles.botLine}>
            {line}
            {idx === currentLineIndex && currentLineIndex < lines.length && (
              <span className={styles.typeCursor}>|</span>
            )}
          </p>
        ))}

        {/* Embedded Mini Sparkline Chart on Completion */}
        {showGraph && isTypingDone && (
          <MiniTrendGraph 
            symbol={graphData?.symbol || "PLTR"} 
            entry={graphData?.entry || "85.80"} 
            target={graphData?.target || "94.20"} 
            rr={graphData?.rr || "1:3.4"} 
          />
        )}
      </div>
    </div>
  );
}

export default function AiAnalyst() {
  const [messages, setMessages] = useState([
    { role: 'user', text: conversationFlow[0].user },
    { 
      role: 'bot', 
      lines: conversationFlow[0].bot,
      showGraph: conversationFlow[0].showGraph,
      graphData: conversationFlow[0].graphData
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [flowIndex, setFlowIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const chatBodyRef = useRef(null);

  // Auto-scroll chat body on content updates
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Autonomous Live Chat Loop
  useEffect(() => {
    if (isUserInteracting) return;

    let timer;
    const currentConv = conversationFlow[flowIndex];

    // Transition when messages array is empty
    if (messages.length === 0) {
      timer = setTimeout(() => {
        // Step 1: User asks question
        setMessages([{ role: 'user', text: currentConv.user }]);
        setIsThinking(true);

        // Step 2: Bot thinks and streams answers with typewriter animation
        setTimeout(() => {
          setIsThinking(false);
          setMessages([
            { role: 'user', text: currentConv.user },
            { 
              role: 'bot', 
              lines: currentConv.bot,
              showGraph: currentConv.showGraph,
              graphData: currentConv.graphData
            }
          ]);
        }, 1200);
      }, 800);
    }

    return () => clearTimeout(timer);
  }, [flowIndex, messages.length, isUserInteracting]);

  const handleBotTypingComplete = () => {
    if (isUserInteracting) return;
    // Step 3: Advance to next conversation after reading pause
    setTimeout(() => {
      setMessages([]);
      setFlowIndex((prev) => (prev + 1) % conversationFlow.length);
    }, 7000);
  };

  // Handle manual user submission
  const handleSendMessage = (e) => {
    e?.preventDefault();
    const query = userInput.trim();
    if (!query) return;

    setIsUserInteracting(true);
    setUserInput('');
    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      const responses = [
        `Analyzing institutional order flow and key levels for ${query.toUpperCase()}...`,
        "Bullish setup validated with +6.4% target projection. Key support level holding with high volume surge.",
        "Risk/Reward ratio optimal at 1:3.4 with trailing stop protection active."
      ];
      setMessages((prev) => [
        ...prev,
        { 
          role: 'bot', 
          lines: responses,
          showGraph: true,
          graphData: { symbol: query.toUpperCase().slice(0, 6), entry: "86.50", target: "95.00", rr: "1:3.4" }
        }
      ]);

      setTimeout(() => {
        setIsUserInteracting(false);
      }, 10000);
    }, 1200);
  };

  const handleQuickPrompt = (promptText) => {
    setIsUserInteracting(true);
    setUserInput('');
    setMessages((prev) => [...prev, { role: 'user', text: promptText }]);
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      let botLines = [];
      let graphInfo = null;

      if (promptText.toLowerCase().includes('btc') || promptText.toLowerCase().includes('support')) {
        botLines = [
          "RSI bullish divergence detected at $64,200 support zone.",
          "Selling pressure dropped 42% over last 3 candles while price holds firmly above 50 EMA."
        ];
        graphInfo = { symbol: "BTC/USD", entry: "64,200", target: "68,900", rr: "1:3.8" };
      } else if (promptText.toLowerCase().includes('pltr') || promptText.toLowerCase().includes('r:r')) {
        botLines = [
          "Stop loss recommended at $85.80 (below previous resistance turned support).",
          "Current Risk/Reward ratio is 1:3.4 with initial target at $94.20 on institutional volume confirmation."
        ];
        graphInfo = { symbol: "PLTR", entry: "85.80", target: "94.20", rr: "1:3.4" };
      } else {
        botLines = [
          "Here are the top 3 breakout leaders with >2.4x volume surge:",
          "1. PLTR ($88.41) — Broke 20-day resistance at $86.20 with +6.72% candle close.",
          "2. NVDA ($138.20) — Bullish flag breakout confirmed on 15m timeframe.",
          "3. AMD ($164.50) — MACD golden cross with institutional block buying."
        ];
        graphInfo = { symbol: "PLTR", entry: "85.80", target: "94.20", rr: "1:3.4" };
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          lines: botLines,
          showGraph: true,
          graphData: graphInfo
        }
      ]);

      setTimeout(() => {
        setIsUserInteracting(false);
      }, 10000);
    }, 1200);
  };

  return (
    <section className={styles.aiAnalystSection}>
      <div className="container">
        <div className={styles.mainGrid}>
          
          {/* Left Column: Ultra-Beautiful Live Interactive AI Chatbot Window */}
          <motion.div 
            className={styles.chatWrapper}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.chatCard}>
              
              {/* Sleek Terminal Header */}
              <div className={styles.chatHeader}>
                <div className={styles.headerLeftCluster}>
         
                  <div className={styles.aiProfile}>
                    <div className={styles.avatarLogoBox}>
                      <img src="/assets/logo/logo.png" alt="ChronosX Logo" className={styles.headerLogoImg} />
                    </div>
               
                  </div>
                </div>

                <div className={styles.liveBadge}>
                  <span className={styles.greenDot} />
                  <span>NEURAL-v4.2</span>
                </div>
              </div>

              {/* Chat Messages Stream Viewport */}
              <div 
                className={styles.chatBody} 
                ref={chatBodyRef}
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
              >
                <AnimatePresence mode="popLayout">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      className={msg.role === 'user' ? styles.userMsgRow : styles.botMsgRow}
                      initial={{ opacity: 0, y: 14, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                      {msg.role === 'user' ? (
                        <div className={styles.userBubble}>
                          <span className={styles.userSenderLabel}>YOU</span>
                          <div className={styles.userText}>{msg.text}</div>
                        </div>
                      ) : (
                        <TypewriterBotMessage
                          lines={msg.lines}
                          showGraph={msg.showGraph}
                          graphData={msg.graphData}
                          onComplete={handleBotTypingComplete}
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* AI Thinking Indicator */}
                {isThinking && (
                  <motion.div 
                    className={styles.thinkingWrapper}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <span className={styles.botSenderLabel}>CHRONOSX AI</span>
                    <div className={styles.thinkingPill}>
                      <span className={styles.dot1} />
                      <span className={styles.dot2} />
                      <span className={styles.dot3} />
                      <span className={styles.thinkingText}>ANALYZING MARKET PATTERNS...</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Quick Prompt Suggestions */}
              <div className={styles.quickPrompts}>
                <button 
                  type="button" 
                  onClick={() => handleQuickPrompt("Top 3 breakouts this hour")}
                  className={styles.promptChip}
                >
                  Top Breakouts
                </button>
                <button 
                  type="button" 
                  onClick={() => handleQuickPrompt("Check BTC support level")}
                  className={styles.promptChip}
                >
                  BTC Support
                </button>
                <button 
                  type="button" 
                  onClick={() => handleQuickPrompt("PLTR Risk to Reward")}
                  className={styles.promptChip}
                >
                  PLTR R:R
                </button>
                <button 
                  type="button" 
                  onClick={() => handleQuickPrompt("MACD golden cross signals")}
                  className={styles.promptChip}
                >
                  MACD Signals
                </button>
              </div>

              {/* Interactive Chat Input Form */}
              <form onSubmit={handleSendMessage} className={styles.chatInputForm}>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask ChronosX anything..."
                  className={styles.chatInput}
                />
                <button type="submit" className={styles.sendButton} aria-label="Send message">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>

            </div>
          </motion.div>

          {/* Right Column: Section Header & Feature Points */}
          <motion.div 
            className={styles.contentColumn}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <SectionHeader
              align="left"
              badge="CHRONOSX · AI MARKET ANALYST"
              title1="AI on Top of Indicators."
              title2="Not Instead of Them."
              description="The signals come from the indicators and the institutional algorithms. ChronosX reads them back to you — ask why a breakout fired, sort the heat list by sector, or pull the last MACD reversal, in plain English."
            />

            {/* Feature List Points */}
            <div className={styles.featureList}>
              {featurePoints.map((item, index) => (
                <div key={index} className={styles.featureItem}>
                  <div className={styles.numBadge}>{item.num}</div>
                  <div className={styles.featureContent}>
                    <h3>{item.title}</h3>
                    {/* <p>{item.desc}</p> */}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
