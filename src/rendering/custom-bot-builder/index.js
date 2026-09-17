"use client";
import React, { useRef, useState } from 'react';
import HeroSection from './HeroSection';
import ThreeWaysSection from './ThreeWaysSection';
import MarketplaceSection from './MarketplaceSection';
import AiBuilderSection from './AiBuilderSection';
import GuidedBuilderSection from './GuidedBuilderSection';
import WorkflowSection from './WorkflowSection';
import BacktestIntegrationSection from './BacktestIntegrationSection';
import FaqSection from './FaqSection';
import FinalCta from './FinalCta';
import styles from './customBotBuilder.module.scss';

export default function CustomBotBuilderView() {
  const containerRef = useRef(null);
  const marketplaceRef = useRef(null);
  const aiBuilderRef = useRef(null);
  const guidedBuilderRef = useRef(null);

  const [mousePos, setMousePos] = useState({ x: 50, y: 20, isHovered: false });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y, isHovered: true });
  };

  const handleMouseLeave = () => {
    setMousePos(prev => ({ ...prev, isHovered: false }));
  };

  const scrollToMarketplace = () => {
    marketplaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAiBuilder = () => {
    aiBuilderRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToGuidedBuilder = () => {
    guidedBuilderRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectWay = (wayId) => {
    if (wayId === 'marketplace') scrollToMarketplace();
    else if (wayId === 'ai-builder') scrollToAiBuilder();
    else if (wayId === 'custom-builder') scrollToGuidedBuilder();
  };

  return (
    <div
      ref={containerRef}
      className={styles.pageWrapper}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Atmosphere Glows & Grid */}
      <div className={styles.ambientGlowTop} aria-hidden="true" />
      <div className={styles.ambientGlowCenter} aria-hidden="true" />
      <div className={styles.gridOverlay} aria-hidden="true" />

      {/* Interactive Cursor Spotlight */}
      <div
        className={styles.interactiveSpotlight}
        style={{
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          opacity: mousePos.isHovered ? 1 : 0
        }}
        aria-hidden="true"
      />

      {/* 1. HERO BANNER */}
      <HeroSection
        onStartClick={scrollToAiBuilder}
        onMarketplaceClick={scrollToMarketplace}
      />

      {/* CONTENT SECTIONS */}
      <div className={styles.contentSections}>
        {/* 2. THREE WAYS TO BUILD */}
        <ThreeWaysSection onSelectWay={handleSelectWay} />

        {/* 3. BOT MARKETPLACE SHOWCASE */}
        <MarketplaceSection refProp={marketplaceRef} />

        {/* 4. AI BOT BUILDER + CHAT SIMULATOR */}
        <AiBuilderSection refProp={aiBuilderRef} />

        {/* 5. CUSTOM GUIDED BOT BUILDER */}
        <GuidedBuilderSection refProp={guidedBuilderRef} />

        {/* 6. WORKFLOW FROM IDEA TO BOT */}
        <WorkflowSection />

        {/* 7. BACKTEST INTEGRATION & CATEGORY EXPLORER */}
        <BacktestIntegrationSection onExploreClick={scrollToMarketplace} />

        {/* 8. FAQ ACCORDION */}
        <FaqSection />

        {/* 9. FINAL CTA BANNER */}
        <FinalCta
          onBuildClick={scrollToAiBuilder}
          onMarketplaceClick={scrollToMarketplace}
        />
      </div>
    </div>
  );
}
