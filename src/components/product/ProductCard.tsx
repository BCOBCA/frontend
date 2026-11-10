import { useState } from 'react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Heart, Package, Phone, ShoppingCart, Star } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { errorMessage, request } from '../../services/api';
import { useAuth } from '../../stores/auth';
import { useToast } from '../../stores/toast';
import { colors, money } from '../../theme';
export type ProductCardItem = {
  id: string; name: string; imageUrl: string; price: number | null; salePrice: number | null;
  variantId: string | null; availableStock: number; isService?: boolean; isFavorite?: boolean;
  rating?: number | null; reviewCount?: number; soldCount?: number;
};

export function ProductCard({ item, width, compact = false }: { item: ProductCardItem; width: number; compact?: boolean }) {
  const user = useAuth(state => state.user);
  const client = useQueryClient();
  const showToast = useToast(state => state.show);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const add = useMutation({ mutationFn: () => request('POST', '/cart/items', { productId: item.id, variantId: item.variantId, quantity: 1 }), onSuccess: () => { void client.invalidateQueries({ queryKey: ['cart'] }); showToast('Đã thêm vào giỏ hàng.'); }, onError: error => showToast(errorMessage(error), 'error') });
  const favorite = useMutation({ mutationFn: () => request(item.isFavorite ? 'DELETE' : 'PUT', `/favorites/${item.id}`), onSuccess: () => Promise.all(['products', 'brand-products', 'product', 'favorites'].map(name => client.invalidateQueries({ queryKey: [name] }))), onError: error => showToast(errorMessage(error), 'error') });
  const discount = item.salePrice !== null && item.price !== null && item.price > 0 && item.salePrice < item.price ? Math.round((1 - item.salePrice / item.price) * 100) : 0;
  const open = () => router.push({ pathname: '/product/[id]', params: { id: item.id, service: item.isService ? '1' : '0' } });
  const available = !!item.variantId && item.availableStock > 0;
  return <View style={{ width, backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: compact ? 8 : 10, gap: 10, flexDirection: compact ? 'row' : 'column' }}>
    <View style={compact ? { width: 52, alignSelf: 'center' } : undefined}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Xem ${item.name}`} onPress={open} style={{ width: '100%', aspectRatio: compact ? 1 : 1.1, alignItems: 'center', justifyContent: 'center' }}>
      {item.imageUrl && failedImage !== item.imageUrl ? <Image source={{ uri: item.imageUrl }} contentFit="contain" accessibilityLabel={item.name} onError={() => setFailedImage(item.imageUrl)} style={{ width: '100%', height: '100%' }} /> : <Package size={38} color={colors.muted} />}
      {discount > 0 && <View style={{ position: 'absolute', top: 0, left: 0, borderRadius: 9, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: colors.primary }}><Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>-{discount}%</Text></View>}
    </Pressable>
    {!compact && !item.isService && typeof item.isFavorite === 'boolean' && <Pressable accessibilityRole="button" accessibilityLabel={item.isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'} disabled={favorite.isPending} onPress={() => user ? favorite.mutate() : router.push('/login')} style={{ position: 'absolute', top: 0, right: 0, padding: 8, borderRadius: 20, backgroundColor: colors.surface }}><Heart size={18} color={colors.primary} fill={item.isFavorite ? colors.primary : 'transparent'} /></Pressable>}
    </View>
    <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0, gap: 7 }}>
      <Pressable accessibilityRole="button" onPress={open}><Text numberOfLines={2} style={{ minHeight: 36, fontSize: 12, lineHeight: 18, fontWeight: '600', color: colors.text }}>{item.name}</Text></Pressable>
      {!item.isService && (!compact || typeof item.rating === 'number') && <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
        {typeof item.rating === 'number' ? <><Star size={11} fill="#F8AF20" color="#F8AF20" /><Text style={{ color: colors.text, fontSize: 10 }}>{item.rating.toFixed(1)} ({(item.reviewCount ?? 0).toLocaleString('vi-VN')})</Text></> : <Text style={{ color: colors.muted, fontSize: 10 }}>Chưa có đánh giá</Text>}
        {(item.soldCount ?? 0) > 0 && <Text style={{ color: colors.muted, fontSize: 10 }}>· Đã bán {(item.soldCount ?? 0).toLocaleString('vi-VN')}</Text>}
      </View>}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginTop: 'auto' }}>
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
          <Text style={{ color: colors.primary, fontSize: compact ? 12 : 14, fontWeight: '700' }}>{item.price === null ? 'Liên hệ' : money(item.salePrice ?? item.price)}</Text>
          {discount > 0 && <Text style={{ color: colors.muted, fontSize: 10, textDecorationLine: 'line-through' }}>{money(item.price!)}</Text>}
          {!item.isService && !available && <Text style={{ color: colors.muted, fontSize: 10 }}>Tạm hết hàng</Text>}
        </View>
        {item.isService ? <Pressable accessibilityRole="button" accessibilityLabel={`Tư vấn ${item.name}`} onPress={open} style={{ padding: 7, borderWidth: 1, borderRadius: 8, borderColor: colors.primary, gap: 4, alignItems: 'center' }}><Phone size={17} color={colors.primary} /><Text style={{ color: colors.primary, fontSize: 10 }}>Tư vấn ngay</Text></Pressable> : <Pressable accessibilityRole="button" accessibilityLabel={`Thêm ${item.name} vào giỏ hàng`} accessibilityState={{ disabled: add.isPending || !available, busy: add.isPending }} aria-busy={add.isPending} aria-disabled={add.isPending || !available} disabled={add.isPending || !available} onPress={() => user ? add.mutate() : router.push('/login')}
          style={({ pressed }) => ({ minWidth: 34, minHeight: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 8, borderColor: '#FFCECB', backgroundColor: '#FFF7F6', opacity: !available || pressed ? 0.5 : 1 })}>
          {add.isPending ? <ActivityIndicator size="small" color={colors.primary} accessibilityLabel={`Đang thêm ${item.name} vào giỏ hàng`} /> : <ShoppingCart size={17} color={colors.primary} />}
        </Pressable>}
      </View>
    </View>
  </View>;
}
