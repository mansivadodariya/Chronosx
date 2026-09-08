import toolsData from '@/data/toolsData.json';

export const TOOLS = toolsData.tools;
export const UTILITY_TOOLS = toolsData.utilityTools;

export const ALL_TOOLS = [...TOOLS, ...UTILITY_TOOLS];

/**
 * Maps any pathname (new or legacy, outer or inner) to the standard tool tab name.
 */
export const ROUTE_TAB_MAP = {
  '/dashboard': 'Dashboard',
  // AI Chart Scanner
  '/chart-scanner': 'AI Chart Scanner',
  '/ai-chart-scanner': 'AI Chart Scanner',

  // AI Trade Audit
  '/trade-audit': 'AI Trade Audit',
  '/ai-trade-audit': 'AI Trade Audit',

  // AI Market Assistant
  '/market-assistant': 'AI Market Assistant',
  '/ai-market-assistant': 'AI Market Assistant',

  // Live Market Scanner
  '/live-scanner': 'Live Market Scanner',
  '/live-market-scanner': 'Live Market Scanner',

  // Strategy Hub
  '/strategy-hub': 'Strategy Hub',
  '/ai-strategy-hub': 'Strategy Hub',
  '/strategy-hub/live': 'Live Market Scanner',
  '/strategy-hub/strategy': 'Strategy Playbooks',

  // Utility Tools
  '/tools': 'Tools',
  '/calendar': 'Economic Calendar',
  '/economic-calendar': 'Economic Calendar',
  '/calculator': 'Forex Calculator',
  '/forex-calculator': 'Forex Calculator',
  '/news': 'Market News',
  '/market-news': 'Market News',

  // System & Account
  '/credit-history': 'Credit History',
  '/plans': 'Subscription Plans',
  '/subscription-plans': 'Subscription Plans',
  '/broker': 'Broker',
  '/brokers': 'Broker',
  '/profile': 'Profile',
  '/settings': 'Profile',
};

/**
 * Get tool definition by id.
 */
export function getToolById(id) {
  return ALL_TOOLS.find((t) => t.id === id);
}

/**
 * Get tool by any route (inner, outer, or legacy).
 */
export function getToolByRoute(pathname) {
  if (!pathname) return null;
  const cleanPath = pathname.split('?')[0].replace(/\/$/, '') || '/';
  return ALL_TOOLS.find(
    (t) =>
      t.innerRoute === cleanPath ||
      t.outerRoute === cleanPath ||
      t.legacyRoutes?.includes(cleanPath)
  );
}

export default toolsData;
