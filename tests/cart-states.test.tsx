import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CartScreen from '../app/(tabs)/cart';
import type { CartItem } from '../src/types/api';

const state = vi.hoisted(() => ({
  user: null as { id: string } | null, push: vi.fn(), enabled: false,
  cart: { data: { items: [] as CartItem[], selectedTotal: 0, selectedCount: 0 }, isLoading: false, error: null as Error | null, refetch: vi.fn() },
  pending: false, mutate: vi.fn(), invalidate: vi.fn(), settled: undefined as undefined | (() => unknown),
  actions: {} as Record<string, () => void>,
}));
vi.mock('react-native', () => {
  const Container = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { View: Container, Text: Container, ScrollView: Container, Platform: { OS: 'web' }, StyleSheet: { create: (styles: unknown) => styles }, useWindowDimensions: () => ({ width: 390 }),
    Pressable: ({ children, accessibilityLabel, onPress, disabled }: { children: React.ReactNode; accessibilityLabel: string; onPress: () => void; disabled?: boolean }) => {
      if (!disabled) state.actions[accessibilityLabel] = onPress;
      return <button>{children}</button>;
    } };
});
vi.mock('react-native-safe-area-context', () => ({ SafeAreaView: ({ children }: { children: React.ReactNode }) => <main>{children}</main>, useSafeAreaInsets: () => ({ bottom: 0 }) }));
vi.mock('react-native-svg', () => {
  const Shape = () => null;
  return { default: Shape, Defs: Shape, LinearGradient: Shape, Stop: Shape, Path: Shape, Ellipse: Shape, Circle: Shape, G: Shape, Rect: Shape };
});
vi.mock('expo-image', () => ({ Image: () => null }));
vi.mock('lucide-react-native', () => Object.fromEntries(['ShoppingCart', 'Minus', 'Plus', 'Trash2', 'Check', 'Package', 'Square', 'SquareCheck', 'UserRound', 'LayoutGrid'].map(name => [name, () => null])));
vi.mock('expo-router', () => ({ router: { push: state.push } }));
vi.mock('../src/navigation/tabs', () => ({ DESKTOP_HEADER_WIDTH: 1024 }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (s: typeof state) => unknown) => select(state), queryClient: { invalidateQueries: state.invalidate } }));
vi.mock('../src/services/api', () => ({ request: vi.fn(), errorMessage: () => 'Không thể cập nhật giỏ hàng.' }));
vi.mock('../src/components/common/ui', () => ({ Header: () => null, LoginNotice: () => <span>Generic login notice</span>, Status: ({ error, loading }: { error: Error | null; loading: boolean }) => <span>{error ? 'Lỗi tải giỏ hàng' : loading ? 'Đang tải' : ''}</span>, Button: ({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) => { if (!disabled) state.actions[title] = onPress; return <button disabled={disabled}>{title}</button>; } }));
vi.mock('@tanstack/react-query', () => ({ useQuery: ({ enabled }: { enabled: boolean }) => { state.enabled = enabled; return state.cart; }, useMutation: ({ onSettled }: { onSettled?: () => unknown }) => { state.settled = onSettled; return { mutate: state.mutate, isPending: state.pending, error: null }; } }));

const line = (overrides: Partial<CartItem> = {}): CartItem => ({ id: 'product', productId: 'p1', variantId: 'v1', brandId: 'brand', brandName: 'Brand', storeId: 'store', storeName: 'Phong Vũ', name: 'Sản phẩm trong giỏ', variantName: 'Trắng', imageUrl: '', unitPrice: 100000, quantity: 1, availableStock: 5, isAvailable: true, isSelected: true, ...overrides });
beforeEach(() => { state.user = null; state.cart.data = { items: [], selectedTotal: 0, selectedCount: 0 }; state.cart.isLoading = false; state.cart.error = null; state.pending = false; state.settled = undefined; state.actions = {}; state.push.mockClear(); state.mutate.mockClear(); state.invalidate.mockClear(); });
describe('cart guest and empty states', () => {
  it('shows a guest login action without checkout or fetching cart', () => {
    const html = renderToStaticMarkup(<CartScreen />);
    expect(html).toContain('Đăng nhập để xem giỏ hàng');
    expect(html).not.toContain('Tổng tiền:'); expect(state.enabled).toBe(false);
    state.actions['Đăng nhập'](); expect(state.push).toHaveBeenCalledWith('/login');
  });
  it('offers shopping for an authenticated empty cart without checkout', () => {
    state.user = { id: 'member' };
    const html = renderToStaticMarkup(<CartScreen />);
    expect(html).toContain('Giỏ hàng của bạn đang trống'); expect(html).not.toContain('Mua hàng (');
    state.actions['Tiếp tục mua sắm'](); expect(state.push).toHaveBeenCalledWith('/categories');
  });
  it.each(['loading', 'error'])('does not misrepresent %s as an empty cart', mode => {
    state.user = { id: 'member' }; state.cart.isLoading = mode === 'loading'; state.cart.error = mode === 'error' ? new Error('offline') : null;
    expect(renderToStaticMarkup(<CartScreen />)).not.toContain('Giỏ hàng của bạn đang trống');
  });
  it('retains items, totals and checkout when the cart contains products', () => {
    state.user = { id: 'member' }; state.cart.data = { items: [line()], selectedTotal: 100000, selectedCount: 1 };
    const html = renderToStaticMarkup(<CartScreen />);
    expect(html).toContain('Sản phẩm trong giỏ'); expect(html).toContain('Tổng tiền:'); expect(html).toContain('Mua hàng (1)');
    state.actions['Mua hàng (1)'](); expect(state.push).toHaveBeenCalledWith('/checkout');
  });
  it('renders one vendor heading and toggles all rows in that vendor', () => {
    state.user = { id: 'member' }; const items = [line(), line({ id: 'two', name: 'Sản phẩm thứ hai' })];
    state.cart.data = { items, selectedTotal: 200000, selectedCount: 2 };
    const html = renderToStaticMarkup(<CartScreen />);
    expect((html.match(/>Phong Vũ</g) ?? [])).toHaveLength(1);
    state.actions['Chọn sản phẩm của Phong Vũ']();
    expect(state.mutate).toHaveBeenCalledWith({ type: 'group', items, selected: false });
  });
  it.each(['pending', 'stock'])('blocks checkout during %s problems', mode => {
    state.user = { id: 'member' }; state.pending = mode === 'pending';
    state.cart.data = { items: [line({ availableStock: mode === 'stock' ? 0 : 5 })], selectedTotal: 100000, selectedCount: 1 };
    renderToStaticMarkup(<CartScreen />);
    expect(state.actions['Mua hàng (1)']).toBeUndefined();
  });
  it('refetches after mutations settle so partial group failures cannot leave stale totals', async () => {
    state.user = { id: 'member' }; renderToStaticMarkup(<CartScreen />);
    expect(state.settled).toBeTypeOf('function');
    await state.settled?.();
    expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['cart'] });
  });
});
