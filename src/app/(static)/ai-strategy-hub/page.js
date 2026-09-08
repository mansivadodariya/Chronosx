import AiStrategyPage from "@/rendering/aiStrategyPage";

export const metadata = {
    title: "AI Strategy Hub — Algorithmic Playbooks & Strategy Engine | ChronosX",
    description:
        "Select custom algorithmic strategies, explore high-conviction quantitative rule playbooks, and execute data-backed trades with multi-factor confluence.",
    keywords: [
        "Strategy Hub",
        "AI Strategy",
        "Algorithmic Playbooks",
        "Quantitative Strategy Engine",
        "MetaTrader 5 Strategies",
        "ChronosX Strategy Hub"
    ],
    openGraph: {
        title: "AI Strategy Hub — Algorithmic Playbooks & Strategy Engine | ChronosX",
        description:
            "Select custom algorithmic strategies and deploy institutional rule playbooks with multi-factor confluence.",
        url: "https://chronosx.com/ai-strategy-hub",
        siteName: "ChronosX",
        images: [
            {
                url: "/assets/images/ai-strategy.png",
                width: 1200,
                height: 630,
                alt: "ChronosX Strategy Hub"
            }
        ],
        locale: "en_US",
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "AI Strategy Hub — ChronosX Strategy Engine",
        description:
            "Explore, backtest, and deploy algorithmic trading strategies with institutional accuracy metrics on ChronosX.",
        images: ["/assets/images/ai-strategy.png"]
    },
    alternates: {
        canonical: "https://chronosx.com/ai-strategy-hub"
    }
};

export default function StrategyHubPage() {
    return <AiStrategyPage />;
}
