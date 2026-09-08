'use client';
import React, { useState, useRef } from 'react';
import styles from './footer.module.scss';
import Link from 'next/link';
import { getAuthHref } from '@/lib/authRedirect';
import { useLanguage } from '@/context/LanguageContext';

const Logo = '/assets/logo/logo.png';

const socialLinks = [
  { icon: '/assets/icons/twitter.svg', href: 'https://twitter.com', label: 'Twitter' },
  { icon: '/assets/icons/instagram.svg', href: 'https://instagram.com', label: 'Instagram' },
  { icon: '/assets/icons/discord.svg', href: 'https://discord.com', label: 'Discord' },
  { icon: '/assets/icons/telegram.svg', href: 'https://t.me/ChronosX_Official', label: 'Telegram' },
  { icon: '/assets/icons/youtube.svg', href: 'https://youtube.com', label: 'YouTube' }
];

export default function Footer() {
  const { t } = useLanguage();
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
        {/* Giant Interactive Brand Signature */}
        <div
          ref={containerRef}
          className={styles.brandSignatureSection}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <h2 className={`${styles.signatureTypography} ${styles.baseLayer}`} aria-hidden="true">
            ChronosX
          </h2>

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
              {t('footer.brandDesc', 'Institutional-grade AI trading intelligence, neural chart pattern detection, and quantitative execution models built for modern traders.')}
            </p>
            <div className={styles.statusBadge}>
              <span className={styles.statusDot} />
              <span>{t('footer.statusOnline', 'AI Trading Desk Online')}</span>
            </div>
          </div>

          {/* 1. Products Column */}
          <div className={styles.navCol}>
            <h4>{t('footer.productsTitle', 'PRODUCTS')}</h4>
            <ul>
              <li><Link href="/ai-chart-scanner">{t('header.products.chartScanner.title', 'AI Chart Scanner')}</Link></li>
              <li><Link href="/ai-market-assistant">{t('header.products.marketAssistant.title', 'AI Market Assistant')}</Link></li>
              <li><Link href="/live-market-scanner">{t('header.products.liveScanner.title', 'Live Market Scanner')}</Link></li>
              <li><Link href="/ai-strategy-hub">{t('header.products.strategyHub.title', 'Strategy Hub')}</Link></li>
            </ul>
          </div>

          {/* 2. Trading Tools Column */}
          <div className={styles.navCol}>
            <h4>{t('footer.tradingToolsTitle', 'TRADING TOOLS')}</h4>
            <ul>
              <li><Link href="/ai-trade-audit">{t('header.tradingTools.tradeAudit.title', 'AI Trade Audit')}</Link></li>
              <li><Link href={getAuthHref('/strategy-hub')}>{t('footer.strategyBuilder', 'Strategy Builder')}</Link></li>
              <li><Link href={getAuthHref('/strategy-hub')}>{t('footer.quantBacktesting', 'Quant Backtesting')}</Link></li>
              <li><Link href={getAuthHref('/dashboard')}>{t('footer.paperTradingDesk', 'Paper Trading Desk')}</Link></li>
            </ul>
          </div>

          {/* 3. Company & Resources Column */}
          <div className={styles.navCol}>
            <h4>{t('footer.companyTitle', 'COMPANY')}</h4>
            <ul>
              <li><Link href="/about-us">{t('header.company.aboutUs.title', 'About Us')}</Link></li>
              <li><Link href="/plans">{t('footer.pricingPlans', 'Pricing Plans')}</Link></li>
              <li><Link href="/blogs">{t('footer.researchBlogs', 'Research & Blogs')}</Link></li>
              <li><Link href="/market-news">{t('header.company.news.title', 'Market News')}</Link></li>
              <li><Link href="/forex-calculator">{t('header.company.forexCalculator.title', 'Forex Calculator')}</Link></li>
              <li><Link href="/economic-calendar">{t('header.company.economicCalendar.title', 'Economic Calendar')}</Link></li>
              <li><Link href="/contact-us">{t('footer.contactUs', 'Contact Us')}</Link></li>
            </ul>
          </div>

          {/* 4. Legal Column */}
          <div className={styles.navCol}>
            <h4>{t('footer.legalTitle', 'LEGAL')}</h4>
            <ul>
              <li><Link href="/privacy-policy">{t('footer.privacyPolicy', 'Privacy Policy')}</Link></li>
              <li><Link href="/terms-and-conditions">{t('footer.termsAndConditions', 'Terms & Conditions')}</Link></li>
              <li><Link href="/risk-disclosure">{t('footer.riskDisclosure', 'Risk Disclosure')}</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.disclaimerSection}>
          <p>{t('footer.disclaimerP1')}</p>
          <p>{t('footer.disclaimerP2')}</p>
          <p>{t('footer.disclaimerP3')}</p>
          <p>{t('footer.disclaimerP4')}</p>
          <p>{t('footer.disclaimerP5')}</p>

          <p className={styles.fullDisclaimerLink}>
            {t('footer.disclaimerNotice')}{' '}
            <Link href="/risk-disclosure">{t('footer.riskDisclosure', 'Risk Disclosure')}</Link> {t('common.and', 'and')}{' '}
            <Link href="/terms-and-conditions">{t('footer.termsAndConditions', 'Terms & Conditions')}</Link>.
          </p>
        </div>

        <div className={styles.divider} />

        {/* Bottom Bar */}
        <div className={styles.bottomSection}>
          <p>{t('footer.copyright', '© 2026 ChronosX. All rights reserved.')}</p>

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
