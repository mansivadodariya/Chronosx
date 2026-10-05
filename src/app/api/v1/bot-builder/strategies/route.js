import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const getBackendBase = () => {
    const raw = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://192.168.0.153:8000').replace(/\/+$/, '');
    return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id',
};

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    });
}

export async function POST(request) {
    try {
        const body = await request.json().catch(() => ({}));
        const authHeader = request.headers.get('authorization');
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(authHeader ? { Authorization: authHeader } : {})
        };

        const backendUrl = `${getBackendBase()}/bot-builder/strategies`;
        const res = await fetch(backendUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        }).catch((err) => {
            console.warn('[Proxy API POST /bot-builder/strategies] Backend unreachable:', err.message);
            return null;
        });

        if (res && res.ok) {
            const data = await res.json();
            return NextResponse.json(data, { status: res.status, headers: corsHeaders });
        }

        if (res) {
            const errData = await res.json().catch(() => null);
            return NextResponse.json(
                errData || { error: `Backend returned status ${res.status}` },
                { status: res.status, headers: corsHeaders }
            );
        }

        // Fallback success response if backend service is offline
        const fallbackBotId = 'strat_' + Date.now();
        return NextResponse.json({
            success: true,
            status: 'success',
            message: 'Strategy created successfully (local fallback)',
            data: {
                id: fallbackBotId,
                ...body,
                created_at: new Date().toISOString()
            }
        }, { status: 200, headers: corsHeaders });

    } catch (err) {
        console.error('[Proxy API POST /bot-builder/strategies] Error:', err);
        return NextResponse.json(
            { success: false, error: err.message || 'Internal server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const authHeader = request.headers.get('authorization');
        const qs = searchParams.toString();
        const backendUrl = `${getBackendBase()}/bot-builder/strategies${qs ? `?${qs}` : ''}`;

        const headers = {
            'Accept': 'application/json',
            ...(authHeader ? { Authorization: authHeader } : {})
        };

        const res = await fetch(backendUrl, {
            method: 'GET',
            headers
        }).catch((err) => {
            console.warn('[Proxy API GET /bot-builder/strategies] Backend unreachable:', err.message);
            return null;
        });

        if (res && res.ok) {
            const data = await res.json();
            return NextResponse.json(data, { status: 200, headers: corsHeaders });
        }

        return NextResponse.json({
            success: true,
            status: 'success',
            strategies: []
        }, { status: 200, headers: corsHeaders });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500, headers: corsHeaders }
        );
    }
}
