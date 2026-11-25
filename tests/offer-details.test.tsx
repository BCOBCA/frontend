import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { OfferDetails } from '../src/components/promotions/OfferDetails';
import type { Voucher } from '../src/types/api';

const state = vi.hoisted(() => ({ close: () => {}, buttons: [] as { disabled?: boolean; onPress: () => void }[] }));
vi.mock('react-native', () => {
  const Container = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { View: Container, Text: Container, ScrollView: Container,
    Modal: ({ children, onRequestClose }: { children: React.ReactNode; onRequestClose: () => void }) => { state.close = onRequestClose; return <section>{children}</section>; },
    Pressable: ({ children, disabled, onPress }: { children: React.ReactNode; disabled?: boolean; onPress: () => void }) => { state.buttons.push({ disabled, onPress }); return <button disabled={disabled}>{children}</button>; } };
});
vi.mock('lucide-react-native', () => ({ X: () => null }));
vi.mock('../src/theme', () => ({ colors: {}, styles: {}, money: String }));
const item: Voucher = { id: 'v', code: 'CODE', name: '', description: 'Điều kiện dùng', discountType: 'PERCENT', discountValue: 15, minOrderAmount: 200000, maxDiscount: 50000, expiresAt: '2099-01-01', claimed: false, storeId: 'shop', storeName: 'Shop QQ', minLevel: 3 };
beforeEach(() => { state.buttons = []; });

it.each([false, true])('guards every close path while redemption is pending: %s', busy => {
  const close = vi.fn();
  renderToStaticMarkup(<OfferDetails item={item} onClose={close} busy={busy} />);
  state.close();
  state.buttons.forEach(button => { expect(button.disabled).toBe(busy); button.onPress(); });
  expect(close).toHaveBeenCalledTimes(busy ? 0 : 3);
});
it('keeps common terms and contextual redemption content in one dialog', () => {
  const html = renderToStaticMarkup(<OfferDetails item={item} onClose={vi.fn()} heading="Xác nhận đổi ưu đãi" footer={<span>Xác nhận đổi điểm</span>}><span>Số dư sau đổi: 100 điểm</span></OfferDetails>);
  for (const text of ['Xác nhận đổi ưu đãi', 'Giảm 15%', 'Voucher của shop: Shop QQ', 'Điều kiện dùng', '200000', '50000', 'Lv.', 'Hạn sử dụng:', 'Số dư sau đổi: 100 điểm', 'Xác nhận đổi điểm']) expect(html).toContain(text);
});
