import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import AffiliateScreen from '../app/affiliate';

const state = vi.hoisted(() => ({ user: { id: 'me' } as { id: string } | null, queries: [] as { queryKey: unknown[]; queryFn: () => Promise<unknown>; enabled: boolean }[], request: vi.fn(), copy: vi.fn(async () => true), share: vi.fn(async () => ({})), toast: vi.fn(), push: vi.fn(), invitation: null as null | { onCopy: () => Promise<void>; onShare: () => Promise<void> }, url: 'https://example.test/register?ref=REAL', error: null as unknown }));
vi.mock('react-native', () => ({ View: 'div', Text: 'span', StyleSheet: { create: (value: unknown) => value }, useWindowDimensions: () => ({ width: 393 }), Share: { share: state.share } }));
vi.mock('@tanstack/react-query', () => ({ useQuery: (options: typeof state.queries[number]) => { state.queries.push(options); return { data: options.queryKey[0] === 'affiliate-invitation' ? { url: state.url } : options.queryKey[0] === 'affiliate-ranks' ? [] : undefined, isLoading: false, error: options.queryKey[0] === 'affiliate-invitation' ? state.error : null, refetch: vi.fn() }; } }));
vi.mock('expo-router', () => ({ router: { push: state.push } }));
vi.mock('expo-clipboard', () => ({ setStringAsync: state.copy }));
vi.mock('../src/services/api', () => ({ request: state.request, errorMessage: () => 'Copy/share failed' }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (value: { user: typeof state.user }) => unknown) => select({ user: state.user }) }));
vi.mock('../src/stores/toast', () => ({ useToast: () => state.toast }));
vi.mock('../src/components/common/ui', () => ({ Page: ({ children }: { children: React.ReactNode }) => <main>{children}</main>, LoginNotice: () => <p>Login required</p>, Status: () => null }));
vi.mock('../src/components/affiliate/AffiliateDashboardView', () => ({ AffiliateDashboardLinks: () => <p>Dashboard links</p>, AffiliateDashboardRank: () => null, AffiliateWalletCard: () => null }));
vi.mock('../src/components/affiliate/AffiliateInvitationCard', () => ({ AffiliateInvitationCard: (props: NonNullable<typeof state.invitation>) => { state.invitation = props; return <p>Invitation</p>; } }));
beforeEach(() => { vi.clearAllMocks(); state.user = { id: 'me' }; state.queries = []; state.url = 'https://example.test/register?ref=REAL'; state.error = null; state.copy.mockResolvedValue(true); state.share.mockResolvedValue({}); });
it('scopes private queries to the user and fetches the existing endpoints', async () => {
  renderToStaticMarkup(<AffiliateScreen />);
  expect(state.queries.map(q => q.queryKey)).toEqual([['affiliate', 'me'], ['affiliate-invitation', 'me'], ['affiliate-ranks']]);
  for (const query of state.queries) await query.queryFn();
  expect(state.request.mock.calls).toEqual([['GET', '/affiliate'], ['GET', '/affiliate/invitation'], ['GET', '/affiliate/ranks']]);
});
it('does not expose private dashboard data to guests', () => {
  state.user = null; const html = renderToStaticMarkup(<AffiliateScreen />);
  expect(html).toContain('Login required'); expect(html).not.toContain('Dashboard links'); expect(state.queries.every(q => !q.enabled)).toBe(true);
});
it('copies and shares the server URL without creating a product link', async () => {
  renderToStaticMarkup(<AffiliateScreen />); await state.invitation!.onCopy(); await state.invitation!.onShare();
  expect(state.copy).toHaveBeenCalledWith(state.url); expect(state.toast).toHaveBeenCalledWith('Đã sao chép link giới thiệu.');
  expect(state.share).toHaveBeenCalledWith({ message: state.url, url: state.url }); expect(state.request).not.toHaveBeenCalled();
});
it('does not copy stale invitation data after an API error or report clipboard refusal as success', async () => {
  state.error = new Error('Unavailable'); renderToStaticMarkup(<AffiliateScreen />); await state.invitation!.onCopy(); expect(state.copy).not.toHaveBeenCalled();
  state.error = null; state.copy.mockResolvedValue(false); renderToStaticMarkup(<AffiliateScreen />); await state.invitation!.onCopy(); expect(state.toast).not.toHaveBeenCalled();
});
