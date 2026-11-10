import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Star } from 'lucide-react-native';
import type { Page, ProductSeller } from '../../types/api';
import { request } from '../../services/api';
import { getDealer } from '../../services/dealers';
import { useAuth } from '../../stores/auth';
import { colors } from '../../theme';
import { DealerImage, FollowButton, VerifiedBadge } from '../dealers/DealerCard';
import { Status } from '../common/ui';

export function ProductSellerCard({ seller }: { seller: ProductSeller }) {
  const userId = useAuth(state => state.user?.id);
  const detail = useQuery({ queryKey: ['dealer', seller.slug, userId], queryFn: () => getDealer(seller.slug) });
  const products = useQuery({ queryKey: ['dealer-products', seller.id, 'seller-count'], queryFn: () => request<Page<{ id: string }>>('GET', `/dealers/${seller.id}/products?pageSize=1`) });
  const dealer = detail.data?.dealer.id === seller.id ? detail.data.dealer : undefined;
  const name = dealer?.name ?? seller.name;
  const logo = dealer?.logoUrl ?? seller.logoUrl;
  return <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, gap: 18 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 52, height: 52, borderRadius: 26, overflow: 'hidden' }}><DealerImage key={logo} uri={logo} logo /></View>
      <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Text style={{ flexShrink: 1, color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: '700' }}>{name}</Text>{dealer?.isVerified && <VerifiedBadge />}</View>
        {dealer?.isVerified && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><ShieldCheck size={13} color={colors.muted} /><Text style={{ fontSize: 11, color: colors.muted }}>Cửa hàng đã xác minh</Text></View>}
      </View>
    </View>
    <View style={{ flexDirection: 'row', paddingVertical: 2 }}>
      <View style={{ flex: 1, alignItems: 'center', gap: 7 }}><Text style={{ fontSize: 12, color: colors.muted }}>Đánh giá</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Text style={{ fontSize: 12, color: colors.muted }}>Chưa có</Text><Star size={14} color="#B8BEC8" /></View></View>
      <View style={{ flex: 1, alignItems: 'center', gap: 7, borderLeftWidth: 1, borderColor: colors.border }}><Text style={{ fontSize: 12, color: colors.muted }}>Sản phẩm</Text><Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{products.data?.totalItems.toLocaleString('vi-VN') ?? '—'}</Text></View>
    </View>
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Xem gian hàng ${name}`} onPress={() => router.push({ pathname: '/dai-ly/[slug]', params: { slug: seller.slug, tab: 'products' } })} style={({ pressed }) => ({ flex: 1.15, minHeight: 40, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', borderRadius: 7, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 })}><Text style={{ color: colors.primary, fontSize: 11, fontWeight: '700' }}>Xem gian hàng</Text></Pressable>
      <View style={{ flex: 1 }}>{dealer ? <FollowButton dealer={dealer} solid /> : <View accessibilityState={{ disabled: true }} style={{ minHeight: 40, borderRadius: 7, backgroundColor: colors.primary, opacity: 0.5, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>Theo dõi</Text></View>}</View>
    </View>
    <Status error={detail.error || products.error} retry={() => { void detail.refetch(); void products.refetch(); }} />
  </View>;
}
