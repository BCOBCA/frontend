import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Page } from '../src/components/common/ui';

const state = vi.hoisted(() => ({ width: 390, segments: [] as string[], actions: {} as Record<string, () => void>, navigate: vi.fn() }));
vi.mock('react-native', () => {
  const Container = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return { View: ({ children, accessibilityRole, accessibilityLabel }: { children: React.ReactNode; accessibilityRole?: string; accessibilityLabel?: string }) => <div role={accessibilityRole} aria-label={accessibilityLabel}>{children}</div>, Text: Container, ScrollView: Container, Image: () => null, ActivityIndicator: () => null, TextInput: () => <input />, useWindowDimensions: () => ({ width: state.width }),
    Pressable: ({ children, accessibilityRole, accessibilityState, accessibilityLabel, onPress }: { children: React.ReactNode; accessibilityRole?: string; accessibilityState?: { selected?: boolean }; accessibilityLabel?: string; onPress?: () => void }) => {
      if (accessibilityLabel && onPress) state.actions[accessibilityLabel] = onPress;
      return <button role={accessibilityRole} aria-label={accessibilityLabel} aria-selected={accessibilityState?.selected}>{children}</button>;
    } };
});
vi.mock('react-native-safe-area-context', () => ({ SafeAreaView: ({ children }: { children: React.ReactNode }) => <main>{children}</main>, useSafeAreaInsets: () => ({ bottom: 20 }) }));
vi.mock('expo-router', () => ({ Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>, router: { navigate: state.navigate }, useSegments: () => state.segments, usePathname: () => '/addresses' }));
vi.mock('lucide-react-native', () => Object.fromEntries(['ArrowLeft', 'Bell', 'Search', 'House', 'LayoutGrid', 'TicketPercent', 'ShoppingCart', 'UserRound'].map(name => [name, () => null])));
vi.mock('../src/theme', () => ({ colors: {}, styles: {} }));
vi.mock('../src/services/api', () => ({ errorMessage: () => '' }));
beforeEach(() => { state.width = 390; state.segments = []; state.actions = {}; state.navigate.mockClear(); });

describe('mobile navigation on member subpages', () => {
  it('shows the shared header and all five footer destinations on small screens', () => {
    const html = renderToStaticMarkup(<Page title="Địa chỉ nhận hàng" back footerTab="member"><span>Danh sách địa chỉ</span></Page>);
    expect(html).toContain('aria-label="Tìm kiếm"');
    expect(html).toContain('role="tablist"');
    for (const [title, href] of [['Trang chủ', '/'], ['Danh mục', '/categories'], ['Ưu đãi', '/promotions'], ['Giỏ hàng', '/cart'], ['Thành viên', '/member']]) {
      state.actions[title](); expect(state.navigate).toHaveBeenLastCalledWith(href);
    }
    expect(html).toMatch(/aria-label="Thành viên" aria-selected="true"/);
    expect((html.match(/aria-selected="false"/g) ?? [])).toHaveLength(4);
  });
  it('keeps the desktop header and omits the mobile footer at the shared breakpoint', () => {
    state.width = 1024;
    const html = renderToStaticMarkup(<Page title="Địa chỉ nhận hàng" back footerTab="member" />);
    expect(html).toContain('Điều hướng chính'); expect(html).not.toContain('role="tablist"');
  });
  it('does not duplicate the navigator footer on routes already inside tabs', () => {
    state.segments = ['(tabs)', 'member'];
    expect(renderToStaticMarkup(<Page back footerTab="member" />)).not.toContain('role="tablist"');
  });
  it('leaves unrelated pages without an extra footer', () => {
    expect(renderToStaticMarkup(<Page back />)).not.toContain('role="tablist"');
  });
});
