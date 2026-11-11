import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import OrderDetail from '../app/order/[id]';
import type { Order, OrderItem } from '../src/types/api';

type ViewProps = { order: Order; onCancel: () => void; onRefund: () => void; onReview: (item: OrderItem) => void; onStore: (slug: string) => void };
const state = vi.hoisted(() => ({ user: { id: 'member' } as { id: string } | null, enabled: false, props: undefined as ViewProps | undefined, queryFn: undefined as undefined | (() => unknown), mutation: undefined as undefined | { mutationFn: () => unknown; onSuccess: () => unknown }, request: vi.fn(), invalidate: vi.fn(), refetch: vi.fn(), push: vi.fn(), mutate: vi.fn() }));
vi.mock('react-native', () => ({ useWindowDimensions: () => ({ width: 1200 }) }));
vi.mock('expo-router', () => ({ router: { push: state.push }, useLocalSearchParams: () => ({ id: 'order-id' }) }));
vi.mock('../src/navigation/tabs', () => ({ DESKTOP_HEADER_WIDTH: 1024 }));
vi.mock('../src/components/common/ui', () => ({ Page: ({ children, title, back }: { children: React.ReactNode; title?: string; back?: boolean }) => <><header>{back && <button>Quay lại</button>}{title}</header><main>{children}</main></>, Status: () => null, LoginNotice: () => <div>Đăng nhập</div> }));
vi.mock('../src/components/orders/OrderDetailView', () => ({ OrderDetailView: (props: ViewProps) => { state.props = props; return null; } }));
vi.mock('../src/services/api', () => ({ request: state.request }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (s: { user: typeof state.user }) => unknown) => select({ user: state.user }), queryClient: { invalidateQueries: state.invalidate } }));
vi.mock('@tanstack/react-query', () => ({ useQuery: (options: { enabled: boolean; queryFn: () => unknown }) => { state.enabled = options.enabled; state.queryFn = options.queryFn; return { data: { id: 'order-id', history: [{ note: 'Keep history' }] }, refetch: state.refetch }; }, useMutation: (options: typeof state.mutation) => { state.mutation = options; return { mutate: state.mutate }; } }));
beforeEach(() => { vi.clearAllMocks(); state.user = { id: 'member' }; state.props = undefined; });
it('shows the back button and order title in the shared desktop header', () => {
  const html = renderToStaticMarkup(<OrderDetail />);
  expect(html).toContain('<header><button>Quay lại</button>Chi tiết đơn hàng</header>');
});
it('passes the original order including its history to the redesign and retains authenticated GET', async () => {
  renderToStaticMarkup(<OrderDetail />); await state.queryFn?.();
  expect(state.props!.order.history[0].note).toBe('Keep history');
  expect(state.request).toHaveBeenCalledWith('GET', '/orders/order-id');
});
it('keeps cancellation contract and refreshes the order/history and restored vouchers', async () => {
  renderToStaticMarkup(<OrderDetail />); state.props!.onCancel();
  expect(state.mutate).toHaveBeenCalledOnce(); await state.mutation!.mutationFn(); await state.mutation!.onSuccess();
  expect(state.request).toHaveBeenCalledWith('POST', '/orders/order-id/cancel'); expect(state.refetch).toHaveBeenCalledOnce();
  for (const key of ['orders', 'membership', 'vouchers']) expect(state.invalidate).toHaveBeenCalledWith({ queryKey: [key] });
});
it('preserves review, refund and store navigation', () => {
  renderToStaticMarkup(<OrderDetail />);
  state.props!.onReview({ id: 'item', productName: 'Tai nghe' } as OrderItem);
  state.props!.onRefund(); state.props!.onStore('phong-vu');
  expect(state.push).toHaveBeenCalledWith({ pathname: '/review/[id]', params: { id: 'item', name: 'Tai nghe' } });
  expect(state.push).toHaveBeenCalledWith({ pathname: '/refund/[id]', params: { id: 'order-id' } });
  expect(state.push).toHaveBeenCalledWith({ pathname: '/dai-ly/[slug]', params: { slug: 'phong-vu' } });
});
it('requires login and does not fetch/render an order for guests', () => {
  state.user = null; expect(renderToStaticMarkup(<OrderDetail />)).toContain('Đăng nhập'); expect(state.enabled).toBe(false); expect(state.props).toBeUndefined();
});
