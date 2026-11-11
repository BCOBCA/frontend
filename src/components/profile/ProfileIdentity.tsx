import { Image } from 'expo-image';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CalendarDays, Camera, LockKeyhole, MonitorSmartphone, ShieldCheck, UserRound } from 'lucide-react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import type { Profile } from '../../types/api';
import { colors } from '../../theme';
import { profileDate } from './profile-data';

function ScenicCover() {
  return <Svg width="100%" height="100%" viewBox="0 0 400 190" preserveAspectRatio="xMidYMid slice">
    <Defs><LinearGradient id="profile-sky" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#9B72AE" /><Stop offset=".52" stopColor="#EDA3B3" /><Stop offset="1" stopColor="#F7C28E" /></LinearGradient></Defs>
    <Rect width="400" height="190" fill="url(#profile-sky)" /><Circle cx="306" cy="96" r="24" fill="#FFE0B2" opacity=".7" />
    <Path d="M0 115 L55 78 L101 110 L166 68 L218 111 L274 82 L333 113 L400 65 V190 H0Z" fill="#6D718F" opacity=".65" />
    <Path d="M0 135 L68 102 L127 131 L193 98 L263 136 L342 97 L400 119 V190 H0Z" fill="#3D566A" />
    <Path d="M0 163 Q91 130 191 163 Q299 198 400 124 V190 H0Z" fill="#213D45" />
  </Svg>;
}
export function ProfileIdentity({ user, tab, onTab, onImage, imageBusy, compact = false }: { user: Profile; tab: 'info' | 'verification'; onTab: (tab: 'info' | 'verification') => void; onImage: (kind: 'avatar' | 'cover') => void; imageBusy: boolean; compact?: boolean }) {
  const menus = [
    { label: 'Thông tin cá nhân', Icon: UserRound, selected: tab === 'info', action: () => onTab('info') },
    { label: 'Xác minh số điện thoại', Icon: ShieldCheck, selected: tab === 'verification', action: () => onTab('verification') },
    { label: 'Đổi mật khẩu', Icon: LockKeyhole, action: () => router.push('/change-password') },
    { label: 'Thiết bị đăng nhập', Icon: MonitorSmartphone, action: () => router.push('/sessions') },
  ];
  const navigation = menus.map(({ label, Icon, selected, action }) => <Pressable key={label} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: !!selected }} onPress={action} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 46, paddingHorizontal: 11, borderRadius: 9, backgroundColor: selected ? '#FFE7E9' : pressed ? '#F5F6F8' : 'transparent' })}><Icon size={20} strokeWidth={1.7} color={selected ? colors.primary : colors.text} /><Text numberOfLines={1} style={{ fontSize: 12, lineHeight: 18, fontWeight: '600', color: selected ? colors.primary : colors.text, flex: compact ? undefined : 1 }}>{label}</Text></Pressable>);
  return <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', boxShadow: '0 5px 22px #20283C08' }}>
    <View style={{ height: 156, overflow: 'hidden', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
      {user.coverUrl ? <Image source={{ uri: user.coverUrl }} contentFit="cover" accessibilityLabel="Ảnh bìa cá nhân" style={{ width: '100%', height: '100%' }} /> : <ScenicCover />}
      <Pressable accessibilityRole="button" accessibilityLabel="Thay đổi ảnh bìa" disabled={imageBusy} onPress={() => onImage('cover')} style={{ position: 'absolute', top: 12, right: 12, minHeight: 32, paddingHorizontal: 10, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#32263588', opacity: imageBusy ? 0.5 : 1 }}><Camera size={13} color="white" /><Text style={{ color: 'white', fontSize: 11, fontWeight: '600' }}>Thay đổi ảnh bìa</Text></Pressable>
    </View>
    <View style={{ alignItems: 'center', paddingHorizontal: 14, paddingBottom: 20, gap: 10, marginTop: -58 }}>
      <View style={{ width: 116, height: 116 }}><View style={{ width: 116, height: 116, borderWidth: 4, borderColor: 'white', borderRadius: 58, overflow: 'hidden', backgroundColor: '#F0F2F6', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 12px #20283C12' }}>{user.avatarUrl ? <Image source={{ uri: user.avatarUrl }} contentFit="cover" accessibilityLabel="Ảnh đại diện" style={{ width: '100%', height: '100%' }} /> : <UserRound size={48} strokeWidth={1.3} color="#8A91A0" />}</View><Pressable accessibilityRole="button" accessibilityLabel="Thay đổi ảnh đại diện" disabled={imageBusy} onPress={() => onImage('avatar')} hitSlop={8} style={{ position: 'absolute', right: 0, bottom: 1, width: 32, height: 32, borderRadius: 16, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px #20283C18', opacity: imageBusy ? 0.5 : 1 }}><Camera size={16} color={colors.text} /></Pressable></View>
      <Text style={{ fontSize: 18, lineHeight: 25, fontWeight: '700', color: colors.text, textAlign: 'center' }}>{user.nickname || user.fullName}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0F1F4', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18 }}><CalendarDays size={13} color={colors.muted} /><Text style={{ fontSize: 11, color: '#5E626C' }}>{user.createdAt ? `Thành viên từ ${profileDate(user.createdAt)}` : 'Thông tin thành viên'}</Text></View>
    </View>
    <View style={{ padding: 12, paddingTop: 16, borderTopWidth: 1, borderColor: '#F2F3F6', gap: 3 }}>
      {compact ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>{navigation}</ScrollView> : navigation}
    </View>
  </View>;
}
