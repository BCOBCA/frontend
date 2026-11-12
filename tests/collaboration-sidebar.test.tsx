import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { AffiliateIncomeCard, CollaborationHelp } from '../src/components/affiliate/CollaborationSidebar';
import { AffiliateCategoryStrip } from '../src/components/affiliate/AffiliateCategoryStrip';
const state = vi.hoisted(() => ({ horizontal: false, actions: {} as Record<string, () => void> }));
vi.mock('react-native', () => ({ View: 'div', Text: 'span', StyleSheet: { create: (v: unknown) => v }, ScrollView: ({ horizontal, children }: { horizontal: boolean; children: React.ReactNode }) => { state.horizontal = horizontal; return <div>{children}</div>; }, Pressable: ({ accessibilityLabel, onPress, children }: { accessibilityLabel: string; onPress: () => void; children: React.ReactNode }) => { state.actions[accessibilityLabel] = onPress; return <button>{children}</button>; } }));
vi.mock('expo-image', () => ({ Image: () => null }));
vi.mock('../src/components/affiliate/AffiliateRankIcon', () => ({ AffiliateRankIcon: ({ level }: { level: number }) => <svg data-rank-level={level} /> }));
vi.mock('lucide-react-native', () => Object.fromEntries(['BarChart3', 'ChevronDown', 'ChevronRight', 'ChevronLeft', 'CircleHelp', 'Eye', 'EyeOff', 'Gift', 'Target', 'LayoutGrid'].map(name => [name, () => null])));
it('renders the actual pending/available balances, current rank and working management/policy controls', () => {
  const onManage = vi.fn(), onPolicy = vi.fn();
  const wallet = { code: 'REF', availableBalance: 120000, pendingBalance: 450000, totalReferrals: 3, debtBalance: 0, rankInfo: { rank: 2, name: 'Bạc', commissionRate: 0.08, successfulReferrals: 3, nextRank: null, nextRankMinReferrals: null, referralsToNextRank: 0 } };
  const html = renderToStaticMarkup(<><AffiliateIncomeCard wallet={wallet} signedIn onRetry={vi.fn()} onManage={onManage} /><CollaborationHelp onPolicy={onPolicy} /></>);
  expect(html).toContain('data-rank-level="1"');
  for (const text of ['450.000 đ', '120.000 đ', 'Bạc', '8%', 'Hướng dẫn nhanh', 'Câu hỏi thường gặp']) expect(html).toContain(text);
  expect(html).not.toContain('>Quản lý cộng tác<');
  state.actions['Xem thu nhập cộng tác'](); state.actions['Xem chi tiết chính sách cộng tác'](); expect(onManage).toHaveBeenCalledOnce(); expect(onPolicy).toHaveBeenCalledOnce();
});
it('renders all root categories in a horizontal strip and selects the last category', () => {
  const categories = Array.from({ length: 14 }, (_, index) => ({ id: `category-${index}`, parentId: null, name: `Danh mục ${index}`, slug: `c${index}`, imageUrl: '' }));
  const onSelect = vi.fn(); const html = renderToStaticMarkup(<AffiliateCategoryStrip categories={categories} selectedId="" onSelect={onSelect} />);
  expect(state.horizontal).toBe(true); expect(html).toContain('Danh mục 13');
  state.actions['Danh mục: Danh mục 13'](); expect(onSelect).toHaveBeenCalledWith('category-13');
});
