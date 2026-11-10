import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from '../src/components/common/ui';

const state = vi.hoisted(() => ({ width: 1200, navigate: vi.fn(), submit: undefined as undefined | ((event: { nativeEvent: { text: string } }) => void), actions: {} as Record<string, () => void> }));
vi.mock('react-native', () => {
  const Container = ({ children, accessibilityLabel, onPress }: { children?: React.ReactNode; accessibilityLabel?: string; onPress?: () => void }) => {
    if (accessibilityLabel && onPress) state.actions[accessibilityLabel] = onPress;
    return <div>{children}</div>;
  };
  return { View: Container, Text: Container, ScrollView: Container, Pressable: Container, Image: () => null, ActivityIndicator: () => null, useWindowDimensions: () => ({ width: state.width }),
    TextInput: ({ onSubmitEditing, accessibilityLabel }: { onSubmitEditing: typeof state.submit; accessibilityLabel: string }) => { state.submit = onSubmitEditing; return <input aria-label={accessibilityLabel} />; } };
});
vi.mock('react-native-safe-area-context', () => ({ SafeAreaView: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>, useSafeAreaInsets: () => ({ bottom: 0 }) }));
vi.mock('expo-router', () => ({ Link: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>, router: { navigate: state.navigate }, usePathname: () => '/dealer-qa', useSegments: () => [] }));
vi.mock('lucide-react-native', () => Object.fromEntries(['ArrowLeft', 'Bell', 'Search'].map(name => [name, () => null])));
vi.mock('../src/theme', () => ({ colors: {}, styles: {} }));
vi.mock('../src/navigation/tabs', () => ({ DESKTOP_HEADER_WIDTH: 1024, primaryTabs: [] }));
vi.mock('../src/services/api', () => ({ request: vi.fn(), errorMessage: () => '' }));

describe('shared header search', () => {
  beforeEach(() => { state.width = 1200; state.navigate.mockReset(); state.submit = undefined; state.actions = {}; });
  it('collapses mobile subpage search into a button until opened', () => {
    state.width = 390;
    const html = renderToStaticMarkup(<Header title="Địa chỉ nhận hàng" back />);
    expect(html).not.toContain('aria-label="Tìm kiếm sản phẩm"');
    expect(state.actions['Tìm kiếm']).toBeTypeOf('function');
    expect(state.navigate).not.toHaveBeenCalled();
  });
  it('keeps direct input available on the dedicated mobile search screen', () => {
    state.width = 390;
    const html = renderToStaticMarkup(<Header title="Tìm kiếm" back search="Laptop" onSearch={vi.fn()} onSubmitSearch={vi.fn()} />);
    expect(html).toContain('aria-label="Tìm kiếm sản phẩm"');
  });
  it('submits a keyword to the search page from a normal header', () => {
    renderToStaticMarkup(<Header title="Đại lý" back />);
    state.submit?.({ nativeEvent: { text: '  iPhone  ' } });
    expect(state.navigate).toHaveBeenCalledWith({ pathname: '/search', params: { search: 'iPhone', categoryId: '', sort: 'newest', page: '1' } });
  });
  it('uses the search page submit callback for Enter and the search icon', () => {
    const submit = vi.fn();
    renderToStaticMarkup(<Header title="Tìm kiếm" back search="  iPhone " onSearch={vi.fn()} onSubmitSearch={submit} />);
    state.submit?.({ nativeEvent: { text: ' Laptop ' } });
    expect(submit).toHaveBeenLastCalledWith('Laptop');
    state.actions['Tìm kiếm']();
    expect(submit).toHaveBeenLastCalledWith('iPhone');
    expect(state.navigate).not.toHaveBeenCalled();
  });
});
