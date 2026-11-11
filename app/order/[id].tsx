import { router, useLocalSearchParams } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LoginNotice, Page, Status } from '../../src/components/common/ui';
import { OrderDetailView } from '../../src/components/orders/OrderDetailView';
import { queryClient, useAuth } from '../../src/stores/auth';
import { request } from '../../src/services/api';
import type { Order } from '../../src/types/api';

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuth(state => state.user);
  const { width } = useWindowDimensions();
  const query = useQuery({ queryKey: ['order', user?.id, id], queryFn: () => request<Order>('GET', `/orders/${encodeURIComponent(id)}`), enabled: !!user && !!id });
  const cancel = useMutation({
    mutationFn: () => request('POST', `/orders/${encodeURIComponent(id)}/cancel`),
    onSuccess: async () => { await Promise.all([query.refetch(), ...['orders', 'membership', 'vouchers'].map(key => queryClient.invalidateQueries({ queryKey: [key] }))]); },
  });
  return <Page title="Chi tiết đơn hàng" back footerTab="member" bodyStyle={{ paddingHorizontal: width < 600 ? 16 : 24, paddingTop: width < 600 ? 16 : 12, paddingBottom: 24 }}>
    {!user ? <LoginNotice /> : <>
      <Status loading={query.isLoading} error={query.error || cancel.error} retry={() => { cancel.reset(); void query.refetch(); }} />
      {query.data && <OrderDetailView order={query.data} busy={cancel.isPending} refreshing={query.isFetching || !!query.error}
        onCancel={() => cancel.mutate()}
        onRefund={() => router.push({ pathname: '/refund/[id]', params: { id } })}
        onReview={item => router.push({ pathname: '/review/[id]', params: { id: item.id, name: item.productName } })}
        onStore={slug => router.push({ pathname: '/dai-ly/[slug]', params: { slug } })} />}
    </>}
  </Page>;
}