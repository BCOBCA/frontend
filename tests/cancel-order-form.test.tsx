import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { CancelOrderForm } from '../src/components/orders/CancelOrderForm';
import { buyerCancellationReasons } from '../src/services/order-cancellation';

const state = vi.hoisted(() => ({ close: undefined as undefined | (() => void), actions: {} as Record<string, () => void> }));
vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
  Modal: ({ children, onRequestClose }: { children: React.ReactNode; onRequestClose: () => void }) => { state.close = onRequestClose; return <section role="dialog">{children}</section>; },
  KeyboardAvoidingView: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ScrollView: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Pressable: ({ children, accessibilityLabel, disabled, onPress }: { children: React.ReactNode; accessibilityLabel: string; disabled?: boolean; onPress: () => void }) => { if (!disabled) state.actions[accessibilityLabel] = onPress; return <button aria-label={accessibilityLabel} disabled={disabled}>{children}</button>; },
}));
vi.mock('../src/theme', () => ({ colors: {} }));
beforeEach(() => { state.close = undefined; state.actions = {}; });

it('requires an explicit buyer reason before confirmation and shows server errors', () => {
  const html = renderToStaticMarkup(<CancelOrderForm error="Đơn đã được xác nhận" onSubmit={vi.fn()} onDismiss={vi.fn()} />);
  for (const reason of buyerCancellationReasons) expect(html).toContain(reason);
  expect(html).toContain('aria-label="Xác nhận hủy đơn" disabled');
  expect(html).toContain('Giữ lại đơn hàng');
  expect(html).toContain('Đơn đã được xác nhận');
});

it('opens a popup with independent close controls rather than nesting buttons', () => {
  const onDismiss = vi.fn();
  const html = renderToStaticMarkup(<CancelOrderForm onSubmit={vi.fn()} onDismiss={onDismiss} />);
  expect(html).toContain('role="dialog"');
  state.actions['Đóng hủy đơn'](); state.actions['Đóng popup hủy đơn'](); state.close!();
  expect(onDismiss).toHaveBeenCalledTimes(3);
  let depth = 0;
  for (const [tag] of html.matchAll(/<\/?button\b[^>]*>/g)) { depth += tag.startsWith('</') ? -1 : 1; expect(depth).toBeLessThanOrEqual(1); }
});

it('prevents dismissing the popup during cancellation', () => {
  const onDismiss = vi.fn();
  renderToStaticMarkup(<CancelOrderForm busy onSubmit={vi.fn()} onDismiss={onDismiss} />);
  expect(state.actions['Đóng hủy đơn']).toBeUndefined(); expect(state.actions['Đóng popup hủy đơn']).toBeUndefined();
  state.close!(); expect(onDismiss).not.toHaveBeenCalled();
});
