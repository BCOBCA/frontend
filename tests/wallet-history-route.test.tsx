import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import WalletHistoryScreen, { WalletHistoryController } from '../src/screens/WalletHistoryScreen';
const state = vi.hoisted(() => ({ user: { id: 'me' } as { id: string } | null, request: vi.fn(), options: null as null | { queryKey: unknown[]; queryFn: () => Promise<unknown> }, rows: [] as { status: string; balanceLabel?: string }[] }));
vi.mock('react-native', () => ({ useWindowDimensions: () => ({ width: 393 }) }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (v: { user: typeof state.user }) => unknown) => select({ user: state.user }) }));
vi.mock('../src/services/api', () => ({ request: state.request }));
vi.mock('../src/components/common/ui', () => ({ Page: ({ children }: { children: React.ReactNode }) => <main>{children}</main>, LoginNotice: () => <p>Login required</p> }));
vi.mock('../src/components/affiliate/WalletHistoryView', () => ({ WalletHistoryView: ({ rows }: { rows: typeof state.rows }) => { state.rows = rows; return <p>Wallet history</p>; } }));
vi.mock('@tanstack/react-query', () => ({ useQuery: (options: NonNullable<typeof state.options>) => { state.options = options; return { data: { items: [{ id: 'tx', type: 'PENDING_CREDIT', amount: 1000, balanceAfter: 1000, referenceType: 'Commission', referenceId: 'commission', status: 'PENDING', createdAt: '2026-11-08T07:20:00Z' }], totalPages: 1 }, isLoading: false, error: null, refetch: vi.fn() }; } }));
beforeEach(() => { vi.clearAllMocks(); state.user = { id: 'me' }; state.options = null; state.rows = []; });
it('keeps private history hidden for guests', () => { state.user = null; expect(renderToStaticMarkup(<WalletHistoryScreen />)).toContain('Login required'); expect(state.options).toBeNull(); });
it('scopes history cache by user, tab and filters and sends pagination to the server', async () => {
  renderToStaticMarkup(<WalletHistoryController userId="me" />); expect(state.options!.queryKey).toEqual(['wallet-transactions', 'me', 'ledger', 'all', 'all', '', 1]);
  await state.options!.queryFn(); expect(state.request).toHaveBeenCalledWith('GET', '/affiliate/transactions?page=1&pageSize=6&period=all');
});
it('preserves pending balance and real status when projecting API records', () => { renderToStaticMarkup(<WalletHistoryController userId="me" />); expect(state.rows[0]).toMatchObject({ status: 'Chờ duyệt', balanceLabel: 'Chờ duyệt' }); });
