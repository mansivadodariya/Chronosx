'use client';
import React, { useState, useRef } from 'react';
import styles from './footer.module.scss';
import Link from 'next/link';
import { getAuthHref, getFeatureHref } from '@/lib/authRedirect';

const Logo = '/assets/logo/logo.png';

const socialLinks = [
  { icon: '/assets/icons/twitter.svg', href: 'https://twitter.com', label: 'Twitter' },
  { icon: '/assets/icons/instagram.svg', href: 'https://instagram.com', label: 'Instagram' },
  { icon: '/assets/icons/discord.svg', href: 'https://discord.com', label: 'Discord' },
  { icon: '/assets/icons/telegram.svg', href: 'https://t.me/ChronosX_Official', label: 'Telegram' },
  { icon: '/assets/icons/youtube.svg', href: 'https://youtube.com', label: 'YouTube' }
];

export default function Footer() {
  const containerRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  return (
    <footer className={styles.footer}>
      <div className='container'>
        {/* Giant Interactive Brand Signature (Web: Cursor Hover Reveal | Mobile: Auto Infinite Sweep) */}
        <div
          ref={containerRef}
          className={styles.brandSignatureSection}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Base Layer: Clean, Shadowless Light Tone Text */}
          <h2 className={`${styles.signatureTypography} ${styles.baseLayer}`} aria-hidden="true">
            ChronosX
          </h2>

          {/* Top Layer: 24K Luxury Gold Reveal (Web: Cursor tracking | Mobile: Auto Infinite Shimmer) */}
          <h2
            className={`${styles.signatureTypography} ${styles.spotlightLayer}`}
            style={{
              '--cursor-x': `${coords.x}px`,
              '--cursor-y': `${coords.y}px`,
              '--hover-opacity': isHovered ? 1 : 0,
            }}
          >
            ChronosX
          </h2>
        </div>

        {/* Navigation & Company Links */}
        <div className={styles.topSection}>
          {/* Brand Info */}
          <div className={styles.brandCol}>
            <div className={styles.brandLogo}>
              <Link href="/" aria-label="ChronosX Home">
                <img src={Logo} alt='ChronosX Logo' />
              </Link>
            </div>
            <p className={styles.brandDesc}>
              Institutional-grade AI trading intelligence, neural chart pattern detection,
              and quantitative execution models built for modern traders.
            </p>
            <div className={styles.statusBadge}>
              <span className={styles.statusDot} />
              <span>AI Trading Desk Online</span>
            </div>
          </div>

          {/* 1. Products Column */}
          <div className={styles.navCol}>
            <h4>PRODUCTS</h4>
            <ul>
              <li><Link href="/trade-snap">Market Snapshot & Scanner</Link></li>
              <li><Link href="/ai-assistant">AI Trading Advisor</Link></li>
              <li><Link href="/ai-strategy/live">AI Strategy Hub</Link></li>
            </ul>
          </div>

          {/* 2. Trading Tools Column */}
          <div className={styles.navCol}>
            <h4>TRADING TOOLS</h4>
            <ul>
              <li><Link href="/trade-analysis">AI Performance Analyzer</Link></li>
              <li><Link href={getAuthHref('/ai-strategy/live')}>Strategy Builder</Link></li>
              <li><Link href={getAuthHref('/ai-strategy/live')}>Quant Backtesting</Link></li>
              <li><Link href={getAuthHref('/dashboard')}>Paper Trading Desk</Link></li>
            </ul>
          </div>

          {/* 3. Company & Resources Column */}
          <div className={styles.navCol}>
            <h4>COMPANY</h4>
            <ul>
              <li><Link href="/about-us">About Us</Link></li>
              <li><Link href="/plans">Pricing Plans</Link></li>
              <li><Link href="/blogs">Research & Blogs</Link></li>
              <li><Link href="/market-news">Market News</Link></li>
              <li><Link href="/forex-calculator">Forex Calculator</Link></li>
              <li><Link href="/economic-calendar">Economic Calendar</Link></li>
              <li><Link href="/contact-us">Contact Us</Link></li>
            </ul>
          </div>

          {/* 4. Legal Column */}
          <div className={styles.navCol}>
            <h4>LEGAL</h4>
            <ul>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms-and-conditions">Terms & Conditions</Link></li>
              <li><Link href="/risk-disclosure">Risk Disclosure</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.disclaimerSection}>
          <p>
            Trading and investing in leveraged financial markets—including Foreign Exchange (Forex), commodities, and global indices—involves substantial risk and can result in the loss of your invested capital. Leveraged trading magnifies both potential gains and potential losses. All automated chart evaluations, AI-generated technical scores, pattern detection models, market commentary, and analytical toolsets provided across ChronosX are engineered strictly for informational and educational research purposes. Nothing on this platform constitutes or should be interpreted as financial, investment, legal, or trading advice. You are solely responsible for evaluating your risk tolerance and financial condition, and we strongly recommend consulting a certified, independent financial advisor before executing any trades. Past performance does not guarantee or predict future results.
          </p>

          <p>
            Hypothetical, backtested, and simulated algorithmic outputs have inherent limitations. Unlike real-world trading records, simulated outcomes do not represent live market transactions or actual account executions. Because simulated trades are not executed in live order books, results may not account for real-time market dynamics such as liquidity gaps, spread expansion, execution slippage, or sudden macroeconomic volatility. All historical backtests, neural pattern overlays, and quantitative metrics are modeled with historical datasets and should never be viewed as a promise or guarantee that any account will achieve comparable gains or avoid losses.
          </p>

          <p>
            Any user testimonials, case studies, or feedback presented on this platform depict individual experiences. Individual trading results vary widely based on risk parameters, personal discipline, market conditions, and experience. Past user experiences do not constitute a guarantee of future success or profitability.
          </p>

          <p>
            ChronosX operates exclusively as an artificial intelligence technology and market research platform. ChronosX is not a registered broker-dealer, financial custodian, exchange, or investment advisor. We do not hold client deposits, manage user capital, or execute orders on financial exchanges. We do not access individual user brokerage accounts, and we make no claims or representations regarding the comparative profitability or performance of users utilizing our platform features.
          </p>

          <p>
            All interactive candlestick charts, multi-timeframe pattern recognition overlays, and technical indicator engines accessible on the platform are powered by ChronosX’s proprietary visual analytics architecture. Market telemetry and price data across currencies, digital assets, and commodities are sourced from institutional data feeds for analytical screening. Data is delivered on an &quot;as-is&quot; basis for technical research and should be independently validated prior to making trading decisions.
          </p>

          <p className={styles.fullDisclaimerLink}>
            This statement serves as a summary notice and does not replace our complete legal framework. For exhaustive details on our operating terms and risk warnings, please review our full <Link href="/risk-disclosure">Risk Disclosure</Link> and <Link href="/terms-and-conditions">Terms & Conditions</Link>.
          </p>
        </div>

        <div className={styles.divider} />

        {/* Bottom Bar */}
        <div className={styles.bottomSection}>
          <p>© 2026 ChronosX. All rights reserved.</p>

          <div className={styles.socialList}>
            {socialLinks.map((item, index) => (
              <a
                key={index}
                href={item.href}
                aria-label={item.label}
                className={styles.socialBtn}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  className={styles.socialIcon}
                  style={{
                    maskImage: `url(${item.icon})`,
                    WebkitMaskImage: `url(${item.icon})`
                  }}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
