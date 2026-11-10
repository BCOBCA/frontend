import { ActivityIndicator, Pressable, Switch, Text, View, useWindowDimensions } from 'react-native';
import { ArrowLeft, Building2, House, MapPin, Phone, Save, Star, UserRound } from 'lucide-react-native';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { listAddressProvinces, listAddressWards } from '../../services/address-locations';
import { colors } from '../../theme';
import { Status } from '../common/ui';
import { AddressField } from './AddressField';
import { AddressIntro } from './AddressIntro';
import { AddressLocationSelect } from './AddressLocationSelect';
import type { AddressValues } from './address-data';

type Props = { form: UseFormReturn<AddressValues>; isNew: boolean; loading?: boolean; busy?: boolean; locked?: boolean; error?: unknown; onRetry?: () => void; onCancel: () => void; onSubmit: () => void };

export function AddressForm({ form, isNew, loading, busy, locked, error, onRetry, onCancel, onSubmit }: Props) {
  const { width } = useWindowDimensions();
  const wide = width >= 800;
  const columns = width >= 600;
  const disabled = !!(busy || locked || loading);
  const provinceCode = form.watch('provinceCode');
  const provinces = useQuery({ queryKey: ['address-provinces'], queryFn: listAddressProvinces, staleTime: 86400000 });
  const wards = useQuery({ queryKey: ['address-wards', provinceCode], queryFn: () => listAddressWards(provinceCode), enabled: !!provinceCode, staleTime: 86400000 });
  return <View style={{ padding: width < 600 ? 16 : 28, paddingBottom: 32, gap: 24, overflow: 'hidden' }}>
    {!isNew && <><View pointerEvents="none" style={{ position: 'absolute', width: 220, height: 100, top: -68, right: -40, borderRadius: 90, backgroundColor: '#FAEDEF', transform: [{ rotate: '-28deg' }] }} />
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" disabled={!!busy} onPress={onCancel} style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: '#EEEEF4', justifyContent: 'center', alignItems: 'center', boxShadow: '0 3px 10px #24283E06', opacity: pressed ? 0.7 : 1 })}><ArrowLeft size={22} color="#D72128" /></Pressable>
      <Text accessibilityRole="header" style={{ flex: 1, color: '#171D2C', fontSize: width < 600 ? 20 : 24, lineHeight: 30, fontWeight: '800', letterSpacing: -0.5 }}>Chỉnh sửa địa chỉ nhận hàng</Text>
    </View></>}
    <View style={{ flexDirection: wide ? 'row' : 'column', backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: '#EBEAF0', overflow: 'hidden', boxShadow: '0 8px 28px #27294408' }}>
      <AddressIntro compact={!wide} />
      <View style={{ flex: 1, minWidth: 0, padding: width < 600 ? 20 : 28, gap: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><MapPin size={24} color="#D72128" fill="#D72128" stroke={colors.surface} strokeWidth={1.3} /><Text accessibilityRole="header" aria-level={2} style={{ color: '#171D2C', fontSize: 18, lineHeight: 24, fontWeight: '700' }}>Thông tin địa chỉ</Text>{loading && <ActivityIndicator size="small" color={colors.primary} accessibilityLabel="Đang tải địa chỉ" />}</View>
        <Controller name="recipientName" control={form.control} render={({ field, fieldState }) => <AddressField label="Họ và tên người nhận" Icon={UserRound} placeholder="Nhập họ và tên người nhận" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} editable={!disabled} autoCapitalize="words" autoComplete="name" maxLength={150} error={fieldState.error?.message} />} />
        <Controller name="phone" control={form.control} render={({ field, fieldState }) => <AddressField label="Số điện thoại" Icon={Phone} placeholder="Nhập số điện thoại liên hệ" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} editable={!disabled} keyboardType="phone-pad" autoComplete="tel" maxLength={16} error={fieldState.error?.message} />} />
        <View style={{ flexDirection: columns ? 'row' : 'column', gap: 20 }}>
          <View style={{ flex: 1, minWidth: 0 }}><Controller name="provinceCode" control={form.control} render={({ field, fieldState }) => <AddressLocationSelect label="Tỉnh/Thành phố" placeholder="Chọn Tỉnh/Thành phố" Icon={Building2} value={field.value} options={provinces.data ?? []} disabled={disabled} loading={provinces.isLoading} failed={provinces.isError} retry={() => void provinces.refetch()} error={fieldState.error?.message} onChange={code => { if (Number(code) !== Number(field.value)) { form.setValue('wardCode', '', { shouldDirty: true }); form.clearErrors('wardCode'); } field.onChange(code); field.onBlur(); }} />} /></View>
          <View style={{ flex: 1, minWidth: 0 }}><Controller name="wardCode" control={form.control} render={({ field, fieldState }) => <AddressLocationSelect label="Phường/Xã" placeholder={provinceCode ? 'Chọn Phường/Xã' : 'Chọn tỉnh/thành phố trước'} Icon={MapPin} value={field.value} options={wards.data ?? []} disabled={disabled || !provinceCode} loading={wards.isLoading && !!provinceCode} failed={wards.isError} retry={() => void wards.refetch()} error={fieldState.error?.message} onChange={code => { field.onChange(code); field.onBlur(); }} />} /></View>
        </View>
        <Controller name="addressLine" control={form.control} render={({ field, fieldState }) => <AddressField label="Địa chỉ chi tiết" Icon={House} placeholder="Số nhà, tên đường, khu phố, ấp,..." value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} editable={!disabled} multiline maxLength={1000} error={fieldState.error?.message} />} />
        <Controller name="isDefault" control={form.control} render={({ field }) => <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 }}>
          <View style={{ width: 40, height: 40, backgroundColor: '#FFF0F1', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><Star size={20} color="#D72128" strokeWidth={1.8} /></View>
          <View style={{ flex: 1, gap: 3 }}><Text style={{ fontSize: 13, lineHeight: 19, color: colors.text, fontWeight: '600' }}>Đặt làm địa chỉ mặc định</Text><Text style={{ fontSize: 12, lineHeight: 18, color: '#777C8E' }}>Địa chỉ này sẽ được chọn sẵn khi đặt hàng</Text></View>
          <Switch accessibilityLabel="Đặt làm địa chỉ mặc định" value={field.value} disabled={disabled} onValueChange={field.onChange} trackColor={{ false: '#CCCdd5', true: '#DA282D' }} thumbColor={colors.surface} />
        </View>} />
        <Status error={error} retry={onRetry} />
        <View style={{ borderTopWidth: 1, borderTopColor: '#F0EFF3', paddingTop: 18, flexDirection: 'row', gap: 12 }}>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!busy }} disabled={!!busy} onPress={onCancel} style={({ pressed }) => ({ flex: 0.8, minHeight: 46, borderRadius: 10, borderWidth: 1, borderColor: '#E42B30', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, opacity: busy ? 0.5 : pressed ? 0.7 : 1 })}><Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Hủy</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityState={{ disabled, busy: !!busy }} disabled={disabled} onPress={onSubmit} style={({ pressed }) => ({ flex: 1.3, minHeight: 46, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: disabled ? '#D8D9E0' : '#D72128', flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}>{busy ? <ActivityIndicator size="small" color={colors.surface} /> : <Save size={18} color={disabled ? '#737787' : colors.surface} strokeWidth={1.8} aria-hidden />}<Text style={{ fontSize: 14, lineHeight: 20, fontWeight: '700', color: disabled && !busy ? '#737787' : colors.surface }}>{busy ? 'Đang lưu...' : 'Lưu địa chỉ'}</Text></Pressable>
        </View>
      </View>
    </View>
  </View>;
}
