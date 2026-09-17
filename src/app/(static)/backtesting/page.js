import BacktestingView from '@/rendering/backtesting';

export const metadata = {
  title: 'Backtesting Engine — Test Ideas & Trade With Confidence | ChronosX',
  description: 'Validate your trading strategies, bots, and custom ideas using historical market data. Analyze win rate, profit factor, drawdown, and optimize before going live.',
  alternates: {
    canonical: 'https://chronosx.com/backtesting',
  },
};

export default function BacktestingPage() {
  return <BacktestingView />;
}
