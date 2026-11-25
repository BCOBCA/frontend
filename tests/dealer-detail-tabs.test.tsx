import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DealerDetailScreen from '../src/screens/DealerDetailScreen';

const routing = vi.hoisted(() => ({ params: { slug: 'dealer-qa', tab: undefined as string | undefined }, setParams: vi.fn(), website: 'https://www.nguyenkim.com/', averageRating: 4 as number | null }));
vi.mock('expo-router', () => ({ useLocalSearchParams: () => routing.params, router: { setParams: routing.setParams }, Link: ({ children, href, target, rel }: { children: React.ReactNode; href: string; target?: string; rel?: string }) => <a href={href} target={target} rel={rel}>{children}</a> }));
vi.mock('react-native', () => {
  const Container = ({ children, accessibilityRole, nativeID, ...props }: { children?: React.ReactNode; accessibilityRole?: string; nativeID?: string; [key: string]: unknown }) =>
    <div role={accessibilityRole ?? props.role as string | undefined} id={nativeID} aria-selected={props['aria-selected'] as boolean | undefined}>{children}</div>;
  return { View: Container, Text: Container, ScrollView: Container, Pressable: Container, Platform: { OS: 'web' }, useWindowDimensions: () => ({ width: 1200 }) };
});
vi.mock('lucide-react-native', () => Object.fromEntries(['Mail', 'MapPin', 'Phone', 'Users', 'Package', 'Tags', 'Star', 'Info'].map(name => [name, () => null])));
vi.mock('../src/components/common/ui', () => ({ Page: ({ children }: { children?: React.ReactNode }) => <main>{children}</main>, Status: () => null }));
vi.mock('../src/components/dealers/DealerCard', () => ({ DealerImage: () => null, FollowButton: () => <button>Theo dõi</button>, VerifiedBadge: () => null }));
vi.mock('../src/components/dealers/DealerProducts', () => ({ DealerProducts: () => <div>Chưa có sản phẩm để hiển thị.</div> }));
vi.mock('../src/components/product/ProductReviews', () => ({ StoreReviews: ({ storeId }: { storeId: string }) => <div data-store-id={storeId}>Đánh giá sản phẩm của cửa hàng</div> }));
vi.mock('../src/components/promotions/ShopVouchers', () => ({ ShopVouchers: () => <div>Voucher của Shop</div> }));
vi.mock('../src/stores/auth', () => ({ useAuth: () => null }));
vi.mock('../src/theme', () => ({ colors: { primary: '#F00', text: '#222', muted: '#777', border: '#EEE' } }));
vi.mock('../src/services/dealers', () => ({ getDealer: vi.fn() }));
vi.mock('@tanstack/react-query', () => ({ useQuery: () => ({ data: {
  dealer: { id: 'dealer', name: 'Đại lý QA', description: 'Giới thiệu đại lý', followerCount: 0, productCount: 12, reviewCount: 7, averageRating: routing.averageRating, isVerified: false },
  branches: [{ id: 'branch', name: 'Chi nhánh QA', address: 'Địa chỉ QA', provinceCode: '79', isMain: true }],
  phone: '0901234567', email: null, website: routing.website,
}, isLoading: false, error: null }) }));

describe('dealer detail tabs', () => {
  it('shows product count and average rating above the store description', () => {
    const html = renderToStaticMarkup(<DealerDetailScreen />);
    expect(html).toContain('12 sản phẩm');
    expect(html).toContain('4.0');
    expect(html).toContain('/ 7 đánh giá');
    expect(html.indexOf('12 sản phẩm')).toBeLessThan(html.indexOf('Giới thiệu đại lý'));
    expect(html.indexOf('4.0')).toBeLessThan(html.indexOf('Giới thiệu đại lý'));
  });
  it('does not invent an average when the store has no rating', () => {
    routing.averageRating = null;
    const html = renderToStaticMarkup(<DealerDetailScreen />);
    expect(html).toContain('Chưa có đánh giá');
    expect(html).not.toContain('0,0');
  });
  beforeEach(() => { routing.params.tab = undefined; routing.website = 'https://www.nguyenkim.com/'; routing.averageRating = 4; });
  it('opens a published website in a separate tab', () => {
    routing.params.tab = 'about';
    const html = renderToStaticMarkup(<DealerDetailScreen />);
    expect(html).toContain('href="https://www.nguyenkim.com/"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
  it('keeps invalid or unsafe website values as plain text', () => {
    routing.params.tab = 'about';
    for (const value of ['javascript:alert(1)', 'not a URL', 'data:text/html,test']) {
      routing.website = value;
      const html = renderToStaticMarkup(<DealerDetailScreen />);
      expect(html).not.toContain('<a ');
    }
  });
  it('shows four tabs and defaults to the product panel', () => {
    const html = renderToStaticMarkup(<DealerDetailScreen />);
    for (const label of ['Sản phẩm', 'Khuyến mãi', 'Đánh giá', 'Giới thiệu']) expect(html).toContain(label);
    expect(html).toContain('Chưa có sản phẩm để hiển thị.');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tabpanel"');
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html).not.toContain('Chi nhánh QA');
  });
  it('keeps branches and contact details in About', () => {
    routing.params.tab = 'about';
    const html = renderToStaticMarkup(<DealerDetailScreen />);
    expect(html).toContain('Chi nhánh QA');
    expect(html).toContain('Địa chỉ QA');
    expect(html).toContain('0901234567');
    expect(html).not.toContain('Mã tỉnh/thành');
  });
  it('connects the reviews panel to the selected store', () => {
    routing.params.tab = 'promotions';
    const promotions = renderToStaticMarkup(<DealerDetailScreen />);
    expect(promotions).toContain('Voucher của Shop');
    expect(promotions).not.toContain('Chưa có khuyến mãi để hiển thị.');
    routing.params.tab = 'reviews';
    const html = renderToStaticMarkup(<DealerDetailScreen />);
    expect(html).toContain('Đánh giá sản phẩm của cửa hàng');
    expect(html).toContain('data-store-id="dealer"');
    expect(html).not.toContain('2.350');
    expect(html).not.toContain('Chi nhánh QA');
  });
  it('falls back to products for an unknown tab', () => {
    routing.params.tab = 'unknown';
    expect(renderToStaticMarkup(<DealerDetailScreen />)).toContain('Chưa có sản phẩm để hiển thị.');
  });
});
