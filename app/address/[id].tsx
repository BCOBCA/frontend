import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginNotice, Page } from '../../src/components/common/ui';
import { AddressForm } from '../../src/components/addresses/AddressForm';
import { addressDefaults, addressSchema, type AddressValues } from '../../src/components/addresses/address-data';
import { request } from '../../src/services/api';
import { queryClient, useAuth } from '../../src/stores/auth';
import type { Address } from '../../src/types/api';
export default function AddressEditor() {
  const { id } = useLocalSearchParams<{ id: string }>(); const user = useAuth(state => state.user); const isNew = id === 'new';
  const query = useQuery({ queryKey: ['addresses'], queryFn: () => request<Address[]>('GET', '/addresses'), enabled: !!user && !isNew });
  const form = useForm<AddressValues>({ resolver: zodResolver(addressSchema), defaultValues: addressDefaults(user) });
  useEffect(() => { const address = query.data?.find(item => item.id === id); if (address) form.reset(address); }, [query.data, id, form]);
  const cancel = () => router.canGoBack() ? router.back() : router.replace('/addresses');
  const save = useMutation({ mutationFn: (values: AddressValues) => request(isNew ? 'POST' : 'PUT', isNew ? '/addresses' : `/addresses/${id}`, values), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['addresses'] }); cancel(); } });
  const missing = !isNew && query.isSuccess && !query.data.some(item => item.id === id);
  return <Page title={isNew ? 'Thêm địa chỉ nhận hàng' : 'Chỉnh sửa địa chỉ nhận hàng'} back footerTab="member">{!user ? <LoginNotice /> : <AddressForm form={form} isNew={isNew} loading={!isNew && query.isLoading} locked={!isNew && !query.data?.some(item => item.id === id)} busy={save.isPending} error={query.error || save.error || (missing ? new Error('Không tìm thấy địa chỉ. Vui lòng quay lại danh sách.') : null)} onRetry={query.isError ? () => void query.refetch() : undefined} onCancel={cancel} onSubmit={() => void form.handleSubmit(values => save.mutate(values))()} />}</Page>;
}
