import { expect, it } from 'vitest';
import { notificationBody } from '../src/services/notifications';
import type { Notification } from '../src/types/api';

const item = { id: 'n', targetType: 'Order', title: 'Order', body: '', readAt: null, createdAt: '2026-11-19T02:00:00Z' } satisfies Notification;
it('expands legacy confirmation text without modifying stored notification records', () => {
  expect(notificationBody({ ...item, body: 'Đã xác nhận' })).toBe('Đơn hàng của bạn đã được xác nhận.');
});
it('preserves actor/reason messages and never guesses who cancelled legacy orders', () => {
  for (const body of ['Đã hủy', 'Bạn đã hủy đơn thành công với lý do: Đặt nhầm hoặc trùng đơn', 'Cửa hàng đã hủy đơn của bạn với lý do: Hết hàng']) expect(notificationBody({ ...item, body })).toBe(body);
  expect(notificationBody({ ...item, targetType: 'Account', body: 'Đã xác nhận' })).toBe('Đã xác nhận');
});
