import { describe, expect, it, vi } from 'vitest';
import type { Notification, Page } from '../src/types/api';
import { notificationCategory, notificationCounts, filterNotifications, loadNotifications, markAllNotificationsRead, notificationTarget } from '../src/services/notifications';

const item = (id: string, targetType = 'Order', readAt: string | null = null): Notification => ({ id, targetType, targetId: `target-${id}`, title: `Thông báo ${id}`, body: 'Nội dung', readAt, createdAt: `2026-11-${id.padStart(2, '0')}T02:00:00Z` });
const page = (items: Notification[], index: number, totalPages: number): Page<Notification> => ({ items, page: index, pageSize: 100, totalItems: 101, totalPages });

describe('notification inbox behavior', () => {
  it('classifies metadata without treating words in a message as a category', () => {
    expect(notificationCategory(item('1'))).toBe('orders');
    expect(notificationCategory(item('2', 'Voucher'))).toBe('promotions');
    expect(notificationCategory(item('3', 'Account'))).toBe('account');
    expect(notificationCategory({ ...item('4', ''), title: 'Đơn hàng khuyến mãi' })).toBe('system');
  });
  it('combines category, read state and sorting without changing the source', () => {
    const items = [item('1'), item('3', 'Order', '2026-11-19T02:00:00Z'), item('2', 'Voucher')];
    expect(filterNotifications(items, 'orders', 'unread', 'newest').map(x => x.id)).toEqual(['1']);
    expect(filterNotifications(items, 'all', 'all', 'newest').map(x => x.id)).toEqual(['3', '2', '1']);
    expect(items.map(x => x.id)).toEqual(['1', '3', '2']);
    expect(notificationCounts(items)).toEqual({ all: 2, orders: 1, promotions: 1, system: 0, account: 0, unread: 2, read: 1 });
  });
  it('loads beyond the first API page and removes duplicates when pages overlap', async () => {
    const get = vi.fn().mockResolvedValueOnce(page([item('1')], 1, 2)).mockResolvedValueOnce(page([item('1'), item('2')], 2, 2));
    expect((await loadNotifications(get)).map(x => x.id)).toEqual(['1', '2']);
    expect(get.mock.calls).toEqual([[1], [2]]);
  });
  it('marks every unread item with bounded concurrency and preserves already read ones', async () => {
    let active = 0, max = 0;
    const mark = vi.fn(async () => { active++; max = Math.max(max, active); await Promise.resolve(); active--; });
    await markAllNotificationsRead([...Array.from({ length: 12 }, (_, i) => item(String(i + 1))), item('20', 'Order', 'read')], mark);
    expect(mark).toHaveBeenCalledTimes(12); expect(max).toBeLessThanOrEqual(5);
  });
  it('reports partial bulk errors after finishing the current batch', async () => {
    const mark = vi.fn(async (id: string) => { if (id === '1') throw new Error('offline'); });
    await expect(markAllNotificationsRead([item('1'), item('2')], mark)).rejects.toThrow('offline');
    expect(mark).toHaveBeenCalledWith('2');
  });
  it('only opens known targets with a target ID', () => {
    expect(notificationTarget(item('4', 'Review'))).toEqual({ pathname: '/review/[id]', params: { id: 'target-4' } });
    expect(notificationTarget(item('1'))).toEqual({ pathname: '/order/[id]', params: { id: 'target-1' } });
    expect(notificationTarget(item('2', 'Unknown'))).toBeNull();
    expect(notificationTarget({ ...item('3'), targetId: null })).toBeNull();
  });
});
