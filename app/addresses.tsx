import { router } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LoginNotice, Page } from '../src/components/common/ui';
import { AddressList } from '../src/components/addresses/AddressList';
import { setDefaultAddress } from '../src/services/addresses';
import { request } from '../src/services/api';
import { queryClient, useAuth } from '../src/stores/auth';
import type { Address } from '../src/types/api';
export default function Addresses() {
  const user = useAuth(state => state.user);
  const query = useQuery({ queryKey: ['addresses'], queryFn: () => request<Address[]>('GET', '/addresses'), enabled: !!user });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['addresses'] });
  const remove = useMutation({ mutationFn: (id: string) => request('DELETE', `/addresses/${encodeURIComponent(id)}`), onSuccess: refresh });
  const makeDefault = useMutation({ mutationFn: setDefaultAddress, onSuccess: refresh });
  const disabled = remove.isPending || makeDefault.isPending;
  return <Page title="Địa chỉ nhận hàng" back footerTab="member">{!user ? <LoginNotice /> : <AddressList addresses={query.data ?? []} loading={query.isLoading} error={query.error || remove.error || makeDefault.error} disabled={disabled} pendingId={remove.isPending ? remove.variables : makeDefault.isPending ? makeDefault.variables?.id : undefined} pendingAction={remove.isPending ? 'delete' : makeDefault.isPending ? 'default' : undefined} retry={query.isError ? () => void query.refetch() : undefined} onAdd={() => router.push('/address/new')} onEdit={address => router.push({ pathname: '/address/[id]', params: { id: address.id } })} onDelete={address => { makeDefault.reset(); remove.mutate(address.id); }} onDefault={address => { remove.reset(); makeDefault.mutate(address); }} />}</Page>;
}
