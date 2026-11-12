import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import WithdrawalScreen, { WithdrawalForm } from '../src/screens/WithdrawalScreen';
import type { WithdrawalRequestViewProps } from '../src/components/affiliate/WithdrawalRequestView';
import type { WithdrawalAttempt } from '../src/components/affiliate/withdrawal';
type Mutation = { mutationFn: (value: never) => Promise<unknown>; onError?: (error: unknown) => void; onSettled?: () => void; onSuccess?: (result: unknown, value: never) => void };
const state = vi.hoisted(() => ({ user: { id: 'me' } as { id: string } | null, request: vi.fn(), queryOptions: [] as { queryKey: unknown[]; queryFn: () => Promise<unknown> }[], mutations: [] as Mutation[], mutate: [vi.fn(), vi.fn()], refetch: vi.fn(), invalidate: vi.fn(), setData: vi.fn(), props: null as WithdrawalRequestViewProps | null, banks: [{ id: 'bank-me', bankName: 'My bank', accountNumber: '****1234', accountHolder: 'MY NAME' }] }));
vi.mock('react-native', () => ({ View: 'div', Text: 'span', StyleSheet: { create: (v: unknown) => v } }));
vi.mock('expo-router', () => ({ router: { replace: vi.fn() } }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (v: { user: typeof state.user }) => unknown) => select({ user: state.user }) }));
vi.mock('../src/services/api', () => ({ request: state.request }));
vi.mock('../src/components/common/ui', () => ({ Page: ({ children }: { children: React.ReactNode }) => <main>{children}</main>, LoginNotice: () => <p>Login required</p>, Button: () => null, Status: () => null }));
vi.mock('../src/components/affiliate/WithdrawalRequestView', () => ({ WithdrawalRequestView: (props: WithdrawalRequestViewProps) => { state.props = props; return <p>Withdrawal form</p>; } }));
vi.mock('../src/components/affiliate/withdrawal', async importOriginal => ({ ...await importOriginal<typeof import('../src/components/affiliate/withdrawal')>(), withdrawalQuote: () => ({ amount: 50000, fee: 5000, net: 45000, withdrawable: 100000, error: null }) }));
vi.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({ invalidateQueries: state.invalidate, setQueryData: state.setData }), useQuery: (options: typeof state.queryOptions[number]) => { state.queryOptions.push(options); return { data: options.queryKey[0] === 'affiliate-bank-accounts' ? state.banks : options.queryKey[0] === 'withdrawal-settings' ? { feeAmount: 5000, minimumAmount: 50000, maximumAmount: 50000000, revision: 'reviewed-revision' } : { availableBalance: 100000, debtBalance: 0 }, error: null, isLoading: false, isFetching: false, refetch: state.refetch }; }, useMutation: (options: Mutation) => { const index = state.mutations.length; state.mutations.push(options); return { mutate: state.mutate[index], isPending: false, reset: vi.fn() }; } }));
beforeEach(() => { vi.clearAllMocks(); state.mutations = []; state.queryOptions = []; state.user = { id: 'me' }; state.banks = [{ id: 'bank-me', bankName: 'My bank', accountNumber: '****1234', accountHolder: 'MY NAME' }]; });
it('does not load private data or show a withdrawal form for guests', () => {
  state.user = null; expect(renderToStaticMarkup(<WithdrawalScreen />)).toContain('Login required'); expect(state.queryOptions).toHaveLength(0);
});
it('scopes wallet/banks by account and prevents a double submission', async () => {
  renderToStaticMarkup(<WithdrawalForm userId="me" />);
  expect(state.queryOptions.map(q => q.queryKey)).toEqual([['affiliate', 'me'], ['withdrawal-settings'], ['affiliate-bank-accounts', 'me']]);
  state.props!.onSubmit(); state.props!.onSubmit(); expect(state.mutate[1]).toHaveBeenCalledTimes(1);
  const attempt = state.mutate[1].mock.calls[0][0] as WithdrawalAttempt;
  expect(attempt.payload).toEqual({ amount: 50000, bankAccountId: 'bank-me', expectedConfigurationRevision: 'reviewed-revision' });
  await state.mutations[1].mutationFn(attempt as never); await state.mutations[1].mutationFn(attempt as never);
  expect(state.request).toHaveBeenLastCalledWith('POST', '/affiliate/withdrawals', attempt.payload, { 'Idempotency-Key': attempt.key });
  expect(state.request.mock.calls[0][3]).toEqual(state.request.mock.calls[1][3]); expect(attempt.payload).not.toHaveProperty('feeAmount');
});
it('blocks submission without a bank and refreshes policy after a definitive rejection', () => {
  state.banks = []; renderToStaticMarkup(<WithdrawalForm userId="me" />); state.props!.onSubmit(); expect(state.mutate[1]).not.toHaveBeenCalled();
  state.mutations[1].onError!({ isAxiosError: true, response: { status: 409 } }); expect(state.refetch).toHaveBeenCalledTimes(3);
});
it('keeps ambiguous failures retryable without automatically refetching or submitting again', () => {
  renderToStaticMarkup(<WithdrawalForm userId="me" />); state.props!.onSubmit();
  state.mutations[1].onError!(new Error('Network interrupted')); expect(state.refetch).not.toHaveBeenCalled(); expect(state.mutate[1]).toHaveBeenCalledOnce();
});
