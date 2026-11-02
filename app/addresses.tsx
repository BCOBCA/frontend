import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Empty, LoginNotice, Page, Status } from '../src/components/common/ui';
import { request } from '../src/services/api';
import { queryClient, useAuth } from '../src/stores/auth';
import type { Address } from '../src/types/api';
import { styles as s } from '../src/theme';
export default function Addresses() {
  const user = useAuth(state => state.user);
  const query = useQuery({ queryKey: ['addresses'], queryFn: () => request<Address[]>('GET', '/addresses'), enabled: !!user });
  const remove = useMutation({ mutationFn: (id: string) => request('DELETE', `/addresses/${id}`), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['addresses'] }) });
  return <Page title="Danh sách địa chỉ" back>{!user ? <LoginNotice /> : <View style={s.padded}><Status loading={query.isLoading} error={query.error || remove.error} retry={() => void query.refetch()} />{query.data?.length === 0 && <Empty text="Chưa có địa chỉ" />}{query.data?.map(address => <View key={address.id} style={s.card}><Text style={s.title}>{address.recipientName}</Text><Text style={s.body}>{address.phone}</Text><Text style={s.body}>{address.addressLine}, {address.wardCode}, {address.provinceCode}</Text>{address.isDefault && <Text style={s.small}>Địa chỉ mặc định</Text>}<View style={s.between}><Button title="Chỉnh sửa" outline onPress={() => router.push({ pathname: '/address/[id]', params: { id: address.id } })} /><Button title="Xóa" outline disabled={remove.isPending} onPress={() => remove.mutate(address.id)} /></View></View>)}<Button title="Thêm địa chỉ" onPress={() => router.push('/address/new')} /></View>}</Page>;
}
