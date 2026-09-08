import AiTrade from "@/rendering/aiTrade";

export const metadata = {
    title: "AI Chart Scanner — Instant Vision AI Technical Pattern Scanner | ChronosX",
    description:
        "Upload any TradingView, MT4/MT5, or broker chart screenshot and get instant institutional AI trade signals. Dual Vision AI and live MT5 indicator confluence with precise Entry, Stop-Loss, and Multi-TP targets.",
    keywords: [
        "AI Chart Scanner",
        "Vision AI Chart Scanner",
        "AI Snap Trading",
        "Chart screenshot analyzer",
        "MetaTrader 5 AI Scanner",
        "TradingView AI scanner",
        "Automated trade setups",
        "Forex chart recognition AI",
        "Market chart pattern AI",
        "ChronosX AI Chart Scanner"
    ],
    openGraph: {
        title: "AI Chart Scanner — Instant Vision AI Technical Pattern Scanner | ChronosX",
        description:
            "Upload any chart screenshot. Get instant institutional AI trade setups powered by Vision AI + MT5 indicator engines.",
        url: "https://chronosx.com/ai-chart-scanner",
        siteName: "ChronosX",
        images: [
            {
                url: "/assets/images/ai-trade.png",
                width: 1200,
                height: 630,
                alt: "ChronosX AI Chart Scanner"
            }
        ],
        locale: "en_US",
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "AI Chart Scanner — ChronosX Vision Scanner",
        description:
            "Upload any chart screenshot and receive precise BUY / SELL / NO-TRADE execution setups in seconds.",
        images: ["/assets/images/ai-trade.png"]
    },
    alternates: {
        canonical: "https://chronosx.com/ai-chart-scanner"
    }
};

export default function AiChartScannerPage() {
    return <AiTrade />;
}
