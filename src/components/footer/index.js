'use client';
import React, { useRef } from 'react';
import styles from './footer.module.scss';
import Link from 'next/link';
import { getAuthHref } from '@/lib/authRedirect';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useTabPermission } from '@/lib/useTabPermission';

const DarkLogo = '/assets/logo/logo.png';
const LightLogo = '/assets/logo/darklogo.png';

const socialLinks = [
  { icon: '/assets/icons/twitter.svg', href: 'https://twitter.com', label: 'Twitter' },
  { icon: '/assets/icons/instagram.svg', href: 'https://instagram.com', label: 'Instagram' },
  { icon: '/assets/icons/discord.svg', href: 'https://discord.com', label: 'Discord' },
  { icon: '/assets/icons/telegram.svg', href: 'https://t.me/ChronosX_Official', label: 'Telegram' },
  { icon: '/assets/icons/youtube.svg', href: 'https://youtube.com', label: 'YouTube' }
];

export default function Footer() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const hasPlansPermission = useTabPermission('Subscription Plans');
  const activeLogo = theme === 'light' ? LightLogo : DarkLogo;
  const containerRef = useRef(null);
  const spotlightRef = useRef(null);
  const rafRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !spotlightRef.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!containerRef.current || !spotlightRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      spotlightRef.current.style.setProperty('--cursor-x', `${x}px`);
      spotlightRef.current.style.setProperty('--cursor-y', `${y}px`);
    });
  };

  const handleMouseEnter = () => {
    if (spotlightRef.current) {
      spotlightRef.current.style.setProperty('--hover-opacity', '1');
    }
  };

  const handleMouseLeave = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (spotlightRef.current) {
      spotlightRef.current.style.setProperty('--hover-opacity', '0');
    }
  };

  return (
    <footer className={styles.footer}>
      <div className='container'>
        {/* Giant Interactive Brand Signature */}
        <div
          ref={containerRef}
          className={styles.brandSignatureSection}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <h2 className={`${styles.signatureTypography} ${styles.baseLayer}`} aria-hidden="true">
            ChronosX
          </h2>

          <h2
            ref={spotlightRef}
            className={`${styles.signatureTypography} ${styles.spotlightLayer}`}
          >
            ChronosX
          </h2>
        </div>

        {/* Navigation & Company Links */}
        <div className={styles.topSection}>
          {/* Brand Info */}
          <div className={styles.brandCol}>
            <div className={styles.brandLogo}>
              <Link href="/" aria-label="ChronosX FrontPage">
                <img src={activeLogo} alt='ChronosX Logo' />
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
              <li><Link href="/ai-trading-signal">{t('header.products.strategyHub.title', 'AI Trading Signal')}</Link></li>
            </ul>
          </div>

          {/* 2. Trading Tools Column */}
          <div className={styles.navCol}>
            <h4>{t('footer.tradingToolsTitle', 'TRADING TOOLS')}</h4>
            <ul>
              <li><Link href="/ai-trade-advisor">{t('header.tradingTools.tradeAudit.title', 'AI Trade Advisor')}</Link></li>
              <li><Link href={getAuthHref('/strategy-core')}>{t('footer.strategyBuilder', 'Strategy Builder')}</Link></li>
              <li><Link href={getAuthHref('/strategy-core')}>{t('footer.quantBacktesting', 'Quant Backtesting')}</Link></li>
            </ul>
          </div>

          {/* 3. Company & Resources Column */}
          <div className={styles.navCol}>
            <h4>{t('footer.companyTitle', 'COMPANY')}</h4>
            <ul>
              <li><Link href="/about-us">{t('header.company.aboutUs.title', 'About Us')}</Link></li>
              {hasPlansPermission && (
                <li><Link href="/plans">{t('footer.pricingPlans', 'Pricing Plans')}</Link></li>
              )}
              <li><Link href="/blogs">{t('footer.researchBlogs', 'Research & Blogs')}</Link></li>
              <li><Link href="/market-news">{t('header.company.news.title', 'Market News')}</Link></li>
              <li><Link href="/forex-calculator">{t('header.company.forexCalculator.title', 'Forex Calculator')}</Link></li>
              <li><Link href="/economic-calendar">{t('header.company.economicCalendar.title', 'Economic Calendar')}</Link></li>
              {/* <li><Link href="/white-label">{t('footer.whiteLabel', 'White Label')}</Link></li> */}
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
              {/* No Refund Policy */}
              <li><Link href="/no-refund-policy">{t('footer.noRefundPolicy', 'No Refund Policy')}</Link></li>
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
