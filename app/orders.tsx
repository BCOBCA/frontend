import { useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Empty, LoginNotice, Page as PageView, Status } from '../src/components/common/ui';
import { OrderListCard } from '../src/components/orders/OrderListCard';
import { errorMessage, request } from '../src/services/api';
import { orderStatusLabels } from '../src/services/order-detail';
import { queryClient, useAuth } from '../src/stores/auth';
import { useToast } from '../src/stores/toast';
import type { OrderSummary, Page } from '../src/types/api';
import { styles as s } from '../src/theme';
export const statusLabel = orderStatusLabels;
export default function Orders() {
  const { status, checkoutGroupId } = useLocalSearchParams<{ status?: string; checkoutGroupId?: string }>();
  const user = useAuth(state => state.user); const [page, setPage] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);
  const showToast = useToast(state => state.show);
  const query = useQuery({ queryKey: ['orders', user?.id, page, status, checkoutGroupId], queryFn: () => request<Page<OrderSummary>>('GET', `/orders?page=${page}${status ? `&status=${encodeURIComponent(status)}` : ''}${checkoutGroupId ? `&checkoutGroupId=${encodeURIComponent(checkoutGroupId)}` : ''}`), enabled: !!user });
  const cancel = useMutation({
    mutationFn: (id: string) => request('POST', `/orders/${encodeURIComponent(id)}/cancel`),
    onSuccess: async (_, id) => {
      await Promise.all([...['orders', 'membership', 'vouchers'].map(key => queryClient.invalidateQueries({ queryKey: [key] })), queryClient.invalidateQueries({ queryKey: ['order', user?.id, id] })]);
      showToast('Đã hủy đơn hàng.');
    },
    onError: error => showToast(errorMessage(error), 'error'),
  });
  const details = (id: string) => router.push({ pathname: '/order/[id]', params: { id } });
  const copy = async (order: OrderSummary) => {
    try { await Clipboard.setStringAsync(order.orderCode); setCopied(order.id); showToast('Đã sao chép mã đơn hàng.'); }
    catch { showToast('Chưa sao chép được mã đơn. Vui lòng thử lại.', 'error'); }
  };
  return <PageView title={checkoutGroupId ? 'Đơn hàng vừa đặt' : status ? statusLabel[status] ?? 'Đơn hàng' : 'Đơn hàng của tôi'} back footerTab="member">{!user ? <LoginNotice /> : <View style={s.padded}><Status loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />{query.data?.items.length === 0 && <Empty text="Chưa có đơn hàng" />}
    {query.data?.items.map(order => <OrderListCard key={order.id} order={order} busy={cancel.isPending && cancel.variables === order.id} copied={copied === order.id}
      onCopy={() => void copy(order)} onDetails={() => details(order.id)}
      onCancel={() => { if (!cancel.isPending && !query.isFetching) cancel.mutate(order.id); }}
      onReview={() => { const item = order.items?.length === 1 ? order.items[0] : null; if (item) router.push({ pathname: '/review/[id]', params: { id: item.id, name: item.productName } }); else details(order.id); }}
      onBuyAgain={() => { const productId = order.items?.[0]?.productId; if (productId) router.push({ pathname: '/product/[id]', params: { id: productId } }); else details(order.id); }}
      onStore={slug => router.push({ pathname: '/dai-ly/[slug]', params: { slug } })} />)}
    {query.data && query.data.totalPages > 1 && <View style={s.between}><Button title="Trước" disabled={page === 1} onPress={() => setPage(page - 1)} /><Text>{page}/{query.data.totalPages}</Text><Button title="Sau" disabled={page === query.data.totalPages} onPress={() => setPage(page + 1)} /></View>}
  </View>}</PageView>;
}
