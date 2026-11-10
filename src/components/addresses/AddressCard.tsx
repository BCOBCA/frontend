import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Building2, House, MapPin, PencilLine, Phone, Star, Trash2, type LucideIcon } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { listAddressProvinces, listAddressWards } from '../../services/address-locations';
import type { Address } from '../../types/api';
import { colors } from '../../theme';

type Props = { address: Address; wide: boolean; disabled?: boolean; pending?: 'default' | 'delete'; onEdit: () => void; onDelete: () => void; onDefault: () => void };

function CardAction({ title, label, Icon, danger, disabled, busy, compact, onPress }: { title: string; label: string; Icon: LucideIcon; danger?: boolean; disabled?: boolean; busy?: boolean; compact?: boolean; onPress: () => void }) {
  const color = danger ? '#D6242C' : '#3B4254';
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled, busy: !!busy }} disabled={disabled} onPress={onPress} hitSlop={compact ? 4 : undefined}
    style={({ pressed }) => ({ minHeight: compact ? 36 : 44, paddingHorizontal: compact ? 8 : 12, paddingVertical: compact ? 6 : 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: compact ? 5 : 7, borderWidth: 1, borderColor: danger ? '#FFD1D5' : '#E2E3EB', backgroundColor: danger ? '#FFFAFA' : 'transparent', borderRadius: compact ? 8 : 9, opacity: disabled && !busy ? 0.5 : pressed ? 0.65 : 1 })}>
    {busy ? <ActivityIndicator size="small" color={color} /> : <Icon size={compact ? 15 : 17} color={color} strokeWidth={1.7} aria-hidden />}
    <Text style={{ color, fontSize: 12, lineHeight: compact ? 16 : 18, fontWeight: '600' }}>{title}</Text>
  </Pressable>;
}

export function AddressCard({ address, wide, disabled, pending, onEdit, onDelete, onDefault }: Props) {
  const provinces = useQuery({ queryKey: ['address-provinces'], queryFn: listAddressProvinces, staleTime: 86400000 });
  const wards = useQuery({ queryKey: ['address-wards', address.provinceCode], queryFn: () => listAddressWards(address.provinceCode), enabled: /^\d{1,2}$/.test(address.provinceCode), staleTime: 86400000 });
  const province = provinces.data?.find(item => Number(item.code) === Number(address.provinceCode))?.name ?? address.provinceCode;
  const ward = wards.data?.find(item => Number(item.code) === Number(address.wardCode))?.name ?? address.wardCode;
  const location = [address.addressLine, ward, province].filter(Boolean).join(', ');
  const Icon = address.isDefault ? House : Building2;

  return <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', gap: 20, padding: wide ? 20 : 16, minHeight: 116, borderRadius: 15, borderWidth: 1, borderColor: address.isDefault ? '#FF656B' : '#E8E8F0', backgroundColor: address.isDefault ? '#FFF5F6' : colors.surface, boxShadow: '0 4px 12px #27294407' }}>
    <View style={{ flex: wide ? 1 : undefined, minWidth: 0, flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
      <View style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 12, backgroundColor: address.isDefault ? '#FFE3E6' : '#F0F1F5', alignItems: 'center', justifyContent: 'center' }}><Icon size={25} color={address.isDefault ? '#EE2D36' : '#6A7082'} strokeWidth={1.8} aria-hidden /></View>
      <View style={{ flex: 1, minWidth: 0, gap: 7 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}><Text accessibilityRole="header" aria-level={2} style={{ fontSize: 16, lineHeight: 23, fontWeight: '700', color: '#202536' }}>{address.recipientName}</Text>{address.isDefault && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: '#FFE1E4' }}><Star size={13} color="#D3232B" strokeWidth={1.8} aria-hidden /><Text style={{ color: '#C82028', fontSize: 11, lineHeight: 16, fontWeight: '600' }}>Mặc định</Text></View>}</View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Phone size={15} color="#777E8E" strokeWidth={1.7} aria-hidden /><Text style={{ fontSize: 13, lineHeight: 19, color: '#41495B', flexShrink: 1 }}>{address.phone}</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}><MapPin size={16} color="#777E8E" strokeWidth={1.7} aria-hidden /><Text style={{ flex: 1, fontSize: 13, lineHeight: 20, color: '#41495B' }}>{location}</Text></View>
      </View>
    </View>
    <View style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: wide ? 10 : 8, flexShrink: 0 }}>
      {!address.isDefault && <CardAction title="Đặt mặc định" label={`Đặt địa chỉ của ${address.recipientName} làm mặc định`} Icon={Star} compact={!wide} disabled={disabled} busy={pending === 'default'} onPress={onDefault} />}
      <CardAction title={wide ? 'Chỉnh sửa' : 'Sửa'} label={`Chỉnh sửa địa chỉ của ${address.recipientName}`} Icon={PencilLine} compact={!wide} disabled={disabled} onPress={onEdit} />
      <CardAction title="Xóa" label={`Xóa địa chỉ của ${address.recipientName}`} Icon={Trash2} compact={!wide} danger disabled={disabled} busy={pending === 'delete'} onPress={onDelete} />
    </View>
  </View>;
}
