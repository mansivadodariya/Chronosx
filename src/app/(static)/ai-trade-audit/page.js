import AiPastTradeAnalyzer from "@/rendering/aiPastTradeAnalyzer";

export const metadata = {
    title: "AI Trade Audit — Learn From Every Trade & Eliminate Leaks | ChronosX",
    description:
        "Upload your past trade screenshots and statements to get instant AI-powered audits. Identify poor entries, risk management errors, market structure conflicts, and execution mistakes to trade smarter.",
    keywords: [
        "AI Trade Audit",
        "trade audit",
        "trading mistake detection",
        "forex trade review",
        "market trade analysis",
        "risk management audit",
        "ChronosX AI",
        "algorithmic trade review",
        "trading psychology"
    ],
    openGraph: {
        title: "AI Trade Audit — Learn From Every Trade | ChronosX",
        description:
            "Stop guessing why you lost. Let ChronosX AI analyze your completed trade screenshots, detect execution flaws, and give you actionable improvements in seconds.",
        url: "https://chronosx.com/ai-trade-audit",
        siteName: "ChronosX",
        images: [
            {
                url: "/assets/images/ai-past-trade-analyzer/brain-pedestal.jpg",
                width: 1200,
                height: 630,
                alt: "ChronosX AI Trade Audit"
            }
        ],
        locale: "en_US",
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "AI Trade Audit — ChronosX",
        description:
            "Your past trades have the answers. Deep AI audits for your entries, exits, risk management, and execution mistakes.",
        images: ["/assets/images/ai-past-trade-analyzer/brain-pedestal.jpg"]
    },
    alternates: {
        canonical: "https://chronosx.com/ai-trade-audit"
    }
};

export default function AiTradeAuditPage() {
    return <AiPastTradeAnalyzer />;
}
