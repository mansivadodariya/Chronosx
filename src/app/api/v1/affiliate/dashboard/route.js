import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    });
}

export async function GET(request) {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '';
        if (backendUrl) {
            const authHeader = request.headers.get('authorization') || '';
            const res = await fetch(`${backendUrl.replace(/\/+$/, '')}/api/v1/affiliate/dashboard`, {
                headers: {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                    ...(authHeader ? { Authorization: authHeader } : {})
                }
            });
            const data = await res.json();
            return NextResponse.json(data, { status: res.status, headers: corsHeaders });
        }
    } catch (err) {
        console.warn('[affiliate/dashboard/route] proxy error:', err?.message);
    }

    return NextResponse.json(
        {
            status: 'success',
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
        },
        { headers: corsHeaders }
    );
}
