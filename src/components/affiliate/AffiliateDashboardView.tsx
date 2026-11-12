import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChartNoAxesColumnIncreasing, ChevronRight, History, UsersRound } from 'lucide-react-native';
import { colors, money } from '../../theme';
import type { Affiliate, AffiliateRank } from '../../types/api';
import { gridItemWidth } from '../common/grid-layout';
import { AffiliateRankIcon } from './AffiliateRankIcon';
import { AffiliateWalletArt, AffiliatePlaneArt } from './AffiliateDashboardArt';
import { affiliatePercent } from './affiliate-catalog';
import { affiliateProgress } from './affiliate-progress';

export type AffiliateDestination = '/referrals' | '/leaderboard' | '/wallet-transactions';
export const dashboardPanel = { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: '#ECEBF4', boxShadow: '0 2px 8px #3133540A' } as const;

export function AffiliateWalletCard({ wallet, wide, onLedger, onWithdraw }: { wallet?: Affiliate; wide: boolean; onLedger: () => void; onWithdraw: () => void }) {
  return <View style={[dashboardPanel, { backgroundColor: '#FFF0F3', borderColor: '#FFFFFF', borderWidth: 3, padding: wide ? 18 : 14, overflow: 'hidden', minHeight: wide ? 192 : 190 }]}>
    <View pointerEvents="none" style={{ position: 'absolute', top: -35, right: -35, width: 280, height: 280, borderRadius: 140, backgroundColor: '#FFE0E8', transform: [{ scaleX: 1.5 }] }} />
    <View pointerEvents="none" style={{ position: 'absolute', right: 12, top: 9, width: 76, height: 66, opacity: 0.8 }}><AffiliatePlaneArt /></View>
    <View style={{ flexDirection: 'row', gap: wide ? 12 : 8, alignItems: 'center' }}>
      <View style={{ width: wide ? 168 : 64, height: wide ? 148 : 90 }}><AffiliateWalletArt /></View>
      <View style={{ flex: 1, minWidth: 0, gap: 10 }}>
        <View style={{ gap: 4 }}><Text style={[s.label, { color: colors.text, fontWeight: '600' }]}>Số dư khả dụng</Text><Text style={{ color: '#E4122E', fontSize: wide ? 34 : 26, fontWeight: '800', lineHeight: wide ? 42 : 34 }}>{wallet ? money(wallet.availableBalance) : '—'}</Text></View>
        <View style={{ height: 1, backgroundColor: '#EDCDD4' }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 9 }}>
          {[{ label: 'Hoa hồng chờ về', value: wallet ? money(wallet.pendingBalance) : '—', accent: true }, { label: 'Mã giới thiệu', value: wallet?.code || '—' }, { label: 'Người đã giới thiệu', value: wallet?.totalReferrals.toLocaleString('vi-VN') ?? '—' }].map((stat, index) => <View key={stat.label} style={{ flex: index === 1 ? 1.45 : 1, minWidth: wide ? 0 : 90, paddingLeft: index ? 12 : 0, paddingRight: 6, borderLeftWidth: index ? 1 : 0, borderColor: '#E7CBD2', gap: 4 }}><Text style={s.label}>{stat.label}</Text><Text selectable style={{ fontSize: 13, lineHeight: 18, fontWeight: '700', color: stat.accent ? '#E4122E' : colors.text }}>{stat.value}</Text></View>)}
        </View>
      </View>
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 14, marginTop: 8 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Yêu cầu rút tiền" onPress={onWithdraw} hitSlop={4} style={({ pressed }) => ({ minHeight: 32, paddingHorizontal: 10, borderWidth: 1, borderColor: '#DF8A9A', borderRadius: 7, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.65 : 1 })}><Text style={{ color: '#BF2943', fontSize: 11, fontWeight: '600' }}>Yêu cầu rút tiền</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Lịch sử ví" onPress={onLedger} hitSlop={4} style={{ minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 4 }}><History size={13} color="#BF2943" /><Text style={{ color: '#BF2943', fontSize: 11, fontWeight: '600' }}>Lịch sử ví</Text></Pressable>
    </View>
  </View>;
}

export function AffiliateDashboardRank({ wallet, ranks, wide, onDetails }: { wallet?: Affiliate; ranks: AffiliateRank[]; wide: boolean; onDetails: () => void }) {
  const info = wallet?.rankInfo;
  const next = info?.nextRank ? [...ranks].sort((a, b) => a.rank - b.rank).find(rank => rank.rank > info.rank) : undefined;
  const progress = affiliateProgress(info, ranks);
  return <View style={[dashboardPanel, { borderRadius: 12, boxShadow: 'none', padding: 14, gap: wide ? 20 : 12, flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch' }]}>
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', width: wide ? 220 : undefined }}>
      <AffiliateRankIcon level={Math.max(0, (info?.rank ?? 1) - 1)} size={40} />
      <View style={{ gap: 2, flex: 1 }}><Text style={s.label}>Hạng giới thiệu</Text><Text style={{ fontSize: 18, lineHeight: 23, fontWeight: '700', color: colors.text }}>{info?.name ?? '—'}</Text><Text style={[s.label, { fontSize: 11 }]}>Hoa hồng cơ bản: <Text style={{ color: colors.text, fontWeight: '600' }}>{info ? affiliatePercent(info.commissionRate) : '—'}</Text></Text></View>
    </View>
    <View style={{ flex: wide ? 1 : undefined, gap: 6, minWidth: 0 }}>
      <Text style={[s.label, { textAlign: 'right', color: colors.text }]}><Text style={{ color: '#D41E3A', fontWeight: '700' }}>{info?.successfulReferrals.toLocaleString('vi-VN') ?? '—'}</Text>{info?.nextRankMinReferrals != null ? ` / ${info.nextRankMinReferrals.toLocaleString('vi-VN')} lượt` : info ? ' lượt thành công' : ''}</Text>
      <View accessibilityRole="progressbar" accessibilityLabel="Tiến độ hạng Affiliate" accessibilityValue={{ min: 0, max: 100, now: progress }} style={{ height: 5, borderRadius: 3, backgroundColor: '#EEEEF2', overflow: 'hidden' }}><View style={{ width: `${progress}%`, height: '100%', borderRadius: 3, backgroundColor: colors.primary }} /></View>
      <Text style={[s.label, { textAlign: 'right' }]}>{!info ? 'Đang tải hạng giới thiệu...' : info.nextRank ? `Cần ${info.referralsToNextRank.toLocaleString('vi-VN')} lượt giới thiệu để lên hạng ${info.nextRank}` : 'Bạn đã đạt hạng cao nhất'}</Text>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Xem hạng giới thiệu" onPress={onDetails} style={({ pressed }) => ({ width: wide ? 200 : undefined, minHeight: 60, paddingLeft: wide ? 16 : 0, paddingTop: wide ? 0 : 10, borderLeftWidth: wide ? 1 : 0, borderTopWidth: wide ? 0 : 1, borderColor: '#EEEEF2', flexDirection: 'row', alignItems: 'center', gap: 9, opacity: pressed ? 0.65 : 1 })}>
      {next && <AffiliateRankIcon level={next.rank - 1} size={30} />}
      <View style={{ flex: 1, gap: 2 }}><Text style={[s.label, { fontSize: 11 }]}>{info?.nextRank ? 'Hạng tiếp theo' : info ? 'Thành tích của bạn' : 'Các hạng Affiliate'}</Text><Text style={[s.title, { fontSize: 14 }]}>{info?.nextRank ?? (info ? 'Hạng cao nhất' : 'Khám phá hạng')}</Text>{next && <Text style={{ fontSize: 11, color: '#646678' }}>Hoa hồng: {affiliatePercent(next.commissionRate)}</Text>}</View><ChevronRight size={16} color={colors.muted} />
    </Pressable>
  </View>;
}

const destinations = [
  { title: 'Danh sách người được giới thiệu', caption: 'Quản lý người đã tham gia qua link', Icon: UsersRound, route: '/referrals' },
  { title: 'Bảng xếp hạng', caption: 'Top người giới thiệu nổi bật', Icon: ChartNoAxesColumnIncreasing, route: '/leaderboard' },
] as const;

export function AffiliateDashboardLinks({ width, onNavigate }: { width: number; onNavigate: (route: AffiliateDestination) => void }) {
  const [measured, setMeasured] = useState(0);
  const columns = width >= 600 ? 2 : 1;
  const gap = 12;
  const itemWidth = gridItemWidth(measured || Math.min(width, 1180) - (width >= 900 ? 40 : 24), columns, gap);
  return <View onLayout={event => setMeasured(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
    {destinations.map(({ title, caption, Icon, route }) => <Pressable key={route} accessibilityRole="button" accessibilityLabel={title} onPress={() => onNavigate(route)} style={({ pressed }) => [dashboardPanel, { width: itemWidth, minHeight: 86, borderRadius: 17, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.65 : 1 }]}>
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFE3E9', alignItems: 'center', justifyContent: 'center' }}><Icon size={27} color="#EF1534" strokeWidth={1.8} /></View>
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}><Text style={{ color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '700' }}>{title}</Text><Text style={s.label}>{caption}</Text></View><ChevronRight size={18} color={colors.text} />
    </Pressable>)}
  </View>;
}
const s = StyleSheet.create({ label: { color: '#646678', fontSize: 12, lineHeight: 17 }, title: { color: colors.text, fontSize: 14, lineHeight: 20, fontWeight: '700' } });
