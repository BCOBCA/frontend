import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { CheckoutView, type CheckoutViewProps } from '../src/components/checkout/CheckoutView';
import type { CartItem } from '../src/types/api';

const state = vi.hoisted(() => ({ actions: {} as Record<string, () => void>, width: 1100 }));
vi.mock('react-native', () => {
  const Container = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return { View: Container, Text: Container, StyleSheet: { create: (s: unknown) => s }, useWindowDimensions: () => ({ width: state.width }),
    TextInput: ({ maxLength, accessibilityLabel }: { maxLength: number; accessibilityLabel: string }) => <textarea aria-label={accessibilityLabel} maxLength={maxLength} />,
    Pressable: ({ children, accessibilityLabel, onPress, disabled }: { children?: React.ReactNode; accessibilityLabel: string; onPress: () => void; disabled?: boolean }) => { if (!disabled) state.actions[accessibilityLabel] = onPress; return <button disabled={disabled}>{children}</button>; } };
});
vi.mock('lucide-react-native', () => Object.fromEntries(['MapPin', 'Store', 'Truck', 'TicketPercent', 'CreditCard', 'MessageSquare', 'ChevronRight', 'CircleCheck', 'Circle', 'Package'].map(name => [name, () => null])));
vi.mock('expo-image', () => ({ Image: () => null }));
vi.mock('../src/services/api', () => ({ request: vi.fn() }));
vi.mock('../src/components/common/ui', () => ({ Status: ({ error, loading }: { error?: unknown; loading?: boolean }) => <span>{error ? 'Lỗi tải dữ liệu' : loading ? 'Đang tải dữ liệu' : ''}</span>, Button: ({ title, disabled, onPress }: { title: string; disabled?: boolean; onPress: () => void }) => { if (!disabled) state.actions[title] = onPress; return <button disabled={disabled}>{title}</button>; } }));
vi.mock('../src/components/checkout/CheckoutAddress', () => ({ CheckoutAddress: ({ address }: { address: { recipientName: string } }) => <div>{address.recipientName}</div> }));
const line = (overrides: Partial<CartItem> = {}): CartItem => ({ id: 'a', productId: 'p', variantId: 'v', brandId: 'b', brandName: 'Apple', storeId: 's', storeName: 'Phong Vũ', name: 'AirPods', variantName: 'Trắng', imageUrl: '', unitPrice: 3000000, quantity: 3, availableStock: 10, isSelected: true, isAvailable: true, ...overrides });
function props(overrides: Partial<CheckoutViewProps> = {}): CheckoutViewProps {
  return { cart: { items: [line()], selectedTotal: 9000000, selectedCount: 3 }, addresses: [{ id: 'home', recipientName: 'Người nhận', phone: '0312312312', addressLine: '123 Nguyễn Văn Trỗi', provinceCode: '79', wardCode: '27343', isDefault: true }], addressId: 'home', preview: { subtotal: 9000000, discountAmount: 100000, shippingFee: 30000, shippingDiscountAmount: 20000, totalAmount: 8910000, selectedCount: 3, cartHash: 'hash' }, note: '', onAddress: vi.fn(), onSelectVoucher: vi.fn(), onAutoVouchers: vi.fn(), onNote: vi.fn(), onAddAddress: vi.fn(), onCart: vi.fn(), onOrder: vi.fn(), onRetry: vi.fn(), onRetryPreview: vi.fn(), ...overrides };
}
beforeEach(() => { state.actions = {}; state.width = 1100; });
it('renders selected products by vendor with server totals and shipping discount', () => {
  const html = renderToStaticMarkup(<CheckoutView {...props({ cart: { items: [line(), line({ id: 'hidden', name: 'Không chọn', isSelected: false })], selectedCount: 3, selectedTotal: 9000000 } })} />);
  for (const text of ['Phong Vũ', 'AirPods', 'Trắng', 'x3', '9.000.000 VNĐ', '8.910.000 VNĐ', 'Giảm phí vận chuyển', 'Tóm tắt thanh toán']) expect(html).toContain(text);
  expect(html).not.toContain('Không chọn');
});
it('places an eligible order through the existing callback', () => {
  const p = props(); renderToStaticMarkup(<CheckoutView {...p} />); state.actions['Đặt hàng'](); expect(p.onOrder).toHaveBeenCalledOnce();
});
it('shows compact shipping and voucher rows for each shop with one combined summary', () => {
  const p = props();
  p.cart!.items.push(line({ id: 'second', storeId: 's2', storeName: 'Shop B' }));
  p.preview!.storeOrders = [
    { storeId: 's', storeName: 'Phong Vũ', subtotal: 100000, discountAmount: 10000, shippingFee: 5000, shippingDiscountAmount: 1000, totalAmount: 94000 },
    { storeId: 's2', storeName: 'Shop B', subtotal: 200000, discountAmount: 20000, shippingFee: 10000, shippingDiscountAmount: 2000, totalAmount: 188000 },
  ];
  const html = renderToStaticMarkup(<CheckoutView {...p} />);
  for (const text of ['2 đơn hàng', '4.000 VNĐ', '8.000 VNĐ', '8.910.000 VNĐ', 'Voucher của shop', 'Giảm giá từ sàn']) expect(html).toContain(text);
  expect(html).not.toContain('Thanh toán cho cửa hàng');
});
it.each(['busy', 'loading', 'refreshing', 'previewLoading', 'error', 'previewError', 'missingPreview', 'noAddress', 'noSelection', 'stock'])('blocks orders for %s', mode => {
  const p = props();
  if (mode === 'busy' || mode === 'loading' || mode === 'refreshing' || mode === 'previewLoading') p[mode] = true;
  if (mode === 'error' || mode === 'previewError') p[mode] = new Error('offline');
  if (mode === 'missingPreview') p.preview = undefined;
  if (mode === 'noAddress') p.addresses = [];
  if (mode === 'noSelection') p.cart = { items: [], selectedTotal: 0, selectedCount: 0 };
  if (mode === 'stock') p.cart!.items[0].availableStock = 0;
  renderToStaticMarkup(<CheckoutView {...p} />); expect(state.actions['Đặt hàng']).toBeUndefined();
});
it('offers adding an address when no recipient exists', () => {
  const p = props({ addresses: [] }); renderToStaticMarkup(<CheckoutView {...p} />); state.actions['Thêm địa chỉ'](); expect(p.onAddAddress).toHaveBeenCalledOnce();
});
it('renders note count and a 200-character input on narrow screens', () => {
  state.width = 320; const html = renderToStaticMarkup(<CheckoutView {...props({ note: 'Gọi trước' })} />);
  expect(html).toContain('9/200'); expect(html).toContain('maxLength="200"');
});
