import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Award, ArrowRight, CalendarDays, Check, Crown, Gift, Link2, Percent, Trophy, Users, UserRound } from 'lucide-react-native';
import { AffiliateRankIcon } from './AffiliateRankIcon';
import { LeaderboardTrophy } from './LeaderboardTrophy';
import type { AffiliateRank, LeaderboardEntry, LeaderboardPage, LeaderboardPeriod } from '../../types/api';
import { colors } from '../../theme';

type Props = { data?: LeaderboardPage; period: LeaderboardPeriod; ranks: AffiliateRank[]; loading?: boolean; sharing?: ReactNode; onPeriod: (period: LeaderboardPeriod) => void; onPage: (page: number) => void; onDetails: () => void; onPolicy: () => void };
const periods: { value: LeaderboardPeriod; title: string; Icon: typeof Trophy }[] = [{ value: 'week', title: 'Tuần này', Icon: Crown }, { value: 'month', title: 'Tháng này', Icon: CalendarDays }, { value: 'quarter', title: 'Quý này', Icon: CalendarDays }, { value: 'all', title: 'Tất cả', Icon: Trophy }];
const percent = (value?: number) => value == null ? '—' : `${(value * 100).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%`;
const quantity = (value: number) => value.toLocaleString('vi-VN');

function Avatar({ entry, size = 32 }: { entry: LeaderboardEntry; size?: number }) {
  const [failed, setFailed] = useState(false);
  return <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: '#F0F1F5', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{entry.avatarUrl && !failed ? <Image source={{ uri: entry.avatarUrl }} accessibilityLabel={`Ảnh đại diện ${entry.displayName}`} contentFit="cover" style={{ width: '100%', height: '100%' }} onError={() => setFailed(true)} /> : <UserRound size={size / 2} color={colors.muted} />}</View>;
}
function Panel({ title, Icon, children, action }: { title: string; Icon: typeof Award; children: ReactNode; action?: ReactNode }) {
  return <View style={[s.card, { padding: 16, gap: 14 }]}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Icon size={19} color="#DE2630" /><Text accessibilityRole="header" aria-level={2} style={{ flex: 1, color: colors.text, fontSize: 15, fontWeight: '700' }}>{title}</Text>{action}</View>{children}</View>;
}
function SmallAction({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled} onPress={onPress} hitSlop={4} style={({ pressed }) => ({ minHeight: 36, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 7, borderWidth: 1, borderColor: colors.border, opacity: disabled ? 0.4 : pressed ? 0.6 : 1 })}><Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>{title}</Text></Pressable>;
}

export function LeaderboardView({ data, period, ranks, loading, sharing, onPeriod, onPage, onDetails, onPolicy }: Props) {
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const compact = width < 600;
  const [tableWidth, setTableWidth] = useState(0);
  const mine = data?.myEntry;
  const entries = data?.items ?? [];
  const periodName = periods.find(item => item.value === period)!.title;
  return <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16, padding: compact ? 12 : 20, alignItems: wide ? 'flex-start' : 'stretch' }}>
    <View style={{ flex: wide ? 1 : undefined, minWidth: 0, gap: 14 }}>
      <View style={{ borderRadius: 13, overflow: 'hidden', backgroundColor: '#D7131B', padding: compact ? 16 : 20, minHeight: 144, flexDirection: 'row', alignItems: 'center', gap: compact ? 10 : 18 }}>
        <LeaderboardTrophy size={compact ? 70 : 100} /><View style={{ flex: 1, gap: 8 }}><Text accessibilityRole="header" aria-level={1} style={{ color: '#FFFAF5', fontSize: compact ? 22 : 27, lineHeight: compact ? 29 : 36, fontWeight: '800' }}>Bảng xếp hạng Giới thiệu</Text><Text style={{ color: '#FFF2E8', fontSize: 13, lineHeight: 20 }}>Vinh danh những kết nối có giá trị.{!compact && '\n'} Giới thiệu bạn bè và theo dõi kết quả của bạn.</Text></View>{!compact && <Gift size={56} color="#FFD77E" strokeWidth={1.4} />}
      </View>
      <View accessibilityRole="tablist" style={[s.card, { flexDirection: 'row', overflow: 'hidden' }]}>{periods.map(({ value, title, Icon }) => <Pressable key={value} accessibilityRole="tab" accessibilityLabel={title} accessibilityState={{ selected: period === value }} aria-selected={period === value} onPress={() => onPeriod(value)} style={({ pressed }) => ({ flex: 1, minHeight: 44, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: compact ? 4 : 7, backgroundColor: period === value ? '#DC2028' : colors.surface, borderRightWidth: value === 'all' ? 0 : 1, borderRightColor: colors.border, opacity: pressed ? 0.7 : 1 })}><Icon size={compact ? 14 : 16} color={period === value ? colors.surface : '#666976'} /><Text style={{ color: period === value ? colors.surface : colors.text, fontSize: compact ? 11 : 13, fontWeight: '600' }}>{title}</Text></Pressable>)}</View>
      <View style={[s.card, { overflow: 'hidden' }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator onLayout={event => setTableWidth(event.nativeEvent.layout.width)} contentContainerStyle={{ flexGrow: 1 }}>
          <View role="table" accessibilityLabel={`Bảng xếp hạng giới thiệu: ${periodName}`} style={{ width: Math.max(520, tableWidth) }}>
            <View role="row" style={[s.row, { backgroundColor: '#F5F5F8', minHeight: 44 }]}><View role="columnheader" style={s.position}><Text style={s.heading}>Hạng</Text></View><View role="columnheader" style={s.member}><Text style={s.heading}>Thành viên</Text></View><View role="columnheader" style={s.count}><Text style={[s.heading, { textAlign: 'center' }]}>Giới thiệu{'\n'}thành công</Text></View><View role="columnheader" style={s.rate}><Text style={[s.heading, { textAlign: 'center' }]}>Hoa hồng</Text></View></View>
            {entries.map(entry => <View key={entry.id} role="row" style={[s.row, { minHeight: 56, backgroundColor: entry.rank === 1 ? '#FFF7E3' : entry.rank === 2 ? '#F0F4FE' : entry.rank === 3 ? '#FFF0E9' : colors.surface, borderLeftWidth: 3, borderLeftColor: entry.isMe ? '#E3343D' : 'transparent' }]}>
              <View role="cell" style={s.position}><View style={{ minWidth: 25, minHeight: 25, borderRadius: 13, backgroundColor: entry.rank <= 3 ? ['#F6CA52', '#CFD8EA', '#E9AD82'][entry.rank - 1] : 'transparent', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#333440', fontSize: 13, fontWeight: '700' }}>{entry.rank}</Text></View></View>
              <View role="cell" style={[s.member, { flexDirection: 'row', alignItems: 'center', gap: 9, paddingRight: 8 }]}><Avatar key={entry.avatarUrl || entry.id} entry={entry} /><View style={{ flex: 1, minWidth: 0, gap: 3 }}><Text numberOfLines={2} style={{ color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '600' }}>{entry.displayName}{entry.isMe ? ' (Bạn)' : ''}</Text>{!!entry.tier && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>{!!entry.tierRank && entry.tierRank >= 1 && entry.tierRank <= 5 && <AffiliateRankIcon level={entry.tierRank - 1} size={16} />}<Text style={{ color: colors.muted, fontSize: 11 }}>{entry.tier}</Text></View>}</View></View>
              <View role="cell" style={s.count}><Text style={{ color: colors.text, fontSize: 14, fontWeight: '700', textAlign: 'center' }}>{quantity(entry.referrals)}</Text></View>
              <View role="cell" style={[s.rate, { alignItems: 'center' }]}><View style={{ backgroundColor: '#FFE9EB', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 14 }}><Text style={{ color: '#D32630', fontSize: 14, fontWeight: '700' }}>{percent(entry.commissionRate)}</Text></View></View>
            </View>)}
            {!entries.length && <View role="row" style={{ padding: 28, alignItems: 'center' }}><Text role="cell" style={s.body}>{loading ? 'Đang tải bảng xếp hạng…' : data ? 'Chưa có thành viên trong bảng xếp hạng' : 'Chưa tải được dữ liệu bảng xếp hạng'}</Text></View>}
          </View>
        </ScrollView>
        <View style={{ padding: 14, gap: 10 }}><Text style={s.note}>Mỗi người được mời tính một lượt khi có đơn hoàn thành, đã thanh toán. Hạng Affiliate và hoa hồng dựa trên tổng lượt hợp lệ; lượt trong bảng tính theo kỳ đã chọn (giờ Việt Nam).</Text>{compact && <Text style={s.note}>Kéo ngang để xem đầy đủ bảng.</Text>}{!!data && data.totalPages > 1 && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}><SmallAction title="Trang trước" disabled={data.page <= 1 || loading} onPress={() => onPage(data.page - 1)} /><Text style={s.note}>{data.page}/{data.totalPages}</Text><SmallAction title="Trang sau" disabled={data.page >= data.totalPages || loading} onPress={() => onPage(data.page + 1)} /></View>}</View>
      </View>
    </View>
    <View style={{ width: wide ? 320 : undefined, gap: 14 }}>
      <Panel title="Hạng của bạn" Icon={Award} action={<Pressable accessibilityRole="link" accessibilityLabel="Xem chi tiết hạng của bạn" onPress={onDetails} hitSlop={4} style={{ minHeight: 36, justifyContent: 'center' }}><Text style={{ color: '#D32630', fontSize: 11, fontWeight: '600' }}>Xem chi tiết →</Text></Pressable>}>
        {mine ? <><View style={{ backgroundColor: '#FFF0F3', borderRadius: 9, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}><Avatar key={mine.avatarUrl || mine.id} entry={mine} size={42} /><View style={{ flex: 1, gap: 5 }}><Text style={{ fontSize: 15, lineHeight: 21, fontWeight: '700', color: colors.text }}>{mine.displayName}</Text><Text style={s.note}>Hạng #{mine.rank} · {periodName}</Text></View>{!!mine.tierRank && <AffiliateRankIcon level={mine.tierRank - 1} size={24} />}</View><View style={{ flexDirection: 'row', gap: 12 }}><View style={{ flex: 1, gap: 5 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Users size={16} color="#D32630" /><Text style={s.stat}>{quantity(mine.referrals)}</Text></View><Text style={s.note}>{period === 'all' ? 'Giới thiệu thành công' : 'Lượt trong kỳ'}</Text></View><View style={{ flex: 1, gap: 5, borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: 12 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Percent size={16} color="#D32630" /><Text style={s.stat}>{percent(mine.commissionRate)}</Text></View><Text style={s.note}>Tỷ lệ theo hạng hiện tại</Text></View></View></> : <Text style={s.body}>{loading ? 'Đang tải hạng của bạn…' : 'Chưa có thông tin xếp hạng của bạn trong kỳ này. Xem chi tiết để tìm hiểu chương trình Affiliate.'}</Text>}
      </Panel>
      <Panel title="Quyền lợi khi giới thiệu" Icon={Gift}><View style={{ gap: 10 }}>{['Chia sẻ sản phẩm và ghi nhận hoa hồng theo điều kiện chương trình.', 'Theo dõi kết quả giới thiệu theo tuần, tháng, quý.', 'Xem hạng Affiliate và lịch sử hoa hồng trong tài khoản.'].map(text => <View key={text} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}><Check size={15} color="#D32630" style={{ marginTop: 2 }} /><Text style={[s.body, { flex: 1 }]}>{text}</Text></View>)}</View><Pressable accessibilityRole="link" accessibilityLabel="Xem chính sách Affiliate" onPress={onPolicy} style={{ minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 7 }}><Text style={{ color: '#D32630', fontSize: 12, fontWeight: '600' }}>Điều kiện ghi nhận hoa hồng</Text><ArrowRight size={14} color="#D32630" /></Pressable></Panel>
      <Panel title="Chia sẻ và giới thiệu ngay" Icon={Link2}><Text style={s.body}>Gửi liên kết giới thiệu đến bạn bè và theo dõi những kết nối mới của bạn.</Text>{sharing}</Panel>
      <Panel title="Huy hiệu Affiliate" Icon={Award}><View>{[...ranks].sort((a, b) => a.rank - b.rank).map(rank => <View key={rank.rank} style={{ flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 38, borderTopWidth: 1, borderTopColor: '#F2F2F6' }}><AffiliateRankIcon level={rank.rank - 1} size={22} /><Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: colors.text }}>{rank.name}</Text><Text style={s.note}>Từ {quantity(rank.minSuccessfulReferrals)} lượt</Text></View>)}</View></Panel>
    </View>
  </View>;
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#EEEFF4' },
  position: { width: 44, alignItems: 'center' }, member: { flex: 1, minWidth: 150 }, count: { width: 112 }, rate: { width: 96 },
  heading: { color: '#626572', fontSize: 11, lineHeight: 16, fontWeight: '600' },
  body: { color: '#5F626F', fontSize: 12, lineHeight: 19 }, note: { color: '#747682', fontSize: 11, lineHeight: 17 },
  stat: { color: '#D32630', fontSize: 18, lineHeight: 24, fontWeight: '700' },
});
