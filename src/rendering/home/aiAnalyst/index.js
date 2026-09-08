"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './aiAnalyst.module.scss';
import SectionHeader from '@/components/sectionHeader';
import StreamingText from '@/components/streamingText';

// Word-by-Word Streaming Animation Component
function StreamingWords({ text = "", speed = 30, onComplete, isActive = true }) {
  const words = React.useMemo(() => (text ? text.split(" ") : []), [text]);
  const [wordCount, setWordCount] = useState(isActive ? 0 : words.length);
  const [isFinished, setIsFinished] = useState(!isActive);

  useEffect(() => {
    if (!isActive) {
      setWordCount(words.length);
      setIsFinished(true);
      return;
    }

    setWordCount(0);
    setIsFinished(false);

    if (words.length === 0) return;

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setWordCount(idx);
      if (idx >= words.length) {
        clearInterval(interval);
        setIsFinished(true);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, isActive, words.length]);

  return (
    <span className={styles.streamingText}>
      {words.slice(0, wordCount).map((word, i) => (
        <span key={i} className={styles.wordSpan}>
          {word}{" "}
        </span>
      ))}
      {!isFinished && <span className={styles.typewriterCursor}>▌</span>}
    </span>
  );
}

// 4 Distinct High-Definition Candlestick & Analysis Chart Renderers with Clear X & Y Axes
function DedicatedChartRenderer({ chartData }) {
  if (!chartData) return null;
  const { chartType, yTicks, xTicks } = chartData;

  return (
    <motion.div
      className={styles.miniCandleChartCard}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* High-Definition SVG Stage with Explicit X and Y Axes */}
      <div className={styles.svgContainer}>
        <svg viewBox="0 0 460 145" className={styles.candleSvgStage} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="bullCandleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="bearCandleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <linearGradient id="fvgZoneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.22)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.05)" />
            </linearGradient>
            <linearGradient id="equityAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.35)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.0)" />
            </linearGradient>
          </defs>

          {/* 1. Y-AXIS GRID LINES & LABELS (LEFT AREA 0 to 52) */}
          <line x1="52" y1="8" x2="52" y2="124" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          
          {/* Top TP Level Line & Label */}
          <line x1="52" y1="22" x2="385" y2="22" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3" opacity="0.65" />
          <text x="48" y="25" fill="#10B981" fontSize="8" fontWeight="700" textAnchor="end" fontFamily="sans-serif">
            {yTicks?.[0] || "2,768.0"}
          </text>
          <rect x="390" y="14" width="62" height="15" rx="3" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.5)" />
          <text x="421" y="25" fill="#10B981" fontSize="7.5" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">TP TARGET</text>

          {/* Mid Entry Level Line & Label */}
          <line x1="52" y1="64" x2="385" y2="64" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.8" />
          <text x="48" y="67" fill="#38BDF8" fontSize="8" fontWeight="700" textAnchor="end" fontFamily="sans-serif">
            {yTicks?.[1] || "2,748.5"}
          </text>
          <rect x="390" y="56" width="62" height="15" rx="3" fill="rgba(56, 189, 248, 0.15)" stroke="rgba(56, 189, 248, 0.5)" />
          <text x="421" y="67" fill="#38BDF8" fontSize="7.5" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">ENTRY</text>

          {/* Bottom SL Level Line & Label */}
          <line x1="52" y1="106" x2="385" y2="106" stroke="#EF4444" strokeWidth="1" strokeDasharray="3 3" opacity="0.65" />
          <text x="48" y="109" fill="#EF4444" fontSize="8" fontWeight="700" textAnchor="end" fontFamily="sans-serif">
            {yTicks?.[2] || "2,741.0"}
          </text>
          <rect x="390" y="98" width="62" height="15" rx="3" fill="rgba(239, 68, 68, 0.15)" stroke="rgba(239, 68, 68, 0.5)" />
          <text x="421" y="109" fill="#EF4444" fontSize="7.5" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">STOP LOSS</text>

          {/* 2. X-AXIS TIMESTAMPS (BOTTOM 124 to 142) */}
          <line x1="52" y1="124" x2="450" y2="124" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          {(xTicks || ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"]).map((t, idx) => {
            const xPos = 65 + idx * 58;
            return (
              <g key={idx}>
                <line x1={xPos} y1="124" x2={xPos} y2="128" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <text x={xPos} y="137" fill="#64748B" fontSize="7.5" fontWeight="500" textAnchor="middle" fontFamily="sans-serif">
                  {t}
                </text>
              </g>
            );
          })}

          {/* 3. DEDICATED VISUALIZATION PER TYPE */}
          
          {/* TYPE 1: BREAKOUT SURGE (XAU/USD) */}
          {chartType === 'breakout' && (
            <g>
              {/* Order Block Breakout Shaded Zone */}
              <rect x="180" y="44" width="140" height="24" rx="4" fill="url(#fvgZoneGrad)" stroke="rgba(16, 185, 129, 0.35)" strokeDasharray="2 2" />
              <text x="186" y="38" fill="#10B981" fontSize="7.5" fontWeight="700" letterSpacing="0.4">
                H1 ORDER BLOCK BREAKOUT ($2,748)
              </text>

              {/* Candlesticks Sequence */}
              {[
                { x: 65, wickTop: 54, wickBottom: 94, bodyY: 62, bodyHeight: 24, isBull: false },
                { x: 98, wickTop: 62, wickBottom: 104, bodyY: 70, bodyHeight: 26, isBull: false },
                { x: 131, wickTop: 72, wickBottom: 110, bodyY: 78, bodyHeight: 24, isBull: false },
                { x: 164, wickTop: 68, wickBottom: 106, bodyY: 74, bodyHeight: 22, isBull: true },
                { x: 197, wickTop: 56, wickBottom: 90, bodyY: 60, bodyHeight: 24, isBull: true },
                { x: 230, wickTop: 42, wickBottom: 78, bodyY: 48, bodyHeight: 24, isBull: true },
                { x: 263, wickTop: 32, wickBottom: 66, bodyY: 36, bodyHeight: 24, isBull: true },
                { x: 296, wickTop: 24, wickBottom: 56, bodyY: 28, bodyHeight: 24, isBull: true },
                { x: 329, wickTop: 16, wickBottom: 46, bodyY: 20, bodyHeight: 22, isBull: true }
              ].map((c, idx) => (
                <g key={idx}>
                  <line x1={c.x + 6} y1={c.wickTop} x2={c.x + 6} y2={c.wickBottom} stroke={c.isBull ? '#10B981' : '#EF4444'} strokeWidth="1.2" />
                  <rect x={c.x} y={c.bodyY} width="12" height={c.bodyHeight} rx="2" fill={c.isBull ? 'url(#bullCandleGrad)' : 'url(#bearCandleGrad)'} />
                  {idx === 8 && <circle cx={c.x + 6} cy={c.bodyY} r="3" fill="#10B981" className={styles.beaconCircle} />}
                </g>
              ))}

              {/* Volume Bars at base */}
              {[12, 14, 10, 18, 26, 38, 48, 52, 62].map((vh, vi) => (
                <rect key={vi} x={66 + vi * 33} y={124 - vh * 0.35} width="10" height={vh * 0.35} fill={vi >= 5 ? '#10B981' : 'rgba(255,255,255,0.15)'} opacity={vi >= 5 ? 0.85 : 0.3} rx="1" />
              ))}
              <text x="350" y="112" fill="#10B981" fontSize="7" fontWeight="700">+2.8x VOL</text>
            </g>
          )}

          {/* TYPE 2: DYNAMIC 50 EMA CONFLUENCE REBOUND (EUR/USD) */}
          {chartType === 'confluence' && (
            <g>
              {/* Dynamic 50 EMA Curve */}
              <path
                d="M 52 92 C 120 90, 200 78, 280 62 S 360 42, 385 36"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2"
                strokeDasharray="4 2"
                opacity="0.85"
              />
              <text x="60" y="44" fill="#38BDF8" fontSize="7.5" fontWeight="700">
                DYNAMIC 50 EMA SUPPORT (1.0845)
              </text>

              {/* Candles hitting EMA floor and bouncing */}
              {[
                { x: 65, wickTop: 34, wickBottom: 72, bodyY: 40, bodyHeight: 24, isBull: false },
                { x: 98, wickTop: 50, wickBottom: 86, bodyY: 56, bodyHeight: 24, isBull: false },
                { x: 131, wickTop: 66, wickBottom: 98, bodyY: 72, bodyHeight: 22, isBull: false },
                { x: 164, wickTop: 76, wickBottom: 104, bodyY: 82, bodyHeight: 18, isBull: false },
                { x: 197, wickTop: 68, wickBottom: 100, bodyY: 74, bodyHeight: 20, isBull: true },
                { x: 230, wickTop: 54, wickBottom: 86, bodyY: 60, bodyHeight: 22, isBull: true },
                { x: 263, wickTop: 42, wickBottom: 74, bodyY: 46, bodyHeight: 22, isBull: true },
                { x: 296, wickTop: 30, wickBottom: 60, bodyY: 34, bodyHeight: 22, isBull: true },
                { x: 329, wickTop: 20, wickBottom: 50, bodyY: 24, bodyHeight: 22, isBull: true }
              ].map((c, idx) => (
                <g key={idx}>
                  <line x1={c.x + 6} y1={c.wickTop} x2={c.x + 6} y2={c.wickBottom} stroke={c.isBull ? '#10B981' : '#EF4444'} strokeWidth="1.2" />
                  <rect x={c.x} y={c.bodyY} width="12" height={c.bodyHeight} rx="2" fill={c.isBull ? 'url(#bullCandleGrad)' : 'url(#bearCandleGrad)'} />
                  {idx === 8 && <circle cx={c.x + 6} cy={c.bodyY} r="3" fill="#10B981" className={styles.beaconCircle} />}
                </g>
              ))}
            </g>
          )}

          {/* TYPE 3: FAIR VALUE GAP IMBALANCE (GBP/USD) */}
          {chartType === 'fvg' && (
            <g>
              {/* Shaded FVG Retest Box */}
              <rect x="150" y="58" width="130" height="32" rx="4" fill="url(#fvgZoneGrad)" stroke="rgba(16, 185, 129, 0.4)" strokeDasharray="3 3" />
              <text x="156" y="52" fill="#10B981" fontSize="7.5" fontWeight="700">
                4H FAIR VALUE GAP (1.2980)
              </text>

              {/* Candles filling FVG and expanding */}
              {[
                { x: 65, wickTop: 24, wickBottom: 62, bodyY: 30, bodyHeight: 24, isBull: true },
                { x: 98, wickTop: 18, wickBottom: 54, bodyY: 24, bodyHeight: 24, isBull: true },
                { x: 131, wickTop: 26, wickBottom: 64, bodyY: 32, bodyHeight: 22, isBull: false },
                { x: 164, wickTop: 48, wickBottom: 84, bodyY: 54, bodyHeight: 24, isBull: false },
                { x: 197, wickTop: 68, wickBottom: 104, bodyY: 74, bodyHeight: 22, isBull: false },
                { x: 230, wickTop: 56, wickBottom: 94, bodyY: 62, bodyHeight: 24, isBull: true },
                { x: 263, wickTop: 42, wickBottom: 76, bodyY: 48, bodyHeight: 24, isBull: true },
                { x: 296, wickTop: 30, wickBottom: 62, bodyY: 34, bodyHeight: 24, isBull: true },
                { x: 329, wickTop: 18, wickBottom: 48, bodyY: 22, bodyHeight: 22, isBull: true }
              ].map((c, idx) => (
                <g key={idx}>
                  <line x1={c.x + 6} y1={c.wickTop} x2={c.x + 6} y2={c.wickBottom} stroke={c.isBull ? '#10B981' : '#EF4444'} strokeWidth="1.2" />
                  <rect x={c.x} y={c.bodyY} width="12" height={c.bodyHeight} rx="2" fill={c.isBull ? 'url(#bullCandleGrad)' : 'url(#bearCandleGrad)'} />
                  {idx === 8 && <circle cx={c.x + 6} cy={c.bodyY} r="3" fill="#10B981" className={styles.beaconCircle} />}
                </g>
              ))}
            </g>
          )}

          {/* TYPE 4: PERFORMANCE AUDIT & EQUITY GROWTH CURVE */}
          {chartType === 'audit' && (
            <g>
              {/* Shaded Area under Equity Spline */}
              <path
                d="M 65 110 C 120 95, 175 80, 230 58 S 310 32, 340 22 L 340 124 L 65 124 Z"
                fill="url(#equityAreaGrad)"
              />
              {/* Smooth Glowing Equity Curve */}
              <path
                d="M 65 110 C 120 95, 175 80, 230 58 S 310 32, 340 22"
                fill="none"
                stroke="#10B981"
                strokeWidth="3"
                strokeLinecap="round"
                filter="drop-shadow(0 0 8px rgba(16, 185, 129, 0.9))"
              />
              {/* Milestone Dots */}
              <circle cx="65" cy="110" r="3" fill="#38BDF8" />
              <circle cx="175" cy="80" r="3.5" fill="#38BDF8" />
              <circle cx="260" cy="50" r="3.5" fill="#6EE7B7" />
              <circle cx="340" cy="22" r="4.5" fill="#10B981" className={styles.beaconCircle} />

              <text x="65" y="44" fill="#10B981" fontSize="8" fontWeight="700">
                +24.8% NET PNL GROWTH (50 TRADES AUDITED)
              </text>
            </g>
          )}
        </svg>
      </div>
    </motion.div>
  );
}

// 4 Comprehensive Presets
const tabPresets = {
  chat: {
    user: "Analyze top intraday breakout setups with institutional volume surges.",
    time: "10:24 AM",
    intro: "High-conviction institutional breakout detected on Gold (XAU/USD):",
    bullets: [
      "H1 Order Block breached with +2.8x volume surge & 1 : 2.6 R:R."
    ],
    chartData: {
      chartType: "breakout",
      symbol: "XAU/USD · Gold Spot",
      timeframe: "1H · INTRADAY",
      action: "STRONG BUY",
      conviction: "94%",
      entry: "$2,748.50",
      tp: "$2,768.00 (+1.95%)",
      sl: "$2,741.00 (-0.27%)",
      rr: "1 : 2.60",
      yTicks: ["$2,768.0", "$2,748.5", "$2,741.0"],
      xTicks: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"],
      telemetry: "Institutional Volume +2.8x · Alignment Rating 94.8% · London/NY Confluence"
    },
    pills: ["XAU/USD Breakout", "Volume Surge", "H1 Order Block", "Liquidity Map"]
  },
  chart: {
    user: "Generate MT5 automated strategy parameters & optimal R:R for EUR/USD.",
    time: "10:26 AM",
    intro: "MetaTrader 5 Confluence & Execution Parameters:",
    bullets: [
      "Asian liquidity sweep confirmed at 1.0845 with 50 EMA dynamic rebound."
    ],
    chartData: {
      chartType: "confluence",
      symbol: "EUR/USD · Euro / US Dollar",
      timeframe: "15M · SCALP/DAY",
      action: "LONG PULLBACK",
      conviction: "91%",
      entry: "1.0845",
      tp: "1.0925 (+80 pips)",
      sl: "1.0818 (-27 pips)",
      rr: "1 : 2.96",
      yTicks: ["1.0925", "1.0845", "1.0818"],
      xTicks: ["10:15", "10:30", "10:45", "11:00", "11:15", "11:30"],
      telemetry: "ADX 34.2 Momentum · MT5 Bridge Synced · Zero Lag Signal"
    },
    pills: ["EUR/USD Confluence", "MT5 Execution", "London Killzone", "Dynamic SL/TP"]
  },
  sliders: {
    user: "Scan watchlist for active Fair Value Gaps (FVG) and liquidity sweeps.",
    time: "10:28 AM",
    intro: "Real-Time Scanner — Unmitigated FVGs & Institutional Pools:",
    bullets: [
      "4H Bullish FVG imbalance retested with clean London open buyer absorption."
    ],
    chartData: {
      chartType: "fvg",
      symbol: "GBP/USD · British Pound",
      timeframe: "4H · SWING",
      action: "FVG RETEST BUY",
      conviction: "89%",
      entry: "1.2980",
      tp: "1.3070 (+90 pips)",
      sl: "1.2945 (-35 pips)",
      rr: "1 : 2.57",
      yTicks: ["1.3070", "1.2980", "1.2945"],
      xTicks: ["04:00", "08:00", "12:00", "16:00", "20:00", "00:00"],
      telemetry: "Unmitigated Imbalance Filled · Smart Money Order Flow · High Conviction"
    },
    pills: ["GBP/USD FVG", "Imbalance Fill", "Order Flow", "Session High Target"]
  },
  report: {
    user: "Audit my last 50 closed trades and detect behavioral execution leaks.",
    time: "10:30 AM",
    intro: "Performance Audit & Behavioral Diagnostics:",
    bullets: [
      "London/NY killzone filtering eliminates 62% of drawdown (2.41 Profit Factor)."
    ],
    chartData: {
      chartType: "audit",
      symbol: "PORTFOLIO DIAGNOSTICS",
      timeframe: "50 TRADES · AUDIT",
      action: "OPTIMAL RECOVERY",
      conviction: "88%",
      entry: "Win Rate: 68.4%",
      tp: "Profit Factor: 2.41",
      sl: "Max DD: 4.2%",
      rr: "Avg R:R 1:2.85",
      yTicks: ["+24.8%", "18.2%", "0.0%"],
      xTicks: ["T1-10", "T11-20", "T21-30", "T31-40", "T41-50", "Live"],
      telemetry: "68.4% Win Rate · 2.41 Profit Factor · Behavioral Leak Mitigated"
    },
    pills: ["Trade Statement Audit", "Leak Detection", "Win Rate Optimizer", "Risk Matrix"]
  }
};

const tabKeys = ['chat', 'chart', 'sliders', 'report'];

const featurePoints = [
  {
    num: "01",
    title: "Grounded in Live Platform Telemetry.",
    desc: "ChronosX inspects real-time tick data, scanner rankings, and your active charts. It reasons directly from live market reality—not generic internet guesses."
  },
  {
    num: "02",
    title: "Algorithms Are the Source of Truth.",
    desc: "The AI interprets the underlying mathematical models and breakout triggers verbatim. It never hallucinates nonexistent trades or forces bad entries."
  },
  {
    num: "03",
    title: "Zero False Confidence.",
    desc: "When market conditions are murky or conviction is low, the AI warns you to stay in cash and shows the exact underlying data rather than guessing."
  }
];

export default function AiAnalyst() {
  const [activeSidebarTab, setActiveSidebarTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [activePill, setActivePill] = useState('XAU/USD Breakout');
  const [userInteractedUntil, setUserInteractedUntil] = useState(0);
  const chatBodyRef = useRef(null);

  // Auto-scroll chat body on content updates
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Initialize with initial tab preset
  useEffect(() => {
    const preset = tabPresets.chat;
    setMessages([
      { role: 'user', text: preset.user, time: preset.time },
      {
        role: 'bot',
        time: preset.time,
        intro: preset.intro,
        bullets: preset.bullets,
        chartData: preset.chartData,
        pills: preset.pills
      }
    ]);
  }, []);

  // Continuous Automatic Dialogue Sequence (User query ➔ Thinking ➔ Bot streaming response ➔ Pause ➔ Next)
  useEffect(() => {
    const timer = setInterval(() => {
      // If user recently clicked/typed, pause auto-loop for 14 seconds
      if (Date.now() < userInteractedUntil) {
        return;
      }

      setActiveSidebarTab((currTab) => {
        const nextIdx = (tabKeys.indexOf(currTab) + 1) % tabKeys.length;
        const nextKey = tabKeys[nextIdx];
        const preset = tabPresets[nextKey];
        setActivePill(preset.pills[0]);

        // 1. Post user question
        setMessages([{ role: 'user', text: preset.user, time: preset.time }]);
        setIsThinking(true);

        // 2. Transition from thinking to streaming bot response
        setTimeout(() => {
          setIsThinking(false);
          setMessages([
            { role: 'user', text: preset.user, time: preset.time },
            {
              role: 'bot',
              time: preset.time,
              intro: preset.intro,
              bullets: preset.bullets,
              chartData: preset.chartData,
              pills: preset.pills
            }
          ]);
        }, 850);

        return nextKey;
      });
    }, 9500);

    return () => clearInterval(timer);
  }, [userInteractedUntil]);

  // Handle Tab Click by User
  const handleTabClick = (tabKey) => {
    setUserInteractedUntil(Date.now() + 15000);
    setActiveSidebarTab(tabKey);
    const preset = tabPresets[tabKey] || tabPresets.chat;
    setActivePill(preset.pills[0]);
    
    setMessages([{ role: 'user', text: preset.user, time: preset.time }]);
    setIsThinking(true);
    
    setTimeout(() => {
      setIsThinking(false);
      setMessages([
        { role: 'user', text: preset.user, time: preset.time },
        {
          role: 'bot',
          time: preset.time,
          intro: preset.intro,
          bullets: preset.bullets,
          chartData: preset.chartData,
          pills: preset.pills
        }
      ]);
    }, 600);
  };

  // Handle Quick Prompt Pill Click
  const handleQuickPrompt = (pillText) => {
    setUserInteractedUntil(Date.now() + 15000);
    setActivePill(pillText);
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', text: `Explain live confluence for: ${pillText}`, time: timeNow }]);
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      const activeTabObj = tabPresets[activeSidebarTab] || tabPresets.chat;
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          time: timeNow,
          intro: `Real-time structural breakdown for ${pillText}:`,
          bullets: activeTabObj.bullets,
          chartData: activeTabObj.chartData,
          pills: activeTabObj.pills
        }
      ]);
    }, 600);
  };

  // Handle Real User Custom Query Submission
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    setUserInteractedUntil(Date.now() + 20000);
    const query = userInput.trim();
    setUserInput('');
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', text: query, time: timeNow }]);
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      const activeTabObj = tabPresets[activeSidebarTab] || tabPresets.chat;
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          time: timeNow,
          intro: `AI analysis and verified setup parameters for "${query}":`,
          bullets: activeTabObj.bullets,
          chartData: activeTabObj.chartData,
          pills: activeTabObj.pills
        }
      ]);
    }, 650);
  };

  return (
    <section className={styles.aiAnalystSection} aria-label="ChronosX AI Trading Advisor Section">
      <div className="container">
        <div className={styles.mainGrid}>
          
          {/* Left Column: Interactive Chat Terminal */}
          <motion.div 
            className={styles.terminalColumn}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.terminalContainer}>
              
              {/* Left Sidebar Navigation Dock */}
              <aside className={styles.sidebarDock} aria-label="Advisor Mode Switcher">
                <div className={styles.sidebarTopGroup}>
                  
                  {/* 1. Chat Tab (Breakout Setup) */}
                  <div className={styles.dockItemWrapper}>
                    {activeSidebarTab === 'chat' && <span className={styles.activeTabGlowPill} />}
                    <button
                      type="button"
                      onClick={() => handleTabClick('chat')}
                      className={`${styles.dockIconBtn} ${activeSidebarTab === 'chat' ? styles.activeDockBtn : ''}`}
                      title="AI Chat Advisor (XAU/USD Breakout)"
                      aria-label="AI Chat Advisor"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                    </button>
                  </div>

                  {/* 2. Chart Tab (EUR/USD Confluence) */}
                  <div className={styles.dockItemWrapper}>
                    {activeSidebarTab === 'chart' && <span className={styles.activeTabGlowPill} />}
                    <button
                      type="button"
                      onClick={() => handleTabClick('chart')}
                      className={`${styles.dockIconBtn} ${activeSidebarTab === 'chart' ? styles.activeDockBtn : ''}`}
                      title="MT5 Strategy Confluence (EUR/USD)"
                      aria-label="MT5 Strategy Confluence"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v18h18"/>
                        <path d="m7 14 4-4 4 2 5-6"/>
                      </svg>
                    </button>
                  </div>

                  {/* 3. Sliders Tab (GBP/USD FVG Retest) */}
                  <div className={styles.dockItemWrapper}>
                    {activeSidebarTab === 'sliders' && <span className={styles.activeTabGlowPill} />}
                    <button
                      type="button"
                      onClick={() => handleTabClick('sliders')}
                      className={`${styles.dockIconBtn} ${activeSidebarTab === 'sliders' ? styles.activeDockBtn : ''}`}
                      title="Real-Time FVG Scanner (GBP/USD)"
                      aria-label="Real-Time FVG Scanner"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="21" x2="4" y2="14"/>
                        <line x1="4" y1="10" x2="4" y2="3"/>
                        <line x1="12" y1="21" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12" y2="3"/>
                        <line x1="20" y1="21" x2="20" y2="16"/>
                        <line x1="20" y1="12" x2="20" y2="3"/>
                        <line x1="1" y1="14" x2="7" y2="14"/>
                        <line x1="9" y1="8" x2="15" y2="8"/>
                        <line x1="17" y1="16" x2="23" y2="16"/>
                      </svg>
                    </button>
                  </div>

                  {/* 4. Report Tab (Trade Audit) */}
                  <div className={styles.dockItemWrapper}>
                    {activeSidebarTab === 'report' && <span className={styles.activeTabGlowPill} />}
                    <button
                      type="button"
                      onClick={() => handleTabClick('report')}
                      className={`${styles.dockIconBtn} ${activeSidebarTab === 'report' ? styles.activeDockBtn : ''}`}
                      title="AI Past Trade Performance Audit"
                      aria-label="AI Past Trade Performance Audit"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                    </button>
                  </div>

                </div>

                {/* Bottom Settings Icon */}
                <div className={styles.sidebarBottomGroup}>
                  <button type="button" className={styles.dockIconBtn} title="Terminal Settings" aria-label="Settings">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  </button>
                </div>
              </aside>

              {/* Main Chat Interface */}
              <div className={styles.terminalMain}>
                
                {/* Top Header Bar */}
                <header className={styles.terminalHeader}>
                  <div className={styles.brandTitleRow}>
                    <img src="/assets/logo/logo.png" alt="ChronosX" className={styles.terminalLogoImg} />
                    <span className={styles.headerDivider}>|</span>
                    <span className={styles.headerSubtitle}>AI TRADING ADVISOR</span>
                  </div>

                  <div className={styles.onlineStatusBadge}>
                    <span className={styles.statusDotGreen} />
                    <span className={styles.statusLabel}>AI ONLINE</span>
                  </div>
                </header>

                {/* Chat Scroll Viewport */}
                <div 
                  ref={chatBodyRef} 
                  className={styles.chatBody}
                  data-lenis-prevent="true"
                  onWheel={(e) => e.stopPropagation()}
                >
                  <AnimatePresence mode="popLayout">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        className={msg.role === 'user' ? styles.userRowWrapper : styles.botRowWrapper}
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      >
                        {msg.role === 'user' ? (
                          /* Right-aligned User Bubble */
                          <div className={styles.userBubbleCard}>
                            <div className={styles.userAvatar}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                              </svg>
                            </div>
                            <div className={styles.userBubbleBody}>
                              <div className={styles.userHeaderName}>You</div>
                              <div className={styles.userQueryText}>{msg.text}</div>
                              <div className={styles.userTimestampRow}>
                                <span>{msg.time || "10:24 AM"}</span>
                                <span className={styles.checkMarks}>✓✓</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* ChronosX AI Luminescent Glowing Response Card */
                          <div className={styles.aiResponseCard}>
                            
                            {/* Header row */}
                            <div className={styles.aiCardHeaderRow}>
                              <div className={styles.aiProfileCluster}>
                                <div className={styles.sparkleBadge}>
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
                                  </svg>
                                </div>
                                <span className={styles.aiBotName}>ChronosX Advisor</span>
                                <span className={styles.verifiedSignalBadge}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="16"/>
                                    <line x1="8" y1="12" x2="16" y2="12"/>
                                  </svg>
                                  VERIFIED SIGNAL
                                </span>
                              </div>

                              <span className={styles.aiCardTime}>{msg.time || "10:24 AM"}</span>
                            </div>

                            {/* Headline intro text with Word-by-Word Streaming animation */}
                            <div className={styles.aiHeadlineIntro}>
                              <StreamingText 
                                text={msg.intro} 
                                speed={20} 
                                isActive={i === messages.length - 1} 
                              />
                            </div>

                            {/* Technical Analysis Bullets */}
                            {msg.bullets && (
                              <div className={styles.analysisBulletsList}>
                                {msg.bullets.map((bullet, bIdx) => (
                                  <div key={bIdx} className={styles.bulletItem}>
                                    <span className={styles.bulletPoint}>◆</span>
                                    <span className={styles.bulletText}>
                                      <StreamingText 
                                        text={bullet} 
                                        speed={22} 
                                        delay={300 + bIdx * 250}
                                        isActive={i === messages.length - 1} 
                                      />
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Tailored Candlestick & Technical Chart Renderer */}
                            {msg.chartData && (
                              <DedicatedChartRenderer chartData={msg.chartData} />
                            )}

                            {/* Sources & Filter Pills Row */}
                            <div className={styles.sourcesPillRow}>
                              <div className={styles.sourcesBtn}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                  <polyline points="14 2 14 8 20 8"/>
                                  <line x1="16" y1="13" x2="8" y2="13"/>
                                  <line x1="16" y1="17" x2="8" y2="17"/>
                                </svg>
                                Sources
                              </div>

                              {msg.pills?.map((pill, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => handleQuickPrompt(pill)}
                                  className={`${styles.filterPill} ${activePill === pill ? styles.activeFilterPill : ''}`}
                                >
                                  {pill}
                                </button>
                              ))}
                            </div>

                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Thinking Status Indicator */}
                  {isThinking && (
                    <motion.div 
                      className={styles.thinkingRow}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className={styles.sparkleBadgeSmall}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
                        </svg>
                      </div>
                      <span className={styles.thinkingText}>SCANNING INSTITUTIONAL ORDER FLOW & VOLUMES...</span>
                    </motion.div>
                  )}
                </div>

                {/* Bottom Interactive Chat Input Bar */}
                <form onSubmit={handleSendMessage} className={styles.chatInputContainer}>
                  <button type="button" className={styles.attachmentBtn} aria-label="Attach File">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                  </button>

                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask ChronosX Advisor anything..."
                    className={styles.terminalInput}
                  />

                  <button type="button" className={styles.micBtn} aria-label="Voice Input">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  </button>

                  <button type="submit" className={styles.terminalSendBtn} aria-label="Send">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#040605" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </form>

              </div>

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
              badge="CHRONOSX · AI TRADING ADVISOR"
              title1="AI on Top of Verified Data."
              title2="Not Instead of It."
              description="Raw signals and setups originate from real-time market data and quantitative algorithms. ChronosX translates complex charts into plain English—explaining exactly why a setup triggered, filtering market scans, and validating your risk parameters in milliseconds."
            />

            {/* Feature List Points */}
            <div className={styles.featureList}>
              {featurePoints.map((item, index) => (
                <div key={index} className={styles.featureItem}>
                  <div className={styles.numBadge}>{item.num}</div>
                  <div className={styles.featureContent}>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
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
