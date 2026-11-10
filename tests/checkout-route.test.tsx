import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import Checkout from '../app/checkout';
import type { CheckoutViewProps } from '../src/components/checkout/CheckoutView';

const state = vi.hoisted(() => ({ user: { id: 'member' } as { id: string } | null, props: undefined as CheckoutViewProps | undefined, preview: undefined as undefined | { queryFn: () => Promise<unknown>; queryKey: unknown[]; placeholderData?: (previous: unknown, previousQuery: { queryKey: unknown[] }) => unknown }, options: undefined as { mutationFn: () => Promise<unknown>; onError: () => Promise<void> } | undefined, request: vi.fn(), affiliate: vi.fn(), invalidate: vi.fn(), replace: vi.fn(), previewRefetch: vi.fn() }));
vi.mock('expo-router', () => ({ router: { push: vi.fn(), replace: state.replace } }));
vi.mock('../src/components/common/ui', () => ({ Page: ({ children }: { children: React.ReactNode }) => <main>{children}</main>, LoginNotice: () => <span>Đăng nhập</span> }));
vi.mock('../src/components/checkout/CheckoutView', () => ({ CheckoutView: (props: CheckoutViewProps) => { state.props = props; return null; } }));
vi.mock('../src/services/api', () => ({ request: state.request }));
vi.mock('../src/services/affiliate-source', () => ({ checkoutAffiliateToken: state.affiliate }));
vi.mock('../src/stores/auth', () => ({ useAuth: Object.assign((select: (s: { user: typeof state.user }) => unknown) => select({ user: state.user }), { getState: () => ({ user: state.user }) }), queryClient: { invalidateQueries: state.invalidate } }));
vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: { queryKey: unknown[]; queryFn: () => Promise<unknown> }) => {
    const { queryKey } = options;
    if (queryKey[0] === 'checkout-preview') state.preview = options;
    return { data: queryKey[0] === 'cart' ? { items: [], selectedCount: 2, selectedTotal: 100 } : queryKey[0] === 'addresses' ? [{ id: 'home', isDefault: true }] : { totalAmount: 90, cartHash: 'server-hash', vouchers: [], appliedVoucherCodes: ['SAVE', 'SHIP'] }, refetch: state.previewRefetch };
  },
  useMutation: (options: typeof state.options) => { state.options = options; return { mutate: vi.fn() }; },
}));
beforeEach(() => { vi.clearAllMocks(); state.user = { id: 'member' }; state.props = undefined; state.affiliate.mockResolvedValue('visit-token'); state.request.mockResolvedValue({ id: 'order' }); });
it('wires the redesigned view without changing the order contract or retry identity', async () => {
  renderToStaticMarkup(<Checkout />);
  expect(state.props).toBeDefined();
  await state.options!.mutationFn(); await state.options!.mutationFn();
  expect(state.request).toHaveBeenCalledWith('POST', '/orders', { addressId: 'home', paymentMethod: 'COD', voucherCodes: ['SAVE', 'SHIP'], note: '', expectedTotal: 90, expectedCartHash: 'server-hash', affiliateVisitToken: 'visit-token' }, { 'Idempotency-Key': expect.stringMatching(/^checkout-/) });
  expect(state.request.mock.calls[0][3]).toEqual(state.request.mock.calls[1][3]);
  expect(state.affiliate).toHaveBeenCalledOnce();
});
it('keeps unknown-result recovery and navigates to an order found after failure', async () => {
  renderToStaticMarkup(<Checkout />); await state.options!.mutationFn();
  await state.options!.onError();
  expect(state.request).toHaveBeenLastCalledWith('GET', expect.stringMatching(/^\/orders\/requests\/checkout-/));
  expect(state.replace).toHaveBeenCalledWith({ pathname: '/order/[id]', params: { id: 'order' } });
});
it('requires login without rendering an actionable checkout', () => {
  state.user = null;
  expect(renderToStaticMarkup(<Checkout />)).toContain('Đăng nhập');
  expect(state.props).toBeUndefined();
});
it('requests automatic owned-voucher selection on entering checkout and scopes it to the user', async () => {
  renderToStaticMarkup(<Checkout />);
  state.request.mockResolvedValueOnce({ vouchers: [], appliedVoucherCodes: [] });
  await state.preview!.queryFn();
  expect(state.preview!.queryKey.slice(0, 3)).toEqual(['checkout-preview', 'member', null]);
  expect(state.request).toHaveBeenCalledWith('POST', '/orders/preview', { voucherCodes: [], autoSelectVouchers: true });
});
it('rejects a preview that cannot supply the voucher warehouse contract', async () => {
  renderToStaticMarkup(<Checkout />);
  state.request.mockResolvedValueOnce({ totalAmount: 100 });
  await expect(state.preview!.queryFn()).rejects.toThrow('Chưa tải được kho voucher');
});
it('never carries voucher warehouse placeholders across different users', () => {
  renderToStaticMarkup(<Checkout />);
  const previous = { vouchers: ['private'] };
  expect(state.preview!.placeholderData?.(previous, { queryKey: ['checkout-preview', 'member'] })).toBe(previous);
  expect(state.preview!.placeholderData?.(previous, { queryKey: ['checkout-preview', 'another-user'] })).toBeUndefined();
});
