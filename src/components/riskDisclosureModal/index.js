'use client';

import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './riskDisclosureModal.module.scss';

export default function RiskDisclosureModal({ isOpen, onAccept, userId }) {
    const [submitting, setSubmitting] = useState(false);
    const contentRef = useRef(null);

    // Lock background/outer page scroll when modal is active
    useEffect(() => {
        if (!isOpen) return;

        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleWheel = (e) => {
        if (contentRef.current) {
            const { scrollHeight, clientHeight } = contentRef.current;
            if (scrollHeight > clientHeight) {
                e.stopPropagation();
                contentRef.current.scrollTop += e.deltaY;
            }
        }
    };

    const handleAccept = async () => {
        setSubmitting(true);
        const timestamp = new Date().toISOString();

        // 1. Instant local persistence for zero-latency UI
        try {
            if (userId) {
                localStorage.setItem(`risk_disclosure_accepted_${userId}`, timestamp);
            }
            localStorage.setItem('risk_disclosure_accepted_global', timestamp);
        } catch { /* ignore */ }

        // 2. Sync to Supabase users table if available
        if (userId && supabase) {
            try {
                await supabase
                    .from('users')
                    .update({ risk_accepted_at: timestamp })
                    .eq('id', userId);
            } catch (err) {
                console.warn('Could not sync risk_accepted_at to users table:', err);
            }
        }

        setSubmitting(false);
        if (onAccept) {
            onAccept();
        }
    };

    return (
        <div className={styles.modalBackdrop}>
            <div
                className={styles.modalCard}
                role="dialog"
                aria-modal="true"
                aria-labelledby="risk-modal-title"
                onWheel={handleWheel}
            >
                {/* 1. Header with Warning Icon */}
                <div className={styles.modalHeader}>
                    <div className={styles.headerIconWrap}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>

                    <div className={styles.titleWrap}>
                        <h2 id="risk-modal-title">Risk Disclosure</h2>
                        <p className={styles.headerSubtitle}>Please read carefully before continuing.</p>
                    </div>
                </div>

                {/* 2. Scrollable Body Content */}
                <div className={styles.disclosureContent} ref={contentRef}>
                    <p className={styles.introParagraph}>
                        Welcome. Before you continue on this platform, please review the disclosure below. The platform is a software and technology service — it is not a broker, custodian, or counterparty to any trade placed through it.
                    </p>

                    {/* Section 1 */}
                    <div className={styles.sectionBlock}>
                        <h3>1. High-Risk Investment Warning</h3>
                        <p className={styles.strongText}>
                            Trading in financial markets carries a high level of risk and may not be suitable for every investor.
                        </p>
                        <p>
                            Before deciding to trade forex, cryptocurrencies, CFDs, or any other financial instrument, you should carefully consider your investment objectives, level of experience, and risk appetite. You may sustain a loss of some or all of your initial investment.
                        </p>
                        <ul className={styles.bulletList}>
                            <li>You should not invest money that you cannot afford to lose.</li>
                            <li>Past performance is not indicative of future results.</li>
                            <li>Leverage can work against you as well as for you.</li>
                            <li>Market conditions can change rapidly and without warning.</li>
                        </ul>
                    </div>

                    {/* Section 2 */}
                    <div className={styles.sectionBlock}>
                        <h3>2. No Liability for Trading Losses</h3>
                        <p>
                            This platform, its operator, and its affiliates, directors, officers, employees and agents shall NOT be held responsible or liable for:
                        </p>
                        <ul className={styles.bulletList}>
                            <li>Any trading losses, whether direct, indirect, incidental, or consequential.</li>
                            <li>Losses arising from copy trading, signal following, auto-trading, or strategy replication.</li>
                            <li>Market volatility, slippage, or execution delays.</li>
                            <li>Broker actions, spreads, swap charges, or margin requirements.</li>
                            <li>Technical failures, system downtime, or connectivity issues.</li>
                            <li>Losses due to user error, negligence, or unauthorised account access.</li>
                        </ul>
                    </div>

                    {/* Section 3 */}
                    <div className={styles.sectionBlock}>
                        <h3>3. Auto-Analysis, Auto-Trade & Trade-Idea Disclaimer</h3>
                        <p>
                            Auto-analysis, auto-trade, copy-trading, and signal/idea-following features are provided strictly for informational and convenience purposes. By using these features, you acknowledge:
                        </p>
                        <ul className={styles.bulletList}>
                            <li>Following or copying trades does NOT guarantee profits or replicate exact results.</li>
                            <li>Historical performance of any analyzer, strategy, or signal source does NOT guarantee future results.</li>
                            <li>You are solely responsible for every trading decision placed by these features on your behalf.</li>
                            <li>Reported analyzer / strategy metrics are based on historical data and may not reflect live trading conditions.</li>
                            <li>Signal delays, missed trades, or partial executions can and do occur.</li>
                        </ul>
                    </div>

                    {/* Section 4 */}
                    <div className={styles.sectionBlock}>
                        <h3>4. No Financial, Investment, or Legal Advice</h3>
                        <p>
                            Nothing on the platform constitutes financial, investment, legal, or tax advice. All content, signals, strategies, AI analyses, and educational material is provided for informational and educational purposes only.
                        </p>
                        <p>
                            You should always seek advice from a qualified, licensed professional before making any investment decision.
                        </p>
                    </div>

                    {/* Section 5 */}
                    <div className={styles.sectionBlock}>
                        <h3>5. No Affiliation with Brokers or Exchanges</h3>
                        <p>
                            This platform is a software and technology service. It is NOT a broker, NOT a custodian, and NOT a counterparty to any trade placed through it.
                        </p>
                        <ul className={styles.bulletList}>
                            <li>The platform has no commercial agreement, revenue share, or financial relationship with the brokers or exchanges you connect.</li>
                            <li>All trades execute on the broker / exchange you have authenticated against; the platform never takes custody of your funds.</li>
                            <li>Listing a broker or exchange in the connect flow does not constitute an endorsement.</li>
                            <li>Account opening, margin, spreads, and dispute resolution remain entirely between you and the broker or exchange.</li>
                        </ul>
                    </div>

                    {/* Section 6 */}
                    <div className={styles.sectionBlock}>
                        <h3>6. Account Security & Responsibility</h3>
                        <p>You are solely responsible for:</p>
                        <ul className={styles.bulletList}>
                            <li>Maintaining the confidentiality of your account credentials and API keys.</li>
                            <li>All activity that occurs under your account.</li>
                            <li>Ensuring every connected broker or exchange account has appropriate risk-management settings (stop loss, max drawdown, etc.).</li>
                            <li>Monitoring your open positions and account balances.</li>
                        </ul>
                    </div>

                    {/* Section 7 */}
                    <div className={styles.sectionBlock}>
                        <h3>7. Service Availability & Modifications</h3>
                        <p>
                            The platform does not guarantee uninterrupted, error-free, or perfectly secure access. The operator reserves the right to modify, suspend, or discontinue any aspect of the service at any time without prior notice.
                        </p>
                    </div>

                    {/* Section 8 */}
                    <div className={styles.sectionBlock}>
                        <h3>8. Limitation of Liability</h3>
                        <p>
                            To the maximum extent permitted by applicable law, the total liability of the platform operator shall be limited to the fees you have paid (if any) for the specific service giving rise to the claim. In no event shall the operator be liable for any indirect, incidental, special, consequential, or punitive damages.
                        </p>
                    </div>

                    {/* Section 9 */}
                    <div className={styles.sectionBlock}>
                        <h3>9. Third-Party Technology Provider — Tradezee.ai</h3>
                        <p>
                            The platform you are using is powered by technology and AI-model infrastructure provided by Tradezee.ai. The trading-analysis AI models, the strategy generation engine, the auto-trade scheduler, and the trade-idea pipeline are all owned and operated by Tradezee.ai as a third-party technology supplier.
                        </p>
                        <p>
                            Under no circumstances shall Tradezee.ai be held liable, responsible, or accountable for:
                        </p>
                        <ul className={styles.bulletList}>
                            <li>Any trading losses whatsoever, regardless of cause.</li>
                            <li>Technical glitches, bugs, system failures, or downtime in its AI / inference infrastructure.</li>
                            <li>Data loss, corruption, or synchronisation issues.</li>
                            <li>Delayed, missed, or incorrectly executed trades.</li>
                            <li>API failures, connectivity issues, or integration problems with any broker or exchange.</li>
                            <li>Any other situation arising from the use of its technology by the platform operator or by you.</li>
                        </ul>
                        <p>
                            Tradezee.ai supplies the underlying technology only and has no control over your trading decisions, the broker you connect, or the live market conditions in which your trades execute. You expressly waive any and all claims against Tradezee.ai.
                        </p>
                    </div>

                    {/* Section 10 */}
                    <div className={styles.sectionBlock}>
                        <h3>10. Acknowledgement</h3>
                        <p>By accepting this disclaimer you confirm that:</p>
                        <ul className={styles.bulletList}>
                            <li>You have read and understood every term above.</li>
                            <li>You understand the risks involved in trading financial instruments.</li>
                            <li>You accept full responsibility for your trading decisions and their outcomes.</li>
                            <li>You release the platform operator from any liability for trading losses or platform-availability issues.</li>
                            <li>You understand that the platform has no affiliation with the brokers or exchanges you connect, and that all trades execute outside of the platform’s control.</li>
                            <li>You expressly waive all claims against Tradezee.ai (the underlying technology / AI-model provider) for any losses arising from technical issues or any other situation.</li>
                        </ul>
                    </div>
                </div>

                {/* 3. Footer Action */}
                <div className={styles.modalActions}>
                    <button
                        type="button"
                        onClick={handleAccept}
                        disabled={submitting}
                        className={styles.acceptBtn}
                    >
                        <span>{submitting ? 'Saving...' : 'I Understand and Accept'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
