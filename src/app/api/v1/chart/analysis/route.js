import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'XAUUSD';
    const lang = searchParams.get('lang') || 'en';
    const strategyId = searchParams.get('strategy_id') || searchParams.get('strategyId') || '';

    const query = new URLSearchParams({ symbol, lang });
    if (strategyId) query.set('strategy_id', strategyId);

    const primaryBase = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.thetradermaster.com').replace(/\/+$/, '');
    const fallbackBase = 'https://api.thetradermaster.com';

    // 1. Try Primary
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);
        const res = await fetch(`${primaryBase}/api/v1/chart/analysis?${query.toString()}`, {
            signal: controller.signal,
            headers: {
                'accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });
        clearTimeout(timeoutId);
        if (res.ok) {
            const data = await res.json();
            return NextResponse.json(data);
        }
    } catch (e) {
        console.warn('API route primary analysis fetch failed:', e.message);
    }

    // 2. Try Fallback
    try {
        const res = await fetch(`${fallbackBase}/api/v1/chart/analysis?${query.toString()}`, {
            headers: {
                'accept': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });
        if (res.ok) {
            const data = await res.json();
            return NextResponse.json(data);
        }
    } catch (e) {
        console.error('API route fallback analysis fetch failed:', e.message);
    }

    return NextResponse.json({ success: false, message: 'Failed to fetch analysis' }, { status: 502 });
}
