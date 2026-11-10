import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CatalogScreen from '../src/screens/CatalogScreen';

const state = vi.hoisted(() => ({ queries: [] as { queryKey: string[]; enabled?: boolean }[], empty: false, push: vi.fn(), actions: {} as Record<string, () => void> }));
vi.mock('react-native', () => {
  const Container = ({ children, accessibilityLabel, onPress }: { children: React.ReactNode; accessibilityLabel?: string; onPress?: () => void }) => {
    if (accessibilityLabel && onPress) state.actions[accessibilityLabel] = onPress;
    return <div>{children}</div>;
  };
  return { View: Container, Text: Container, ScrollView: Container, Pressable: Container, useWindowDimensions: () => ({ width: 390 }) };
});
vi.mock('expo-router', () => ({ router: { setParams: vi.fn(), push: state.push }, useLocalSearchParams: () => ({}) }));
vi.mock('expo-image', () => ({ Image: () => null }));
vi.mock('lucide-react-native', () => Object.fromEntries(['Gamepad2', 'Heart', 'Newspaper', 'TicketPercent', 'MessageSquare', 'Info', 'Handshake', 'Store', 'Phone', 'LayoutGrid', 'Check', 'ChevronRight'].map(name => [name, () => null])));
vi.mock('../src/theme', () => ({ colors: {}, styles: {} }));
vi.mock('../src/services/api', () => ({ request: vi.fn() }));
vi.mock('../src/components/common/BannerCarousel', () => ({ BannerCarousel: () => null }));
vi.mock('../src/components/product/ProductCard', () => ({ ProductCard: ({ item }: { item: { name: string } }) => <span>{item.name}</span> }));
vi.mock('../src/components/brands/BrandCoverGrid', () => ({ BrandCoverGrid: () => <span>Brand covers</span> }));
vi.mock('../src/components/brands/BrandExplorer', () => ({ BrandExplorer: () => <span>Brand directory</span> }));
vi.mock('../src/components/common/ui', () => ({
  Page: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
  Section: () => null, Status: () => null, Button: () => null,
  Empty: ({ text }: { text: string }) => <span>{text}</span>,
}));
vi.mock('@tanstack/react-query', () => ({ useQuery: (options: { queryKey: string[]; enabled?: boolean }) => {
  state.queries.push(options);
  const items = options.queryKey[0] === 'categories' ? state.empty ? [] : [{ id: '108799fa-9459-4d41-944c-3fe17436ba72', name: 'Điện thoại & phụ kiện', slug: 'dien-thoai', parentId: null, imageUrl: '' }, { id: 'phone-child', name: 'Danh mục con QA', slug: 'phone-child', parentId: '108799fa-9459-4d41-944c-3fe17436ba72', imageUrl: '' }]
    : options.queryKey[0] === 'brands' ? [{ id: 'apple', name: 'Apple' }]
      : options.queryKey[0] === 'products' ? [{ id: 'p1', name: 'Sản phẩm QA', isService: false }]
        : options.queryKey[0] === 'services' ? [{ id: 's1', name: 'Dịch vụ QA', isService: true }] : [];
  return { data: options.queryKey[0] === 'banners' ? [] : { items, totalPages: 1 }, isLoading: false, error: null, refetch: vi.fn() };
} }));
beforeEach(() => { state.queries = []; state.empty = false; state.actions = {}; state.push.mockReset(); });

describe('catalog category tab', () => {
  it('opens the search page when a root category is pressed', () => {
    renderToStaticMarkup(<CatalogScreen />);
    state.actions['Danh mục Điện thoại & phụ kiện']();
    expect(state.push).toHaveBeenCalledWith({ pathname: '/search', params: { search: '', categoryId: '108799fa-9459-4d41-944c-3fe17436ba72', sort: 'newest', page: '1' } });
  });
  it('renders database categories and excludes brand discovery from the category tab', () => {
    const html = renderToStaticMarkup(<CatalogScreen />);
    expect(html).toContain('Điện thoại &amp; phụ kiện');
    expect(html).not.toContain('Danh mục con QA');
    expect(html).not.toContain('Brand covers'); expect(html).not.toContain('Brand directory');
    expect(state.queries.find(x => x.queryKey[0] === 'categories')?.enabled).toBe(true);
    expect(state.queries.find(x => x.queryKey[0] === 'brands')?.enabled).toBe(false);
    expect(state.queries.find(x => x.queryKey[0] === 'products')?.enabled).toBe(false);
    expect(state.queries.find(x => x.queryKey[0] === 'services')?.enabled).toBe(false);
    expect(html).not.toContain('Sản phẩm QA');
    expect(html).not.toContain('Dịch vụ QA');
    expect(html).not.toContain('Tất cả sản phẩm');
  });
  it('retains the brand discovery section on home', () => {
    const html = renderToStaticMarkup(<CatalogScreen home />);
    expect(html).toContain('Brand covers'); expect(html).toContain('Brand directory');
    expect(state.queries.find(x => x.queryKey[0] === 'categories')?.enabled).toBe(false);
    expect(state.queries.find(x => x.queryKey[0] === 'products')?.enabled).toBe(true);
    expect(state.queries.find(x => x.queryKey[0] === 'services')?.enabled).toBe(true);
    expect(html).toContain('Sản phẩm QA');
    expect(html).toContain('Dịch vụ QA');
  });
  it('shows an actual empty category state', () => {
    state.empty = true;
    expect(renderToStaticMarkup(<CatalogScreen />)).toContain('Chưa có danh mục');
  });
});
