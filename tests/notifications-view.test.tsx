import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { NotificationsView } from '../src/components/notifications/NotificationsView';
import type { Notification } from '../src/types/api';

const state = vi.hoisted(() => ({ width: 1280, actions: {} as Record<string, () => void> }));
vi.mock('react-native', () => {
  const Container = ({ children, accessibilityLabel }: { children?: React.ReactNode; accessibilityLabel?: string }) => <div aria-label={accessibilityLabel}>{children}</div>;
  return { View: Container, Text: Container, ScrollView: Container, StyleSheet: { create: (v: unknown) => v }, useWindowDimensions: () => ({ width: state.width }),
    Pressable: ({ children, accessibilityLabel, accessibilityState, disabled, onPress }: { children?: React.ReactNode; accessibilityLabel: string; accessibilityState?: { selected?: boolean }; disabled?: boolean; onPress: () => void }) => {
      if (!disabled) state.actions[accessibilityLabel] = onPress;
      return <button aria-label={accessibilityLabel} aria-selected={accessibilityState?.selected} disabled={disabled}>{children}</button>;
    } };
});
vi.mock('lucide-react-native', () => Object.fromEntries(['Bell', 'BellOff', 'Check', 'ChevronDown', 'ChevronRight', 'Clock3', 'FileText', 'Megaphone', 'Package', 'Tag'].map(name => [name, () => null])));
vi.mock('../src/components/common/ui', () => ({ Status: ({ error }: { error?: unknown }) => error ? <span>Đã có lỗi</span> : null }));
const items: Notification[] = [
  { id: 'one', title: 'Đơn hàng BCA123', body: 'Đã tạo vận đơn GHN, chờ lấy hàng.', targetType: 'Order', targetId: 'order', readAt: null, createdAt: '2026-11-19T02:20:00Z' },
  { id: 'two', title: 'Ưu đãi dành cho bạn', body: 'Voucher đã sẵn sàng.', targetType: 'Voucher', readAt: '2026-11-19T02:00:00Z', createdAt: '2026-11-18T02:00:00Z' },
];
const props = () => ({ items, category: 'all' as const, status: 'all' as const, sort: 'newest' as const, page: 1, onCategory: vi.fn(), onStatus: vi.fn(), onSort: vi.fn(), onPage: vi.fn(), onOpen: vi.fn(), onReadAll: vi.fn(), onRetry: vi.fn() });
beforeEach(() => { state.width = 1280; state.actions = {}; });
it.each([390, 1280])('renders the reference inbox with real contents and read states at %ipx', width => {
  state.width = width;
  const html = renderToStaticMarkup(<NotificationsView {...props()} />);
  for (const text of ['Tất cả thông báo', 'Đơn hàng', 'Khuyến mãi &amp; Ưu đãi', 'Hệ thống', 'Tài khoản', 'Chưa đọc (1)', 'Đơn hàng BCA123', 'Đã tạo vận đơn GHN', 'Ưu đãi dành cho bạn', 'Đã đọc']) expect(html).toContain(text);
});
it('wires categories, read filters, opening and mark-all actions', () => {
  const p = props(); renderToStaticMarkup(<NotificationsView {...p} />);
  state.actions['Đơn hàng'](); state.actions['Chưa đọc (1)'](); state.actions['Đơn hàng BCA123, Chưa đọc'](); state.actions['Đánh dấu tất cả là đã đọc']();
  expect(p.onCategory).toHaveBeenCalledWith('orders'); expect(p.onStatus).toHaveBeenCalledWith('unread'); expect(p.onOpen).toHaveBeenCalledWith(items[0]); expect(p.onReadAll).toHaveBeenCalledOnce();
});
it('applies combined filters and does not show unrelated rows', () => {
  const html = renderToStaticMarkup(<NotificationsView {...props()} category="promotions" status="read" />);
  expect(html).toContain('Voucher đã sẵn sàng.'); expect(html).not.toContain('Đơn hàng BCA123');
});
it('shows distinct loading, error and empty states', () => {
  expect(renderToStaticMarkup(<NotificationsView {...props()} items={undefined} loading />)).toContain('Đang tải thông báo');
  const error = renderToStaticMarkup(<NotificationsView {...props()} items={undefined} error={new Error('offline')} />);
  expect(error).toContain('Đã có lỗi'); expect(error).not.toContain('Chưa có thông báo');
  expect(renderToStaticMarkup(<NotificationsView {...props()} items={[]} />)).toContain('Chưa có thông báo');
});
it('disables all reading actions while a mutation is pending', () => {
  renderToStaticMarkup(<NotificationsView {...props()} busy />);
  expect(state.actions['Đánh dấu tất cả là đã đọc']).toBeUndefined(); expect(state.actions['Đơn hàng BCA123, Chưa đọc']).toBeUndefined();
});

it('counts only unread items in category badges and hides every count after reading all', () => {
  const mixed = renderToStaticMarkup(<NotificationsView {...props()} />);
  expect(mixed).toContain('aria-label="1 thông báo chưa đọc"');
  const html = renderToStaticMarkup(<NotificationsView {...props()} items={items.map(item => ({ ...item, readAt: '2026-11-21T03:00:00Z' }))} />);
  expect(html).toContain(items[0].title); expect(html).toContain(items[1].body);
  expect(html).not.toContain('thông báo chưa đọc"');
  expect(html).not.toMatch(/(?:Tất cả|Chưa đọc|Đã đọc) \(\d+\)/);
});
