import CustomBotBuilderView from '@/rendering/custom-bot-builder';

export const metadata = {
  title: 'AI Custom Bot Builder — Build & Automate Trading Bots | ChronosX',
  description: 'Discover ready-made trading bots, create your own with AI chat assistance, or build step-by-step with full control. Take your trading ideas from creation to backtesting seamlessly.',
  alternates: {
    canonical: 'https://chronosx.com/custom-bot-builder',
  },
};

export default function CustomBotBuilderPage() {
  return <CustomBotBuilderView />;
}
