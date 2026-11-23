import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { Button, Empty, Status } from '../common/ui';
import { OfferCard } from './OfferCard';
import { gridItemWidth } from '../common/grid-layout';
import { request } from '../../services/api';
import { queryClient, useAuth } from '../../stores/auth';
import { colors, money, styles as s } from '../../theme';
import type { Page, Voucher } from '../../types/api';

export function ShopVouchers({ storeId }: { storeId: string }) {
  const user = useAuth(state => state.user);
  return <ShopVoucherContent key={`${storeId}/${user?.id ?? 'guest'}`} storeId={storeId} userId={user?.id} />;
}
function ShopVoucherContent({ storeId, userId }: { storeId: string; userId?: string }) {
  const { width } = useWindowDimensions();
  const [gridWidth, setGridWidth] = useState(0), [selected, setSelected] = useState<Voucher | null>(null);
  const vouchers = useInfiniteQuery({ queryKey: ['vouchers', 'shop', storeId, userId ?? 'guest'], initialPageParam: 1, staleTime: 0,
    queryFn: ({ pageParam }) => request<Page<Voucher>>('GET', `/vouchers?storeId=${encodeURIComponent(storeId)}&page=${pageParam}&pageSize=20`),
    getNextPageParam: last => last.page < last.totalPages ? last.page + 1 : undefined });
  const claim = useMutation({ mutationFn: (voucher: Voucher) => request('POST', `/vouchers/${encodeURIComponent(voucher.id)}/claim`),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['vouchers'] }); } });
  const items = vouchers.data?.pages.flatMap(page => page.items) ?? [];
  const cardWidth = gridItemWidth(gridWidth || Math.min(width, 1180) - 48, width >= 1000 ? 4 : width >= 700 ? 3 : 2, 12);
  const receive = (voucher: Voucher) => { if (!userId) { router.push('/login'); return; } if (!voucher.claimed && !claim.isPending) claim.mutate(voucher); };
  return <View style={{ gap: 12 }}>
    <Text accessibilityRole="header" style={s.title}>Voucher của Shop</Text>
    <Status loading={vouchers.isLoading} error={vouchers.error || claim.error} retry={() => void vouchers.refetch()} />
    {!vouchers.isLoading && !vouchers.error && !items.length && <Empty text="Shop chưa có voucher có thể nhận." />}
    <View onLayout={event => setGridWidth(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {items.map(voucher => <OfferCard key={voucher.id} voucher={voucher} width={cardWidth} busy={claim.isPending && claim.variables?.id === voucher.id} onClaim={() => receive(voucher)} onDetails={() => setSelected(voucher)} />)}
    </View>
    {vouchers.hasNextPage && <Button title="Xem thêm voucher của shop" outline disabled={vouchers.isFetchingNextPage} onPress={() => void vouchers.fetchNextPage()} />}
    {selected && <Modal transparent visible animationType="fade" onRequestClose={() => setSelected(null)}><View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#00000066' }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Đóng nền điều kiện voucher shop" onPress={() => setSelected(null)} style={{ position: 'absolute', inset: 0 }} />
      <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 460, maxHeight: '90%', backgroundColor: colors.surface, borderRadius: 16, padding: 20, gap: 12 }}>
        <View style={s.between}><Text style={s.title}>Điều kiện ưu đãi</Text><Pressable accessibilityRole="button" accessibilityLabel="Đóng điều kiện voucher shop" onPress={() => setSelected(null)} style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}><X size={20} color={colors.text} /></Pressable></View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}><Text style={s.title}>{selected.name}</Text><Text style={s.body}>{selected.description}</Text><Text style={s.small}>Shop: {selected.storeName ?? 'Cửa hàng'}</Text><Text style={s.body}>Đơn từ {money(selected.minOrderAmount)} tính trên sản phẩm đủ điều kiện của shop.</Text>{selected.maxDiscount != null && <Text style={s.body}>Giảm tối đa {money(selected.maxDiscount)}.</Text>}<Text style={s.small}>Không giảm phí vận chuyển. Xem hạn áp dụng: {new Date(selected.expiresAt).toLocaleDateString('vi-VN')}.</Text></ScrollView>
      </View>
    </View></Modal>}
  </View>;
}
