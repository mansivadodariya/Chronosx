'use client';

import React from 'react';

export function CommissionLedgerTab({
    styles,
    t,
    ledgerSearch,
    setLedgerSearch,
    filteredLedger
}) {
    return (
        <div className={styles.tableWrapperCard}>
            <div className={styles.tableToolbar}>
                <div className={styles.tableTitleGroup}>
                    <h3>{t('affiliate.commissionLedgerTitle', 'Commission History Ledger')}</h3>
                    <p>{t('affiliate.commissionLedgerDesc', "Real-time audit of commissions credited from referred traders' deposits and trading volume.")}</p>
                </div>

                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder={t('affiliate.searchPlaceholder', 'Search by trader, ID or status...')}
                        value={ledgerSearch}
                        onChange={(e) => setLedgerSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.tableScroll}>
                <table className={styles.customTable}>
                    <thead>
                        <tr>
                            <th>{t('affiliate.thDateTime', 'Date & Time')}</th>
                            <th>{t('affiliate.thReferredTrader', 'Referred Trader')}</th>
                            <th>{t('affiliate.thDepositVolume', 'Deposit / Volume')}</th>
                            <th>{t('affiliate.thTierRate', 'Tier Rate')}</th>
                            <th>{t('affiliate.thCommissionEarned', 'Commission Earned')}</th>
                            <th>{t('affiliate.thStatus', 'Status')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLedger.length > 0 ? (
                            filteredLedger.map((item) => (
                                <tr key={item.id || item.date + item.trader}>
                                    <td className={styles.dateCol}>
                                        {new Date(item.date || item.created_at).toLocaleDateString()} <span className={styles.timeSub}>{new Date(item.date || item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className={styles.traderCol}>
                                        <strong>{item.trader || item.masked_referee_email || 'Trader'}</strong>
                                    </td>
                                    <td>${Number(item.deposit_volume || item.order_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    <td><span className={styles.tierPill}>{item.tier_rate || (item.commission_rate ? `${item.commission_rate}%` : '10%')}</span></td>
                                    <td className={styles.commissionVal}>+${Number(item.commission_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${(item.status || '').toUpperCase() === 'CREDITED' || (item.status || '').toUpperCase() === 'COMPLETED' ? styles.statusCredited : styles.statusPending}`}>
                                            {item.status || 'CREDITED'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className={styles.emptyTableRow}>
                                    {t('affiliate.noCommissionRecords', 'No commission records found.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
