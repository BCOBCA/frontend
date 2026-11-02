import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Clock, CircleCheck, Package, Truck, Star, Coins, ReceiptText, UsersRound, Medal, FileText, UserRound, Heart, MessageSquare, MapPin, Info, ChevronRight } from 'lucide-react-native';
import { Page, Button, Empty, LoginNotice, Status } from '../../src/components/common/ui';
import { MemberBarcode } from '../../src/components/membership/MemberBarcode';
import { colors, money, styles as s } from '../../src/theme';
import { request } from '../../src/services/api';
import { useAuth } from '../../src/stores/auth';
import type { Membership } from '../../src/types/api';

const menu = [ ['Đơn hàng từ bảng báo giá', ReceiptText, '/quotations'], ['Danh sách giới thiệu người mới', UsersRound, '/referrals'], ['Bảng xếp hạng lượt giới thiệu', Medal, '/leaderboard'], ['Chính sách Affiliate', FileText, '/info/affiliate'], ['Cá nhân', UserRound, '/profile'], ['Sản phẩm yêu thích', Heart, '/favorites'], ['Phản hồi', MessageSquare, '/feedback'], ['Danh sách địa chỉ', MapPin, '/addresses'], ['Về chúng tôi', Info, '/info/about'] ] as const;
const statuses = [ ['Chờ xác nhận', Clock, 'PENDING'], ['Đã xác nhận', CircleCheck, 'CONFIRMED'], ['Sẵn sàng giao', Package, 'READY'], ['Đang giao', Truck, 'SHIPPING'] ] as const;
export default function Member() {
  const user = useAuth(state => state.user);
  const logout = useMutation({ mutationFn: () => useAuth.getState().logout() });
  const member = useQuery({ queryKey: ['membership'], queryFn: () => request<Membership>('GET', '/membership'), enabled: !!user });
  return <Page title="THÀNH VIÊN" header={false}><View style={{ backgroundColor: colors.member, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, padding: 16, paddingTop: 24, gap: 12 }}>
    <Text accessibilityRole="header" style={s.title}>THÀNH VIÊN</Text>
    {!user ? <LoginNotice /> : <View style={[s.card, { backgroundColor: '#E5E8E9' }]}>
      <View style={s.between}><View style={[s.row, { flex: 1 }]}>{user.avatarUrl ? <Image source={{ uri: user.avatarUrl }} style={{ width: 42, height: 42, borderRadius: 24 }} /> : <UserRound size={40} color={colors.muted} />}<Text style={[s.body, { fontWeight: '700', flexShrink: 1 }]}>{user.fullName}</Text></View>{member.data && <MemberBarcode code={member.data.memberCode} />}</View>
      <View style={[s.row, { marginTop: 16 }]}><Star size={38} color={colors.gold} fill={colors.gold} /><Text style={s.title}>ĐIỂM THÀNH VIÊN</Text></View>
      <View style={{ height: 4, backgroundColor: colors.member, borderRadius: 4 }} /><Text style={s.muted}>Cảm ơn quý khách hàng vẫn luôn đồng hành</Text>
      <Status loading={member.isLoading} error={member.error} retry={() => void member.refetch()} />
      {!!member.data?.pointDebt && <Text style={s.error}>Điểm cần cấn trừ sau hoàn tiền: {member.data.pointDebt}</Text>}
      {member.data && <View style={[s.between, { borderRadius: 14, backgroundColor: colors.surface, padding: 12 }]}>{[['Tổng điểm', member.data.availablePoints], ['Đơn hàng', member.data.orderCount], ['Tổng hóa đơn', money(member.data.totalSpend)]].map(([label, value]) => <View key={label} style={{ alignItems: 'center', flex: 1, gap: 5 }}><Text style={[s.small, { fontWeight: '700' }]}>{label}</Text><Text style={s.body}>{value}</Text></View>)}</View>}
    </View>}
  </View>
    <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 16, marginTop: 12 }}><Pressable accessibilityRole="button" onPress={() => router.push('/orders')} style={s.between}><Text style={s.body}>Đơn hàng của tôi</Text><Text style={s.small}>Xem tất cả ›</Text></Pressable>
      <ScrollView horizontal contentContainerStyle={{ gap: 18, paddingTop: 24, paddingBottom: 12 }} showsHorizontalScrollIndicator={false}>{statuses.map(([label, Icon, status]) => <Pressable accessibilityRole="button" key={status} onPress={() => router.push({ pathname: '/orders', params: { status } })} style={{ alignItems: 'center', gap: 12, minWidth: 80 }}><Icon color={colors.text} size={27} strokeWidth={1.6} /><Text style={s.small}>{label}{member.data?.orderCounts[status] ? ` (${member.data.orderCounts[status]})` : ''}</Text></Pressable>)}</ScrollView>
    </View>
    <View style={{ flexDirection: 'row', padding: 12, gap: 12 }}>{[{ title: 'Số dư Affiliate', value: member.data ? money(member.data.affiliateBalance) : '—', Icon: Coins, route: '/affiliate' }, { title: 'Điểm thành viên', value: member.data ? `${member.data.availablePoints} Điểm` : '—', Icon: Star, route: '/points' }].map(({ title, value, Icon, route }) => <View key={title} style={[s.card, { flex: 1, padding: 10 }]}><Text style={[s.body, { fontWeight: '700', fontSize: 14 }]}>{title}</Text><View style={s.between}><Text style={s.small}>{value}</Text><Icon color={colors.primary} fill={colors.gold} size={32} /></View><Button title="Xem chi tiết ›" onPress={() => router.push(route)} /></View>)}</View>
    <View>{menu.map(([label, Icon, route]) => <Pressable key={label} accessibilityRole="button" onPress={() => router.push(route)} style={[s.row, s.line, { minHeight: 60, paddingHorizontal: 24, gap: 20 }]}><Icon color={colors.text} size={24} strokeWidth={1.7} /><Text style={[s.body, { flex: 1 }]}>{label}</Text><ChevronRight size={18} color={colors.muted} /></Pressable>)}</View>
    <Status error={logout.error} />
    {user && <View style={s.padded}><Button title="Đăng xuất" disabled={logout.isPending} outline onPress={() => logout.mutate()} /></View>}
    <Empty text={'© 2026 Báo chí Online BCA. All rights reserved.\nVersion: 1.0.0'} />
  </Page>;
}
