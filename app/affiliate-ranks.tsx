import { Pressable, Text, View, useWindowDimensions, type DimensionValue } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Award, Clock3, CircleAlert, Percent, Users, Wallet, ChevronRight, Link2 } from 'lucide-react-native';
import { Button, Page, Status } from '../src/components/common/ui';
import { ShareLinkActions } from '../src/components/affiliate/ShareLinkActions';
import { AffiliateCommissionHistory } from '../src/components/affiliate/AffiliateCommissionHistory';
import { AffiliateRankIcon } from '../src/components/affiliate/AffiliateRankIcon';
import { affiliateProgress } from '../src/components/affiliate/affiliate-progress';
import { request } from '../src/services/api';
import { useAuth } from '../src/stores/auth';
import { money, styles as s } from '../src/theme';
import type { Affiliate, AffiliateRank } from '../src/types/api';

type Invitation = { code: string; url: string; totalInvites: number; successfulInvites: number };
type ProductLink = { id: string; productId: string; url: string; clicks: number };
const accent = '#E53935';

export default function AffiliateInformation() {
  const user = useAuth(state => state.user);
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const ranks = useQuery({ queryKey: ['affiliate-ranks'], queryFn: () => request<AffiliateRank[]>('GET', '/affiliate/ranks') });
  const affiliate = useQuery({ queryKey: ['affiliate', user?.id], queryFn: () => request<Affiliate>('GET', '/affiliate'), enabled: !!user });
  const invitation = useQuery({ queryKey: ['affiliate-invitation', user?.id], queryFn: () => request<Invitation>('GET', '/affiliate/invitation'), enabled: !!user });
  const links = useQuery({ queryKey: ['affiliate-links', user?.id], queryFn: () => request<ProductLink[]>('GET', '/affiliate/links'), enabled: !!user });
  const wallet = user ? affiliate.data : undefined;
  const info = wallet?.rankInfo;
  const progress = affiliateProgress(info, ranks.data ?? []);
  const stats = [
    { label: 'Số dư khả dụng', value: wallet ? money(wallet.availableBalance) : '—', Icon: Wallet },
    { label: 'Hoa hồng chờ duyệt', value: wallet ? money(wallet.pendingBalance) : '—', Icon: Clock3 },
    { label: 'Khoản cần cấn trừ', value: wallet ? money(wallet.debtBalance) : '—', Icon: CircleAlert },
    { label: 'Hạng Affiliate', value: info?.name ?? '—', Icon: Award },
    { label: 'Tỷ lệ hoa hồng', value: info ? (info.commissionRate * 100).toLocaleString('vi-VN') + '%' : '—', Icon: Percent },
    { label: 'Giới thiệu thành công', value: info?.successfulReferrals.toLocaleString('vi-VN') ?? '—', Icon: Users },
  ];
  return <Page title="Thông tin Affiliate" back bodyStyle={{ backgroundColor: '#F4F5F7' }}><View style={{ padding: wide ? 24 : 12, gap: 22 }}>
    <View style={{ gap: 6 }}><Text accessibilityRole="header" style={[s.title, { fontSize: wide ? 26 : 22, lineHeight: 32 }]}>Đồng hành & nhận hoa hồng</Text><Text style={s.small}>Mời bạn bè, chia sẻ sản phẩm và theo dõi thu nhập của bạn.</Text></View>
    <Status loading={ranks.isLoading || !!user && affiliate.isLoading} error={ranks.error || (user ? affiliate.error : null)} retry={() => { void ranks.refetch(); if (user) void affiliate.refetch(); }} />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {stats.map(({ label, value, Icon }) => <View key={label} style={{ width: wide ? '31.9%' : '47.8%', flexGrow: 1, minWidth: 0, backgroundColor: '#FFFFFF', borderRadius: 14, padding: wide ? 18 : 12, gap: 12, borderWidth: 1, borderColor: '#E9EBEF' }}>
        <View style={s.between}><Text style={[s.small, { flex: 1, fontSize: 12 }]}>{label}</Text><Icon size={19} color={accent} /></View>
        <Text style={{ color: label === 'Số dư khả dụng' ? accent : '#24242B', fontSize: wide ? 23 : 18, lineHeight: 28, fontWeight: '800' }}>{value}</Text>
      </View>)}
    </View>
    {!user && <Button title="Đăng nhập để xem Affiliate của bạn" onPress={() => router.push('/login')} />}
    <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16 }}>
      <View style={[s.card, { flex: 1, padding: 20, gap: 14 }]}>
        <View style={s.between}><Text accessibilityRole="header" style={[s.title, { flex: 1 }]}>Hạng Affiliate của bạn</Text><Award color={accent} size={25} /></View>
        <Text style={{ color: accent, fontSize: 25, fontWeight: '800' }}>{info?.name ?? '—'}</Text>
        <View style={s.between}><Text style={[s.small, { flex: 1 }]}>Đã giới thiệu thành công</Text><Text style={[s.body, { fontWeight: '700' }]}>{info?.successfulReferrals.toLocaleString('vi-VN') ?? '—'} người</Text></View>
        <View accessible accessibilityRole="progressbar" accessibilityLabel="Tiến độ hạng Affiliate" aria-valuemin={0} aria-valuemax={100} aria-valuenow={info ? Math.round(progress) : undefined} aria-valuetext={info ? undefined : 'Đăng nhập để xem hạng'} style={{ height: 9, backgroundColor: '#ECEEF2', borderRadius: 5, overflow: 'hidden' }}><View style={{ height: '100%', width: (progress + '%') as DimensionValue, backgroundColor: accent, borderRadius: 5 }} /></View>
        <Text style={s.small}>{!info ? 'Đăng nhập để theo dõi tiến độ của bạn.' : info.nextRank ? 'Còn ' + info.referralsToNextRank + ' người để lên ' + info.nextRank + '.' : 'Bạn đã đạt hạng cao nhất.'}</Text>
        <Button title="Xem bảng xếp hạng giới thiệu" outline onPress={() => router.push('/leaderboard')} />
      </View>
      <View style={[s.card, { flex: 1, padding: 20, gap: 14 }]}>
        <View style={s.between}><Text accessibilityRole="header" style={[s.title, { flex: 1 }]}>Mã giới thiệu của bạn</Text><Link2 color={accent} size={23} /></View>
        <Status loading={!!user && invitation.isLoading} error={user ? invitation.error : null} retry={() => void invitation.refetch()} />
        {user && invitation.data ? <><ShareLinkActions url={invitation.data.url} code={invitation.data.code} /><Text style={s.small}>Tổng lượt mời: {invitation.data.totalInvites} · Thành công: {invitation.data.successfulInvites}</Text></> : <Text style={s.small}>Đăng nhập để sao chép mã và link mời của bạn.</Text>}
        <Pressable accessibilityRole="button" onPress={() => router.push('/referrals')} style={[s.between, { minHeight: 44 }]}><Text style={[s.body, { color: accent, flex: 1 }]}>Lịch sử người được giới thiệu</Text><ChevronRight size={18} color={accent} /></Pressable>
      </View>
    </View>
    <View style={[s.card, { padding: 20, gap: 14 }]}>
      <Text accessibilityRole="header" style={s.title}>Quyền lợi 5 hạng Affiliate</Text>
      <View style={{ borderWidth: 1, borderColor: '#F1E9EC', borderRadius: 10, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FDEEF1', paddingHorizontal: 12, paddingVertical: 10 }}>
          <Text style={{ flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '700', color: '#24242B' }}>Hạng</Text>
          <View style={{ flex: 1.3, alignItems: 'center' }}><Text style={{ fontSize: 12, lineHeight: 18, textAlign: 'center', fontWeight: '700', color: '#24242B' }}>Lượt giới thiệu thành công*</Text><Text style={{ fontSize: 11, lineHeight: 16, textAlign: 'center', color: '#24242B' }}>(hoàn thành đơn hàng đầu tiên)</Text></View>
          <Text style={{ width: 76, fontSize: 14, lineHeight: 20, fontWeight: '700', textAlign: 'center', color: '#24242B' }}>Hoa hồng</Text>
        </View>
        {[...(ranks.data ?? [])].sort((a, b) => a.rank - b.rank).map((rank, index) => <View key={rank.rank} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 39, paddingHorizontal: 12, paddingVertical: 7, borderTopWidth: 1, borderColor: '#F1E9EC', backgroundColor: info?.rank === rank.rank ? '#FFF7F8' : '#FFFFFF' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}><AffiliateRankIcon level={index} size={23} /><Text style={{ flex: 1, color: '#24242B', fontSize: 14, lineHeight: 20, fontWeight: '700' }}>{rank.name}</Text></View>
          <Text style={{ flex: 1.3, fontSize: 14, lineHeight: 20, textAlign: 'center', color: '#24242B' }}>{rank.minSuccessfulReferrals.toLocaleString('vi-VN')}+</Text>
          <Text style={{ width: 76, fontSize: 15, lineHeight: 20, fontWeight: '800', textAlign: 'center', color: '#F5222D' }}>{(rank.commissionRate * 100).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%</Text>
        </View>)}
      </View>
      <Text style={s.small}>Mỗi người được mời chỉ tính một lượt khi có đơn hoàn thành, đã thanh toán. Không đặt lại số lượt khi lên hạng. Đơn hoàn tiền không còn đủ điều kiện sẽ được loại khỏi số lượt.</Text>
    </View>
    <View style={[s.card, { padding: 20, gap: 12 }]}>
      <Text accessibilityRole="header" style={s.title}>Cách tính hoa hồng Affiliate</Text>
      <Text style={[s.body, { fontWeight: '700', color: accent }]}>Hoa hồng = Giá trị sản phẩm hợp lệ × Tỷ lệ theo hạng</Text>
      <Text style={s.small}>Tính theo từng sản phẩm sau giảm giá, không gồm phí vận chuyển. Chỉ ghi nhận một Affiliate cho mỗi đơn, không chia nhiều tầng. Mức trần hoặc ngân sách riêng của sản phẩm có thể giới hạn hoa hồng.</Text>
      <Text style={s.small}>Link hợp lệ được bấm gần nhất được ghi nhận trong 30 ngày mặc định. Chỉ sản phẩm thuộc link được tính hoa hồng. Tự mua qua link của mình không được ghi nhận.</Text>
      <Text style={s.small}>Khi đơn hoàn thành và thanh toán, hoa hồng vào số dư chờ duyệt. Sau thời hạn đối soát/hoàn trả và được duyệt, tiền chuyển vào số dư khả dụng. Đơn hoàn tiền sẽ bị thu hồi hoa hồng; thiếu số dư sẽ cấn trừ các lần được duyệt tiếp theo.</Text>
    </View>
    {user && <>
      <View style={[s.row, { flexWrap: 'wrap' }]}>{[['Ví & rút tiền', '/affiliate'], ['Lịch sử giao dịch ví', '/wallet-transactions'], ['Lịch sử hoa hồng', '/commissions']].map(([title, route]) => <View key={route} style={{ flex: 1, minWidth: 140 }}><Button title={title} outline onPress={() => router.push(route)} /></View>)}</View>
      <AffiliateCommissionHistory />
      <View style={[s.card, { padding: 20, gap: 14 }]}><Text accessibilityRole="header" style={s.title}>Link sản phẩm đã tạo</Text><Status error={links.error} retry={() => void links.refetch()} />
        {links.data?.length === 0 && <Text style={s.small}>Mở một sản phẩm và chọn “Tạo link Affiliate” để bắt đầu.</Text>}
        {links.data?.map(link => <View key={link.id} style={{ gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ECEEF2' }}><Text style={s.small}>{link.clicks} lượt truy cập hợp lệ</Text><ShareLinkActions url={link.url} /></View>)}
        <Button title="Khám phá sản phẩm để chia sẻ" onPress={() => router.push('/categories')} />
      </View>
    </>}
  </View></Page>;
}
