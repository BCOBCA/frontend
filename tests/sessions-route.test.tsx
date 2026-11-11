import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import Sessions from '../app/sessions';

const state = vi.hoisted(() => ({ user: { accountId: 'account' } as { accountId: string } | null, request: vi.fn(), refetch: vi.fn(), mutate: vi.fn(), query: undefined as undefined | { queryKey: unknown[]; enabled: boolean; queryFn: () => unknown }, mutation: undefined as undefined | { mutationFn: (id: string) => unknown; onSuccess: () => Promise<void> }, table: undefined as undefined | { onRevoke: (id: string) => void } }));
vi.mock('react-native', () => ({ View: 'div' }));
vi.mock('../src/theme', () => ({ styles: {} }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (value: { user: typeof state.user }) => unknown) => select({ user: state.user }) }));
vi.mock('../src/services/api', () => ({ request: state.request }));
vi.mock('../src/components/common/ui', () => ({ Page: ({ children }: { children: React.ReactNode }) => <main>{children}</main>, Status: () => null, LoginNotice: () => <p>Đăng nhập</p> }));
vi.mock('../src/components/profile/SessionsTable', () => ({ SessionsTable: (props: NonNullable<typeof state.table>) => { state.table = props; return <div>Sessions table</div>; } }));
vi.mock('@tanstack/react-query', () => ({ useQuery: (options: typeof state.query) => { state.query = options; return { data: [], refetch: state.refetch }; }, useMutation: (options: typeof state.mutation) => { state.mutation = options; return { mutate: state.mutate }; } }));
beforeEach(() => { vi.clearAllMocks(); state.user = { accountId: 'account' }; });
it('loads authenticated sessions under an account-specific cache key', async () => {
  expect(renderToStaticMarkup(<Sessions />)).toContain('Sessions table');
  await state.query!.queryFn();
  expect(state.query!.queryKey).toEqual(['sessions', 'account']);
  expect(state.request).toHaveBeenCalledWith('GET', '/auth/sessions');
});
it('preserves per-session revoke and refreshes after success', async () => {
  renderToStaticMarkup(<Sessions />); state.table!.onRevoke('session/id');
  expect(state.mutate).toHaveBeenCalledWith('session/id');
  await state.mutation!.mutationFn('session/id');
  expect(state.request).toHaveBeenCalledWith('DELETE', '/auth/sessions/session%2Fid');
  await state.mutation!.onSuccess(); expect(state.refetch).toHaveBeenCalledOnce();
});
it('keeps the session table behind login', () => {
  state.user = null;
  const html = renderToStaticMarkup(<Sessions />);
  expect(html).toContain('Đăng nhập'); expect(html).not.toContain('Sessions table'); expect(state.query!.enabled).toBe(false);
});
