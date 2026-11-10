import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, LoginNotice, Page, Status } from '../../src/components/common/ui';
import { queryClient, useAuth } from '../../src/stores/auth';
import { request } from '../../src/services/api';
import type { Order } from '../../src/types/api';
import { money, dateTime, styles as s } from '../../src/theme';
import { statusLabel } from '../orders';
export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(); const user = useAuth(state => state.user);
  const query = useQuery({ queryKey: ['order', id], queryFn: () => request<Order>('GET', `/orders/${id}`), enabled: !!user });
  const cancel = useMutation({ mutationFn: () => request('POST', `/orders/${id}/cancel`), onSuccess: () => { void query.refetch(); void queryClient.invalidateQueries({ queryKey: ['orders'] }); void queryClient.invalidateQueries({ queryKey: ['membership'] }); } });
  return <Page title="Chi tiết đơn hàng" back>{!user ? <LoginNotice /> : <View style={s.padded}><Status loading={query.isLoading} error={query.error || cancel.error} retry={() => void query.refetch()} />{query.data && <>
    <View style={s.card}><Text style={s.title}>{query.data.orderCode}</Text><Text style={s.body}>{statusLabel[query.data.status]}</Text><Text style={s.small}>{dateTime(query.data.createdAt)}</Text><Text style={s.body}>{query.data.recipientName} · {query.data.recipientPhone}</Text><Text style={s.body}>{query.data.shippingAddress}</Text></View>
    {query.data.items.map(item => <View key={item.id} style={s.card}><Text style={s.body}>{item.productName}</Text><Text style={s.small}>{item.quantity} × {money(item.unitPrice)}</Text><Text style={s.price}>{money(item.totalPrice)}</Text>{(query.data!.status === 'COMPLETED' || query.data!.status === 'REFUNDED') && <Button title="Đánh giá" outline onPress={() => router.push({ pathname: '/review/[id]', params: { id: item.id, name: item.productName } })} />}</View>)}
    <View style={s.card}><Text style={s.body}>Tiền hàng: {money(query.data.subtotal)}</Text><Text style={s.body}>Giảm tiền hàng: {money(query.data.discountAmount)}</Text><Text style={s.body}>Phí giao hàng: {money(query.data.shippingFee)}</Text>{!!query.data.shippingDiscountAmount && <Text style={s.body}>Giảm phí vận chuyển: -{money(query.data.shippingDiscountAmount)}</Text>}<Text style={s.price}>Tổng tiền: {money(query.data.totalAmount)}</Text><Text style={s.small}>{query.data.paymentStatus === 'REFUNDED' ? 'Đã hoàn tiền' : query.data.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Text></View>
    {!!query.data.shipments?.length && <View style={s.card}><Text style={s.title}>Vận chuyển</Text>{query.data.shipments.map(shipment => <View key={shipment.id} style={{ gap: 6 }}><Text style={s.body}>{shipment.carrier} · {shipment.trackingCode}</Text><Text style={s.small}>{shipment.status === 'DELIVERED' ? 'Đã giao hàng' : shipment.status === 'CANCELLED' ? 'Đã hủy vận đơn' : 'Đang giao'}</Text></View>)}</View>}
    {!!query.data.history?.length && <View style={s.card}><Text style={s.title}>Lịch sử đơn hàng</Text>{query.data.history.map((entry, index) => <View key={`${entry.createdAt}-${index}`} style={{ gap: 6 }}><Text style={s.body}>{statusLabel[entry.newStatus] ?? entry.newStatus}</Text><Text style={s.small}>{dateTime(entry.createdAt)}{entry.note ? ` · ${entry.note}` : ''}</Text></View>)}</View>}
    {query.data.status === 'PENDING' && <Button title="Hủy đơn hàng" outline disabled={cancel.isPending} onPress={() => cancel.mutate()} />}
    {query.data.status === 'COMPLETED' && query.data.paymentStatus === 'PAID' && <Button title="Yêu cầu hoàn tiền" outline onPress={() => router.push({ pathname: '/refund/[id]', params: { id } })} />}
    <Button title="Lịch sử hoàn tiền" outline onPress={() => router.push('/refunds')} />
  </>}</View>}</Page>;
}
