'use client';

import React, { useEffect, useState } from 'react';

import { unifiedSocket, cleanPairSymbol } from '@/lib/unifiedSocket';

/**
 * LandingPageLiveCard
 * Connects the Landing Page AI Live Feed card to the Unified MT5 Live WebSocket with
 * smooth flash glow animations and automatic reconnection.
 * WebSocket Endpoint: /api/v1/ws/live?symbol={symbol}
 */
export const LandingPageLiveCard = ({ symbol = 'XAUUSD', className = '' }) => {
    const cleanSymbol = cleanPairSymbol(symbol);

    const [price, setPrice] = useState(null);
    const [bid, setBid] = useState(null);
    const [ask, setAsk] = useState(null);
    const [changePct, setChangePct] = useState(0.00);
    const [lastUpdated, setLastUpdated] = useState('SYNCING');
    const [isConnected, setIsConnected] = useState(false);
    const [flashColor, setFlashColor] = useState('transparent');

    useEffect(() => {
        let isMounted = true;

        const unsubscribeStatus = unifiedSocket.subscribeStatus((status) => {
            if (isMounted) {
                setIsConnected(status === 'connected');
            }
        });

        const unsubscribePrice = unifiedSocket.subscribePrice((payload) => {
            if (!isMounted) return;
            const newPrice = parseFloat(payload.price);
            if (!isNaN(newPrice)) {
                setPrice((prevPrice) => {
                    if (prevPrice !== null && prevPrice !== undefined) {
                        if (newPrice > prevPrice) {
                            setFlashColor('rgba(0, 230, 118, 0.2)');
                        } else if (newPrice < prevPrice) {
                            setFlashColor('rgba(255, 82, 82, 0.2)');
                        }
                        setTimeout(() => {
                            if (isMounted) setFlashColor('transparent');
                        }, 400);
                    }
                    return newPrice;
                });
            }

            if (payload.bid !== undefined) setBid(parseFloat(payload.bid));
            if (payload.ask !== undefined) setAsk(parseFloat(payload.ask));

            const cp = payload.change_percent !== undefined
                ? parseFloat(payload.change_percent)
                : 0;
            setChangePct(cp);
            setLastUpdated('JUST NOW');
        }, cleanSymbol);

        return () => {
            isMounted = false;
            unsubscribeStatus();
            unsubscribePrice();
        };
    }, [cleanSymbol]);

    const isPositive = changePct >= 0;

    return (
        <div
            className={className}
            style={{
                background: '#0d0e12',
                border: '1px solid #1e2029',
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '420px',
                color: '#fff',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                transition: 'background 0.3s ease, border-color 0.3s ease',
                backgroundColor: flashColor !== 'transparent' ? flashColor : '#0d0e12',
            }}
        >
            {/* Header Symbol Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#059669',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            color: '#000',
                        }}
                    >
                        G
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                            {cleanSymbol}{' '}
                            <span
                                style={{
                                    fontSize: '11px',
                                    color: isConnected ? '#00e676' : '#ff9100',
                                    background: isConnected ? 'rgba(0,230,118,0.1)' : 'rgba(255,145,0,0.1)',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                }}
                            >
                                ● {isConnected ? 'LIVE' : 'CONNECTING'}
                            </span>
                        </h3>
                        <span style={{ fontSize: '12px', color: '#71758c' }}>
                            {cleanSymbol === 'XAUUSD' ? 'Gold Spot • Commodities' : 'Live Asset • Market Stream'}
                        </span>
                    </div>
                </div>
                <span style={{ fontSize: '12px', color: '#71758c' }}>★ IN WATCHLIST</span>
            </div>

            {/* Main Big Price Display */}
            <div style={{ marginBottom: '16px' }}>
                <h1 style={{ margin: 0, fontSize: '42px', fontWeight: 800, color: '#ff6e40', letterSpacing: '-1px' }}>
                    {price !== null
                        ? `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : 'Connecting...'}
                </h1>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <div style={{ color: isPositive ? '#00e676' : '#ff5252', fontSize: '14px', fontWeight: 600 }}>
                        {isPositive ? '↑ +' : '↓ '}{changePct.toFixed(2)}% (Live Tick)
                    </div>
                    {(bid !== null || ask !== null) && (
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                            Bid: {bid?.toFixed(2) || '--'} | Ask: {ask?.toFixed(2) || '--'}
                        </div>
                    )}
                </div>
            </div>

            {/* Status Footer */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '16px',
                    borderTop: '1px solid #1e2029',
                    fontSize: '11px',
                    color: '#71758c',
                }}
            >
                <span>● UPDATED {lastUpdated} • {isConnected ? 'WEBSOCKET LIVE' : 'CONNECTING...'}</span>
                <span>CHRONOSX AI LIVE FEED</span>
            </div>
        </div>
    );
};

export default LandingPageLiveCard;
