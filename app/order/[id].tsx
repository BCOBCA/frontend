import { ReviewDialog } from '../../src/components/orders/ReviewDialog';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LoginNotice, Page, Status } from '../../src/components/common/ui';
import { OrderDetailView } from '../../src/components/orders/OrderDetailView';
import { CancelOrderForm } from '../../src/components/orders/CancelOrderForm';
import { buyerCancellationReason } from '../../src/services/order-cancellation';
import { queryClient, useAuth } from '../../src/stores/auth';
import { request, errorMessage } from '../../src/services/api';
import type { Order, OrderItem } from '../../src/types/api';

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuth(state => state.user);
  const { width } = useWindowDimensions();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<OrderItem | null>(null);
  const query = useQuery({ queryKey: ['order', user?.id, id], queryFn: () => request<Order>('GET', `/orders/${encodeURIComponent(id)}`), enabled: !!user && !!id });
  const cancel = useMutation({
    mutationFn: (reason: string) => request('POST', `/orders/${encodeURIComponent(id)}/cancel`, { reason: buyerCancellationReason(reason) }),
    onSuccess: async () => { setCancelOpen(false); await Promise.all([query.refetch(), ...['orders', 'membership', 'vouchers', 'notifications'].map(key => queryClient.invalidateQueries({ queryKey: [key] }))]); },
  });
  return <Page title="Chi tiết đơn hàng" back footerTab="member" bodyStyle={{ paddingHorizontal: width < 600 ? 16 : 24, paddingTop: width < 600 ? 16 : 12, paddingBottom: 24 }}>
    {!user ? <LoginNotice /> : <>
      {reviewingItem && query.data && <ReviewDialog key={`${user.id}/${id}`} items={query.data.items} initialItemId={reviewingItem.id} onDismiss={() => setReviewingItem(null)} />}
      <Status loading={query.isLoading} error={query.error || cancel.error} retry={() => { cancel.reset(); void query.refetch(); }} />
      {cancelOpen && query.data?.status === 'PENDING' && query.data.paymentStatus === 'UNPAID' && <CancelOrderForm key={`${user.id}/${id}`} busy={cancel.isPending || query.isFetching} error={cancel.error ? errorMessage(cancel.error) : undefined} onDismiss={() => { if (!cancel.isPending) setCancelOpen(false); }} onSubmit={reason => { if (!cancel.isPending && !query.isFetching) cancel.mutate(reason); }} />}
      {query.data && <OrderDetailView order={query.data} busy={cancel.isPending} refreshing={query.isFetching || !!query.error}
        onCancel={() => { if (!cancel.isPending && !query.isFetching) { cancel.reset(); setCancelOpen(true); } }}
        onRefund={() => router.push({ pathname: '/refund/[id]', params: { id } })}
        onReview={setReviewingItem}
        onStore={slug => router.push({ pathname: '/dai-ly/[slug]', params: { slug } })} />}
    </>}
  </Page>;
}
