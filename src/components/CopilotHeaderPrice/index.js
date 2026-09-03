'use client';

import React, { useEffect, useState } from 'react';
import { unifiedSocket, cleanPairSymbol } from '@/lib/unifiedSocket';

/**
 * CopilotHeaderPrice
 * Connects the top live price badge powered by the Unified MT5 Live WebSocket.
 * Endpoint: /api/v1/ws/live
 */
export const CopilotHeaderPrice = ({ symbol = 'XAUUSD', className = '' }) => {
    const cleanSymbol = cleanPairSymbol(symbol);

    const [data, setData] = useState({
        symbol: cleanSymbol,
        price: null,
        bid: null,
        ask: null,
        change_percent: 0,
        timestamp: null,
    });
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const unsubscribeStatus = unifiedSocket.subscribeStatus((status) => {
            if (isMounted) {
                setIsLive(status === 'connected');
            }
        });

        const unsubscribePrice = unifiedSocket.subscribePrice((payload) => {
            if (!isMounted) return;
            setData({
                symbol: payload.symbol || cleanSymbol,
                price: payload.price !== undefined ? parseFloat(payload.price) : null,
                bid: payload.bid !== undefined ? parseFloat(payload.bid) : null,
                ask: payload.ask !== undefined ? parseFloat(payload.ask) : null,
                change_percent: payload.change_percent !== undefined
                    ? parseFloat(payload.change_percent)
                    : 0,
                timestamp: payload.timestamp || new Date().toISOString(),
            });
        }, cleanSymbol);

        return () => {
            isMounted = false;
            unsubscribeStatus();
            unsubscribePrice();
        };
    }, [cleanSymbol]);

    const isPositive = (data.change_percent || 0) >= 0;

    return (
        <div
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                fontFamily: 'sans-serif',
                color: '#fff',
            }}
        >
            {/* Live Indicator Dot */}
            <span
                style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isLive ? '#00e676' : '#ff5252',
                    boxShadow: isLive ? '0 0 8px #00e676' : 'none',
                    transition: 'all 0.3s ease',
                }}
            />

            {/* Price Display */}
            <span style={{ fontWeight: 700, fontSize: '15px' }}>
                {data.price !== null
                    ? data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : 'Loading...'}
            </span>

            {/* Change Percentage Badge */}
            <span
                style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isPositive ? '#00e676' : '#ff5252',
                }}
            >
                {isPositive ? '↗ +' : '↘ '}
                {(data.change_percent || 0).toFixed(2)}%
            </span>
        </div>
    );
};

export default CopilotHeaderPrice;
