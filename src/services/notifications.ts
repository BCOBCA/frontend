import type { Notification, Page } from '../types/api';

export type NotificationCategory = 'all' | 'orders' | 'promotions' | 'system' | 'account';
export type NotificationStatus = 'all' | 'unread' | 'read';
export type NotificationSort = 'newest' | 'oldest';

export function notificationBody(item: Notification) {
  if (notificationCategory(item) === 'orders' && item.body.trim() === 'Đã xác nhận') return 'Đơn hàng của bạn đã được xác nhận.';
  return item.body;
}

export function notificationCategory(item: Notification): Exclude<NotificationCategory, 'all'> {
  const target = item.targetType?.toLowerCase() ?? '';
  const type = item.type?.toUpperCase() ?? '';
  if (target === 'order' || type.startsWith('ORDER')) return 'orders';
  if (['voucher', 'promotion', 'campaign'].includes(target) || /^(PROMOTION|VOUCHER)/.test(type)) return 'promotions';
  if (['account', 'user', 'membership', 'profile'].includes(target) || /^(ACCOUNT|MEMBERSHIP|SECURITY)/.test(type)) return 'account';
  return 'system';
}

export function notificationCounts(items: Notification[]) {
  const counts = { all: 0, orders: 0, promotions: 0, system: 0, account: 0, unread: 0, read: 0 };
  for (const item of items) {
    if (item.readAt) counts.read++;
    else { counts.all++; counts.unread++; counts[notificationCategory(item)]++; }
  }
  return counts;
}

export function filterNotifications(items: Notification[], category: NotificationCategory, status: NotificationStatus, sort: NotificationSort) {
  return items.filter(item => (category === 'all' || notificationCategory(item) === category) && (status === 'all' || (status === 'read') === !!item.readAt))
    .sort((a, b) => (sort === 'newest' ? -1 : 1) * (Date.parse(a.createdAt) - Date.parse(b.createdAt)) || a.id.localeCompare(b.id));
}

export async function loadNotifications(getPage: (page: number) => Promise<Page<Notification>>) {
  const items = new Map<string, Notification>();
  for (let index = 1; ; index++) {
    const page = await getPage(index);
    for (const item of page.items) items.set(item.id, item);
    if (index >= page.totalPages || page.items.length === 0) break;
  }
  return [...items.values()];
}

export async function markAllNotificationsRead(items: Notification[], mark: (id: string) => Promise<unknown>) {
  const unread = items.filter(item => !item.readAt);
  for (let index = 0; index < unread.length; index += 5) {
    const results = await Promise.allSettled(unread.slice(index, index + 5).map(item => mark(item.id)));
    const failure = results.find(result => result.status === 'rejected');
    if (failure?.status === 'rejected') throw failure.reason;
  }
}

export function notificationTarget(item: Notification) {
  if (item.targetType?.toLowerCase() === 'order' && item.targetId) return { pathname: '/order/[id]' as const, params: { id: item.targetId } };
  return null;
}
