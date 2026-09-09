import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    });
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { amount, asset, network, wallet_address } = body;

        if (!amount || Number(amount) <= 0) {
            return NextResponse.json(
                { error: 'Valid withdrawal amount is required.' },
                { status: 400, headers: corsHeaders }
            );
        }

        if (!asset || !network || !wallet_address) {
            return NextResponse.json(
                { error: 'Asset, network, and destination wallet address are required.' },
                { status: 400, headers: corsHeaders }
            );
        }

        const withdrawalRecord = {
            id: 'WTH-' + Math.floor(1000 + Math.random() * 9000),
            created_at: new Date().toISOString(),
            amount: Number(amount),
            asset,
            network,
            wallet_address,
            status: 'PENDING',
            tx_hash: null
        };

        return NextResponse.json(
            {
                success: true,
                message: `Withdrawal request for ${amount} ${asset} (${network}) has been submitted successfully.`,
                data: withdrawalRecord
            },
            { status: 201, headers: corsHeaders }
        );
    } catch (err) {
        return NextResponse.json(
            { error: err?.message || 'Failed to process withdrawal request.' },
            { status: 500, headers: corsHeaders }
        );
    }
}
