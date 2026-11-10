import { useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Button, Empty, Status } from '../common/ui';
import { request } from '../../services/api';
import { useAuth } from '../../stores/auth';
import type { Page } from '../../types/api';
import { dateTime, money, styles as s } from '../../theme';

type Commission = { id: string; orderCode: string; productName: string; rankName: string; commissionRate: number; baseAmount: number; commissionAmount: number; paidAmount: number; status: string; createdAt: string };
const labels: Record<string, string> = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', PAID: 'Đã thanh toán', REVERSED: 'Đã thu hồi' };

export function AffiliateCommissionHistory() {
  const [page, setPage] = useState(1);
  const user = useAuth(state => state.user);
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const query = useQuery({ queryKey: ['commissions', user?.id, page], queryFn: () => request<Page<Commission>>('GET', `/affiliate/commissions?page=${page}&pageSize=10`), enabled: !!user });
  if (!user) return null;
  return <View style={{ gap: 12 }}>
    <Text accessibilityRole="header" style={s.title}>Lịch sử hoa hồng</Text>
    <Status loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
    {query.data?.items.length === 0 && <Empty text="Chưa có hoa hồng. Chia sẻ link sản phẩm để bắt đầu." />}
    {wide && !!query.data?.items.length && <View style={[s.row, { paddingHorizontal: 14 }]}>{[['Đơn hàng / Sản phẩm', 2], ['Giá trị hợp lệ', 1], ['Hạng / Tỷ lệ', 1], ['Hoa hồng', 1], ['Trạng thái', 1]].map(([label, flex]) => <Text key={label} style={[s.small, { flex: Number(flex), fontWeight: '700' }]}>{label}</Text>)}</View>}
    {query.data?.items.map(item => <View key={item.id} style={[s.card, { flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', padding: 14 }]}>
      <View style={{ flex: wide ? 2 : undefined, minWidth: 0, gap: 4 }}><Text style={[s.body, { fontWeight: '700' }]}>{item.orderCode || 'Đơn hàng'}</Text><Text style={s.small}>{item.productName || 'Sản phẩm'}</Text><Text style={[s.small, { fontSize: 11 }]}>{dateTime(item.createdAt)}</Text></View>
      <Text style={[s.body, { flex: wide ? 1 : undefined }]}>{wide ? '' : 'Giá trị hợp lệ: '}{money(item.baseAmount)}</Text>
      <Text style={[s.small, { flex: wide ? 1 : undefined }]}>{item.rankName || '—'} · {(item.commissionRate * 100).toLocaleString('vi-VN')}%</Text>
      <View style={{ flex: wide ? 1 : undefined, gap: 4 }}><Text style={s.price}>{money(item.commissionAmount)}</Text>{item.paidAmount > 0 && item.status !== 'PAID' && <Text style={[s.small, { fontSize: 11 }]}>Đã chi: {money(item.paidAmount)}</Text>}</View>
      <Text style={[s.small, { flex: wide ? 1 : undefined, color: item.status === 'REVERSED' ? '#C33232' : item.status === 'PENDING' ? '#986409' : '#237847' }]}>{labels[item.status] ?? item.status}</Text>
    </View>)}
    {query.data && query.data.totalPages > 1 && <View style={s.between}><Button title="Trước" outline disabled={page === 1} onPress={() => setPage(value => value - 1)} /><Text style={s.small}>{page} / {query.data.totalPages}</Text><Button title="Sau" outline disabled={page >= query.data.totalPages} onPress={() => setPage(value => value + 1)} /></View>}
  </View>;
}
