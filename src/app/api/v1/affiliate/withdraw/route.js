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
        const { amount, asset, crypto_currency, network, wallet_address } = body;
        const coin = (crypto_currency || asset || 'USDT').toUpperCase();

        if (!amount || Number(amount) <= 0) {
            return NextResponse.json(
                { error: 'Valid withdrawal amount is required.' },
                { status: 400, headers: corsHeaders }
            );
        }

        if (!coin || !network || !wallet_address) {
            return NextResponse.json(
                { error: 'Asset, network, and destination wallet address are required.' },
                { status: 400, headers: corsHeaders }
            );
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '';
        if (backendUrl) {
            const authHeader = request.headers.get('authorization') || '';
            const res = await fetch(`${backendUrl.replace(/\/+$/, '')}/api/v1/affiliate/withdraw`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    accept: 'application/json',
                    ...(authHeader ? { Authorization: authHeader } : {})
                },
                body: JSON.stringify({
                    amount: Number(amount),
                    crypto_currency: coin,
                    network: String(network).toUpperCase(),
                    wallet_address: String(wallet_address).trim()
                })
            });
            const data = await res.json();
            return NextResponse.json(data, { status: res.status, headers: corsHeaders });
        }

        const withdrawalRecord = {
            id: 'WTH-' + Math.floor(1000 + Math.random() * 9000),
            created_at: new Date().toISOString(),
            amount: Number(amount),
            asset: coin,
            crypto_currency: coin,
            network,
            wallet_address,
            status: 'PENDING',
            tx_hash: null
        };

        return NextResponse.json(
            {
                status: 'success',
                success: true,
                message: `Withdrawal request for ${amount} ${coin} (${network}) has been submitted successfully.`,
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
