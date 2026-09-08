
import Header from "@/components/header";
import Footer from "@/components/footer";
import HomePage from "@/rendering/home";

export const metadata = {
  title: "ChronosX — Trade Smarter With AI Signals That Never Sleep",
  description: "Get real-time AI trading signals, market insights, and trade recommendations across Forex, Crypto, Stocks, and Global Markets.",
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
