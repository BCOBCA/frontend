import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { WalletHistoryView } from '../src/components/affiliate/WalletHistoryView';
import { walletHistoryRow } from '../src/components/affiliate/wallet-history';
const state = vi.hoisted(() => ({ actions: {} as Record<string, () => void>, selects: {} as Record<string, (value: string) => void> }));
vi.mock('react-native', () => ({ StyleSheet: { create: (v: unknown) => v }, View: ({ children, role }: { children: React.ReactNode; role?: string }) => <div role={role}>{children}</div>, Text: ({ children, role }: { children: React.ReactNode; role?: string }) => <span role={role}>{children}</span>, TextInput: () => <input />, Pressable: ({ children, accessibilityLabel, onPress }: { children: React.ReactNode; accessibilityLabel: string; onPress: () => void }) => { state.actions[accessibilityLabel] = onPress; return <button>{children}</button>; } }));
vi.mock('lucide-react-native', () => Object.fromEntries(['Check', 'ChevronLeft', 'ChevronRight', 'CircleAlert', 'Clock3', 'Coins', 'Info', 'Landmark', 'Search', 'ShoppingBag'].map(name => [name, () => null])));
vi.mock('../src/components/common/ui', () => ({ Status: () => null }));
vi.mock('../src/components/dealers/DealerFilters', () => ({ DealerSelect: ({ label, onChange }: { label: string; onChange: (v: string) => void }) => { state.selects[label] = onChange; return <select aria-label={label} />; } }));
const row = walletHistoryRow({ id: 'tx', type: 'CREDIT', amount: 29800, balanceAfter: 1256000, referenceType: 'Commission', referenceId: 'ref', referenceCode: 'DH102893', status: 'APPROVED', createdAt: '2026-11-08T07:20:00Z' });
function props() { return { filter: { tab: 'ledger' as const, page: 1, period: 'all', kind: 'all', search: '' }, draft: '', rows: [row], width: 1200, loading: false, totalPages: 22, onTab: vi.fn(), onPeriod: vi.fn(), onKind: vi.fn(), onSearch: vi.fn(), onSubmitSearch: vi.fn(), onPage: vi.fn(), onRetry: vi.fn() }; }
beforeEach(() => { state.actions = {}; state.selects = {}; });
it('renders the desktop table, notes and pagination without showing transaction counts', () => {
  const p = props(), html = renderToStaticMarkup(<WalletHistoryView {...p} />);
  for (const text of ['role="table"', '#DH102893', '+29.800 VNĐ', '1.256.000 VNĐ', '08/11/2026', 'Thành công', 'Lưu ý']) expect(html).toContain(text);
  expect(html).not.toContain('Hiển thị'); expect(html).not.toContain('Tổng giao dịch'); expect(html).not.toContain('1–6');
  state.actions['Lịch sử yêu cầu rút tiền'](); expect(p.onTab).toHaveBeenCalledWith('withdrawals');
  state.actions['Trang giao dịch sau'](); expect(p.onPage).toHaveBeenCalledWith(2);
  state.selects['Lọc thời gian giao dịch']('month'); expect(p.onPeriod).toHaveBeenCalledWith('month');
});
it('switches to compact transaction rows on phones', () => {
  const html = renderToStaticMarkup(<WalletHistoryView {...props()} width={393} />);
  expect(html).not.toContain('role="table"'); expect(html).toContain('#DH102893'); expect(html).toContain('Số dư sau');
});
it('does not show an empty message while loading and provides an honest empty state', () => {
  expect(renderToStaticMarkup(<WalletHistoryView {...props()} rows={[]} loading />)).not.toContain('Chưa có giao dịch phù hợp');
  expect(renderToStaticMarkup(<WalletHistoryView {...props()} rows={[]} />)).toContain('Chưa có giao dịch phù hợp');
});
