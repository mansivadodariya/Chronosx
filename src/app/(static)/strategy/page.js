import AiStrategyPage from "@/rendering/aiStrategyPage";

export const metadata = {
    title: "AI Strategy & Live Analysis Feed — 100-Point Quantitative Engine | ChronosX",
    description:
        "Experience real-time institutional FX intelligence. Select custom algorithmic strategies, track live 100-point Technical Scores across major pairs, and execute data-backed trades with multi-factor confluence.",
    keywords: [
        "AI Trading Strategy",
        "Live Analysis Feed",
        "100-Point Technical Score",
        "Quantitative Forex Engine",
        "MetaTrader 5 Strategies",
        "Forex Watchlist Grid",
        "Multi-Timeframe Trend Confluence",
        "EMA Pullback Strategy",
        "Algorithmic FX Signals",
        "ChronosX AI Strategy"
    ],
    openGraph: {
        title: "AI Strategy & Live Analysis Feed — Quantitative AI Generator | ChronosX",
        description:
            "Track live 100-point Technical Scores across 6+ Forex pairs. 4-pillar algorithmic evaluation covering Trend, Momentum, Volume, and Structure.",
        url: "https://chronosx.com/ai-strategy",
        siteName: "ChronosX",
        images: [
            {
                url: "/assets/images/ai-strategy.png",
                width: 1200,
                height: 630,
                alt: "ChronosX AI Strategy Live Feed"
            }
        ],
        locale: "en_US",
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "AI Strategy & Live Analysis Feed — ChronosX Quant Engine",
        description:
            "Select custom algorithmic strategies and execute data-backed trades with live multi-factor confluence.",
        images: ["/assets/images/ai-strategy.png"]
    },
    alternates: {
        canonical: "https://chronosx.com/ai-strategy"
    }
};

export default function Page() {
    return <AiStrategyPage />;
}
