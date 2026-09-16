import AiPastTradeAnalyzer from "@/rendering/aiPastTradeAnalyzer";

export const metadata = {
    title: "AI Past Trade Analyzer — Learn From Every Trade & Eliminate Leaks | ChronosX",
    description:
        "Upload your past trade screenshots and statements to get instant AI-powered advice and audits. Identify poor entries, risk management errors, market structure conflicts, and execution mistakes to trade smarter.",
    keywords: [
        "AI Past Trade Analyzer",
        "past trade analyzer",
        "AI Trade Advisor",
        "trade advisor",
        "AI Trade Audit",
        "trading mistake detection",
        "forex trade review",
        "market trade analysis",
        "risk management audit",
        "ChronosX AI",
        "algorithmic trade review",
        "trading psychology"
    ],
    openGraph: {
        title: "AI Past Trade Analyzer — Learn From Every Trade | ChronosX",
        description:
            "Stop guessing why you lost. Let ChronosX AI analyze your completed trade screenshots, detect execution flaws, and give you actionable improvements in seconds.",
        url: "https://chronosx.com/ai-trade-advisor",
        siteName: "ChronosX",
        images: [
            {
                url: "/assets/images/ai-past-trade-analyzer/brain-pedestal.jpg",
                width: 1200,
                height: 630,
                alt: "ChronosX AI Past Trade Analyzer"
            }
        ],
        locale: "en_US",
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "AI Past Trade Analyzer — ChronosX",
        description:
            "Your past trades have the answers. Deep AI advice for your entries, exits, risk management, and execution mistakes.",
        images: ["/assets/images/ai-past-trade-analyzer/brain-pedestal.jpg"]
    },
    alternates: {
        canonical: "https://chronosx.com/ai-trade-advisor"
    }
};

export default function AiTradeAdvisorPage() {
    return <AiPastTradeAnalyzer />;
}
