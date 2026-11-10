import { describe, expect, it } from 'vitest';
import { affiliateProgress } from '../src/components/affiliate/affiliate-progress';
import type { AffiliateRankProgress } from '../src/types/api';

const ranks = [0, 10, 30, 60, 100].map((minSuccessfulReferrals, index) => ({ rank: index + 1, name: '', minSuccessfulReferrals, commissionRate: 0.02 }));
const info: AffiliateRankProgress = { rank: 3, name: 'Vàng', successfulReferrals: 42, commissionRate: 0.05, nextRank: 'Bạch kim', nextRankMinReferrals: 60, referralsToNextRank: 18 };
describe('affiliate rank progress', () => {
  it('keeps accumulated referrals and shows progress within the current rank', () => { expect(affiliateProgress(info, ranks)).toBe(40); });
  it('supports admin threshold changes', () => { expect(affiliateProgress({ ...info, nextRankMinReferrals: 70 }, ranks)).toBe(30); });
  it('handles guests and maximum rank', () => { expect(affiliateProgress(undefined, ranks)).toBe(0); expect(affiliateProgress({ ...info, rank: 5, nextRank: null }, ranks)).toBe(100); });
});
