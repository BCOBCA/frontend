import { Pressable, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { listAddressProvinces, listAddressWards } from '../../services/address-locations';
import { parseOrderAddress } from '../../services/order-detail';
import { colors } from '../../theme';

export function OrderShippingAddress({ value }: { value: string }) {
  const address = parseOrderAddress(value);
  const provinces = useQuery({ queryKey: ['address-provinces'], queryFn: listAddressProvinces, enabled: !!address, staleTime: 86400000 });
  const wards = useQuery({ queryKey: ['address-wards', address?.provinceCode], queryFn: () => listAddressWards(address!.provinceCode), enabled: !!address, staleTime: 86400000 });
  const province = address && provinces.data?.find(item => Number(item.code) === Number(address.provinceCode))?.name;
  const ward = address && wards.data?.find(item => Number(item.code) === Number(address.wardCode))?.name;
  const loading = provinces.isPending || wards.isPending;
  return <View style={{ gap: 4 }}>
    <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>{address ? [address.addressLine, ward, province].filter(Boolean).join(', ') : value}</Text>
    {address && (!province || !ward) && (loading ? <Text style={{ color: colors.muted, fontSize: 12 }}>Đang tải phường/xã, tỉnh/thành…</Text> : <Pressable accessibilityRole="button" accessibilityLabel="Thử tải lại tên địa chỉ nhận hàng" onPress={() => { void provinces.refetch(); void wards.refetch(); }} style={{ minHeight: 36, justifyContent: 'center', alignSelf: 'flex-start' }}><Text style={{ color: colors.primary, fontSize: 12 }}>Chưa tải được tên địa chỉ. Thử lại</Text></Pressable>)}
  </View>;
}
