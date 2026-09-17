import PublicAffiliateView from '@/rendering/publicAffiliate';

export const metadata = {
  title: 'Affiliate Program — Earn Recurring Commissions | ChronosX',
  description: 'Join the ChronosX Affiliate Program and earn up to 20% recurring commissions by sharing AI-powered trading tools with your audience.',
  alternates: {
    canonical: 'https://chronosx.com/affiliate-program',
  },
};

export default function AffiliateProgramPage() {
  return <PublicAffiliateView />;
}
