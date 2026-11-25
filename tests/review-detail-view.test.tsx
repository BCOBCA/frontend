import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { ReviewDetailView } from '../src/components/orders/ReviewDetailView';
import type { Review } from '../src/components/product/ProductReviews';

const actions = vi.hoisted(() => ({} as Record<string, () => void>));
vi.mock('react-native', () => ({ StyleSheet: { create: (v: unknown) => v }, View: 'div', Text: 'span', Pressable: ({ children, accessibilityLabel, onPress }: { children: React.ReactNode; accessibilityLabel: string; onPress: () => void }) => { actions[accessibilityLabel] = onPress; return <button>{children}</button>; } }));
vi.mock('expo-image', () => ({ Image: () => <img alt="Sản phẩm" /> }));
vi.mock('lucide-react-native', () => Object.fromEntries(['Star', 'Store', 'ChevronRight', 'MessageCircle', 'Package', 'ArrowLeft', 'LockKeyhole'].map(name => [name, () => null])));
const review: Review = { id: 'r', productId: 'p', displayName: 'Kai', rating: 1, content: '<script>Trải nghiệm chưa tốt</script>', imageUrls: [], status: 1, createdAt: '2026-11-23T02:40:00Z', reply: { storeName: 'Cửa hàng QQ', content: 'Cảm ơn bạn đã phản hồi.', updatedAt: '2026-11-23T03:08:00Z' } };
it('presents the buyer review and actual shop reply as distinct readable sections', () => {
  const html = renderToStaticMarkup(<ReviewDetailView review={review} onOrders={vi.fn()} onProduct={vi.fn()} />);
  for (const text of ['Đánh giá của bạn', 'Phản hồi từ cửa hàng', 'Cửa hàng QQ', 'Cảm ơn bạn đã phản hồi.', '&lt;script&gt;Trải nghiệm chưa tốt']) expect(html).toContain(text);
  expect(html).not.toContain('textarea');
  expect(html).not.toContain('Gửi đánh giá');
  expect(html).not.toContain('Đã gửi');
  expect(html).not.toContain('Đánh giá đã gửi');
});
it('keeps existing review content visible without product data or shop reply', () => {
  const html = renderToStaticMarkup(<ReviewDetailView review={{ ...review, reply: null }} onOrders={vi.fn()} onProduct={vi.fn()} />);
  expect(html).toContain('Chưa có phản hồi');
  expect(html).toContain('Trải nghiệm chưa tốt');
  expect(html).not.toContain('Xem sản phẩm');
});
it('opens the actual related product and provides a return to buyer orders', () => {
  const product = { id: 'p', name: 'Kẹp tóc càng cua', imageUrl: '' };
  const onProduct = vi.fn(), onOrders = vi.fn();
  const html = renderToStaticMarkup(<ReviewDetailView review={review} product={product} onProduct={onProduct} onOrders={onOrders} />);
  expect(html).toContain(product.name);
  actions['Xem sản phẩm Kẹp tóc càng cua'](); actions['Về đơn hàng của tôi']();
  expect(onProduct).toHaveBeenCalledOnce(); expect(onOrders).toHaveBeenCalledOnce();
});
