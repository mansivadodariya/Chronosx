'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import WhiteLabelHero from './components/WhiteLabelHero';
import WhiteLabelIntro from './components/WhiteLabelIntro';
import WhiteLabelCapabilities from './components/WhiteLabelCapabilities';
import WhiteLabelAudience from './components/WhiteLabelAudience';
import WhiteLabelMakeItYours from './components/WhiteLabelMakeItYours';
import WhiteLabelEcosystem from './components/WhiteLabelEcosystem';
import WhiteLabelHowItWorks from './components/WhiteLabelHowItWorks';
import WhiteLabelUseCases from './components/WhiteLabelUseCases';
import WhiteLabelFaq from './components/WhiteLabelFaq';
import styles from './whiteLabel.module.scss';

export default function WhiteLabel() {
    const router = useRouter();
    const [contactOpen, setContactOpen] = useState(false);

    const handleContactClick = () => {
        router.push('/contact-us?subject=White-Label%20Enterprise%20Inquiry');
    };

    return (
        <main className={styles.whiteLabelPage}>
            {/* Ambient Background Lighting & Tech Grid */}
            <div className={styles.ambientGlowTop} />
            <div className={styles.ambientGlowRight} />
            <div className={styles.ambientGlowLeft} />
            <div className={styles.gridPatternOverlay} />

            {/* 01 — Hero Section */}
            <WhiteLabelHero onContactClick={handleContactClick} />

            {/* 02 & 03 — Introduction & What is ChronosX White Label */}
            <WhiteLabelIntro />

            {/* 04 — Core Capabilities */}
            <WhiteLabelCapabilities />

            {/* 05 — Who Is It For */}
            <WhiteLabelAudience />

            {/* 06 & 14 — Your Brand, Your Platform & Customization */}
            <WhiteLabelMakeItYours />

            {/* 08 — Platform Ecosystem */}
            <WhiteLabelEcosystem />

            {/* 10 & 11 — How It Works, Advantage & Security */}
            <WhiteLabelHowItWorks />

            {/* 16 — Ideal White-Label Use Cases */}
            <WhiteLabelUseCases />

            {/* 17 & 18 — CTA and FAQ */}
            <WhiteLabelFaq onContactClick={handleContactClick} />
        </main>
    );
}
