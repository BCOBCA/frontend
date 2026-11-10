import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HeaderSearchPopover } from '../src/components/common/HeaderSearchPopover';

const state = vi.hoisted(() => ({ actions: {} as Record<string, () => void>, requestClose: undefined as undefined | (() => void), outside: undefined as undefined | (() => void), submit: undefined as undefined | ((event: { nativeEvent: { text: string } }) => void) }));
vi.mock('react-native', () => ({
  Modal: ({ children, onRequestClose }: { children: React.ReactNode; onRequestClose: () => void }) => { state.requestClose = onRequestClose; return <div role="dialog">{children}</div>; },
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pressable: ({ children, accessibilityLabel, onPress }: { children: React.ReactNode; accessibilityLabel?: string; onPress: () => void }) => {
    if (accessibilityLabel) state.actions[accessibilityLabel] = onPress; else state.outside = onPress;
    return <button aria-label={accessibilityLabel}>{children}</button>;
  },
  TextInput: ({ accessibilityLabel, value, onSubmitEditing }: { accessibilityLabel: string; value: string; onSubmitEditing: typeof state.submit }) => { state.submit = onSubmitEditing; return <input aria-label={accessibilityLabel} value={value} readOnly />; },
}));
vi.mock('expo-router', () => ({ useNavigation: () => ({ addListener: vi.fn(() => () => {}) }) }));
vi.mock('lucide-react-native', () => ({ Search: () => null, X: () => null }));
vi.mock('../src/theme', () => ({ colors: {} }));
beforeEach(() => { state.actions = {}; state.requestClose = undefined; state.outside = undefined; state.submit = undefined; });

describe('floating header search', () => {
  it('preserves the query and submits it from either the search key or icon', () => {
    const submit = vi.fn();
    const html = renderToStaticMarkup(<HeaderSearchPopover top={68} value="Laptop" onChange={() => {}} onSubmit={submit} onClose={() => {}} />);
    expect(html).toContain('value="Laptop"');
    state.actions['Tìm kiếm'](); expect(submit).toHaveBeenLastCalledWith('Laptop');
    state.submit?.({ nativeEvent: { text: 'iPhone' } }); expect(submit).toHaveBeenLastCalledWith('iPhone');
  });
  it('dismisses through the close button, outside tap and modal back/Escape', () => {
    const close = vi.fn();
    renderToStaticMarkup(<HeaderSearchPopover top={68} value="" onChange={() => {}} onSubmit={() => {}} onClose={close} />);
    state.actions['Đóng tìm kiếm'](); state.outside?.(); state.requestClose?.();
    expect(close).toHaveBeenCalledTimes(3);
  });
});
