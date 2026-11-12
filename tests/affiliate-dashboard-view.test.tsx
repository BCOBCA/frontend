import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { AffiliateDashboardLinks, AffiliateDashboardRank, AffiliateWalletCard } from '../src/components/affiliate/AffiliateDashboardView';
import type { Affiliate, AffiliateRank } from '../src/types/api';

const state = vi.hoisted(() => ({ actions: {} as Record<string, () => void>, progress: -1 }));
vi.mock('react-native', () => ({
  View: ({ children, accessibilityRole, accessibilityValue }: { children: React.ReactNode; accessibilityRole?: string; accessibilityValue?: { now: number } }) => { if (accessibilityRole === 'progressbar') state.progress = accessibilityValue!.now; return <div>{children}</div>; },
  Text: 'span', StyleSheet: { create: (value: unknown) => value },
  Pressable: ({ children, accessibilityLabel, onPress }: { children: React.ReactNode; accessibilityLabel: string; onPress: () => void }) => { state.actions[accessibilityLabel] = onPress; return <button>{children}</button>; },
}));
vi.mock('lucide-react-native', () => Object.fromEntries(['Banknote', 'ChartNoAxesColumnIncreasing', 'ChevronRight', 'Coins', 'Crown', 'FileClock', 'Gift', 'History', 'UsersRound'].map(name => [name, () => null])));
vi.mock('../src/components/affiliate/AffiliateRankIcon', () => ({ AffiliateRankIcon: ({ level }: { level: number }) => <svg data-rank={level} /> }));
vi.mock('../src/components/affiliate/AffiliateDashboardArt', () => ({ AffiliateWalletArt: () => null, AffiliatePlaneArt: () => null }));
const wallet: Affiliate = { code: 'REAL-CODE', availableBalance: 120000, pendingBalance: 450000, totalCommission: 850000, totalReferrals: 12, debtBalance: 0, rankInfo: { rank: 1, name: 'Đồng', commissionRate: 0.02, successfulReferrals: 3, nextRank: 'Bạc', nextRankMinReferrals: 10, referralsToNextRank: 7 } };
const ranks: AffiliateRank[] = [{ rank: 1, name: 'Đồng', minSuccessfulReferrals: 0, commissionRate: 0.02 }, { rank: 2, name: 'Bạc', minSuccessfulReferrals: 10, commissionRate: 0.03 }];
beforeEach(() => { state.actions = {}; state.progress = -1; });

it('shows pending commission in the wallet summary and preserves ledger access', () => {
  const ledger = vi.fn(), withdraw = vi.fn(); const html = renderToStaticMarkup(<AffiliateWalletCard wallet={wallet} wide onLedger={ledger} onWithdraw={withdraw} />);
  for (const text of ['120.000 VNĐ', 'Hoa hồng chờ về', '450.000 VNĐ', 'REAL-CODE', '12']) expect(html).toContain(text);
  expect(html).not.toContain('850.000 VNĐ'); expect(html).not.toContain('Tổng hoa hồng');
  state.actions['Lịch sử ví'](); expect(ledger).toHaveBeenCalledOnce();
  state.actions['Yêu cầu rút tiền'](); expect(withdraw).toHaveBeenCalledOnce();
  expect(html.indexOf('Yêu cầu rút tiền')).toBeLessThan(html.indexOf('Lịch sử ví'));
  const missing = renderToStaticMarkup(<AffiliateWalletCard wide={false} onLedger={ledger} onWithdraw={withdraw} />);
  expect(missing).not.toContain('570.000 VNĐ'); expect(missing).toContain('—');
});
it('uses live rank thresholds, percentage and next rate instead of the example milestone', () => {
  const details = vi.fn(); const html = renderToStaticMarkup(<AffiliateDashboardRank wallet={wallet} ranks={ranks} wide onDetails={details} />);
  expect(html).toContain(' / 10 lượt'); expect(html).toContain('Cần 7 lượt'); expect(html).toContain('3%'); expect(html).toContain('2%'); expect(state.progress).toBe(30);
  state.actions['Xem hạng giới thiệu'](); expect(details).toHaveBeenCalledOnce();
});
it('renders zero progress honestly and handles the highest rank', () => {
  renderToStaticMarkup(<AffiliateDashboardRank wallet={{ ...wallet, rankInfo: { ...wallet.rankInfo!, successfulReferrals: 0, referralsToNextRank: 10 } }} ranks={ranks} wide={false} onDetails={vi.fn()} />);
  expect(state.progress).toBe(0);
  const html = renderToStaticMarkup(<AffiliateDashboardRank wallet={{ ...wallet, rankInfo: { ...wallet.rankInfo!, rank: 5, name: 'Kim cương', nextRank: null, nextRankMinReferrals: null, referralsToNextRank: 0 } }} ranks={ranks} wide={false} onDetails={vi.fn()} />);
  expect(state.progress).toBe(100); expect(html).toContain('Bạn đã đạt hạng cao nhất'); expect(html).not.toContain('Hạng tiếp theo');
});
it('shows only referrals and leaderboard in the dashboard navigation', () => {
  const navigate = vi.fn(); const html = renderToStaticMarkup(<AffiliateDashboardLinks width={393} onNavigate={navigate} />);
  expect(html).not.toContain('Các hạng và tỷ lệ hoa hồng'); expect(html).not.toContain('Hoa hồng của tôi');
  expect(html).not.toContain('Lịch sử rút'); expect(html).not.toContain('Yêu cầu rút tiền');
  for (const [label, route] of [['Danh sách người được giới thiệu', '/referrals'], ['Bảng xếp hạng', '/leaderboard']]) { state.actions[label](); expect(navigate).toHaveBeenLastCalledWith(route); }
});
