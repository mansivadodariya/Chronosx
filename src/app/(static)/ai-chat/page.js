import AiChat from "@/rendering/aiChat";

export const metadata = {
    title: "AI Forex & Trading Chat Copilot — Live MT5 Market Intelligence | ChronosX",
    description:
        "Your 24/7 AI-Powered Institutional Forex & Trading Copilot. Ask questions, analyze real-time market trends, calculate precise risk management parameters, and receive instant data-driven trade setups powered by live MetaTrader 5 (MT5) market feeds.",
    keywords: [
        "AI Forex Chat",
        "AI Trading Copilot",
        "MetaTrader 5 AI",
        "MT5 live feed AI",
        "Forex AI assistant",
        "Institutional technical analysis",
        "Position size calculator AI",
        "Real-time trade setups",
        "Gold XAUUSD analysis AI",
        "ChronosX AI Chat"
    ],
    openGraph: {
        title: "AI Forex & Trading Chat Copilot | ChronosX",
        description:
            "Ask questions, analyze real-time market trends, calculate precise risk parameters, and receive instant trade setups powered by live MT5 feeds.",
        url: "https://chronosx.com/ai-chat",
        siteName: "ChronosX",
        images: [
            {
                url: "/assets/images/ai-chat.png",
                width: 1200,
                height: 630,
                alt: "ChronosX AI Trading Chat Copilot"
            }
        ],
        locale: "en_US",
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "AI Forex & Trading Chat Copilot — ChronosX",
        description:
            "Your 24/7 AI-Powered Institutional Forex & Trading Copilot with live MetaTrader 5 integration.",
        images: ["/assets/images/ai-chat.png"]
    },
    alternates: {
        canonical: "https://chronosx.com/ai-chat"
    }
};

export default function AiChatPage() {
    return <AiChat />;
}
