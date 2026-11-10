import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useInfiniteQuery, useMutation, useQuery, type InfiniteData } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ChevronRight, Crown, Flame, Gift, Percent, Star, TicketPercent, X, Zap } from 'lucide-react-native';
import { MemberStar } from '../../src/components/membership/MemberStar';
import { Page as PageView, Button, Status, Empty } from '../../src/components/common/ui';
import { OfferCard } from '../../src/components/promotions/OfferCard';
import { CheckInPanel } from '../../src/components/promotions/CheckInPanel';
import { TopToast } from '../../src/components/common/TopToast';
import { filterOffers, offerRestriction, type OfferCategory } from '../../src/components/promotions/offers';
import { colors, money, styles as s } from '../../src/theme';
import { errorMessage, request } from '../../src/services/api';
import { queryClient, useAuth } from '../../src/stores/auth';
import type { Membership, Page, Voucher } from '../../src/types/api';

const categories = [
  { id: 'all', label: 'Tất cả ưu đãi', caption: 'Xem danh sách', Icon: Percent },
  { id: 'vouchers', label: 'Voucher', caption: 'Nhận và sử dụng', Icon: TicketPercent },
  { id: 'points', label: 'Đổi điểm', caption: 'Nhận voucher', Icon: Star },
  { id: 'levels', label: 'Ưu đãi theo Level', caption: 'Đặc quyền thành viên', Icon: Crown },
  { id: 'flash', label: 'Flash Sale', caption: 'Ưu đãi có hạn', Icon: Zap },
] as const;

export default function Promotions() {
  const user = useAuth(state => state.user);
  const { width } = useWindowDimensions();
  const compactCategories = width < 600;
  const [category, setCategory] = useState<OfferCategory>('all');
  const [selected, setSelected] = useState<{ voucher: Voucher; redeem: boolean } | null>(null);
  const [message, setMessage] = useState('');
  const [showCheckInToast, setShowCheckInToast] = useState(false);
  const dismissCheckInToast = useCallback(() => setShowCheckInToast(false), []);
  const [pendingVoucherIds, setPendingVoucherIds] = useState<Set<string>>(() => new Set());
  const member = useQuery({ queryKey: ['membership', user?.id], queryFn: () => request<Membership>('GET', '/membership'), enabled: !!user });
  const program = useQuery({ queryKey: ['check-in-program'], queryFn: () => request<{ rewardPoints: number; isActive: boolean }>('GET', '/membership/check-in-program') });
  const vouchers = useInfiniteQuery({ queryKey: ['vouchers', user?.id ?? 'guest'], initialPageParam: 1,
    queryFn: ({ pageParam }) => request<Page<Voucher>>('GET', `/vouchers?page=${pageParam}&pageSize=50`),
    getNextPageParam: last => last.page < last.totalPages ? last.page + 1 : undefined });
  const checkIn = useMutation({ mutationKey: ['check-in', user?.id], mutationFn: () => request<{ rewardPoints: number; streakDays: number }>('POST', '/membership/check-ins'), onSuccess: () => { setShowCheckInToast(true); void queryClient.invalidateQueries({ queryKey: ['membership'] }); void queryClient.invalidateQueries({ queryKey: ['points'] }); } });
  const claim = useMutation({ mutationFn: (voucher: Voucher) => request('POST', `/vouchers/${voucher.id}/claim`),
    onMutate: voucher => { setPendingVoucherIds(current => new Set(current).add(voucher.id)); },
    onSuccess: (_, voucher) => {
      queryClient.setQueriesData<InfiniteData<Page<Voucher>>>({ queryKey: ['vouchers', user?.id ?? 'guest'] }, current => current && ({ ...current, pages: current.pages.map(page => ({ ...page, items: page.items.map(item => item.id === voucher.id ? { ...item, claimed: true } : item) })) }));
      setSelected(current => current?.voucher.id === voucher.id ? null : current);
      setMessage(`Đã thu thập ${voucher.name}.`);
      void queryClient.invalidateQueries({ queryKey: ['vouchers'] }); void queryClient.invalidateQueries({ queryKey: ['membership'] }); void queryClient.invalidateQueries({ queryKey: ['points'] });
    },
    onSettled: (_data, _error, voucher) => { setPendingVoucherIds(current => { const next = new Set(current); next.delete(voucher.id); return next; }); },
  });
  const selectedBusy = !!selected && pendingVoucherIds.has(selected.voucher.id);
  const offers = filterOffers(vouchers.data?.pages.flatMap(page => page.items) ?? [], category);
  const free = offers.filter(voucher => !(voucher.pointCost ?? 0));
  const rewards = offers.filter(voucher => (voucher.pointCost ?? 0) > 0);
  const columns = width >= 1000 ? 4 : width >= 700 ? 3 : 2;
  const cardWidth = (Math.min(width, 1180) - 24 - (columns - 1) * 12) / columns;
  const receive = (voucher: Voucher) => {
    if (voucher.claimed || pendingVoucherIds.has(voucher.id)) return;
    setMessage(''); claim.reset();
    if (!user) { router.push('/login'); return; }
    if ((voucher.pointCost ?? 0) > 0) setSelected({ voucher, redeem: true });
    else claim.mutate(voucher);
  };
  const cards = (items: Voucher[]) => <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{items.map(voucher => <OfferCard key={voucher.id} voucher={voucher} width={cardWidth}
    restriction={user && !voucher.claimed ? member.isLoading ? 'Đang tải điểm...' : member.error ? 'Chưa tải được điểm' : offerRestriction(voucher, member.data) : undefined}
    busy={pendingVoucherIds.has(voucher.id)} onClaim={() => receive(voucher)} onDetails={() => { claim.reset(); setSelected({ voucher, redeem: false }); }} />)}</View>;
  return <PageView title="Ưu đãi" overlay={showCheckInToast && <TopToast message="Bạn đã điểm danh hôm nay" onDismiss={dismissCheckInToast} />}>
    <CheckInPanel rewards={Array.from({ length: 7 }, () => program.data?.rewardPoints ?? null)}
      streakDays={user ? member.data?.checkInStreakDays ?? 0 : 0}
      checkedInToday={!!user && !!member.data?.checkedInToday} pending={!!user && checkIn.isPending}
      loading={!!user && member.isLoading}
      disabled={!!user && (checkIn.isPending || member.isLoading || !!member.error || !!member.data?.checkedInToday || !program.data?.isActive)}
      onPress={() => { if (!user) { router.push('/login'); return; } checkIn.mutate(); }} />
    {user && <View style={{ paddingHorizontal: 20, paddingTop: 8 }}><View style={s.between}><Text style={s.small}>Điểm có thể sử dụng</Text><Text style={s.price}>{member.data?.availablePoints.toLocaleString('vi-VN') ?? '—'} điểm</Text></View>
    </View>}
    <Status error={program.error || (user ? checkIn.error || member.error : null)} retry={() => { void program.refetch(); if (user) void member.refetch(); }} />
    <View style={[s.padded, { gap: 24, paddingTop: 20, paddingBottom: 24 }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: compactCategories ? 8 : 10, paddingVertical: 4 }}>
        {categories.map(({ id, label, caption, Icon }) => <Pressable key={id} accessibilityRole="button" accessibilityLabel={label} aria-pressed={category === id} onPress={() => { setCategory(id); setMessage(''); }}
          style={({ pressed }) => ({ width: compactCategories ? 144 : width >= 1000 ? (Math.min(width, 1180) - 64) / 5 : 156, minHeight: compactCategories ? 64 : 74, flexDirection: 'row', alignItems: 'center', gap: compactCategories ? 6 : 9, padding: compactCategories ? 8 : 12, borderRadius: compactCategories ? 10 : 12, borderWidth: 1, borderColor: category === id ? '#E89093' : colors.border, backgroundColor: category === id ? '#FFF0F0' : colors.surface, opacity: pressed ? 0.8 : 1, boxShadow: '0 3px 8px rgba(36,36,43,0.04)' })}>
          <View style={{ width: compactCategories ? 28 : 34, height: compactCategories ? 30 : 38, borderRadius: compactCategories ? 8 : 10, backgroundColor: id === 'points' || id === 'levels' ? '#FFF4CD' : '#FFF0F0', alignItems: 'center', justifyContent: 'center' }}>{id === 'points' ? <MemberStar size={compactCategories ? 22 : 26} /> : <Icon size={compactCategories ? 20 : 24} color={id === 'levels' ? '#B57700' : colors.primary} />}</View>
          <View style={{ flex: 1, minWidth: 0 }}><Text numberOfLines={compactCategories ? 2 : undefined} style={{ color: colors.text, fontWeight: '700', fontSize: compactCategories ? 12 : 13, lineHeight: compactCategories ? 16 : 18 }}>{label}</Text><Text numberOfLines={compactCategories ? 1 : undefined} style={[s.small, { fontSize: compactCategories ? 10 : 11, lineHeight: compactCategories ? 14 : 18 }]}>{caption}</Text></View>
        </Pressable>)}
      </ScrollView>
      {!!message && <Text accessibilityLiveRegion="polite" style={{ color: '#25663D', fontSize: 14, lineHeight: 21 }}>{message}</Text>}
      <Status loading={vouchers.isLoading} error={vouchers.error || claim.error} retry={() => void vouchers.refetch()} />
      {category !== 'points' && <View style={{ gap: 14 }}>
        <View style={s.between}><View style={[s.row, { flex: 1, minWidth: 0, gap: 7 }]}><Flame color={colors.primary} size={22} /><Text accessibilityRole="header" style={[s.title, { flexShrink: 1 }]}>{category === 'levels' ? 'Ưu đãi theo Level' : category === 'flash' ? 'Flash Sale' : 'Voucher nổi bật'}</Text></View>
          {category === 'all' && <Pressable accessibilityRole="button" accessibilityLabel="Xem tất cả voucher" onPress={() => setCategory('vouchers')} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center' }}><Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Xem tất cả</Text><ChevronRight size={16} color={colors.primary} /></Pressable>}
        </View>
        {cards(free)}
        {!vouchers.isLoading && !vouchers.error && free.length === 0 && <Empty text="Chưa có voucher trong mục này." />}
        {category === 'levels' && <Button title="Xem các level và ưu đãi thành viên" outline onPress={() => router.push('/membership-levels')} />}
      </View>}
      {(category === 'all' || category === 'points' || rewards.length > 0) && <View style={{ gap: 14 }}>
        <View style={s.between}><View style={[s.row, { flex: 1, minWidth: 0, gap: 7 }]}><Gift color="#B57700" size={23} /><Text accessibilityRole="header" style={[s.title, { flexShrink: 1 }]}>Đổi điểm nhận ưu đãi</Text></View>
          {category === 'all' && <Pressable accessibilityRole="button" accessibilityLabel="Xem tất cả ưu đãi đổi điểm" onPress={() => setCategory('points')} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center' }}><Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Xem tất cả</Text><ChevronRight size={16} color={colors.primary} /></Pressable>}
        </View>
        <Text style={s.small}>Dùng điểm có thể sử dụng để nhận voucher. Tổng điểm tích lũy và level giữ nguyên khi đổi.</Text>
        {cards(rewards)}
        {!vouchers.isLoading && !vouchers.error && rewards.length === 0 && <Empty text="Chưa có ưu đãi đổi điểm trong mục này." />}
      </View>}
      {vouchers.hasNextPage && <Button title={vouchers.isFetchingNextPage ? 'Đang tải...' : 'Tải thêm ưu đãi'} disabled={vouchers.isFetchingNextPage} outline onPress={() => void vouchers.fetchNextPage()} />}
    </View>
    <Modal transparent animationType="fade" visible={selected !== null} onRequestClose={() => { if (!selectedBusy) setSelected(null); }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000066', padding: 16 }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 460, maxHeight: '90%', backgroundColor: colors.surface, borderRadius: 18, padding: 20, gap: 14 }}>
          <View style={s.between}><Text accessibilityRole="header" style={[s.title, { flex: 1 }]}>{selected?.redeem ? 'Xác nhận đổi ưu đãi' : 'Điều kiện ưu đãi'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Đóng điều kiện ưu đãi" disabled={selectedBusy} onPress={() => setSelected(null)} style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}><X size={22} color={colors.text} /></Pressable></View>
          <ScrollView contentContainerStyle={{ gap: 12 }}>
            <Text style={[s.title, { color: colors.primary }]}>{selected?.voucher.name}</Text>
            <Text style={s.body}>{selected?.voucher.description}</Text>
            <Text style={s.body}>Đơn từ {money(selected?.voucher.minOrderAmount ?? 0)} tính trên giá trị hàng.</Text>
            <Text style={s.body}>{selected?.voucher.discountType === 'SHIPPING' ? 'Giảm trực tiếp phí vận chuyển thực tế, tối đa mức ưu đãi. Không trừ vào tiền hàng.' : 'Giảm tiền hàng, không áp dụng cho phí vận chuyển.'}</Text>
            {selected?.voucher.maxDiscount !== null && selected?.voucher.maxDiscount !== undefined && <Text style={s.body}>Giảm tối đa {money(selected.voucher.maxDiscount)}.</Text>}
            {selected && <Text style={s.small}>Hạn sử dụng: {new Date(selected.voucher.expiresAt).toLocaleDateString('vi-VN')}.</Text>}
            {selected?.redeem && <><Text style={s.body}>Sử dụng {(selected.voucher.pointCost ?? 0).toLocaleString('vi-VN')} điểm. Số dư sau đổi: {Math.max(0, (member.data?.availablePoints ?? 0) - (selected.voucher.pointCost ?? 0)).toLocaleString('vi-VN')} điểm.</Text><Text style={s.small}>Tổng điểm tích lũy và level của bạn không thay đổi. Mỗi ưu đãi đổi điểm được đổi một lần; điểm không tự hoàn khi hủy đơn, voucher sẽ được khôi phục để dùng lại trong thời hạn.</Text></>}
            {!!claim.error && <Text accessibilityRole="alert" style={s.error}>{errorMessage(claim.error)}</Text>}
          </ScrollView>
          {selected?.redeem && <Button title={selectedBusy ? 'Đang đổi...' : 'Xác nhận đổi điểm'} disabled={selectedBusy || !user || !member.data || !!offerRestriction(selected.voucher, member.data)} onPress={() => { if (selected && !selectedBusy) claim.mutate(selected.voucher); }} />}
          {selected?.redeem && <Button title="Để sau" outline disabled={selectedBusy} onPress={() => setSelected(null)} />}
        </View>
      </View>
    </Modal>
  </PageView>;
}
