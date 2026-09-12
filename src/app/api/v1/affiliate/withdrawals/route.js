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
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '20';

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '';
        if (backendUrl) {
            const authHeader = request.headers.get('authorization') || '';
            const res = await fetch(`${backendUrl.replace(/\/+$/, '')}/api/v1/affiliate/withdrawals?page=${page}&limit=${limit}`, {
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
        console.warn('[affiliate/withdrawals/route] proxy error:', err?.message);
    }

    return NextResponse.json(
        {
            status: 'success',
            page: 1,
            limit: 20,
            total: 0,
            data: []
        },
        { headers: corsHeaders }
    );
}
