import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const primaryBase = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || '').replace(/\/+$/, '');

    if (primaryBase) {
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
            console.warn('API route strategies fetch failed:', e.message);
        }
    }

    return NextResponse.json({
        strategies: [
            { id: '3e8d2b78-0e86-4fdf-9759-338276db1742', name: 'EMA Pullback', description: 'Trend Following EMA Pullback' }
        ]
    });
}
