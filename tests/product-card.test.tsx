import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductCard } from '../src/components/product/ProductCard';

const state = vi.hoisted(() => ({ user: null as { id: string } | null, pending: false, success: false, error: null as Error | null, actions: new Map<string, () => void>(), push: vi.fn(), request: vi.fn().mockResolvedValue({}), showToast: vi.fn(), invalidate: vi.fn().mockResolvedValue(undefined) }));
vi.mock('react-native', () => {
  const Container = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return { View: Container, Text: Container, ActivityIndicator: ({ accessibilityLabel }: { accessibilityLabel: string }) => <span role="progressbar" aria-label={accessibilityLabel} />, Pressable: ({ children, accessibilityLabel, onPress, disabled }: { children?: React.ReactNode; accessibilityLabel?: string; onPress: () => void; disabled?: boolean }) => {
    if (accessibilityLabel && !disabled) state.actions.set(accessibilityLabel, onPress);
    return <button aria-label={accessibilityLabel} disabled={disabled}>{children}</button>;
  } };
});
vi.mock('expo-image', () => ({ Image: ({ contentFit }: { contentFit: string }) => <img alt="product" data-fit={contentFit} /> }));
vi.mock('expo-router', () => ({ router: { push: state.push } }));
vi.mock('lucide-react-native', () => Object.fromEntries(['Check', 'Heart', 'Phone', 'Package', 'ShoppingCart', 'Star'].map(name => [name, () => <span data-icon={name} />])));
vi.mock('@tanstack/react-query', () => ({ useMutation: ({ mutationFn, onSuccess, onError }: { mutationFn: () => unknown; onSuccess?: () => unknown; onError?: (error: unknown) => void }) => ({ mutate: async () => { try { await mutationFn(); await onSuccess?.(); } catch (error) { onError?.(error); } }, isPending: state.pending, isSuccess: state.success, error: state.error }), useQueryClient: () => ({ invalidateQueries: state.invalidate }) }));
vi.mock('../src/stores/auth', () => ({ queryClient: { invalidateQueries: vi.fn() }, useAuth: (select: (s: typeof state) => unknown) => select(state) }));
vi.mock('../src/services/api', () => ({ request: state.request, errorMessage: (error: Error) => error.message }));
vi.mock('../src/stores/toast', () => ({ useToast: (select: (s: { show: typeof state.showToast }) => unknown) => select({ show: state.showToast }) }));
vi.mock('../src/theme', () => ({ colors: {}, styles: {}, money: (value: number) => `${value} VNĐ` }));
vi.mock('../src/components/common/ui', () => ({ Status: () => null }));

const product = { id: 'p1', name: 'Laptop mẫu', imageUrl: 'https://example.test/image.jpg', price: 1000, salePrice: 800, variantId: 'v1', availableStock: 2, rating: null, reviewCount: 0, soldCount: 0 };
beforeEach(() => { state.user = null; state.pending = false; state.success = false; state.error = null; state.actions.clear(); vi.clearAllMocks(); state.request.mockReset().mockResolvedValue({}); });
describe('shared product card', () => {
  it('uses the dealer presentation for catalog and dealer data', () => {
    const html = renderToStaticMarkup(<ProductCard item={product} width={220} />);
    for (const text of ['-20%', '800 VNĐ', '1000 VNĐ', 'Chưa có đánh giá', 'data-fit="contain"']) expect(html).toContain(text);
    expect(html).not.toContain('Đã bán');
    state.actions.get('Thêm Laptop mẫu vào giỏ hàng')!();
    expect(state.push).toHaveBeenCalledWith('/login');
  });
  it('adds the displayed variant and keeps favorites working', async () => {
    state.user = { id: 'member' };
    renderToStaticMarkup(<ProductCard item={{ ...product, isFavorite: true }} width={220} />);
    await state.actions.get('Thêm Laptop mẫu vào giỏ hàng')!();
    expect(state.request).toHaveBeenCalledWith('POST', '/cart/items', { productId: 'p1', variantId: 'v1', quantity: 1 });
    await state.actions.get('Bỏ yêu thích')!();
    expect(state.request).toHaveBeenCalledWith('DELETE', '/favorites/p1');
  });
  it('shows a spinner instead of the cart and blocks repeated taps while pending', () => {
    state.user = { id: 'member' }; state.pending = true;
    const html = renderToStaticMarkup(<ProductCard item={product} width={220} />);
    expect(html).toContain('role="progressbar"');
    expect(html).not.toContain('data-icon="ShoppingCart"');
    expect(state.actions.has('Thêm Laptop mẫu vào giỏ hàng')).toBe(false);
  });
  it('restores the cart icon after success without adding a card message or checkmark', () => {
    state.success = true;
    const html = renderToStaticMarkup(<ProductCard item={product} width={220} />);
    expect(html).toContain('data-icon="ShoppingCart"');
    expect(html).not.toContain('data-icon="Check"');
    expect(html).not.toContain('Đã thêm vào giỏ hàng');
  });
  it('publishes top success feedback and refreshes the cart cache', async () => {
    state.user = { id: 'member' };
    renderToStaticMarkup(<ProductCard item={product} width={220} />);
    await state.actions.get('Thêm Laptop mẫu vào giỏ hàng')!();
    expect(state.showToast).toHaveBeenCalledWith('Đã thêm vào giỏ hàng.');
    expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['cart'] });
  });
  it('reports failed additions at the top and keeps the cart action available', async () => {
    state.user = { id: 'member' }; state.request.mockRejectedValueOnce(new Error('Sản phẩm đã hết hàng.'));
    const html = renderToStaticMarkup(<ProductCard item={product} width={220} />);
    await state.actions.get('Thêm Laptop mẫu vào giỏ hàng')!();
    expect(state.showToast).toHaveBeenCalledWith('Sản phẩm đã hết hàng.', 'error');
    expect(html).toContain('data-icon="ShoppingCart"');
    expect(state.invalidate).not.toHaveBeenCalled();
  });
  it('disables unavailable products and accepts missing review fields', () => {
    const html = renderToStaticMarkup(<ProductCard item={{ ...product, availableStock: 0, rating: undefined, reviewCount: undefined }} width={140} />);
    expect(html).toContain('Tạm hết hàng');
    expect(state.actions.has('Thêm Laptop mẫu vào giỏ hàng')).toBe(false);
    expect(html).not.toContain('NaN');
  });
  it('preserves consultation for services without a cart action', () => {
    const html = renderToStaticMarkup(<ProductCard item={{ ...product, isService: true, price: null, salePrice: null }} width={220} />);
    expect(html).toContain('Tư vấn ngay');
    expect(html).toContain('Liên hệ');
    expect(html).not.toContain('Tạm hết hàng');
    expect(state.actions.has('Thêm Laptop mẫu vào giỏ hàng')).toBe(false);
  });
});
