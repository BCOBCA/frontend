import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { CheckoutVoucherPicker } from '../src/components/checkout/CheckoutVoucherPicker';
import type { CheckoutVoucher } from '../src/types/api';
const state = vi.hoisted(() => ({ actions: {} as Record<string, () => void> }));
vi.mock('react-native', () => {
  const Container = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return { View: Container, Text: Container, StyleSheet: { create: (v: unknown) => v }, Pressable: ({ children, accessibilityLabel, onPress, disabled }: { children?: React.ReactNode; accessibilityLabel: string; onPress: () => void; disabled?: boolean }) => { if (!disabled) state.actions[accessibilityLabel] = onPress; return <button disabled={disabled}>{children}</button>; } };
});
vi.mock('lucide-react-native', () => ({ Circle: () => null, CircleCheck: () => null, TicketPercent: () => null, Truck: () => null, Sparkles: () => null }));
vi.mock('../src/components/common/ui', () => ({ Status: () => null }));
beforeEach(() => { state.actions = {}; });
const voucher = (code: string, discountType = 'FIXED', isEligible = true): CheckoutVoucher => ({ id: code, code, name: code, description: '', discountType, discountValue: 100000, maxDiscount: 100000, minOrderAmount: 100000, expiresAt: '2027-01-01', discountAmount: 100000, isEligible, reason: isEligible ? null : 'Voucher đã hết hạn' });
it('shows both categories, actual savings, selected counts and unavailable reasons', () => {
  const html = renderToStaticMarkup(<CheckoutVoucherPicker vouchers={[voucher('SAVE'), voucher('SHIP', 'SHIPPING'), voucher('EXPIRED', 'FIXED', false)]} selectedCodes={['SAVE', 'SHIP']} onSelect={vi.fn()} onAuto={vi.fn()} />);
  for (const text of ['Voucher sản phẩm', 'Voucher vận chuyển', 'SAVE', 'SHIP', '100.000 VNĐ', 'Voucher đã hết hạn', '1/1']) expect(html).toContain(text);
  expect(state.actions['Chọn voucher EXPIRED']).toBeUndefined();
});
it('changes only the requested category and exposes an explicit automatic selection action', () => {
  const onSelect = vi.fn(); const onAuto = vi.fn();
  renderToStaticMarkup(<CheckoutVoucherPicker vouchers={[voucher('SAVE')]} selectedCodes={[]} onSelect={onSelect} onAuto={onAuto} />);
  state.actions['Chọn voucher SAVE'](); expect(onSelect).toHaveBeenCalledWith('product', 'SAVE');
  state.actions['Không dùng voucher vận chuyển'](); expect(onSelect).toHaveBeenCalledWith('shipping', null);
  state.actions['Tự chọn giảm nhiều nhất'](); expect(onAuto).toHaveBeenCalledOnce();
});
it('prevents changes while a preview or order is pending', () => {
  renderToStaticMarkup(<CheckoutVoucherPicker vouchers={[voucher('SAVE')]} selectedCodes={[]} disabled onSelect={vi.fn()} onAuto={vi.fn()} />);
  expect(Object.keys(state.actions)).toHaveLength(0);
});
