import { Anton, Plus_Jakarta_Sans, Roboto } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toast";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import SmoothScrollProvider from "@/components/smoothScroll";
import ClientOnlyWidgets from "@/components/ClientOnlyWidgets";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const antonSans = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: ["400"],
  display: 'swap',
});

const plusSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap"
});

const robotoSans = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: 'swap',
});

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://chronosx.com'),
  title: {
    default: "ChronosX — Next-Gen AI Trading Platform & Intelligence Desk",
    template: "%s | ChronosX"
  },
  description: "Next-gen AI trading platform providing real-time AI trading signals, instant neural chart pattern recognition, and multi-market insights across Forex, Stocks, and Commodities.",
  keywords: [
    "AI Forex Trading",
    "MT5 Trading Bot",
    "Algorithmic Trading Signals",
    "Forex AI Copilot",
    "ChronosX",
    "Neural Chart Pattern Recognition",
    "Live Forex Analysis",
    "Automated OCR Chart Vision",
    "Institutional Trading Desk",
    "Gold Trading Signals",
    "XAUUSD AI Analysis"
  ],
  authors: [{ name: "ChronosX AI Technologies", url: "https://chronosx.com" }],
  creator: "ChronosX",
  publisher: "ChronosX",
  category: "Finance & Trading Technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://chronosx.com',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://chronosx.com",
    title: "ChronosX — Next-Gen AI Trading Platform & Intelligence Desk",
    description: "Trade smarter with AI that never sleeps. Real-time AI trading signals, instant neural chart insights, and algorithmic market analysis.",
    siteName: "ChronosX",
    images: [
      {
        url: "/assets/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "ChronosX AI Trading Desk"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ChronosX — Next-Gen AI Trading Platform & Intelligence Desk",
    description: "Trade smarter with AI that never sleeps. Real-time AI trading signals, instant neural chart insights, and algorithmic market analysis.",
    images: ["/assets/logo/logo.png"],
    creator: "@ChronosX",
    site: "@ChronosX",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/assets/logo/smallLogo.png", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: [
      { url: "/assets/logo/smallLogo.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${antonSans.variable} ${robotoSans.variable} ${plusSans.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var storedTheme = localStorage.getItem('theme') || 'dark';
                document.documentElement.classList.add(storedTheme);
                document.documentElement.setAttribute('data-theme', storedTheme);

                var storedLang = localStorage.getItem('app_language');
                if (storedLang === 'ar') {
                  document.documentElement.setAttribute('lang', 'ar');
                  document.documentElement.setAttribute('dir', 'rtl');
                }
              } catch (_) {}
            `,
          }}
        />
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <SmoothScrollProvider>
                <GoogleAnalytics />
                {children}
                <ClientOnlyWidgets />
              </SmoothScrollProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
