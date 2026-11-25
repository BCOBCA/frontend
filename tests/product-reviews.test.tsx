import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductReviews } from '../src/components/product/ProductReviews';

const state = vi.hoisted(() => ({ total: 2, ratings: [5, 3], reply: null as null | { content: string; storeName: string; updatedAt: string } }));
vi.mock('react-native', () => {
  const Container = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return { View: Container, Text: Container, Pressable: Container };
});
vi.mock('expo-image', () => ({ Image: () => null }));
vi.mock('expo-router', () => ({ router: { push: vi.fn() } }));
vi.mock('lucide-react-native', () => ({ Star: () => null, MessageSquare: () => null }));
vi.mock('../src/components/common/ui', () => ({ Button: () => null, Status: () => null }));
vi.mock('../src/services/api', () => ({ request: vi.fn() }));
vi.mock('../src/theme', () => ({ colors: {}, styles: {}, dateTime: () => '09/11/2026' }));
vi.mock('@tanstack/react-query', () => ({ useQuery: () => ({ data: { totalItems: state.total, totalPages: 1, items: state.ratings.map((rating, i) => ({ id: String(i), rating, displayName: 'Khách hàng', content: 'Nội dung đánh giá', imageUrls: [], createdAt: '', reply: state.reply })) } }) }));
beforeEach(() => { state.total = 2; state.ratings = [5, 3]; state.reply = null; });

describe('product review presentation', () => {
  it('computes scores and distributions only when all reviews are present', () => {
    const html = renderToStaticMarkup(<ProductReviews productId="p" />);
    expect(html).toContain('4.0');
    expect(html).toContain('50');
    expect(html).toContain('Nội dung đánh giá');
  });
  it('does not present a page average as a product-wide rating', () => {
    state.total = 100;
    expect(renderToStaticMarkup(<ProductReviews productId="p" />)).not.toContain('4.0');
  });
  it('shows the real empty state without invented ratings', () => {
    state.total = 0; state.ratings = [];
    const html = renderToStaticMarkup(<ProductReviews productId="p" />);
    expect(html).toContain('Chưa có đánh giá được công bố');
    expect(html).not.toContain('4.8');
  });
});

it('shows shop replies publicly as escaped text under the buyer review', () => {
  state.reply = { content: '<script>Thank you</script>', storeName: 'Review Shop', updatedAt: '2026-11-21T08:00:00Z' };
  const html = renderToStaticMarkup(<ProductReviews productId="p" />);
  expect(html).toContain('Review Shop');
  expect(html).toContain('&lt;script&gt;Thank you&lt;/script&gt;');
  expect(html).not.toContain('<script>');
});
