import { describe, expect, it } from 'vitest';
import { filterOffers, offerRestriction } from '../src/components/promotions/offers';
import type { Membership, Voucher } from '../src/types/api';

const offer: Voucher = { id: 'voucher', name: 'Voucher', code: 'BCA', description: '', discountType: 'FIXED', discountValue: 30000, minOrderAmount: 200000, maxDiscount: null, expiresAt: '2027-01-01', claimed: false };
const member = { availablePoints: 500, lifetimeEarnedPoints: 1600, pointDebt: 0, levelInfo: { level: 6 } } as Membership;

describe('promotion offer categories and eligibility', () => {
  it('uses server metadata to filter actual offers', () => {
    const offers = [offer, { ...offer, id: 'redeem', pointCost: 500 }, { ...offer, id: 'level', minLevel: 3 }, { ...offer, id: 'flash', isFlashSale: true }];
    expect(filterOffers(offers, 'all')).toHaveLength(4);
    expect(filterOffers(offers, 'points').map(x => x.id)).toEqual(['redeem']);
    expect(filterOffers(offers, 'levels').map(x => x.id)).toEqual(['level']);
    expect(filterOffers(offers, 'flash').map(x => x.id)).toEqual(['flash']);
    expect(filterOffers(offers, 'vouchers')).toHaveLength(3);
  });
  it('allows exact-balance redemption using lifetime-derived level', () => {
    expect(offerRestriction({ ...offer, pointCost: 500, minLevel: 6 }, member)).toBeUndefined();
  });
  it('explains insufficient points, point debt and minimum level', () => {
    expect(offerRestriction({ ...offer, pointCost: 800 }, member)).toBe('Chưa đủ điểm');
    expect(offerRestriction({ ...offer, pointCost: 500 }, { ...member, pointDebt: 1 })).toBe('Cần cấn trừ điểm');
    expect(offerRestriction({ ...offer, minLevel: 7 }, member)).toBe('Cần Lv.7');
  });
  it('lets guests browse and defers authenticated eligibility to the API', () => {
    expect(offerRestriction({ ...offer, pointCost: 800 })).toBeUndefined();
  });
  it('includes free and point-funded shipping offers in the appropriate categories', () => {
    const shipping = [{ ...offer, id: 'ship', discountType: 'SHIPPING' }, { ...offer, id: 'ship-points', discountType: 'SHIPPING', pointCost: 1000 }];
    expect(filterOffers(shipping, 'vouchers').map(x => x.id)).toEqual(['ship']);
    expect(filterOffers(shipping, 'points').map(x => x.id)).toEqual(['ship-points']);
    expect(offerRestriction(shipping[1], member)).toBe('Chưa đủ điểm');
  });
});
