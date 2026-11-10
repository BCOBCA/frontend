import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Favorites from '../app/favorites';

const state = vi.hoisted(() => ({ user: null as { id: string } | null, push: vi.fn(), queries: [] as string[], login: undefined as undefined | (() => void) }));
vi.mock('react-native', () => {
  const Container = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { View: Container, Text: Container, StyleSheet: { create: (styles: unknown) => styles }, Platform: { OS: 'web' }, useWindowDimensions: () => ({ width: 390 }),
    Pressable: ({ children, onPress, accessibilityLabel }: { children: React.ReactNode; onPress: () => void; accessibilityLabel: string }) => {
      if (accessibilityLabel === 'Đăng nhập') state.login = onPress;
      return <button>{children}</button>;
    } };
});
vi.mock('react-native-svg', () => {
  const Shape = () => null;
  return { default: Shape, Defs: Shape, LinearGradient: Shape, Stop: Shape, Path: Shape, Ellipse: Shape, G: Shape, Rect: Shape };
});
vi.mock('lucide-react-native', () => ({ UserRound: () => null }));
vi.mock('expo-router', () => ({ router: { push: state.push } }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (s: typeof state) => unknown) => select(state) }));
vi.mock('../src/services/api', () => ({ request: vi.fn() }));
vi.mock('../src/components/product/ProductCard', () => ({ ProductCard: ({ item }: { item: { name: string; isFavorite: boolean } }) => <article data-favorite={item.isFavorite}>{item.name}<span>Shared product card</span></article> }));
vi.mock('../src/components/common/ui', () => ({
  Page: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
  Button: ({ title }: { title: string }) => <button>{title}</button>,
  Empty: () => null, Status: () => null, LoginNotice: () => <span>Generic login notice</span>,
}));
vi.mock('@tanstack/react-query', () => ({ useQuery: ({ queryKey }: { queryKey: string[] }) => {
  state.queries.push(queryKey[0]);
  return { data: { items: [{ id: 'one', name: 'Sản phẩm đã lưu', price: 100000, salePrice: null }], totalPages: 1 }, isLoading: false, error: null };
} }));
beforeEach(() => { state.user = null; state.queries = []; state.login = undefined; state.push.mockClear(); });

describe('favorites login presentation', () => {
  it('shows the reference guest copy without requesting private favorites', () => {
    const html = renderToStaticMarkup(<Favorites />);
    expect(html).toContain('Đăng nhập để sử dụng danh sách yêu thích');
    expect(html).toContain('Lưu lại những sản phẩm bạn yêu thích');
    expect(state.queries).toEqual([]);
    state.login!();
    expect(state.push).toHaveBeenCalledWith('/login');
  });
  it('keeps saved products available to authenticated users', () => {
    state.user = { id: 'member' };
    const html = renderToStaticMarkup(<Favorites />);
    expect(html).toContain('Sản phẩm đã lưu');
    expect(html).toContain('Shared product card');
    expect(html).toContain('data-favorite="true"');
    expect(html).not.toContain('Đăng nhập để sử dụng danh sách yêu thích');
    expect(state.queries).toEqual(['favorites']);
  });
});
