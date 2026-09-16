import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const primaryBase = (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.thetradermaster.com').replace(/\/+$/, '');
    const fallbackBase = 'https://api.thetradermaster.com';

    // 1. Try Primary
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);
        const res = await fetch(`${primaryBase}/api/v1/chart/strategies`, {
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
        console.warn('API route primary strategies fetch failed:', e.message);
    }

    // 2. Try Fallback
    try {
        const res = await fetch(`${fallbackBase}/api/v1/chart/strategies`, {
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
        console.error('API route fallback strategies fetch failed:', e.message);
    }

    return NextResponse.json({
        strategies: [
            { id: '3e8d2b78-0e86-4fdf-9759-338276db1742', name: 'EMA Pullback Strategy', description: 'Trend Following EMA Pullback' }
        ]
    });
}
