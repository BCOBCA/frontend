import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SearchScreen from '../src/screens/SearchScreen';

const state = vi.hoisted(() => ({ params: { search: 'iPhone', categoryId: '108799fa-9459-4d41-944c-3fe17436ba72' } as Record<string, string>, empty: false, setParams: vi.fn(), queryKeys: [] as unknown[][], submit: undefined as undefined | ((value: string) => void), selects: {} as Record<string, (value: string) => void>, actions: {} as Record<string, () => void> }));
vi.mock('expo-router', () => ({ useLocalSearchParams: () => state.params, router: { setParams: state.setParams } }));
vi.mock('react-native', () => {
  const Container = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return { View: Container, Text: Container, Pressable: Container, useWindowDimensions: () => ({ width: 1200 }) };
});
vi.mock('../src/components/common/ui', () => ({
  Page: ({ children, onSubmitSearch }: { children?: React.ReactNode; onSubmitSearch: (value: string) => void }) => { state.submit = onSubmitSearch; return <main>{children}</main>; },
  Status: () => null,
  Button: ({ title, onPress }: { title: string; onPress: () => void }) => { state.actions[title] = onPress; return <button>{title}</button>; },
}));
vi.mock('../src/components/product/ProductCard', () => ({ ProductCard: ({ item }: { item: { name: string } }) => <div>{item.name}</div> }));
vi.mock('../src/components/dealers/DealerFilters', () => ({ DealerSelect: ({ label, options, onChange }: { label: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) => { state.selects[label] = onChange; return <select aria-label={label}>{options.map(item => <option key={item.value}>{item.label}</option>)}</select>; } }));
vi.mock('lucide-react-native', () => ({ Search: () => null }));
vi.mock('../src/stores/auth', () => ({ useAuth: () => 'user-qa' }));
vi.mock('../src/services/api', () => ({ request: vi.fn() }));
vi.mock('../src/theme', () => ({ colors: {} }));
vi.mock('@tanstack/react-query', () => ({ useQuery: ({ queryKey }: { queryKey: unknown[] }) => {
  state.queryKeys.push(queryKey);
  return { isLoading: false, error: null, data: queryKey[0] === 'categories' ? { items: [{ id: '108799fa-9459-4d41-944c-3fe17436ba72', parentId: null, name: 'Điện thoại & phụ kiện' }] } : { items: state.empty ? [] : [{ id: 'p1', name: 'iPhone QA' }], totalItems: state.empty ? 0 : 21, totalPages: state.empty ? 0 : 2 }, refetch: vi.fn() };
} }));

describe('product search page', () => {
  beforeEach(() => { state.params = { search: 'iPhone', categoryId: '108799fa-9459-4d41-944c-3fe17436ba72' }; state.empty = false; state.queryKeys = []; state.setParams.mockReset(); state.submit = undefined; state.actions = {}; state.selects = {}; });
  it('shows product results with keyword and root-category context', () => {
    const html = renderToStaticMarkup(<SearchScreen />);
    expect(html).toContain('Kết quả tìm kiếm');
    expect(html).toContain('Điện thoại &amp; phụ kiện');
    expect(html).toContain('iPhone QA');
    const query = state.queryKeys.find(key => key[0] === 'products')?.[2] as string;
    expect(new URLSearchParams(query).get('categoryId')).toBe(state.params.categoryId);
    expect(new URLSearchParams(query).get('search')).toBe('iPhone');
    expect(state.queryKeys.some(key => key[0] === 'services' || key[0] === 'banners')).toBe(false);
  });
  it('keeps category when submitting another keyword and resets pagination', () => {
    renderToStaticMarkup(<SearchScreen />);
    state.submit?.(' Samsung ');
    expect(state.setParams).toHaveBeenCalledWith({ search: 'Samsung', categoryId: state.params.categoryId, sort: 'newest', page: '1' });
  });
  it('preserves filters during pagination and allows clearing the category', () => {
    renderToStaticMarkup(<SearchScreen />);
    state.actions.Sau();
    expect(state.setParams).toHaveBeenLastCalledWith({ search: 'iPhone', categoryId: state.params.categoryId, sort: 'newest', page: '2' });
    state.selects['Danh mục sản phẩm']('');
    expect(state.setParams).toHaveBeenLastCalledWith({ search: 'iPhone', categoryId: '', sort: 'newest', page: '1' });
  });
  it('renders an empty state and resets keyword/category together', () => {
    state.empty = true;
    const html = renderToStaticMarkup(<SearchScreen />);
    expect(html).toContain('Không tìm thấy sản phẩm phù hợp');
    expect(html).not.toContain('iPhone QA');
    state.actions['Xem tất cả sản phẩm']();
    expect(state.setParams).toHaveBeenCalledWith({ search: '', categoryId: '', sort: 'newest', page: '1' });
  });
});
