import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { LeaderboardView } from '../src/components/affiliate/LeaderboardView';
import type { AffiliateRank, LeaderboardPage } from '../src/types/api';
const state = vi.hoisted(() => ({ width: 1200, actions: {} as Record<string, () => void> }));
vi.mock('react-native', () => ({ View: 'div', Text: 'span', useWindowDimensions: () => ({ width: state.width }), StyleSheet: { create: (v: unknown) => v }, ScrollView: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, Pressable: ({ children, accessibilityLabel, onPress, disabled }: { children: React.ReactNode; accessibilityLabel: string; onPress: () => void; disabled?: boolean }) => { if (!disabled) state.actions[accessibilityLabel] = onPress; return <button disabled={disabled}>{children}</button>; } }));
vi.mock('expo-image', () => ({ Image: ({ accessibilityLabel }: { accessibilityLabel: string }) => <img alt={accessibilityLabel} /> }));
vi.mock('../src/components/affiliate/AffiliateRankIcon', () => ({ AffiliateRankIcon: ({ level }: { level: number }) => <i data-badge={level} /> }));
vi.mock('../src/components/affiliate/LeaderboardTrophy', () => ({ LeaderboardTrophy: () => <i /> }));
vi.mock('lucide-react-native', () => Object.fromEntries(['Award','ArrowRight','CalendarDays','Check','Crown','Gift','Link2','Percent','Trophy','Users','UserRound'].map(name => [name, () => null])));
const ranks: AffiliateRank[] = ['Đồng','Bạc','Vàng','Bạch kim','Kim cương'].map((name, i) => ({ name, rank: i+1, minSuccessfulReferrals: i*10, commissionRate: (i+1)/100 }));
const data: LeaderboardPage = { page: 1, pageSize: 10, totalItems: 30, totalPages: 3, period: 'week', items: [{ id: 'first', displayName: 'Thành viên A', rank: 1, referrals: 8, tier: 'Đồng', tierRank: 1, commissionRate: 0.01 }], myEntry: { id: 'mine', displayName: 'Thành viên của tôi', rank: 15, referrals: 2, tier: 'Kim cương', tierRank: 5, commissionRate: 0.05, isMe: true } };
const callbacks = () => ({ onPeriod: vi.fn(), onPage: vi.fn(), onDetails: vi.fn(), onPolicy: vi.fn() });
it.each([375,1200])('renders real positions, rates and all five badge tiers at %ipx', width => {
  state.width = width;
  const html = renderToStaticMarkup(<LeaderboardView data={data} period="week" ranks={ranks} {...callbacks()} />);
  for (const text of ['Bảng xếp hạng Giới thiệu','Thành viên A','Hạng #15','1%','5%','Đồng','Bạc','Vàng','Bạch kim','Kim cương']) expect(html).toContain(text);
  expect(html).toContain('data-badge="0"'); expect(html).toContain('data-badge="4"');
  expect(html).toContain('Thành viên của tôi');
});
it('wires period, pagination and details actions', () => {
  const actions=callbacks(); renderToStaticMarkup(<LeaderboardView data={data} period="week" ranks={ranks} {...actions} />);
  state.actions['Tháng này'](); expect(actions.onPeriod).toHaveBeenCalledWith('month');
  state.actions['Trang sau'](); expect(actions.onPage).toHaveBeenCalledWith(2);
  state.actions['Xem chi tiết hạng của bạn'](); expect(actions.onDetails).toHaveBeenCalledOnce();
  state.actions['Xem chính sách Affiliate'](); expect(actions.onPolicy).toHaveBeenCalledOnce();
});
it('does not invent a personal rank when data is absent', () => {
  const html=renderToStaticMarkup(<LeaderboardView period="week" ranks={[]} {...callbacks()} />);
  expect(html).not.toContain('Hạng #'); expect(html).toContain('Chưa có thông tin xếp hạng'); expect(html).not.toContain('10%');
});
