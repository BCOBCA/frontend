import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { OrderListCard } from '../src/components/orders/OrderListCard';
import type { OrderSummary } from '../src/types/api';

const state = vi.hoisted(() => ({ width: 1200, actions: {} as Record<string, () => void> }));
vi.mock('react-native', () => ({ View: 'div', Text: 'span', StyleSheet: { create: (v: unknown) => v }, useWindowDimensions: () => ({ width: state.width }), Pressable: ({ children, accessibilityLabel, onPress, disabled }: { children: React.ReactNode; accessibilityLabel: string; onPress: () => void; disabled?: boolean }) => { if (!disabled) state.actions[accessibilityLabel] = onPress; return <button disabled={disabled}>{children}</button>; } }));
vi.mock('expo-image', () => ({ Image: ({ accessibilityLabel }: { accessibilityLabel: string }) => <img alt={accessibilityLabel} /> }));
vi.mock('lucide-react-native', () => Object.fromEntries(['Package','Copy','Check','Clock3','Truck','CircleCheck','CircleX','Store','ChevronRight','MapPin','Star','ShoppingCart'].map(name => [name, () => null])));
const order: OrderSummary = { id: 'a', orderCode: 'BCA123', status: 'PENDING', paymentStatus: 'UNPAID', totalAmount: 9010000, createdAt: '2026-11-10T09:05:00Z', storeName: 'ANKT Store', items: [{ id: 'line', productId: 'product', productName: 'Tai nghe Bluetooth ANKT Pro', variantName: 'Màu trắng', imageUrl: 'https://example.test/image.jpg', storeName: 'ANKT Store', storeSlug: 'ankt', quantity: 2, unitPrice: 4505000, totalPrice: 9010000 }] };
const actions = () => ({ onDetails: vi.fn(), onCancel: vi.fn(), onCopy: vi.fn(), onReview: vi.fn(), onBuyAgain: vi.fn(), onStore: vi.fn() });

it.each([375, 1200])('renders actual order, shop, products and total at %ipx', width => {
  state.width = width;
  const html = renderToStaticMarkup(<OrderListCard order={order} {...actions()} />);
  for (const text of ['BCA123', 'Đặt lúc', 'ANKT Store', 'Tai nghe Bluetooth ANKT Pro', 'Màu trắng', '×2', '9.010.000 VNĐ', 'Tổng thanh toán', 'Hủy đơn', 'Xem chi tiết']) expect(html).toContain(text);
});
it('uses the right actions for shipping, completed and paid pending orders', () => {
  const shipping = renderToStaticMarkup(<OrderListCard order={{ ...order, status: 'SHIPPING' }} {...actions()} />);
  expect(shipping).toContain('Theo dõi đơn'); expect(shipping).not.toContain('Hủy đơn');
  const completed = renderToStaticMarkup(<OrderListCard order={{ ...order, status: 'COMPLETED' }} {...actions()} />);
  expect(completed).toContain('Đánh giá'); expect(completed).toContain('Mua lại');
  expect(renderToStaticMarkup(<OrderListCard order={{ ...order, paymentStatus: 'PAID' }} {...actions()} />)).not.toContain('Hủy đơn');
});
it('keeps copy, store, cancel and details as separate working controls', () => {
  const callbacks = actions();
  renderToStaticMarkup(<OrderListCard order={order} {...callbacks} />);
  state.actions['Sao chép mã đơn BCA123'](); state.actions['Xem cửa hàng ANKT Store'](); state.actions['Hủy đơn BCA123'](); state.actions['Xem chi tiết đơn BCA123']();
  expect(callbacks.onCopy).toHaveBeenCalledOnce(); expect(callbacks.onStore).toHaveBeenCalledWith('ankt'); expect(callbacks.onCancel).toHaveBeenCalledOnce(); expect(callbacks.onDetails).toHaveBeenCalledOnce();
});
it('supports historic orders from several shops and absent metadata', () => {
  const multi = renderToStaticMarkup(<OrderListCard order={{ ...order, items: [{ ...order.items![0], storeId: 'a' }, { ...order.items![0], id: 'second', storeId: 'b', storeName: 'Shop B', storeSlug: 'b' }] }} {...actions()} />);
  expect(multi).toContain('Shop B');
  expect(renderToStaticMarkup(<OrderListCard order={{ ...order, items: undefined }} {...actions()} />)).toContain('Xem sản phẩm trong chi tiết đơn hàng');
});
it('shows only the first product per shop and counts the hidden lines', () => {
  const html = renderToStaticMarkup(<OrderListCard order={{ ...order, items: [order.items![0], { ...order.items![0], id: 'second', productName: 'Sản phẩm thứ hai' }] }} {...actions()} />);
  expect(html).toContain('Tai nghe Bluetooth ANKT Pro');
  expect(html).not.toContain('Sản phẩm thứ hai');
  expect(html).toContain('+1 sản phẩm khác');
  expect(html).toContain('9.010.000 VNĐ');
});
