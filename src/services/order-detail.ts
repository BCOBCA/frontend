import type { Order, OrderItem } from '../types/api';

export function parseOrderAddress(value: string) {
  const match = /^(.*\S)\s*,\s*(\d{5})\s*,\s*(\d{1,2})\s*$/.exec(value);
  if (!match || Number(match[2]) < 1 || Number(match[3]) < 1 || Number(match[3]) > 99) return null;
  return { addressLine: match[1].trim(), wardCode: match[2], provinceCode: match[3].padStart(2, '0') };
}

export const orderStatusLabels: Record<string, string> = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Chờ giao hàng', READY: 'Chờ giao hàng', SHIPPING: 'Đang giao', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy', REFUNDED: 'Đã hoàn tiền' };
export const orderHistoryLabels: Record<string, string> = { PENDING: 'Đặt hàng thành công', CONFIRMED: 'Shop đã xác nhận đơn hàng', READY: 'Đơn hàng đã sẵn sàng giao', SHIPPING: 'Đơn hàng đang được giao', COMPLETED: 'Đơn hàng đã hoàn thành', CANCELLED: 'Đơn hàng đã hủy', REFUNDED: 'Đơn hàng đã hoàn tiền' };
const stages: Record<string, number> = { PENDING: 0, CONFIRMED: 1, READY: 1, SHIPPING: 2, COMPLETED: 3, REFUNDED: 3 };
export function orderProgress(order: Order) {
  const history = [...(order.history ?? [])].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  return { current: stages[order.status] ?? -1, dates: [order.createdAt,
    history.find(x => x.newStatus === 'CONFIRMED' || x.newStatus === 'READY')?.createdAt,
    history.find(x => x.newStatus === 'SHIPPING')?.createdAt,
    history.find(x => x.newStatus === 'COMPLETED')?.createdAt] };
}

export function groupOrderItems(items: OrderItem[]) {
  const groups = new Map<string, { key: string; name: string; slug: string | null; items: OrderItem[] }>();
  for (const item of items) {
    const key = item.storeId ? `store:${item.storeId}` : item.brandId ? `brand:${item.brandId}` : 'legacy';
    let group = groups.get(key);
    if (!group) { group = { key, name: item.storeName?.trim() || (key === 'legacy' ? 'Sản phẩm trong đơn' : 'Cửa hàng'), slug: item.storeSlug || null, items: [] }; groups.set(key, group); }
    group.items.push(item);
  }
  return [...groups.values()].map(group => ({
    ...group,
    name: group.items.find(item => item.storeName?.trim())?.storeName?.trim()
      || (!group.items[0].storeId ? group.items.find(item => item.brandName?.trim())?.brandName?.trim() : undefined)
      || group.name,
    slug: group.items.find(item => item.storeSlug)?.storeSlug || null,
  }));
}
