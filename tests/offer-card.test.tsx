import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { OfferCard } from '../src/components/promotions/OfferCard';
import type { Voucher } from '../src/types/api';

const actions = vi.hoisted(() => ({} as Record<string, () => void>));

vi.mock('react-native', () => ({
  View: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
  Pressable: ({ children, accessibilityLabel, disabled, onPress }: { children?: React.ReactNode; accessibilityLabel?: string; disabled?: boolean; onPress: () => void }) => { if (accessibilityLabel) actions[accessibilityLabel] = onPress; return <button aria-label={accessibilityLabel} disabled={disabled}>{children}</button>; },
}));
vi.mock('lucide-react-native', () => ({ Check: () => null, TicketPercent: () => null, Truck: () => null }));
vi.mock('../src/components/membership/MemberStar', () => ({ MemberStar: () => null }));
vi.mock('../src/components/promotions/VoucherTicket', () => ({ VoucherTicket: () => null }));
vi.mock('../src/theme', () => ({ colors: {} }));
const voucher: Voucher = { id: 'voucher-a', name: 'Giảm 20.000đ', code: 'SAVE20', description: '', discountType: 'FIXED', discountValue: 20000, minOrderAmount: 200000, maxDiscount: null, expiresAt: '2027-01-01', claimed: false };
const render = (item: Voucher, busy = false) => renderToStaticMarkup(<OfferCard voucher={item} width={300} busy={busy} onClaim={vi.fn()} onDetails={vi.fn()} />);

describe('voucher collection state', () => {
  it.each([false, true])('keeps shop identity and order terms on the same reward card before/after collection: %s', owned => {
    const html = renderToStaticMarkup(<OfferCard voucher={{ ...voucher, pointCost: 500, storeId: 'shop-qq', storeName: 'Cửa hàng QQ', claimed: owned }} owned={owned} width={300} busy={false} onClaim={vi.fn()} onDetails={vi.fn()} />);
    expect(html).toContain('Cửa hàng QQ');
    expect(html).toContain('Đơn từ 200.000đ');
    expect(html).toContain(owned ? 'Đã đổi 500 điểm' : 'Đổi 500 điểm');
  });
  it.each([0, 500])('derives the fixed discount title from its value for %i point cost', pointCost => {
    const html = render({ ...voucher, name: 'hahahahaha', discountValue: 20000, pointCost });
    expect(html).toContain('Giảm 20.000đ');
    expect(html).not.toContain('hahahahaha');
  });
  it('derives the percentage title from its rate rather than its cap', () => {
    const html = render({ ...voucher, name: 'OLD_PROGRAM', discountType: 'PERCENT', discountValue: 15, maxDiscount: 50000 });
    expect(html).toContain('Giảm 15%');
    expect(html).not.toContain('OLD_PROGRAM');
    expect(html).toContain('Tối đa 50.000đ');
  });
  it.each([0, 500])('opens conditions for owned vouchers without allowing another %i-point claim', pointCost => {
    const details = vi.fn(), claim = vi.fn();
    const html = renderToStaticMarkup(<OfferCard voucher={{ ...voucher, claimed: true, pointCost }} owned width={300} busy={false} onClaim={claim} onDetails={details} />);
    expect(html).toContain('Xem điều kiện'); expect(html).not.toContain('disabled');
    actions[`Xem điều kiện: ${voucher.name}`](); expect(details).toHaveBeenCalledOnce(); expect(claim).not.toHaveBeenCalled();
  });
  it.each([0, 100])('shows collected status rather than a copy action for %i point cost', pointCost => {
    const html = render({ ...voucher, claimed: true, pointCost });
    expect(html).toContain('Đã thu thập');
    expect(html).not.toContain('Sao chép mã');
    expect(html).not.toContain('Đã nhận');
    expect(html).toContain('disabled');
  });
  it.each([{ minLevel: 1, badge: 'Thành viên' }, { minLevel: 3, badge: 'Lv.3+' }, { isFlashSale: true, badge: 'Có hạn' }])('preserves the $badge tag after collection', ({ badge, ...metadata }) => {
    const html = render({ ...voucher, ...metadata, claimed: true });
    expect(html).toContain(badge);
    expect(html).not.toContain('Đã nhận');
  });
  it('does not replace an already collected state with another processing action', () => {
    expect(render({ ...voucher, claimed: true }, true)).toContain('Đã thu thập');
    expect(render({ ...voucher, claimed: true }, true)).not.toContain('Đang xử lý');
  });
});
