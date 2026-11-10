import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { MapPin, Plus } from 'lucide-react-native';
import type { Address } from '../../types/api';
import { colors } from '../../theme';
import { Status } from '../common/ui';
import { AddressCard } from './AddressCard';

type Props = { addresses: Address[]; loading?: boolean; error?: unknown; disabled?: boolean; pendingId?: string; pendingAction?: 'default' | 'delete'; retry?: () => void; onAdd: () => void; onEdit: (address: Address) => void; onDelete: (address: Address) => void; onDefault: (address: Address) => void };

export function AddressList({ addresses, loading, error, disabled, pendingId, pendingAction, retry, onAdd, onEdit, onDelete, onDefault }: Props) {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  return <View style={{ padding: width < 600 ? 16 : 28, gap: 26 }}>
    <View style={{ flexDirection: width < 600 ? 'column' : 'row', alignItems: width < 600 ? 'flex-start' : 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, flex: width < 600 ? undefined : 1, width: width < 600 ? '100%' : undefined, minWidth: 220 }}><View style={{ width: 54, height: 54, borderRadius: 15, backgroundColor: '#FFF0F2', alignItems: 'center', justifyContent: 'center' }}><MapPin size={27} color="#EE2D36" strokeWidth={1.9} aria-hidden /></View><View style={{ gap: 5, flex: 1 }}><Text accessibilityRole="header" style={{ color: '#202536', fontSize: 22, lineHeight: 29, fontWeight: '800', letterSpacing: -0.5 }}>Địa chỉ nhận hàng</Text><Text style={{ color: '#73798A', fontSize: 13, lineHeight: 20 }}>Quản lý các địa chỉ giao hàng của bạn</Text></View></View>
      <View style={{ paddingVertical: wide ? 0 : 3 }}><Pressable accessibilityRole="button" accessibilityLabel="Thêm địa chỉ" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onAdd} hitSlop={wide ? undefined : 3} style={({ pressed }) => ({ minHeight: wide ? 46 : 38, paddingHorizontal: wide ? 18 : 12, paddingVertical: wide ? 11 : 8, flexDirection: 'row', gap: wide ? 8 : 6, alignItems: 'center', justifyContent: 'center', borderRadius: wide ? 10 : 9, backgroundColor: '#DB252C', boxShadow: '0 4px 9px #D7242B20', opacity: disabled ? 0.5 : pressed ? 0.75 : 1 })}><Plus size={wide ? 20 : 17} color={colors.surface} strokeWidth={1.8} aria-hidden /><Text style={{ color: colors.surface, fontSize: wide ? 13 : 12, fontWeight: '600' }}>Thêm địa chỉ</Text></Pressable></View>
    </View>
    <Status error={error} retry={retry} />
    <View style={{ gap: 16 }}>
      {loading ? <View accessibilityRole="progressbar" accessibilityLabel="Đang tải địa chỉ" style={{ gap: 16 }}>{[0, 1].map(index => <View key={index} style={{ minHeight: 116, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#E8E8F0', borderRadius: 15, padding: 20, flexDirection: 'row', gap: 16 }}><View style={{ width: 46, height: 46, backgroundColor: '#F0F1F5', borderRadius: 12 }} /><View style={{ flex: 1, gap: 12 }}><View style={{ height: 15, width: '45%', backgroundColor: '#F0F1F5', borderRadius: 4 }} /><View style={{ height: 12, width: '25%', backgroundColor: '#F4F4F7', borderRadius: 4 }} /><View style={{ height: 12, width: '75%', backgroundColor: '#F4F4F7', borderRadius: 4 }} /></View></View>)}</View> : !addresses.length && !error ? <View style={{ alignItems: 'center', gap: 12, padding: 36, borderWidth: 1, borderColor: '#E8E8F0', borderRadius: 15, backgroundColor: colors.surface }}><MapPin size={36} color="#D82C33" aria-hidden /><Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>Chưa có địa chỉ nhận hàng</Text><Text style={{ color: '#73798A', fontSize: 13, lineHeight: 21, textAlign: 'center' }}>Thêm địa chỉ đầu tiên để thuận tiện hơn khi đặt hàng.</Text></View> : [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)).map(address => <AddressCard key={address.id} address={address} wide={wide} disabled={disabled} pending={address.id === pendingId ? pendingAction : undefined} onEdit={() => onEdit(address)} onDelete={() => onDelete(address)} onDefault={() => onDefault(address)} />)}
    </View>
  </View>;
}
