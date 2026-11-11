import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { OrderDetailView } from '../src/components/orders/OrderDetailView';
import type { Order } from '../src/types/api';

const state = vi.hoisted(() => ({ width: 1200, actions: {} as Record<string, () => void> }));
vi.mock('react-native', () => {
  const Container = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return { View: Container, Text: Container, StyleSheet: { create: (v: unknown) => v }, useWindowDimensions: () => ({ width: state.width }), Pressable: ({ children, accessibilityLabel, onPress, disabled }: { children?: React.ReactNode; accessibilityLabel: string; onPress: () => void; disabled?: boolean }) => { if (!disabled) state.actions[accessibilityLabel] = onPress; return <button disabled={disabled}>{children}</button>; } };
});
vi.mock('lucide-react-native', () => Object.fromEntries(['ArrowLeft', 'Check', 'CheckCircle2', 'CircleCheck', 'CircleX', 'ClipboardList', 'CreditCard', 'History', 'MapPin', 'Package', 'ReceiptText', 'RotateCcw', 'ShoppingBag', 'Store', 'Truck', 'X', 'ChevronRight'].map(name => [name, () => null])));
vi.mock('expo-image', () => ({ Image: () => <img alt="product" /> }));
vi.mock('../src/components/common/ui', () => ({ Status: () => null }));
vi.mock('../src/components/orders/OrderShippingAddress', () => ({ OrderShippingAddress: ({ value }: { value: string }) => <span>{value}</span> }));
export const order: Order = { id: 'order', orderCode: 'BCA123', status: 'PENDING', paymentStatus: 'UNPAID', createdAt: '2026-11-10T08:00:00Z', subtotal: 100000, discountAmount: 10000, shippingFee: 30000, shippingDiscountAmount: 20000, totalAmount: 100000, recipientName: 'Người nhận', recipientPhone: '0912345678', shippingAddress: '123 Nguyễn Huệ, TP Hồ Chí Minh', paymentMethod: 'COD', items: [{ id: 'item', productName: 'Tai nghe', variantName: 'Trắng', imageUrl: 'https://example.test/image.jpg', quantity: 2, unitPrice: 50000, totalPrice: 90000, storeId: 'store', storeName: 'Phong Vũ', storeSlug: 'phong-vu' }], shipments: [{ id: 'ship', carrier: 'Carrier', trackingCode: 'TRACK123', status: 'SHIPPING', shippedAt: null, deliveredAt: null }], history: [{ oldStatus: '', newStatus: 'PENDING', note: 'Tạo đơn hàng', createdAt: '2026-11-10T08:00:00Z' }, { oldStatus: 'PENDING', newStatus: 'CONFIRMED', note: 'Ghi chú lịch sử cần giữ', createdAt: '2026-11-10T09:00:00Z' }] };
const callbacks = () => ({ onBack: vi.fn(), onCancel: vi.fn(), onRefund: vi.fn(), onReview: vi.fn(), onStore: vi.fn() });
beforeEach(() => { state.width = 1200; state.actions = {}; });
it.each(['PENDING', 'CONFIRMED', 'READY', 'SHIPPING', 'COMPLETED'])('uses the same four progress stages for %s', status => {
  const html = renderToStaticMarkup(<OrderDetailView order={{ ...order, status }} {...callbacks()} />);
  const progress = html.split('Trạng thái đơn hàng')[1].split('Thông tin nhận hàng')[0];
  expect(progress).toMatch(/Chờ xác nhận.*Chờ giao hàng.*Đang giao.*Hoàn thành/);
  expect(progress).not.toContain('Đã xác nhận');
});
it('records successful placement and does not invent shop confirmation', () => {
  const html = renderToStaticMarkup(<OrderDetailView order={{ ...order, history: [order.history[0]] }} {...callbacks()} />);
  const history = html.split('Lịch sử đơn hàng')[1].split('Tóm tắt đơn hàng')[0];
  expect(history).toContain('Đặt hàng thành công');
  expect(history).toContain('15:00 10/11/26');
  expect(history).not.toContain('Chờ xác nhận');
  expect(history).not.toContain('Shop đã xác nhận');
});
it('retains each real transition with its own event title, time and note', () => {
  const entries = [
    ...order.history,
    { oldStatus: 'CONFIRMED', newStatus: 'READY', createdAt: '2026-11-10T10:00:00Z', note: 'Đóng gói xong' },
    { oldStatus: 'READY', newStatus: 'SHIPPING', createdAt: '2026-11-11T01:00:00Z', note: 'Bàn giao vận chuyển' },
    { oldStatus: 'SHIPPING', newStatus: 'COMPLETED', createdAt: '2026-11-11T02:00:00Z', note: 'Khách đã nhận' },
  ];
  const html = renderToStaticMarkup(<OrderDetailView order={{ ...order, status: 'COMPLETED', history: [...entries].reverse() }} {...callbacks()} />);
  const history = html.split('Lịch sử đơn hàng')[1].split('Tóm tắt đơn hàng')[0];
  expect(history).toMatch(/Đặt hàng thành công.*Shop đã xác nhận đơn hàng.*Đơn hàng đã sẵn sàng giao.*Đơn hàng đang được giao.*Đơn hàng đã hoàn thành/);
  for (const entry of entries) expect(history).toContain(entry.note);
  expect(history).toContain('08:00 11/11/26');
  expect(history).toContain('09:00 11/11/26');
});
it('leaves the title and back navigation to the shared page header', () => {
  const html = renderToStaticMarkup(<OrderDetailView order={order} {...callbacks()} />);
  expect(html).not.toContain('Chi tiết đơn hàng');
  expect(state.actions['Quay lại danh sách đơn hàng']).toBeUndefined();
});
it('retains all history, notes, shipments, recipient and server amount lines in the new layout', () => {
  const html = renderToStaticMarkup(<OrderDetailView order={order} {...callbacks()} />);
  for (const text of ['Lịch sử đơn hàng', 'Tạo đơn hàng', 'Ghi chú lịch sử cần giữ', 'TRACK123', 'Người nhận', 'Phong Vũ', 'Tai nghe', 'Trắng', 'Tóm tắt đơn hàng', '100.000 VNĐ', 'Giảm phí vận chuyển', 'Thanh toán khi nhận hàng (COD)']) expect(html).toContain(text);
});
it('routes cancel and store actions without a refund history button', () => {
  const c = callbacks(); renderToStaticMarkup(<OrderDetailView order={order} {...c} />);
  expect(state.actions['Lịch sử hoàn tiền']).toBeUndefined();
  state.actions['Hủy đơn hàng'](); state.actions['Xem cửa hàng Phong Vũ']();
  expect(c.onCancel).toHaveBeenCalledOnce(); expect(c.onStore).toHaveBeenCalledWith('phong-vu');
});
it.each(['CANCELLED', 'REFUNDED'])('never shows an order-success banner for %s', status => {
  const html = renderToStaticMarkup(<OrderDetailView order={{ ...order, status }} {...callbacks()} />);
  expect(html).not.toContain('Đặt hàng thành công!'); expect(html).toContain('Lịch sử đơn hàng'); expect(state.actions['Hủy đơn hàng']).toBeUndefined();
});
it('allows reviews and refund requests only in their supported states', () => {
  const c = callbacks(); renderToStaticMarkup(<OrderDetailView order={{ ...order, status: 'COMPLETED', paymentStatus: 'PAID' }} {...c} />);
  state.actions['Yêu cầu hoàn tiền'](); state.actions['Đánh giá Tai nghe']();
  expect(c.onRefund).toHaveBeenCalledOnce(); expect(c.onReview).toHaveBeenCalledWith(order.items[0]);
});
it.each(['busy', 'paid', 'refreshing'])('blocks cancellation when %s', mode => {
  renderToStaticMarkup(<OrderDetailView order={{ ...order, paymentStatus: mode === 'paid' ? 'PAID' : 'UNPAID' }} busy={mode === 'busy'} refreshing={mode === 'refreshing'} {...callbacks()} />);
  expect(state.actions['Hủy đơn hàng']).toBeUndefined();
});
it('keeps history and all main sections at phone width', () => {
  state.width = 320; const html = renderToStaticMarkup(<OrderDetailView order={order} {...callbacks()} />);
  expect(html).toContain('Lịch sử đơn hàng'); expect(html).toContain('Thông tin nhận hàng'); expect(html).toContain('Tổng tiền thanh toán');
});
