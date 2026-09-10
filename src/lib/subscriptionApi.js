'use client';

import { getStoredUser, getStoredUserId } from '@/lib/authSession';

const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.0.153:8000'}/api/v1`;

function getAuthHeaders() {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
            return {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'ngrok-skip-browser-warning': 'true',
            };
        }
    }
    return {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'ngrok-skip-browser-warning': 'true',
    };
}

export const PLAN_TIERS = {
    free: 0,
    starter: 1,
    growth: 2,
    pro: 3,
};

export const subscriptionApi = {
    /**
     * 1. GET /api/v1/subscription/current
     * Fetches real active subscription details for current logged-in user
     */
    getCurrentSubscription: async () => {
        try {
            const res = await fetch(`${BASE_URL}/subscription/current`, {
                headers: getAuthHeaders(),
                cache: 'no-store',
            });
            if (res.ok) {
                const json = await res.json();
                return json?.data || json;
            }
        } catch (err) {
            console.warn('[subscriptionApi] Failed to fetch current subscription:', err);
        }

        return {
            has_active_plan: false,
            active_subscription: null,
        };
    },

    /**
     * 2. POST /api/v1/subscription/check-eligibility
     * Check plan eligibility for upgrade, downgrade, or renewal
     */
    checkEligibility: async (targetPlanId) => {
        try {
            const res = await fetch(`${BASE_URL}/subscription/check-eligibility`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ target_plan_id: String(targetPlanId) }),
            });
            if (res.ok) {
                const json = await res.json();
                return json?.data || json;
            }
            const errJson = await res.json().catch(() => ({}));
            return {
                allowed: true,
                action_type: 'SUBSCRIBE',
                message: errJson?.detail || '',
            };
        } catch (err) {
            console.warn('[subscriptionApi] Eligibility check failed:', err);
            return {
                allowed: true,
                action_type: 'SUBSCRIBE',
                message: '',
            };
        }
    },

    /**
     * 3. POST /api/v1/payments/validate-coupon
     * Validates discount coupon against target plan directly via backend
     */
    validateCoupon: async (code, planId) => {
        const cleanCode = String(code || '').trim().toUpperCase();
        if (!cleanCode) {
            throw new Error('Please enter a coupon code.');
        }

        const res = await fetch(`${BASE_URL}/payments/validate-coupon`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                code: cleanCode,
                plan_id: String(planId),
            }),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
            const errorMsg = json?.detail || json?.message || 'Invalid or expired coupon code.';
            throw new Error(errorMsg);
        }

        return json?.data || json;
    },

    /**
     * 4. POST /api/v1/payments/calculate-summary
     * Calculates itemized financial breakdown directly with backend
     */
    calculateSummary: async ({ planId, plan, couponCode = null, coupon = null }) => {
        const effectivePlanId = planId || plan?.id;
        const effectiveCouponCode = couponCode || coupon?.code || (typeof coupon === 'string' ? coupon : null);

        if (!effectivePlanId) {
            throw new Error('Plan ID is required to calculate summary.');
        }

        const res = await fetch(`${BASE_URL}/payments/calculate-summary`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                plan_id: String(effectivePlanId),
                coupon_code: effectiveCouponCode ? String(effectiveCouponCode).trim() : null,
            }),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
            const errorMsg = json?.detail || json?.message || 'Failed to calculate payment summary.';
            throw new Error(errorMsg);
        }

        const data = json?.data || json;
        return {
            plan_id: data.plan_id || effectivePlanId,
            plan_name: data.plan_name || plan?.name || '',
            base_price: Number(data.base_price ?? data.price ?? plan?.price ?? 0),
            discount_amount: Number(data.discount_amount ?? data.discount ?? 0),
            tax_rate: Number(data.tax_rate ?? 0),
            tax_amount: Number(data.tax_amount ?? data.tax ?? 0),
            final_amount: Number(data.final_amount ?? data.total ?? data.net_payable ?? plan?.price ?? 0),
            currency: data.currency || plan?.currency || 'USD',
            coupon: data.coupon || null,
        };
    },

    /**
     * 5. POST /api/v1/payments/create-session
     * Creates checkout session with backend ledger entry
     */
    createPaymentSession: async ({ planId, plan, couponCode = null, gateway = 'STRIPE' }) => {
        const effectivePlanId = planId || plan?.id;
        const origin = typeof window !== 'undefined' ? window.location.origin : '';

        // Normalize gateway to STRIPE or CREGIS / CRYPTO
        const effectiveGateway = (gateway === 'CARD' || gateway === 'STRIPE') ? 'STRIPE' : 'CREGIS';

        const payload = {
            plan_id: String(effectivePlanId),
            coupon_code: couponCode ? String(couponCode).trim() : null,
            gateway: effectiveGateway,
            success_url: `${origin}/subscription-plans?payment_status=success&plan_id=${effectivePlanId}`,
            cancel_url: `${origin}/subscription-plans?payment_status=failed&plan_id=${effectivePlanId}&reason=payment_cancelled`,
        };

        const res = await fetch(`${BASE_URL}/payments/create-session`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
            const errorMsg = json?.detail || json?.message || 'Failed to initialize payment session.';
            throw new Error(errorMsg);
        }

        return json?.data || json;
    },

    /**
     * 6. GET /api/v1/payments/history
     * Get real payment transaction history for current logged-in user
     */
    getPaymentHistory: async () => {
        try {
            const res = await fetch(`${BASE_URL}/payments/history`, {
                headers: getAuthHeaders(),
                cache: 'no-store',
            });
            if (res.ok) {
                const json = await res.json();
                const history = json?.data || json;
                if (Array.isArray(history)) return history;
            }
        } catch (err) {
            console.warn('[subscriptionApi] Failed to fetch payment history:', err);
        }

        return [];
    },

    /**
     * 7. GET /api/v1/payments/invoices/{invoice_number}/download
     * Download or retrieve invoice details for a payment
     */
    downloadInvoice: async (invoiceNumber) => {
        if (!invoiceNumber) {
            throw new Error('Invoice number is required.');
        }

        const res = await fetch(`${BASE_URL}/payments/invoices/${encodeURIComponent(invoiceNumber)}/download`, {
            headers: getAuthHeaders(),
        });

        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json?.detail || 'Failed to download invoice PDF.');
        }

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/pdf') || contentType.includes('octet-stream')) {
            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `Invoice-${invoiceNumber}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
            return { downloaded: true };
        }

        const json = await res.json().catch(() => ({}));
        const fileUrl = json?.download_url || json?.url || json?.pdf_url || json?.data?.url;
        if (fileUrl) {
            window.open(fileUrl, '_blank');
            return { downloaded: true, url: fileUrl };
        }

        return json;
    },

    /**
     * 8. GET /api/v1/payments/return
     * Query return verification from backend
     */
    verifyPaymentReturn: async (orderId, statusParam = 'success', reason = '') => {
        try {
            const query = new URLSearchParams({
                order_id: String(orderId),
                status_param: String(statusParam),
            });
            if (reason) query.set('reason', String(reason));

            const res = await fetch(`${BASE_URL}/payments/return?${query.toString()}`, {
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                const json = await res.json().catch(() => ({}));
                return json?.data || json;
            }
        } catch (err) {
            console.warn('[subscriptionApi] Return verification warning:', err);
        }
        return null;
    },

    /**
     * 9. POST /api/v1/deposit/create
     * Cregis / Crypto deposit creation
     */
    createCryptoDeposit: async ({ amount, planId, plan_id }) => {
        const resolvedPlanId = planId ?? plan_id;
        const res = await fetch(`${BASE_URL}/deposit/create`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                amount: Number(amount),
                plan_id: resolvedPlanId !== undefined && resolvedPlanId !== null ? resolvedPlanId : null,
            }),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(json?.detail || 'Failed to create crypto deposit.');
        }
        return json?.data || json;
    },
};

