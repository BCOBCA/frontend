import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Button, Empty, LoginNotice, Page as PageView, Status } from '../src/components/common/ui';
import { request } from '../src/services/api';
import { useAuth } from '../src/stores/auth';
import type { OrderSummary, Page } from '../src/types/api';
import { money, dateTime, styles as s } from '../src/theme';
export const statusLabel: Record<string, string> = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', READY: 'Sẵn sàng giao', SHIPPING: 'Đang giao', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy', REFUNDED: 'Đã hoàn tiền' };
export default function Orders() {
  const { status } = useLocalSearchParams<{ status?: string }>();
  const user = useAuth(state => state.user); const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['orders', page, status], queryFn: () => request<Page<OrderSummary>>('GET', `/orders?page=${page}${status ? `&status=${encodeURIComponent(status)}` : ''}`), enabled: !!user });
  const items = query.data?.items;
  return <PageView title={status ? statusLabel[status] ?? 'Đơn hàng' : 'Đơn hàng của tôi'} back>{!user ? <LoginNotice /> : <View style={s.padded}><Status loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />{items?.length === 0 && <Empty text="Chưa có đơn hàng" />}{items?.map(order => <Pressable key={order.id} accessibilityRole="button" style={s.card} onPress={() => router.push({ pathname: '/order/[id]', params: { id: order.id } })}><Text style={s.title}>{order.orderCode}</Text><Text style={s.body}>{statusLabel[order.status]}</Text><Text style={s.small}>{dateTime(order.createdAt)}</Text><Text style={s.price}>{money(order.totalAmount)}</Text></Pressable>)}
    {query.data && query.data.totalPages > 1 && <View style={s.between}><Button title="Trước" disabled={page === 1} onPress={() => setPage(page - 1)} /><Text>{page}/{query.data.totalPages}</Text><Button title="Sau" disabled={page === query.data.totalPages} onPress={() => setPage(page + 1)} /></View>}
  </View>}</PageView>;
}
