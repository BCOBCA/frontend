import type { Membership, Voucher } from '../../types/api';

export type OfferCategory = 'all' | 'vouchers' | 'points' | 'levels' | 'flash';

export function filterOffers(offers: Voucher[], category: OfferCategory) {
  return offers.filter(offer => category === 'all' || (category === 'points' ? (offer.pointCost ?? 0) > 0
    : category === 'levels' ? (offer.minLevel ?? 1) > 1
      : category === 'flash' ? !!offer.isFlashSale : (offer.pointCost ?? 0) === 0));
}

export function offerRestriction(offer: Voucher, member?: Membership) {
  if (!member) return undefined;
  if ((offer.minLevel ?? 1) > (member.levelInfo?.level ?? 1)) return `Cần Lv.${offer.minLevel}`;
  if ((offer.pointCost ?? 0) > 0) {
    if (member.pointDebt > 0) return 'Cần cấn trừ điểm';
    if (member.availablePoints < offer.pointCost!) return 'Chưa đủ điểm';
  }
  return undefined;
}
