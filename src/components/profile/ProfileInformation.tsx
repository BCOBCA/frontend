import { Pressable, Text, View } from 'react-native';
import { CalendarDays, Check, CircleCheck, Clock, Copy, Gift, Pencil, RefreshCw, UserRound, UsersRound, VenusAndMars, type LucideIcon } from 'lucide-react-native';
import type { Profile } from '../../types/api';
import { colors } from '../../theme';
import { profileDate, referrerLabel } from './profile-data';

export function ProfileInformation({ user, wide, onEdit, onCopy, editDisabled = false }: { user: Profile; wide: boolean; onEdit: () => void; onCopy: () => void; editDisabled?: boolean }) {
  const rows: { key: string; label: string; field?: string; value: string; Icon: LucideIcon }[] = [
    { key: 'fullName', label: 'Họ và tên', field: 'FullName', value: user.fullName, Icon: UserRound },
    { key: 'nickname', label: 'Tên hiển thị', field: 'Nickname', value: user.nickname || '—', Icon: Pencil },
    { key: 'gender', label: 'Giới tính', field: 'Gender', value: user.gender === 1 ? 'Nam' : user.gender === 2 ? 'Nữ' : 'Chưa cập nhật', Icon: VenusAndMars },
    { key: 'birthday', label: 'Ngày sinh', field: 'DateOfBirth', value: profileDate(user.dateOfBirth), Icon: CalendarDays },
    { key: 'referral', label: 'Mã giới thiệu', field: 'ReferralCode', value: user.referralCode || '—', Icon: Gift },
    { key: 'referrer', label: 'Người giới thiệu', field: 'ReferredByUserId', value: referrerLabel(user), Icon: UsersRound },
    { key: 'created', label: 'Ngày tạo', field: 'CreatedAt', value: profileDate(user.createdAt, true), Icon: Clock },
    { key: 'updated', label: 'Cập nhật gần nhất', field: 'UpdatedAt', value: profileDate(user.updatedAt, true), Icon: RefreshCw },
    { key: 'status', label: 'Trạng thái tài khoản', value: user.status === 1 ? 'Đang hoạt động' : user.status === 0 ? 'Tạm khóa' : 'Chưa có thông tin', Icon: CircleCheck },
  ];
  return <View>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#F1F2F5' }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}><UserRound size={24} color={colors.primary} strokeWidth={1.8} /><Text accessibilityRole="header" style={{ fontSize: wide ? 20 : 18, lineHeight: 26, fontWeight: '700', color: colors.text }}>Thông tin tài khoản</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Chỉnh sửa thông tin tài khoản" disabled={editDisabled} onPress={onEdit} style={{ opacity: editDisabled ? 0.5 : 1, minHeight: 34, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.primary, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 6 }}><Pencil size={14} color={colors.primary} /><Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Chỉnh sửa</Text></Pressable></View>
    {rows.map(({ key, label, field, value, Icon }, index) => <View key={key} style={{ flexDirection: 'row', gap: 14, paddingVertical: 13, borderBottomWidth: index < rows.length - 1 ? 1 : 0, borderColor: '#F1F2F5', alignItems: wide ? 'center' : 'flex-start' }}>
      <Icon size={20} color={colors.text} strokeWidth={1.7} />
      <View style={{ flex: 1, minWidth: 0, flexDirection: wide ? 'row' : 'column', gap: wide ? 14 : 7, alignItems: wide ? 'center' : 'flex-start' }}>
        <Text style={{ width: wide ? '43%' : undefined, color: colors.text, fontSize: 13, lineHeight: 20, fontWeight: '600' }}>{label}{field && <Text style={{ fontSize: 11, fontWeight: '400' }}> ({field})</Text>}</Text>
        <View style={{ flex: wide ? 1 : undefined, minWidth: 0, maxWidth: '100%' }}>{key === 'referral' ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}><View style={{ backgroundColor: '#FFE8E9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 }}><Text selectable style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>{value}</Text></View>{!!user.referralCode && <Pressable accessibilityRole="button" accessibilityLabel="Sao chép mã giới thiệu" onPress={onCopy} hitSlop={5} style={{ minWidth: 36, minHeight: 36, alignItems: 'center', justifyContent: 'center' }}><Copy size={17} color={colors.text} /></Pressable>}</View> : key === 'status' ? <View style={{ alignSelf: 'flex-start', backgroundColor: user.status === 1 ? '#DCF9DF' : '#F1F2F5', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>{user.status === 1 && <Check size={16} color="#16852B" />}<Text style={{ color: user.status === 1 ? '#16852B' : colors.muted, fontSize: 12, fontWeight: '700' }}>{value}</Text></View> : <Text selectable style={{ color: colors.text, fontSize: 13, lineHeight: 20, fontWeight: key === 'fullName' || key === 'nickname' ? '600' : '400' }}>{value}</Text>}</View>
      </View>
    </View>)}
  </View>;
}
