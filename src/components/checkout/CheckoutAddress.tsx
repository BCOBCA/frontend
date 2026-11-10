import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { listAddressProvinces, listAddressWards } from '../../services/address-locations';
import type { Address } from '../../types/api';
import { colors } from '../../theme';

export function CheckoutAddress({ address }: { address: Address }) {
  const provinces = useQuery({ queryKey: ['address-provinces'], queryFn: listAddressProvinces, staleTime: 86400000 });
  const wards = useQuery({ queryKey: ['address-wards', address.provinceCode], queryFn: () => listAddressWards(address.provinceCode), enabled: /^\d{1,2}$/.test(address.provinceCode), staleTime: 86400000 });
  const province = provinces.data?.find(item => Number(item.code) === Number(address.provinceCode))?.name ?? address.provinceCode;
  const ward = wards.data?.find(item => Number(item.code) === Number(address.wardCode))?.name ?? address.wardCode;
  return <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 9 }}><Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{address.recipientName}</Text><Text style={{ color: colors.text, fontSize: 14 }}>· {address.phone}</Text></View>
    <Text style={{ color: '#636778', fontSize: 13, lineHeight: 20 }}>{[address.addressLine, ward, province].filter(Boolean).join(', ')}</Text>
  </View>;
}
