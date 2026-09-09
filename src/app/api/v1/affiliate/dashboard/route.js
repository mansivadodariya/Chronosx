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

export async function GET() {
    return NextResponse.json(
        {
            status: 'success',
            data: {
                total_earned: 1280.00,
                withdrawable_balance: 420.00,
                pending_lock_balance: 150.00,
                total_withdrawn: 710.00,
                referral_count: 24,
                active_traders: 18,
                referral_code: 'CHRONOS-8921',
                current_tier: {
                    level: 1,
                    name: 'Tier 1 - Standard Partner',
                    rate_percentage: 10,
                    next_tier_name: 'Tier 2 - Pro Partner (20%)',
                    next_tier_threshold: 30,
                    progress_count: 18,
                    min_withdrawal: 50.00
                }
            }
        },
        { headers: corsHeaders }
    );
}
