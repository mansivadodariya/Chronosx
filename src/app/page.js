
import Header from "@/components/header";
import Footer from "@/components/footer";
import HomePage from "@/rendering/home";

export const metadata = {
  title: "ChronosX — Institutional AI Forex & MT5 Trading Terminal",
  description: "Trade smarter with AI that never sleeps. Real-time AI trading signals, instant neural chart pattern recognition, and institutional risk management.",
  alternates: {
    canonical: 'https://chronosx.com',
  },
};

export default function Home() {
  return (
    <>
      <Header />
      <HomePage />
      <Footer />
    </>
  );
}
