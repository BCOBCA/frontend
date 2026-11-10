import { Text, View } from 'react-native';
import { ShieldCheck, Truck, Zap } from 'lucide-react-native';
import { colors } from '../../theme';
import { AddressIllustration } from './AddressIllustration';

export function AddressIntro({ compact }: { compact: boolean }) {
  return <View style={{ width: compact ? '100%' : 294, padding: compact ? 22 : 26, paddingTop: compact ? 12 : 24, backgroundColor: '#FDFCFE', borderRightWidth: compact ? 0 : 1, borderBottomWidth: compact ? 1 : 0, borderColor: '#F0EDF1', gap: 22 }}>
    <View style={{ height: compact ? 148 : 220, width: compact ? 200 : '100%', alignSelf: 'center' }}><AddressIllustration /></View>
    <View style={{ gap: 8 }}><Text accessibilityRole="header" aria-level={2} style={{ fontSize: 23, lineHeight: 29, fontWeight: '800', letterSpacing: -0.5, color: colors.text }}>Địa chỉ nhận hàng</Text><Text style={{ fontSize: 14, lineHeight: 22, color: '#666977' }}>Thêm địa chỉ để nhận hàng nhanh chóng và chính xác hơn.</Text></View>
    {!compact && <View style={{ gap: 16 }}>{[
      { Icon: Truck, label: 'Giao hàng đúng địa chỉ' },
      { Icon: ShieldCheck, label: 'An toàn, bảo mật thông tin' },
      { Icon: Zap, label: 'Hỗ trợ nhiều địa chỉ' },
    ].map(({ Icon, label }) => <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: '#FDECEE', justifyContent: 'center', alignItems: 'center' }}><Icon size={21} color="#DA262B" strokeWidth={1.7} /></View><Text style={{ flex: 1, fontSize: 13, lineHeight: 19, color: colors.text }}>{label}</Text></View>)}</View>}
  </View>;
}
