import { expect, it } from 'vitest';
import { groupOrderItems, orderProgress } from '../src/services/order-detail';
import type { Order } from '../src/types/api';

it('groups by actual store identity and retains legacy products', () => {
  const item = { id: 'a', productName: 'AirPods', quantity: 1, unitPrice: 100, totalPrice: 100, storeId: 'one', storeName: 'Phong Vũ' };
  const groups = groupOrderItems([item, { ...item, id: 'b' }, { ...item, id: 'c', storeId: 'two' }, { id: 'legacy', productName: 'Old', quantity: 1, unitPrice: 100, totalPrice: 100 }]);
  expect(groups).toHaveLength(3); expect(groups[0].items.map(i => i.id)).toEqual(['a', 'b']);
  expect(groups[2].name).toBe('Sản phẩm trong đơn');
});
it('shows the recorded brand seller for legacy orders without a store identity', () => {
  const groups = groupOrderItems([{ id: 'old', productName: 'Loa', quantity: 1, unitPrice: 100, totalPrice: 100, brandId: 'brand', brandName: 'Apple Việt Nam' }]);
  expect(groups[0].name).toBe('Apple Việt Nam');
  expect(groups[0].slug).toBeNull();
});
it('uses the actual store name ahead of the brand and fills missing group metadata from other lines', () => {
  const item = { id: 'one', productName: 'Loa', quantity: 1, unitPrice: 100, totalPrice: 100, storeId: 'store', brandId: 'brand', brandName: 'Apple' };
  const groups = groupOrderItems([item, { ...item, id: 'two', storeName: '  Cửa hàng Minh Anh  ', storeSlug: 'minh-anh' }]);
  expect(groups).toHaveLength(1);
  expect(groups[0].name).toBe('Cửa hàng Minh Anh');
  expect(groups[0].slug).toBe('minh-anh');
});
it.each([['PENDING', 0], ['CONFIRMED', 1], ['READY', 1], ['SHIPPING', 2], ['COMPLETED', 3], ['REFUNDED', 3], ['CANCELLED', -1], ['OTHER', -1]])('maps %s without marking future stages completed', (status, expected) => {
  expect(orderProgress({ status, history: [], createdAt: '2026-11-10T08:00:00Z' } as unknown as Order).current).toBe(expected);
});
it('uses recorded times without fabricating dates for future states or mutating history', () => {
  const history = [{ oldStatus: 'CONFIRMED', newStatus: 'SHIPPING', note: 'Đã bàn giao', createdAt: '2026-11-10T10:00:00Z' }, { oldStatus: 'PENDING', newStatus: 'CONFIRMED', note: 'Đã xác nhận', createdAt: '2026-11-10T09:00:00Z' }];
  const result = orderProgress({ status: 'SHIPPING', createdAt: '2026-11-10T08:00:00Z', history } as unknown as Order);
  expect(result.dates).toEqual(['2026-11-10T08:00:00Z', '2026-11-10T09:00:00Z', '2026-11-10T10:00:00Z', undefined]);
  expect(history[0].newStatus).toBe('SHIPPING');
});
