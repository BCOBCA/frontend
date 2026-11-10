import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { OfferCard } from '../src/components/promotions/OfferCard';
import type { Voucher } from '../src/types/api';

vi.mock('react-native', () => ({
  View: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
  Pressable: ({ children, accessibilityLabel, disabled }: { children?: React.ReactNode; accessibilityLabel?: string; disabled?: boolean }) => <button aria-label={accessibilityLabel} disabled={disabled}>{children}</button>,
}));
vi.mock('lucide-react-native', () => ({ Check: () => null, TicketPercent: () => null, Truck: () => null }));
vi.mock('../src/components/membership/MemberStar', () => ({ MemberStar: () => null }));
vi.mock('../src/components/promotions/VoucherTicket', () => ({ VoucherTicket: () => null }));
vi.mock('../src/theme', () => ({ colors: {} }));
const voucher: Voucher = { id: 'voucher-a', name: 'Giảm 20.000đ', code: 'SAVE20', description: '', discountType: 'FIXED', discountValue: 20000, minOrderAmount: 200000, maxDiscount: null, expiresAt: '2027-01-01', claimed: false };
const render = (item: Voucher, busy = false) => renderToStaticMarkup(<OfferCard voucher={item} width={300} busy={busy} onClaim={vi.fn()} onDetails={vi.fn()} />);

describe('voucher collection state', () => {
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
