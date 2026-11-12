import { expect, it } from 'vitest';
import { formatHistoryDate, historyPages, signedHistoryMoney, walletHistoryPath, walletHistoryRow, withdrawalHistoryRow } from '../src/components/affiliate/wallet-history';
const entry = { id: 'tx', referenceId: '016e59bc-a64b-6cce-d429-649264d33a74', type: 'CREDIT', amount: 29800, balanceAfter: 1256000, referenceType: 'Commission', referenceCode: 'DH102893', status: 'APPROVED', createdAt: '2026-11-08T07:20:00Z' };
it('formats dates first with Vietnam local time', () => { expect(formatHistoryDate(entry.createdAt)).toBe('08/11/2026 14:20'); });
it('encodes server-side filters before pagination for both tabs', () => {
  const filter = { tab: 'ledger' as const, period: 'month', kind: 'commission', search: ' #DH&123 ', page: 2 };
  expect(walletHistoryPath(filter)).toBe('/affiliate/transactions?page=2&pageSize=6&period=month&transactionType=commission&search=%23DH%26123');
  expect(walletHistoryPath({ ...filter, tab: 'withdrawals', kind: 'PENDING' })).toContain('status=PENDING');
  expect(walletHistoryPath({ ...filter, tab: 'withdrawals', kind: 'all', search: '' })).not.toContain('transactionType');
});
it('uses real order codes and commission statuses without inventing reward events', () => {
  const row = walletHistoryRow(entry); expect(row.code).toBe('#DH102893'); expect(row.title).toBe('Hoa hồng sản phẩm'); expect(row.status).toBe('Thành công'); expect(row.negative).toBe(false);
  expect(walletHistoryRow({ ...entry, status: 'PENDING', type: 'PENDING_CREDIT' })).toMatchObject({ tone: 'pending', balanceLabel: 'Chờ duyệt' });
  expect(walletHistoryRow({ ...entry, status: 'REVERSED' }).status).toBe('Đã thu hồi');
  expect(walletHistoryRow({ ...entry, referenceCode: '' }).code).toBe('#016E59BC');
});
it('distinguishes debt from spendable cash and formats signed amounts', () => {
  expect(walletHistoryRow({ ...entry, type: 'DEBT_CREDIT' })).toMatchObject({ negative: true, balanceLabel: 'Cần thu hồi' });
  expect(walletHistoryRow({ ...entry, type: 'DEBT_DEBIT', amount: -1000 })).toMatchObject({ negative: false, balanceLabel: 'Cần thu hồi' });
  expect(signedHistoryMoney(29800)).toBe('+29.800 VNĐ'); expect(signedHistoryMoney(-29800)).toBe('-29.800 VNĐ');
});
it('keeps withdrawal fees/net and missing original balances honest', () => {
  const row = withdrawalHistoryRow({ id: entry.referenceId, amount: 50000, feeAmount: 5000, netAmount: 45000, bankName: 'Bank', accountNumber: '****1234', status: 'PENDING', transactionReference: '', requestedAt: entry.createdAt });
  expect(row).toMatchObject({ balance: null, fee: 5000, net: 45000, amount: -50000, status: 'Chờ duyệt', tone: 'pending' });
});
it('returns bounded page controls with ellipses instead of transaction quantities', () => {
  expect(historyPages(9, 22)).toEqual([1, '…', 7, 8, 9, 10, 11, '…', 22]); expect(historyPages(1, 1)).toEqual([1]); expect(historyPages(1, 0)).toEqual([]);
});
