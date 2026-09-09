import React from 'react'
import styles from './home.module.scss'
import Herobanner from './herobanner'
import AiCockpit from './aiCockpit'
import MetricsSection from './metricsSection'
import CardList from './cardList'
import Platform from './platform'
import Capabilities from './capabilities'
import AiAssistant from './aiAssistant'
import HowitWorks from './howitWorks'
import ChartAnalysis from './chartAnalysis'
import BreakoutDetection from './breakoutDetection'
import AiAnalyst from './aiAnalyst'
import BeforeAfterComparison from './beforeAfterComparison'
import MarketIntelligence from './marketIntelligence'
import TeamUp from './teamUp'
import Testimonials from './testimonials'
import GlobalNetworkMap from './globalNetworkMap'
import ReadytoPut from './readytoPut'

export default function HomePage() {
    return (
        <div className={styles.homeWrapper}>
            <Herobanner />
            <div className={styles.contentSections}>
                <Capabilities />
                <MetricsSection />
                <AiCockpit isHero={false} showHeader={true} />
                <AiAnalyst />
                <BeforeAfterComparison />
                <HowitWorks />
                <MarketIntelligence />
                <BreakoutDetection />
                <TeamUp />
                <GlobalNetworkMap />
                <Testimonials />
                <ReadytoPut />
            </div>
        </div>  
    )
}

