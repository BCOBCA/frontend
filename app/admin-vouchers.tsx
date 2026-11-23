import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react-native';
import { Button, Field, LoginNotice, Page, Status } from '../src/components/common/ui';
import { OfferCard } from '../src/components/promotions/OfferCard';
import { gridItemWidth } from '../src/components/common/grid-layout';
import { request } from '../src/services/api';
import { queryClient, useAuth } from '../src/stores/auth';
import { colors, dateTime, money, styles as s } from '../src/theme';
import { managedVoucherAction, managedVoucherStatus, type ManagedVoucherList, type ManagedVoucherDetail } from '../src/types/managed-voucher';

export default function AdminVouchers() {
  const user = useAuth(state => state.user);
  const allowed = user?.roles.some(role => role === 'Admin' || role === 'SuperAdmin');
  return <Page title="Quản lý khuyến mãi" back footerTab="member">{!user ? <LoginNotice /> : !allowed ? <Text style={[s.error, { padding: 20 }]}>Bạn không có quyền quản lý khuyến mãi.</Text> : <Management key={user.id} account={user.id} />}</Page>;
}
function Management({ account }: { account: string }) {
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState(''), [status, setStatus] = useState('ALL'), [store, setStore] = useState(''), [page, setPage] = useState(1);
  const [from, setFrom] = useState(''), [to, setTo] = useState(''), [selected, setSelected] = useState<string | null>(null), [gridWidth, setGridWidth] = useState(0);
  const fromTime = from ? Date.parse(`${from}T00:00:00+07:00`) : undefined, toTime = to ? Date.parse(`${to}T23:59:59+07:00`) : undefined;
  const invalidDates = !!(from && (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !Number.isFinite(fromTime)) || to && (!/^\d{4}-\d{2}-\d{2}$/.test(to) || !Number.isFinite(toTime)) || fromTime != null && toTime != null && fromTime > toTime);
  const stores = useQuery({ queryKey: ['admin-voucher-stores', account], queryFn: () => request<{ id: string; name: string }[]>('GET', '/admin/vouchers/stores') });
  const list = useQuery({ queryKey: ['admin-vouchers', account, search, status, store, page, from, to], enabled: !invalidDates,
    queryFn: () => request<ManagedVoucherList>('GET', `/admin/vouchers?page=${page}&pageSize=20&search=${encodeURIComponent(search.trim())}&status=${status}${store ? `&storeId=${encodeURIComponent(store)}` : ''}${fromTime != null ? `&from=${encodeURIComponent(new Date(fromTime).toISOString())}` : ''}${toTime != null ? `&to=${encodeURIComponent(new Date(toTime).toISOString())}` : ''}`) });
  const cardWidth = gridItemWidth(gridWidth || Math.min(width, 1180) - 24, width >= 1000 ? 4 : width >= 700 ? 3 : 2, 12);
  return <View style={{ padding: 12, gap: 16 }}>
    <Text style={s.title}>Giám sát voucher toàn hệ thống</Text>
    <View style={[s.row, { flexWrap: 'wrap' }]}>{[['Đang diễn ra', list.data?.statistics.active], ['Sắp diễn ra', list.data?.statistics.upcoming], ['Lượt sử dụng', list.data?.statistics.used]].map(([label, value]) => <Text key={label} style={s.body}>{label}: {value ?? '—'}</Text>)}</View>
    <Field label="Tìm tên/mã voucher hoặc tên Shop" value={search} onChangeText={value => { setSearch(value); setPage(1); }} />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{[['ALL', 'Tất cả'], ...Object.entries(managedVoucherStatus)].map(([id, label]) => <Pressable key={id} accessibilityRole="button" accessibilityState={{ selected: status === id }} onPress={() => { setStatus(id); setPage(1); }} style={{ padding: 12, minHeight: 44, borderRadius: 8, backgroundColor: status === id ? '#FCE1E3' : colors.surface }}><Text style={s.body}>{label}</Text></Pressable>)}</ScrollView>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}><Button title="Mọi Shop" outline={!!store} onPress={() => { setStore(''); setPage(1); }} />{stores.data?.map(shop => <Button key={shop.id} title={shop.name} outline={store !== shop.id} onPress={() => { setStore(shop.id); setPage(1); }} />)}</ScrollView>
    <View style={[s.row, { flexWrap: 'wrap' }]}><View style={{ flex: 1, minWidth: 140 }}><Field label="Từ ngày (YYYY-MM-DD)" value={from} onChangeText={value => { setFrom(value); setPage(1); }} /></View><View style={{ flex: 1, minWidth: 140 }}><Field label="Đến ngày (YYYY-MM-DD)" value={to} onChangeText={value => { setTo(value); setPage(1); }} /></View></View>
    {invalidDates && <Text style={s.error}>Khoảng ngày không hợp lệ.</Text>}
    <Status loading={!invalidDates && list.isLoading} error={list.error || stores.error} retry={() => { void list.refetch(); void stores.refetch(); }} />
    {!list.isLoading && !list.error && !invalidDates && !list.data?.vouchers.items.length && <Text style={s.small}>Không có voucher phù hợp.</Text>}
    <View onLayout={event => setGridWidth(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{list.data?.vouchers.items.map(v => <View key={v.id} style={{ width: cardWidth, gap: 6 }}>
      <OfferCard voucher={{ ...v, claimed: true }} owned width={cardWidth} busy={false} onClaim={() => setSelected(v.id)} onDetails={() => setSelected(v.id)} />
      <Text style={s.small}>{managedVoucherStatus[v.status]} · {v.usedCount}/{v.usageLimit ?? '∞'} lượt · {v.storeId ? 'Voucher Shop' : 'Voucher nền tảng'}</Text>
    </View>)}</View>
    {(list.data?.vouchers.totalPages ?? 0) > 1 && <View style={s.between}><Button title="Trước" outline disabled={page === 1} onPress={() => setPage(p => p - 1)} /><Text style={s.body}>{page}/{list.data?.vouchers.totalPages}</Text><Button title="Sau" outline disabled={page >= (list.data?.vouchers.totalPages ?? 1)} onPress={() => setPage(p => p + 1)} /></View>}
    {selected && <AdminVoucherDetail key={selected} id={selected} account={account} onClose={() => setSelected(null)} />}
  </View>;
}
function AdminVoucherDetail({ id, account, onClose }: { id: string; account: string; onClose: () => void }) {
  const [page, setPage] = useState(1), [confirm, setConfirm] = useState(false), [reason, setReason] = useState('');
  const detail = useQuery({ queryKey: ['admin-voucher-detail', account, id, page], queryFn: () => request<ManagedVoucherDetail>('GET', `/admin/vouchers/${encodeURIComponent(id)}?page=${page}`) });
  const disable = useMutation({ mutationFn: () => request('POST', `/admin/vouchers/${encodeURIComponent(id)}/disable`, { reason: reason.trim() }), onSuccess: async () => { setConfirm(false); await Promise.all([queryClient.invalidateQueries({ queryKey: ['admin-vouchers'] }), queryClient.invalidateQueries({ queryKey: ['admin-voucher-detail', account, id] }), queryClient.invalidateQueries({ queryKey: ['vouchers'] })]); } });
  const v = detail.data?.voucher;
  return <Modal transparent visible animationType="fade" onRequestClose={() => { if (!disable.isPending) onClose(); }}><View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000066' }}><View accessibilityViewIsModal style={{ backgroundColor: colors.surface, borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '92%', padding: 20, gap: 12 }}>
    <View style={s.between}><Text style={s.title}>Chi tiết và lịch sử voucher</Text><Pressable accessibilityRole="button" accessibilityLabel="Đóng quản lý voucher" disabled={disable.isPending} onPress={onClose} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><X size={22} color={colors.text} /></Pressable></View>
    <Status loading={detail.isLoading} error={detail.error || disable.error} retry={() => void detail.refetch()} />
    <ScrollView contentContainerStyle={{ gap: 12 }} showsVerticalScrollIndicator={false}>{v && <>
      <Text style={s.title}>{v.name}</Text><Text style={s.body}>{v.code} · {v.storeName} · {managedVoucherStatus[v.status]}</Text><Text style={s.body}>{v.description}</Text>
      <Text style={s.small}>Đơn từ {money(v.minOrderAmount)} · Mỗi người {v.perUserLimit} lượt · Đã nhận {v.claimedCount}</Text><Text style={s.small}>{dateTime(v.startsAt)} → {dateTime(v.expiresAt)}</Text><Text style={s.small}>{v.productIds.length ? `${v.productIds.length} sản phẩm` : 'Toàn shop / phạm vi nền tảng'}</Text>
      {!!v.disabledReason && <Text style={s.error}>Lý do vô hiệu hóa: {v.disabledReason}</Text>}
      <Text style={s.title}>Lịch sử sử dụng</Text>{!detail.data?.usages.items.length && <Text style={s.small}>Chưa có lượt sử dụng.</Text>}{detail.data?.usages.items.map(use => <Text key={use.id} style={s.small}>{dateTime(use.createdAt)} · {money(use.discountAmount)} · {use.status} · Đơn {use.orderId}</Text>)}
      {(detail.data?.usages.totalPages ?? 0) > 1 && <View style={s.row}><Button title="Trước" disabled={page === 1} outline onPress={() => setPage(p => p - 1)} /><Button title="Sau" disabled={page >= (detail.data?.usages.totalPages ?? 1)} outline onPress={() => setPage(p => p + 1)} /></View>}
      <Text style={s.title}>Lịch sử quản lý</Text>{detail.data?.actions.map((action, index) => <Text key={index} style={s.small}>{dateTime(action.createdAt)} · {managedVoucherAction(action.action)}{action.reason ? ` · ${action.reason}` : ''}</Text>)}
      {v.status !== 'DISABLED' && !confirm && <Button title="Vô hiệu hóa voucher" onPress={() => setConfirm(true)} />}
      {confirm && <><Text style={s.body}>Xác nhận vô hiệu hóa? Các đơn mới sẽ không dùng được voucher này.</Text><Field label="Lý do vô hiệu hóa" value={reason} onChangeText={setReason} multiline maxLength={1000} /><Button title={disable.isPending ? 'Đang xử lý...' : 'Xác nhận vô hiệu hóa'} disabled={disable.isPending || !reason.trim()} onPress={() => disable.mutate()} /><Button title="Hủy" outline disabled={disable.isPending} onPress={() => setConfirm(false)} /></>}
    </>}</ScrollView>
  </View></View></Modal>;
}
