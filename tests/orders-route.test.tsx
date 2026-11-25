import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import Orders from '../app/orders';
vi.mock('../src/components/orders/ReviewDialog', () => ({ ReviewDialog: () => null }));

const state = vi.hoisted(() => ({ request: vi.fn(), invalidate: vi.fn(), mutate: vi.fn(), copy: vi.fn(), push: vi.fn(), card: undefined as undefined | { onCopy: () => Promise<void>; onCancel: () => void; onReview: () => void }, mutation: undefined as undefined | { mutationFn: (input: { id: string; reason: string }) => unknown; onSuccess: (result: unknown, input: { id: string; reason: string }) => Promise<void> }, query: undefined as undefined | { queryKey: unknown[]; queryFn: () => unknown } }));
vi.mock('../src/components/orders/CancelOrderForm', () => ({ CancelOrderForm: () => null }));
vi.mock('expo-router', () => ({ router: { push: state.push }, useLocalSearchParams: () => ({ checkoutGroupId: 'checkout-group' }) }));
vi.mock('react-native', () => ({ View: 'div', Text: 'span', Pressable: ({ children }: { children: React.ReactNode }) => <button>{children}</button> }));
vi.mock('../src/theme', () => ({ styles: {}, money: (v: number) => `${v} VNĐ`, dateTime: () => '11/11/2026' }));
vi.mock('../src/components/common/ui', () => ({ Page: ({ children, title }: { children: React.ReactNode; title: string }) => <main><h1>{title}</h1>{children}</main>, Button: () => null, Empty: () => null, LoginNotice: () => null, Status: () => null }));
vi.mock('../src/stores/auth', () => ({ queryClient: { invalidateQueries: state.invalidate }, useAuth: (selector: (s: unknown) => unknown) => selector({ user: { id: 'member' } }) }));
vi.mock('../src/services/api', () => ({ request: state.request }));
vi.mock('expo-clipboard', () => ({ setStringAsync: state.copy }));
vi.mock('../src/stores/toast', () => ({ useToast: () => vi.fn() }));
vi.mock('../src/components/orders/OrderListCard', () => ({ OrderListCard: (props: NonNullable<typeof state.card> & { order: { storeName: string } }) => { state.card = props; return <article>{props.order.storeName}</article>; } }));
vi.mock('@tanstack/react-query', () => ({ useMutation: (options: typeof state.mutation) => { state.mutation = options; return { mutate: state.mutate, reset: vi.fn() }; }, useQuery: (options: typeof state.query) => { state.query = options; return { data: { items: [{ id: 'a', orderCode: 'BCA-A', storeName: 'Shop Minh Anh', status: 'PENDING', totalAmount: 100000 }], totalPages: 1 } }; } }));
beforeEach(() => { vi.clearAllMocks(); });

it('loads only the new checkout group and labels each order with its store name', () => {
  const html = renderToStaticMarkup(<Orders />);
  expect(html).toContain('Đơn hàng vừa đặt');
  expect(html).toContain('Shop Minh Anh');
  state.query!.queryFn();
  expect(state.query!.queryKey).toContain('checkout-group');
  expect(state.request).toHaveBeenCalledWith('GET', '/orders?page=1&checkoutGroupId=checkout-group');
});
it('copies the real code and cancels only the selected order with related cache refresh', async () => {
  renderToStaticMarkup(<Orders />);
  state.card!.onCopy();
  expect(state.copy).toHaveBeenCalledWith('BCA-A');
  state.card!.onCancel();
  expect(state.mutate).not.toHaveBeenCalled();
  const input = { id: 'a', reason: 'Không còn nhu cầu mua' };
  await state.mutation!.mutationFn(input);
  expect(state.request).toHaveBeenCalledWith('POST', '/orders/a/cancel', { reason: input.reason });
  await state.mutation!.onSuccess(undefined, input);
  for (const key of ['orders', 'membership', 'vouchers', 'notifications']) expect(state.invalidate).toHaveBeenCalledWith({ queryKey: [key] });
  expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['order', 'member', 'a'] });
});

it('opens review editing in place without navigating away from the order list', () => {
  renderToStaticMarkup(<Orders />);
  state.card!.onReview();
  expect(state.push).not.toHaveBeenCalled();
});
