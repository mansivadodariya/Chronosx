/**
 * ChronosX Affiliate Service
 * Integration client for connecting to FastAPI / Next.js backend affiliate endpoints.
 */

const getApiBaseUrl = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '';
    if (backendUrl) {
        return `${backendUrl.replace(/\/+$/, '')}/api/v1`;
    }
    return '/api/v1';
};

const getAuthHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
        accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
    };

    if (typeof window !== 'undefined') {
        let token = localStorage.getItem('access_token');
        if (!token && typeof document !== 'undefined') {
            const match = document.cookie.match(/(?:^|;\s*)(?:auth_token|access_token)=([^;]*)/);
            if (match) token = decodeURIComponent(match[1]);
        }
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    }
    return headers;
};

const handleResponse = async (res) => {
    const contentType = res.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
        const message = data?.detail || data?.message || data?.error || `HTTP error ${res.status}`;
        throw new Error(message);
    }
    return data;
};

const toNum = (val, def = 0) => {
    if (val === undefined || val === null || val === '') return def;
    const n = Number(val);
    return isNaN(n) ? def : n;
};

export const affiliateService = {
    /**
     * Fetch aggregate dashboard metrics, tier status, and referral links
     * GET /api/v1/affiliate/dashboard
     */
    getDashboard: async () => {
        try {
            const url = `${getApiBaseUrl()}/affiliate/dashboard`;
            const res = await fetch(url, {
                method: 'GET',
                headers: getAuthHeaders(),
            });
            const result = await handleResponse(res);
            const raw = result?.data || result || {};

            // Normalize fields across backend schemas
            const tierRaw = raw.current_tier;
            let currentTier;
            if (typeof tierRaw === 'object' && tierRaw !== null) {
                currentTier = {
                    level: toNum(tierRaw.level, 1),
                    name: tierRaw.name || (tierRaw.level === 2 ? 'Tier 2 - Pro Partner' : 'Tier 1 - Standard Partner'),
                    rate_percentage: toNum(tierRaw.rate_percentage ?? tierRaw.rate ?? raw.active_commission_rate, 10),
                    next_tier_name: tierRaw.next_tier_name || 'Tier 2 - Pro Partner (20%)',
                    next_tier_threshold: toNum(tierRaw.next_tier_threshold, 30),
                    progress_count: toNum(tierRaw.progress_count ?? raw.active_traders ?? raw.referral_count, 0),
                    min_withdrawal: toNum(tierRaw.min_withdrawal, 50)
                };
            } else {
                const isPro = String(tierRaw).toLowerCase().includes('pro') || String(tierRaw).toLowerCase().includes('premium') || String(tierRaw) === '2';
                currentTier = {
                    level: isPro ? 2 : 1,
                    name: isPro ? 'Tier 2 - Pro Partner' : 'Tier 1 - Standard Partner',
                    rate_percentage: toNum(raw.active_commission_rate ?? (isPro ? 20 : 10), 10),
                    next_tier_name: 'Tier 2 - Pro Partner (20%)',
                    next_tier_threshold: 30,
                    progress_count: toNum(raw.active_traders ?? raw.referral_count, 0),
                    min_withdrawal: 50
                };
            }

            return {
                status: 'success',
                data: {
                    total_earned: toNum(raw.total_earned ?? raw.total_earnings ?? raw.earnings, 0),
                    withdrawable_balance: toNum(raw.withdrawable_balance ?? raw.balance ?? raw.withdrawable, 0),
                    pending_lock_balance: toNum(raw.pending_lock_balance ?? raw.pending_withdrawal ?? raw.pending, 0),
                    total_withdrawn: toNum(raw.total_withdrawn ?? raw.withdrawn, 0),
                    referral_count: toNum(raw.total_referrals ?? raw.referral_count ?? raw.referrals, 0),
                    active_traders: toNum(raw.active_traders ?? raw.active_referrals, 0),
                    referral_code: raw.referral_code || '',
                    referral_link: raw.referral_link || raw.referral_url || '',
                    current_tier: currentTier
                }
            };
        } catch (err) {
            console.warn('[affiliateService] getDashboard error:', err?.message);
            return {
                status: 'error',
                message: err?.message || 'Failed to load affiliate dashboard',
                data: {
                    total_earned: 0,
                    withdrawable_balance: 0,
                    pending_lock_balance: 0,
                    total_withdrawn: 0,
                    referral_count: 0,
                    active_traders: 0,
                    referral_code: '',
                    referral_link: '',
                    current_tier: {
                        level: 1,
                        name: 'Tier 1 - Standard Partner',
                        rate_percentage: 10,
                        next_tier_name: 'Tier 2 - Pro Partner (20%)',
                        next_tier_threshold: 30,
                        progress_count: 0,
                        min_withdrawal: 50.00
                    }
                }
            };
        }
    },

    /**
     * Fetch paginated commission ledger history
     * GET /api/v1/affiliate/history?page=1&limit=20
     */
    getCommissionHistory: async ({ page = 1, limit = 20 } = {}) => {
        try {
            const url = `${getApiBaseUrl()}/affiliate/history?page=${page}&limit=${limit}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: getAuthHeaders(),
            });
            const result = await handleResponse(res);
            const items = Array.isArray(result?.data)
                ? result.data
                : Array.isArray(result?.items)
                ? result.items
                : Array.isArray(result)
                ? result
                : [];

            const normalizedItems = items.map((item, idx) => ({
                id: item.id || `comm_${idx + 1}`,
                date: item.date || item.created_at || item.timestamp || new Date().toISOString(),
                trader: item.trader || item.masked_referee_email || item.referred_user_id || item.user_id || 'Trader',
                deposit_volume: Number(item.deposit_volume ?? item.order_amount ?? item.amount ?? 0),
                tier_rate: item.tier_rate || (item.commission_rate ? `${item.commission_rate}%` : '10%'),
                commission_amount: Number(item.commission_amount ?? item.commission ?? 0),
                status: (item.status || 'CREDITED').toUpperCase()
            }));

            return {
                status: 'success',
                page,
                limit,
                total: result?.total ?? result?.count ?? normalizedItems.length,
                data: normalizedItems
            };
        } catch (err) {
            console.warn('[affiliateService] getCommissionHistory error:', err?.message);
            return {
                status: 'error',
                message: err?.message || 'Failed to load commission history',
                page,
                limit,
                total: 0,
                data: []
            };
        }
    },

    /**
     * Fetch paginated crypto withdrawal history
     * GET /api/v1/affiliate/withdrawals?page=1&limit=20
     */
    getWithdrawalHistory: async ({ page = 1, limit = 20 } = {}) => {
        try {
            const url = `${getApiBaseUrl()}/affiliate/withdrawals?page=${page}&limit=${limit}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: getAuthHeaders(),
            });
            const result = await handleResponse(res);
            const items = Array.isArray(result?.data)
                ? result.data
                : Array.isArray(result?.items)
                ? result.items
                : Array.isArray(result)
                ? result
                : [];

            const normalizedItems = items.map((item, idx) => ({
                id: item.id || item.withdrawal_id || item.reference || `WTH-${9000 + idx}`,
                created_at: item.created_at || item.date || item.timestamp || new Date().toISOString(),
                asset: item.crypto_currency || item.asset || 'USDT',
                crypto_currency: item.crypto_currency || item.asset || 'USDT',
                network: item.network || 'TRC20',
                amount: Number(item.amount ?? 0),
                wallet_address: item.wallet_address || '',
                status: (item.status || 'PENDING').toUpperCase(),
                tx_hash: item.tx_hash || null
            }));

            return {
                status: 'success',
                page,
                limit,
                total: result?.total ?? result?.count ?? normalizedItems.length,
                data: normalizedItems
            };
        } catch (err) {
            console.warn('[affiliateService] getWithdrawalHistory error:', err?.message);
            return {
                status: 'error',
                message: err?.message || 'Failed to load withdrawal history',
                page,
                limit,
                total: 0,
                data: []
            };
        }
    },

    /**
     * Submit new crypto withdrawal request
     * POST /api/v1/affiliate/withdraw
     * Body: { amount, crypto_currency, network, wallet_address }
     */
    requestWithdrawal: async ({ amount, crypto_currency, asset, network, wallet_address }) => {
        const coin = (crypto_currency || asset || 'USDT').toUpperCase();
        const url = `${getApiBaseUrl()}/affiliate/withdraw`;
        const res = await fetch(url, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                amount: Number(amount),
                crypto_currency: coin,
                network: String(network || 'TRC20').toUpperCase(),
                wallet_address: String(wallet_address || '').trim()
            }),
        });
        const result = await handleResponse(res);
        return result;
    },

    /**
     * Simulate Purchase Commission Webhook (Testing & Webhook trigger)
     * POST /api/v1/affiliate/purchase-webhook
     * Body: { referred_user_id, plan_name, order_reference, order_amount }
     */
    simulatePurchaseWebhook: async ({ referred_user_id, plan_name, order_reference, order_amount }) => {
        const url = `${getApiBaseUrl()}/affiliate/purchase-webhook`;
        const res = await fetch(url, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                referred_user_id,
                plan_name: plan_name || 'Pro',
                order_reference: order_reference || `ORD-${Date.now()}`,
                order_amount: Number(order_amount || 0)
            }),
        });
        const result = await handleResponse(res);
        return result;
    }
};
