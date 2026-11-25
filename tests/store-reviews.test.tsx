import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { StoreReviews } from '../src/components/product/ProductReviews';
import { request } from '../src/services/api';
import { router } from 'expo-router';

const state = vi.hoisted(() => ({ items: [] as Record<string, unknown>[], totalPages: 1, error: null as Error | null, loading: false, query: null as null | { queryKey: unknown[]; queryFn: () => unknown }, actions: {} as Record<string, () => void> }));
vi.mock('react-native', () => ({
  View: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>, Text: 'span',
  Pressable: ({ children, onPress, accessibilityRole }: { children: React.ReactNode; onPress: () => void; accessibilityRole: string }) => {
    state.actions['Đi tới sản phẩm'] = onPress;
    return <a role={accessibilityRole}>{children}</a>;
  },
}));
vi.mock('expo-image', () => ({ Image: ({ source }: { source: { uri: string } }) => <img src={source.uri} alt="Ảnh đánh giá" /> }));
vi.mock('expo-router', () => ({ router: { push: vi.fn() } }));
vi.mock('lucide-react-native', () => ({ Star: () => null }));
vi.mock('../src/components/common/ui', () => ({
  Button: ({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) => { state.actions[title] = onPress; return <button disabled={disabled}>{title}</button>; },
  Status: ({ loading, error }: { loading: boolean; error: Error | null }) => <span>{loading ? 'Loading' : error?.message}</span>,
}));
vi.mock('../src/services/api', () => ({ request: vi.fn() }));
vi.mock('../src/theme', () => ({ colors: {}, styles: {}, dateTime: (value: string) => value }));
vi.mock('@tanstack/react-query', () => ({ useQuery: (options: typeof state.query) => {
  state.query = options;
  return { data: state.loading || state.error ? undefined : { items: state.items, totalItems: state.items.length, totalPages: state.totalPages }, isLoading: state.loading, error: state.error, refetch: vi.fn() };
} }));
beforeEach(() => { vi.clearAllMocks(); state.items = []; state.totalPages = 1; state.error = null; state.loading = false; state.actions = {}; });

it('requests only the selected store reviews with a separate cache key', async () => {
  renderToStaticMarkup(<StoreReviews storeId="shop" />);
  expect(state.query?.queryKey).toEqual(['store-reviews', 'shop', 1]);
  await state.query?.queryFn();
  expect(request).toHaveBeenCalledWith('GET', '/dealers/shop/reviews?page=1');
});

it('shows buyer content, photos and replies in server order and opens the reviewed product', () => {
  state.items = [
    { id: 'new', productId: 'p2', displayName: 'Kai', rating: 1, content: 'Mới nhất', imageUrls: ['https://example.test/review.jpg'], createdAt: '2026-11-25', reply: { content: '<script>Cảm ơn</script>', storeName: 'Cửa hàng QQ', updatedAt: '2026-11-26' } },
    { id: 'old', productId: 'p1', displayName: 'An', rating: 5, content: 'Đánh giá cũ', imageUrls: [], createdAt: '2026-11-23', reply: null },
  ];
  const html = renderToStaticMarkup(<StoreReviews storeId="shop" />);
  for (const value of ['Kai', 'Cửa hàng QQ', '&lt;script&gt;Cảm ơn&lt;/script&gt;', 'review.jpg', '2026-11-26', 'Đi tới sản phẩm']) expect(html).toContain(value);
  expect(html.indexOf('Mới nhất')).toBeLessThan(html.indexOf('Đánh giá cũ'));
  expect(html.match(/Phản hồi của/g)).toHaveLength(1);
  // Each review retains its own product action.
  expect(html.match(/Đi tới sản phẩm/g)).toHaveLength(2);
  expect(html).toContain('role="link"');
  expect(html.indexOf('Đi tới sản phẩm')).toBeLessThan(html.indexOf('Phản hồi của'));
  expect(html.indexOf('Đi tới sản phẩm')).toBeLessThan(html.indexOf('2026-11-25'));
  state.actions['Đi tới sản phẩm']();
  expect(router.push).toHaveBeenCalledWith('/product/p1');
});

it('exposes pagination to reach all reviews', () => {
  state.totalPages = 3;
  const html = renderToStaticMarkup(<StoreReviews storeId="shop" />);
  expect(html).toContain('1/3');
  expect(html).toContain('disabled=""');
  expect(html).toContain('Sau');
});

it('distinguishes empty, loading and failed requests', () => {
  expect(renderToStaticMarkup(<StoreReviews storeId="shop" />)).toContain('Chưa có đánh giá được công bố');
  state.loading = true;
  const loading = renderToStaticMarkup(<StoreReviews storeId="shop" />);
  expect(loading).toContain('Loading');
  expect(loading).not.toContain('Chưa có đánh giá được công bố');
  state.loading = false; state.error = new Error('Không tải được đánh giá');
  expect(renderToStaticMarkup(<StoreReviews storeId="shop" />)).toContain(state.error.message);
});
