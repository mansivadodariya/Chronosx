import AiStrategy from '@/rendering/aiStrategy';

export const metadata = {
    title: 'Strategy Signal — AI Strategy Core | ChronosX',
    description: 'Explore, backtest, and deploy algorithmic trading strategies with institutional accuracy metrics on ChronosX.',
};

export default function StrategyHubPlaybooksPage() {
    return <AiStrategy initialTab="strategy" />;
}
