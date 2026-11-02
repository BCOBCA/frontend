import { useEffect } from 'react';
import { Switch, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Field, LoginNotice, Page, Status } from '../../src/components/common/ui';
import { request } from '../../src/services/api';
import { queryClient, useAuth } from '../../src/stores/auth';
import type { Address } from '../../src/types/api';
import { styles as s } from '../../src/theme';
const schema = z.object({ recipientName: z.string().min(2).max(150), phone: z.string().regex(/^\+?[0-9]{9,15}$/), provinceCode: z.string().min(1).max(20), wardCode: z.string().min(1).max(20), addressLine: z.string().min(3).max(1000), isDefault: z.boolean() });
export default function AddressEditor() {
  const { id } = useLocalSearchParams<{ id: string }>(); const user = useAuth(state => state.user); const isNew = id === 'new';
  const query = useQuery({ queryKey: ['addresses'], queryFn: () => request<Address[]>('GET', '/addresses'), enabled: !!user && !isNew });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { recipientName: user?.fullName ?? '', phone: user?.phone ?? '', provinceCode: '', wardCode: '', addressLine: '', isDefault: false } });
  useEffect(() => { const address = query.data?.find(item => item.id === id); if (address) form.reset(address); }, [query.data, id, form]);
  const save = useMutation({ mutationFn: (values: z.infer<typeof schema>) => request(isNew ? 'POST' : 'PUT', isNew ? '/addresses' : `/addresses/${id}`, values), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['addresses'] }); router.back(); } });
  const labels = { recipientName: 'Tên người nhận', phone: 'Số điện thoại', provinceCode: 'Mã tỉnh/thành phố', wardCode: 'Mã phường/xã', addressLine: 'Địa chỉ chi tiết' };
  return <Page title={isNew ? 'Thêm địa chỉ' : 'Sửa địa chỉ'} back>{!user ? <LoginNotice /> : <View style={s.padded}><Status loading={!isNew && query.isLoading} error={query.error || save.error} retry={() => void query.refetch()} />{(Object.keys(labels) as (keyof typeof labels)[]).map(name => <Controller key={name} name={name} control={form.control} render={({ field }) => <Field label={labels[name]} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={form.formState.errors[name]?.message} />} />)}<Controller name="isDefault" control={form.control} render={({ field }) => <View style={s.between}><Text style={s.body}>Đặt làm địa chỉ mặc định</Text><Switch accessibilityLabel="Địa chỉ mặc định" value={field.value} onValueChange={field.onChange} /></View>} /><Button title="Lưu địa chỉ" disabled={save.isPending || !isNew && (query.isLoading || !query.data?.some(x => x.id === id))} onPress={() => void form.handleSubmit(values => save.mutate(values))()} /></View>}</Page>;
}
