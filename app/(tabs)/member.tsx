import { Platform, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Clock, CircleCheck, CircleAlert, Package, Truck, ReceiptText, UsersRound, Medal, FileText, UserRound, Heart, MessageSquare, MapPin, Info, ChevronRight } from 'lucide-react-native';
import { Page, Button, Empty, Status } from '../../src/components/common/ui';
import { MemberQRCode } from '../../src/components/membership/MemberQRCode';
import { MemberLevelProgress } from '../../src/components/membership/MemberLevelProgress';
import { guestMembershipProgress } from '../../src/components/membership/membership-progress';
import { AffiliateCoinIcon, MemberPointsIcon } from '../../src/components/membership/MemberRewardIcons';
import { colors, money, styles as s } from '../../src/theme';
import { request } from '../../src/services/api';
import { useAuth } from '../../src/stores/auth';
import type { Membership } from '../../src/types/api';

const menu = [ ['Đơn hàng của tôi', ReceiptText, '/orders'], ['Danh sách giới thiệu người mới', UsersRound, '/referrals'], ['Bảng xếp hạng lượt giới thiệu', Medal, '/leaderboard'], ['Chính sách Affiliate', FileText, '/info/affiliate'], ['Cá nhân', UserRound, '/profile'], ['Sản phẩm yêu thích', Heart, '/favorites'], ['Phản hồi và hỗ trợ', MessageSquare, '/feedback'], ['Danh sách địa chỉ', MapPin, '/addresses'], ['Về chúng tôi', Info, '/info/about'] ] as const;
const statuses = [ ['Chờ xác nhận', Clock, 'PENDING'], ['Chờ giao hàng', Package, 'CONFIRMED'], ['Đang giao', Truck, 'SHIPPING'], ['Hoàn thành', CircleCheck, 'COMPLETED'] ] as const;
export default function Member() {
  const { width } = useWindowDimensions();
  const webOrders = Platform.OS === 'web' && width >= 768;
  const user = useAuth(state => state.user);
  const logout = useMutation({ mutationFn: () => useAuth.getState().logout() });
  const member = useQuery({ queryKey: ['membership', user?.id], queryFn: () => request<Membership>('GET', '/membership'), enabled: !!user });
  const membership = user ? member.data : undefined;
  return <Page title="THÀNH VIÊN" header={false}><View style={{ backgroundColor: colors.member, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, padding: 12, paddingTop: 16, gap: 10 }}>
    <Text accessibilityRole="header" style={[s.title, { fontSize: 14, color: colors.muted }]}>THÀNH VIÊN</Text>
    <View style={[s.card, { backgroundColor: '#E5E8E9', overflow: 'hidden' }]}>
      <View pointerEvents="none" accessible={false} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
        <Svg width="100%" height="100%" viewBox="0 0 320 220" preserveAspectRatio="xMidYMid slice">
          <Path d="M0 0H190L205 42 0 138Z" fill="#FFFFFF" opacity={0.4} />
          <Path d="m0 155 320-135v24L0 180Z" fill="#FFFFFF" opacity={0.34} />
          <Path d="m213 0 23 77 84-35v15l-79 34 34 129h-18L220 99 0 193v-14l217-94-24-85Z" fill="#C6CDCF" opacity={0.45} />
          <Path d="m295 0-68 220h18L315 0Z" fill="#FFFFFF" opacity={0.28} />
        </Svg>
      </View>
      <View style={[s.between, { alignItems: 'flex-start' }]}>
        <View style={[s.row, { flex: 1, minWidth: 0 }]}>
          {user?.avatarUrl ? <Image source={{ uri: user.avatarUrl }} style={{ width: 44, height: 44, borderRadius: 22 }} /> : <View style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, backgroundColor: '#D4DBE6', alignItems: 'center', justifyContent: 'center' }}><UserRound size={29} color={colors.surface} fill={colors.surface} /></View>}
          <Text style={[s.body, { fontWeight: '700', flexShrink: 1 }]}>{user?.fullName ?? '—'}</Text>
        </View>
        <MemberQRCode code={membership?.memberCode} />
      </View>
      <MemberLevelProgress progress={user ? membership?.levelInfo : guestMembershipProgress} points={user ? membership?.lifetimeEarnedPoints : 0} availablePoints={user ? membership?.availablePoints : 0} />
      <Text style={[s.muted, { fontSize: 12 }]}>Cảm ơn quý khách hàng vẫn luôn đồng hành</Text>
      {user && <Status loading={member.isLoading} error={member.error} retry={() => void member.refetch()} />}
      {!!membership?.pointDebt && <Text style={s.error}>Điểm cần cấn trừ sau hoàn tiền: {membership.pointDebt}</Text>}
      <View style={[s.between, { borderRadius: 12, backgroundColor: colors.surface, padding: 10, gap: 4, marginTop: 6 }]}>{[['Tổng điểm', membership?.lifetimeEarnedPoints ?? '—'], ['Đơn hàng', membership?.orderCount ?? '—'], ['Tổng hóa đơn', membership ? money(membership.totalSpend) : '—']].map(([label, value]) => <View key={label} style={{ alignItems: 'center', flex: 1, gap: 3 }}><Text style={[s.small, { fontWeight: '700', fontSize: 12, textAlign: 'center' }]}>{label}</Text><Text style={[s.body, { fontSize: 13, textAlign: 'center' }]}>{value}</Text></View>)}</View>
      {!user && <Button title="Đăng nhập" onPress={() => router.push('/login')} />}
    </View>
  </View>
    <View style={{ backgroundColor: colors.surface, borderRadius: webOrders ? 16 : 20, padding: 16, marginTop: 12, borderWidth: webOrders ? 1 : 0, borderColor: colors.border }}>
      <Pressable accessibilityRole="button" onPress={() => router.push('/orders')} style={[s.between, { minHeight: webOrders ? 44 : undefined }]}>
        <Text style={[s.body, webOrders && { fontWeight: '700' }]}>Đơn hàng của tôi</Text>
        <Text style={[s.small, webOrders && { color: colors.primary, fontWeight: '600' }]}>Xem tất cả ›</Text>
      </Pressable>
      {webOrders ? <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <View pointerEvents="none" accessible={false} style={{ position: 'absolute', top: 28, left: '12.5%', right: '12.5%', height: 1, backgroundColor: '#DADAE2' }} />
        {statuses.map(([label, Icon, status]) => <Pressable key={status} accessibilityRole="button" accessibilityLabel={label}
          onPress={() => router.push({ pathname: '/orders', params: { status } })}
          style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: 76, alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 4, opacity: pressed ? 0.65 : 1 })}>
          <View style={{ width: 48, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}><Icon color={colors.text} size={24} strokeWidth={1.6} /></View>
          <View style={{ minWidth: 0, alignItems: 'center', gap: 3 }}>
            <Text style={{ fontSize: 13, lineHeight: 18, textAlign: 'center', fontWeight: '600', color: colors.text }}>{label}</Text>
            {membership?.orderCounts[status] !== undefined && <Text style={s.small}>{membership.orderCounts[status]} đơn hàng</Text>}
          </View>
        </Pressable>)}
      </View> : <ScrollView horizontal contentContainerStyle={{ gap: 12, paddingTop: 16, paddingBottom: 12 }} showsHorizontalScrollIndicator={false}>{statuses.map(([label, Icon, status]) => <Pressable accessibilityRole="button" key={status} onPress={() => router.push({ pathname: '/orders', params: { status } })} style={{ alignItems: 'center', gap: 8, minWidth: 72 }}><Icon color={colors.text} size={24} strokeWidth={1.6} /><Text style={s.small}>{label}{membership?.orderCounts[status] ? ` (${membership.orderCounts[status]})` : ''}</Text></Pressable>)}</ScrollView>}
    </View>
    <View style={{ flexDirection: 'row', padding: 12, gap: 12 }}>{[{ title: 'Số dư Affiliate', value: membership ? money(membership.affiliateBalance) : '—', Icon: AffiliateCoinIcon, route: '/affiliate', infoRoute: '/affiliate-ranks' }, { title: 'Điểm thành viên', value: membership ? `${membership.availablePoints} Điểm` : '—', Icon: MemberPointsIcon, route: '/points', infoRoute: '/membership-levels' }].map(({ title, value, Icon, route, infoRoute }) => <View key={title} style={[s.card, { flex: 1, padding: 10 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Thông tin ${title}`} onPress={() => router.push(infoRoute)} hitSlop={{ top: 8, bottom: 8 }}
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 28, alignSelf: 'flex-start', maxWidth: '100%', opacity: pressed ? 0.65 : 1 })}>
        <Text style={[s.body, { fontWeight: '700', fontSize: 14, flexShrink: 1 }]}>{title}</Text><CircleAlert size={12} color={colors.primary} strokeWidth={2} />
      </Pressable>
      <View style={s.between}><Text style={s.small}>{value}</Text><Icon size={48} /></View>
      {webOrders ? <Button title="Xem chi tiết ›" onPress={() => router.push(route)} /> : <Pressable accessibilityRole="button" accessibilityLabel={`Xem chi tiết ${title}`} onPress={() => router.push(route)} hitSlop={{ top: 7, bottom: 7 }}
        style={({ pressed }) => ({ alignSelf: 'flex-start', minHeight: 30, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.75 : 1 })}>
        <Text style={{ color: colors.surface, fontSize: 12, lineHeight: 18, fontWeight: '600' }}>Xem chi tiết ›</Text>
      </Pressable>}
    </View>)}</View>
    <View>{menu.map(([label, Icon, route]) => <Pressable key={label} accessibilityRole="button" onPress={() => router.push(route)} style={[s.row, s.line, { minHeight: 52, paddingHorizontal: 16, gap: 12 }]}><Icon color={colors.text} size={22} strokeWidth={1.7} /><Text style={[s.body, { flex: 1 }]}>{label}</Text><ChevronRight size={18} color={colors.muted} /></Pressable>)}</View>
    <Status error={logout.error} />
    {user && <View style={s.padded}><Button title="Đăng xuất" disabled={logout.isPending} outline onPress={() => logout.mutate()} /></View>}
    <Empty text={'© 2026 Báo chí Online BCA. All rights reserved.\nVersion: 1.0.0'} />
  </Page>;
}
