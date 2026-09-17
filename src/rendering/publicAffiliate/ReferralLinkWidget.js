"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '@/components/sectionHeader';
import styles from './publicAffiliate.module.scss';

export default function ReferralLinkWidget() {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const referralLink = "https://chronosx.com/signup?ref=YOUR-CODE";

  const handleCopy = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSocialShare = (platform) => {
    const encodedUrl = encodeURIComponent(referralLink);
    const text = encodeURIComponent("Join ChronosX - The Next-Gen AI Trading Platform!");
    let url = "";

    if (platform === 'x') url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`;
    if (platform === 'telegram') url = `https://t.me/share/url?url=${encodedUrl}&text=${text}`;
    if (platform === 'whatsapp') url = `https://api.whatsapp.com/send?text=${text}%20${encodedUrl}`;
    if (platform === 'linkedin') url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

    if (url) window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <section className={styles.referralWidgetSection}>
      <div className="container">
        <SectionHeader
          badge="YOUR REFERRAL LINK"
          title1="One-Click Instant"
          title2="Social Sharing"
          description="Share your unique referral link across social media, trading communities, websites, and direct channels. Make it easy to share ChronosX wherever your audience is active."
        />

        <div className={styles.widgetContainer}>
          {/* Link Box */}
          <div className={styles.linkDisplayBox}>
            <div className={styles.linkText}>{referralLink}</div>
            <button className={styles.copyBtn} onClick={handleCopy}>
              {copied ? 'COPIED! ✓' : 'COPY LINK'}
            </button>
          </div>

          {/* Code & QR Actions Row */}
          <div className={styles.widgetActionsRow}>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
              Referral Code: <strong style={{ color: '#18C98B' }}>YOUR-CODE</strong>
            </div>

            <button
              className={styles.heroSecondaryBtn}
              onClick={() => setShowQrModal(true)}
              style={{ padding: '8px 20px', fontSize: '0.85rem' }}
            >
              SHOW QR CODE
            </button>

            <div className={styles.socialShareGroup}>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginRight: 4 }}>Share On:</span>
              <button className={styles.socialBtn} onClick={() => handleSocialShare('x')}>𝕏 (Twitter)</button>
              <button className={styles.socialBtn} onClick={() => handleSocialShare('telegram')}>Telegram</button>
              <button className={styles.socialBtn} onClick={() => handleSocialShare('whatsapp')}>WhatsApp</button>
              <button className={styles.socialBtn} onClick={() => handleSocialShare('linkedin')}>LinkedIn</button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
            onClick={() => setShowQrModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                background: '#0B1319',
                border: '1px solid rgba(24,201,139,0.4)',
                borderRadius: 24,
                padding: 36,
                textAlign: 'center',
                maxWidth: 360,
                width: '100%',
                color: '#FFFFFF'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 700 }}>Your Referral QR Code</h3>
              <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Scan with smartphone camera to join ChronosX</p>
              
              <div style={{ background: '#FFFFFF', padding: 16, borderRadius: 16, display: 'inline-block', marginBottom: 24 }}>
                <svg width="180" height="180" viewBox="0 0 100 100" fill="#060B0E">
                  <path d="M0,0 h30 v30 h-30 z M40,0 h20 v10 h-20 z M70,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M80,10 h10 v10 h-10 z M0,40 h10 v20 h-10 z M30,40 h40 v10 h-40 z M80,40 h20 v20 h-20 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,70 h20 v30 h-20 z M70,70 h30 v30 h-30 z M80,80 h10 v10 h-10 z" />
                </svg>
              </div>

              <div>
                <button
                  className={styles.heroPrimaryBtn}
                  onClick={() => setShowQrModal(false)}
                  style={{ width: '100%' }}
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
