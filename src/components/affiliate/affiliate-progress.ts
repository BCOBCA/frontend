import type { AffiliateRank, AffiliateRankProgress } from '../../types/api';

export function affiliateProgress(info: AffiliateRankProgress | null | undefined, ranks: AffiliateRank[]) {
  if (!info) return 0;
  if (info.nextRank === null) return 100;
  const current = ranks.find(rank => rank.rank === info.rank);
  if (!current || info.nextRankMinReferrals === null || info.nextRankMinReferrals <= current.minSuccessfulReferrals) return 0;
  return Math.max(0, Math.min(100, (info.successfulReferrals - current.minSuccessfulReferrals) * 100 / (info.nextRankMinReferrals - current.minSuccessfulReferrals)));
}
