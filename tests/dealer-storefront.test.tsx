import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DealerProducts } from '../src/components/dealers/DealerProducts';

const state = vi.hoisted(() => ({ empty: false }));
vi.mock('react-native', () => {
  const Container = ({ children, accessibilityRole, accessibilityLabel, disabled }: { children?: React.ReactNode; accessibilityRole?: string; accessibilityLabel?: string; disabled?: boolean }) => accessibilityRole === 'button' ? <button aria-label={accessibilityLabel} disabled={disabled}>{children}</button> : <div>{children}</div>;
  const NativeContainer = (props: Parameters<typeof Container>[0]) => {
    React.Children.forEach(props.children, child => {
      if (typeof child === 'string' || typeof child === 'number') throw new Error('Raw text cannot be a child of a native View');
    });
    return <Container {...props} />;
  };
  return { View: NativeContainer, Text: Container, TextInput: () => <input />, Pressable: NativeContainer, useWindowDimensions: () => ({ width: 1440 }) };
});
vi.mock('expo-image', () => ({ Image: ({ source, accessibilityLabel }: { source: { uri: string }; accessibilityLabel: string }) => <img src={source.uri} alt={accessibilityLabel} /> }));
vi.mock('expo-router', () => ({ router: { push: vi.fn(), setParams: vi.fn() }, useLocalSearchParams: () => ({}) }));
vi.mock('lucide-react-native', () => Object.fromEntries(['Heart', 'Phone', 'Check', 'Package', 'ShoppingCart', 'Star', 'ChevronDown', 'Headphones', 'Laptop', 'List', 'SlidersHorizontal', 'Smartphone', 'Tablet', 'Watch', 'ChevronLeft', 'ChevronRight', 'LayoutGrid'].map(name => [name, () => null])));
vi.mock('../src/theme', () => ({ colors: {}, money: (value: number) => `${value} ₫` }));
vi.mock('../src/services/api', () => ({ request: vi.fn() }));
vi.mock('../src/stores/auth', () => ({ useAuth: () => null }));
vi.mock('../src/components/common/ui', () => ({ Status: () => null }));
vi.mock('../src/components/dealers/DealerFilters', () => ({ DealerSelect: ({ label, options }: { label: string; options: { value: string; label: string }[] }) => <select aria-label={label}>{options.map(x => <option key={x.value}>{x.label}</option>)}</select> }));
vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({ isPending: false, isSuccess: false, error: null, mutate: vi.fn() }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useQuery: ({ queryKey }: { queryKey: string[] }) => ({ isLoading: false, error: null, data: queryKey[0] === 'dealer-product-categories' ? [
    { id: 'phone', name: 'Điện thoại', slug: 'dien-thoai', parentId: 'root', productCount: 2 },
  ] : { items: state.empty ? [] : [
    { id: 'p1', name: 'Sản phẩm mẫu QA', imageUrl: 'https://example.test/product.webp', price: 1000, salePrice: 800, variantId: 'v1', availableStock: 5, rating: null, reviewCount: 0, soldCount: 0 },
    { id: 'p2', name: 'Sản phẩm hết hàng QA', imageUrl: '', price: 2000, salePrice: null, variantId: 'v2', availableStock: 0, rating: null, reviewCount: 0, soldCount: 0 },
  ], totalItems: state.empty ? 0 : 2, totalPages: 1 } }),
}));

describe('dealer product storefront', () => {
  beforeEach(() => { state.empty = false; });
  it('renders the category/price sidebar and real product cards without a banner', () => {
    const html = renderToStaticMarkup(<DealerProducts storeId="dealer" />);
    for (const text of ['Danh mục cửa hàng', 'Khoảng giá', 'Áp dụng', 'Điện thoại', 'Tất cả sản phẩm', 'Phổ biến nhất', 'Giá tăng dần', 'Sản phẩm mẫu QA', '800 ₫']) expect(html).toContain(text);
    expect(html).not.toContain('Ưu đãi đặc biệt');
    expect(html).not.toContain('Đã bán');
    expect(html).toContain('Chưa có đánh giá');
    expect(html).toContain('Tạm hết hàng');
    expect(html.match(/disabled=""/g)).toHaveLength(1);
  });
  it('shows an honest empty result', () => {
    state.empty = true;
    const html = renderToStaticMarkup(<DealerProducts storeId="dealer" />);
    expect(html).toContain('Chưa có sản phẩm phù hợp.');
    expect(html).not.toContain('Sản phẩm mẫu QA');
  });
});
