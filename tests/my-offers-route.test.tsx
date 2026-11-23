import React, { type ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import MyOffers from '../app/my-offers';
import type { MyOffersView } from '../src/components/promotions/MyOffersView';

type Query = { queryKey: unknown[]; queryFn: (ctx: { pageParam: number }) => Promise<unknown>; getNextPageParam: (page: { page: number; totalPages: number }) => number | undefined };
const state = vi.hoisted(() => ({ user: { id: 'a' } as { id: string } | null, query: undefined as Query | undefined, props: undefined as ComponentProps<typeof MyOffersView> | undefined, request: vi.fn(), push: vi.fn(), next: vi.fn(), retry: vi.fn() }));
vi.mock('expo-router', () => ({ router: { push: state.push } }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (s: { user: typeof state.user }) => unknown) => select(state) }));
vi.mock('../src/services/api', () => ({ request: state.request }));
vi.mock('../src/components/common/ui', () => ({ Page: ({ children }: { children: React.ReactNode }) => <main>{children}</main>, LoginNotice: () => <span>Đăng nhập</span> }));
vi.mock('../src/components/promotions/MyOffersView', () => ({ MyOffersView: (props: typeof state.props) => { state.props = props; return null; } }));
vi.mock('@tanstack/react-query', () => ({ useInfiniteQuery: (options: Query) => { state.query = options; return { data: { pages: [{ items: [] }] }, isLoading: false, error: null, hasNextPage: true, isFetchingNextPage: false, fetchNextPage: state.next, refetch: state.retry }; } }));
beforeEach(() => { vi.clearAllMocks(); state.user = { id: 'a' }; state.query = undefined; state.props = undefined; });
it('requests only owned offers with pagination and an account-scoped cache', async () => {
  renderToStaticMarkup(<MyOffers />); await state.query!.queryFn({ pageParam: 2 });
  expect(state.query!.queryKey).toEqual(['vouchers', 'mine', 'a', 'AVAILABLE']);
  expect(state.request).toHaveBeenCalledWith('GET', '/vouchers/mine?page=2&pageSize=20&status=AVAILABLE');
  expect(state.query!.getNextPageParam({ page: 1, totalPages: 2 })).toBe(2);
  expect(state.query!.getNextPageParam({ page: 2, totalPages: 2 })).toBeUndefined();
  state.user = { id: 'b' }; renderToStaticMarkup(<MyOffers />);
  expect(state.query!.queryKey).toEqual(['vouchers', 'mine', 'b', 'AVAILABLE']);
});
it('requires login before mounting the private offers query', () => {
  state.user = null; expect(renderToStaticMarkup(<MyOffers />)).toContain('Đăng nhập');
  expect(state.query).toBeUndefined(); expect(state.props).toBeUndefined();
});
it('connects load more, retry, shopping and discovery to the existing app', () => {
  renderToStaticMarkup(<MyOffers />);
  state.props!.onLoadMore(); state.props!.onRetry(); state.props!.onShop(); state.props!.onDiscover();
  expect(state.next).toHaveBeenCalledOnce(); expect(state.retry).toHaveBeenCalledOnce();
  expect(state.push.mock.calls).toEqual([['/categories'], ['/promotions']]);
});
