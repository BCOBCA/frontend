import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { AffiliateProductCard } from '../src/components/affiliate/AffiliateProductCard';
import { affiliatePrice, affiliateProductsPath, loadAllAffiliateCategories } from '../src/components/affiliate/affiliate-catalog';
const state = vi.hoisted(() => ({ actions: {} as Record<string, () => void>, disabled: {} as Record<string, boolean> }));
vi.mock('react-native', () => ({ View: 'div', Text: 'span', ActivityIndicator: () => <i>busy</i>, StyleSheet: { create: (v: unknown) => v }, Pressable: ({ accessibilityLabel, onPress, disabled, children }: { accessibilityLabel: string; onPress: () => void; disabled: boolean; children: React.ReactNode }) => { state.actions[accessibilityLabel] = onPress; state.disabled[accessibilityLabel] = !!disabled; return <button aria-label={accessibilityLabel} disabled={disabled}>{children}</button>; } }));
vi.mock('expo-image', () => ({ Image: ({ source, accessibilityLabel }: { source: { uri: string }; accessibilityLabel: string }) => <img src={source.uri} alt={accessibilityLabel} /> }));
vi.mock('lucide-react-native', () => ({ Package: () => null, Star: () => <i>rating-star</i>, Link2: () => null, Coins: () => null }));
const item = { id: 'product', name: 'Tai nghe Bluetooth', imageUrl: 'https://example.test/headphones.png', price: 1_000_000, salePrice: 790_000, variantId: 'variant', availableStock: 5, rating: 4.8, reviewCount: 16, commissionRate: 0.08, estimatedCommission: 63_200 };
it('shows original/discounted price, real review score and supplied rank-based commission with no cart', () => {
  const onOpen = vi.fn(), onGetLink = vi.fn();
  const html = renderToStaticMarkup(<AffiliateProductCard item={item} width={200} onOpen={onOpen} onGetLink={onGetLink} />);
  for (const text of ['Tai nghe Bluetooth', '790.000 VNĐ', '1.000.000 VNĐ', '4.8', '(16)', 'Kiếm ', '63.200 VNĐ', 'Lấy link', '-21%']) expect(html).toContain(text);
  expect(html).not.toContain('8%'); expect(html.match(/-21%/g)).toHaveLength(1);
  expect(html.indexOf('Kiếm ')).toBeLessThan(html.indexOf('790.000 VNĐ'));
  expect(html).not.toContain('giỏ hàng'); expect(html).not.toContain('ShoppingCart');
  expect(html).toContain('>Lấy link<');
  state.actions['Lấy link: Tai nghe Bluetooth'](); state.actions['Xem sản phẩm: Tai nghe Bluetooth']();
  expect(onGetLink).toHaveBeenCalledOnce(); expect(onOpen).toHaveBeenCalledOnce();
});
it('shows missing reviews honestly and prevents repeated link creation while busy', () => {
  const html = renderToStaticMarkup(<AffiliateProductCard item={{ ...item, rating: null, reviewCount: 0, commissionRate: 0.02, estimatedCommission: 15_800 }} width={160} busy disabled onOpen={vi.fn()} onGetLink={vi.fn()} />);
  expect(html).toContain('Chưa có đánh giá'); expect(html).toContain('15.800 VNĐ'); expect(html).not.toContain('rating-star'); expect(state.disabled['Lấy link: Tai nghe Bluetooth']).toBe(true);
});
it('uses zero sale prices and avoids a fake discount when prices match', () => {
  expect(affiliatePrice({ price: 100, salePrice: 0 })).toEqual({ current: 0, original: 100, discount: 100 });
  expect(affiliatePrice({ price: 100, salePrice: 100 })).toEqual({ current: 100, original: null, discount: 0 });
});
it('keeps the estimated commission visible when the server returns zero', () => {
  const html = renderToStaticMarkup(<AffiliateProductCard item={{ ...item, commissionRate: 0.02, estimatedCommission: 0 }} width={160} onOpen={vi.fn()} onGetLink={vi.fn()} />);
  expect(html).toContain('Kiếm '); expect(html).toContain('0 VNĐ');
});
it('encodes category and search server-side for pagination', () => {
  expect(affiliateProductsPath(2, ' a&b ', 'category')).toBe('/affiliate/products?page=2&pageSize=12&search=a%26b&categoryId=category');
});
it('loads every category page, including categories beyond the first hundred', async () => {
  const fetchPage = vi.fn(async (page: number) => ({ items: [`category-${page}`], totalPages: 3 }));
  expect(await loadAllAffiliateCategories(fetchPage)).toEqual(['category-1', 'category-2', 'category-3']);
  expect(fetchPage.mock.calls).toEqual([[1], [2], [3]]);
});
