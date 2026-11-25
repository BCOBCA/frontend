import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import ReviewDetail from '../app/review/[id]';

const state = vi.hoisted(() => ({ user: { id: 'buyer' } as { id: string } | null, data: { productId: 'product' } as { productId: string } | null | undefined, error: null as Error | null, queries: [] as { queryKey: unknown[]; queryFn: () => unknown; enabled: boolean }[], request: vi.fn(), push: vi.fn() }));
vi.mock('react-native', () => ({ View: 'div', StyleSheet: { create: (value: unknown) => value }, useWindowDimensions: () => ({ width: 375 }) }));
vi.mock('expo-router', () => ({ useLocalSearchParams: () => ({ id: 'line/a' }), router: { push: state.push } }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (s: { user: typeof state.user }) => unknown) => select({ user: state.user }) }));
vi.mock('../src/services/api', () => ({ request: state.request }));
vi.mock('../src/components/common/ui', () => ({ Page: ({ children, title }: { children: React.ReactNode; title: string }) => <main>{title}{children}</main>, Status: ({ error }: { error?: Error }) => <span>{error?.message}</span>, LoginNotice: () => <span>Đăng nhập</span> }));
vi.mock('../src/components/orders/ReviewForm', () => ({ ReviewForm: () => <span>First review form</span> }));
vi.mock('../src/components/orders/ReviewDetailView', () => ({ ReviewDetailView: () => <span>Review detail</span> }));
vi.mock('@tanstack/react-query', () => ({ useQuery: (options: typeof state.queries[number]) => { state.queries.push(options); return options.queryKey[0] === 'my-review' ? { data: state.data, error: state.error, isLoading: state.data === undefined, refetch: vi.fn() } : { data: undefined }; } }));
beforeEach(() => { vi.clearAllMocks(); state.user = { id: 'buyer' }; state.data = { productId: 'product' }; state.error = null; state.queries = []; });
it('loads the notified order item in the buyer scope and optional product context', () => {
  const html = renderToStaticMarkup(<ReviewDetail />);
  expect(html).toContain('Chi tiết đánh giá'); expect(html).toContain('Review detail');
  expect(state.queries[0].queryKey).toEqual(['my-review', 'line/a', 'buyer']);
  state.queries.forEach(query => query.queryFn());
  expect(state.request).toHaveBeenCalledWith('GET', '/order-items/line%2Fa/review');
  expect(state.request).toHaveBeenCalledWith('GET', '/products/product');
});
it('keeps product failure independent from displaying the saved review', () => {
  expect(renderToStaticMarkup(<ReviewDetail />)).toContain('Review detail');
  expect(renderToStaticMarkup(<ReviewDetail />)).not.toContain('First review form');
});
it('only shows the first review form after the API confirms there is no review', () => {
  state.data = undefined;
  expect(renderToStaticMarkup(<ReviewDetail />)).not.toContain('First review form');
  state.data = null;
  expect(renderToStaticMarkup(<ReviewDetail />)).toContain('First review form');
  expect(state.queries.at(-1)?.enabled).toBe(false);
  state.error = new Error('Không có quyền');
  expect(renderToStaticMarkup(<ReviewDetail />)).not.toContain('First review form');
});
it('requires login and disables both requests for guests', () => {
  state.user = null;
  expect(renderToStaticMarkup(<ReviewDetail />)).toContain('Đăng nhập');
  expect(state.queries.every(query => !query.enabled)).toBe(true);
});
