import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import ProductDetail from '../app/product/[id]';

const state = vi.hoisted(() => ({ show: vi.fn(), invalidate: vi.fn(), push: vi.fn(), callbacks: [] as { onSuccess?: (result: unknown, buyNow: boolean) => unknown; onError?: (error: Error) => unknown }[] }));
vi.mock('react-native', () => {
  const Container = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return { View: Container, Text: Container, Pressable: Container, StyleSheet: { create: (value: unknown) => value }, useWindowDimensions: () => ({ width: 1200 }) };
});
vi.mock('expo-router', () => ({ useLocalSearchParams: () => ({ id: 'p1' }), router: { push: state.push } }));
vi.mock('lucide-react-native', () => Object.fromEntries(['Heart', 'Link2', 'Minus', 'Plus', 'ShoppingCart', 'Star', 'Zap'].map(name => [name, () => null])));
vi.mock('react-hook-form', () => ({ useForm: () => ({}), Controller: () => null }));
vi.mock('../src/stores/auth', () => ({ useAuth: () => ({ id: 'member' }), queryClient: { invalidateQueries: state.invalidate } }));
vi.mock('../src/stores/toast', () => ({ useToast: (select: (value: { show: typeof state.show }) => unknown) => select({ show: state.show }) }));
vi.mock('../src/services/api', () => ({ request: vi.fn() }));
vi.mock('../src/services/product-purchase', () => ({ prepareProductCheckout: vi.fn() }));
vi.mock('../src/services/affiliate-source', () => ({ recordAffiliateVisit: vi.fn() }));
vi.mock('../src/components/common/ui', () => ({ Page: ({ children }: { children: React.ReactNode }) => <main>{children}</main>, Status: ({ error }: { error?: unknown }) => error ? <span>INLINE ERROR</span> : null, Button: () => null, Field: () => null }));
vi.mock('../src/components/product/ProductVariantSelector', () => ({ ProductVariantSelector: () => null }));
vi.mock('../src/components/product/ProductGallery', () => ({ ProductGallery: () => null }));
vi.mock('../src/components/product/ProductDetailInfo', () => ({ ProductDetailInfo: () => null }));
vi.mock('../src/components/product/ProductDetailSidebar', () => ({ detailPanel: {}, ProductDetailSidebar: () => null }));
vi.mock('../src/components/affiliate/ShareLinkActions', () => ({ ShareLinkActions: () => null }));
vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: string[] }) => ({ data: queryKey[0] === 'product' ? { id: 'p1', name: 'Tai nghe', brandId: 'b1', price: 100, variants: [{ id: 'v1', price: 100, availableStock: 10 }] } : undefined }),
  useMutation: (options: (typeof state.callbacks)[number]) => {
    state.callbacks.push(options);
    return { isSuccess: true, variables: false, error: options.onError ? new Error('API failure') : null };
  },
}));
beforeEach(() => { vi.clearAllMocks(); state.callbacks = []; });
function render() {
  const html = renderToStaticMarkup(<ProductDetail />);
  return { html, add: state.callbacks[3] };
}
it('uses a top success toast and refreshes the cart after adding', async () => {
  const { add } = render();
  await add.onSuccess?.({}, false);
  expect(state.show).toHaveBeenCalledWith('Đã thêm vào giỏ hàng.');
  expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['cart'] });
  expect(state.push).not.toHaveBeenCalled();
});
it('uses the requested top error toast after add failure', async () => {
  const { add } = render();
  await add.onError?.(new Error('API failure'));
  expect(state.show).toHaveBeenCalledWith('Lỗi: thêm giỏ hàng thất bại', 'error');
  expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['cart'] });
  expect(state.push).not.toHaveBeenCalled();
});
it('removes inline cart success and error messages', () => {
  const { html } = render();
  expect(html).not.toContain('Xem giỏ hàng');
  expect(html).not.toContain('INLINE ERROR');
});
it('preserves buy-now checkout navigation without an add-success toast', async () => {
  const { add } = render();
  await add.onSuccess?.({}, true);
  expect(state.push).toHaveBeenCalledWith('/checkout');
  expect(state.show).not.toHaveBeenCalled();
});
