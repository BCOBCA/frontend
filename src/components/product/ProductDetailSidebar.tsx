import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BadgeCheck, Headphones, Package, Truck } from 'lucide-react-native';
import { request } from '../../services/api';
import type { Brand, Page, Product } from '../../types/api';
import { colors } from '../../theme';
import { Status } from '../common/ui';
import { ProductCard } from './ProductCard';
import { ProductSellerCard } from './ProductSellerCard';

export const detailPanel = { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, gap: 14 } as const;

export function ProductDetailSidebar({ product, brand, width, children }: { product: Product; brand?: Brand; width: number; children?: ReactNode }) {
  const related = useQuery({ queryKey: ['related-products', product.storeId, product.brandId, product.id], queryFn: () => request<Page<Product>>('GET', `/products?${product.storeId ? `storeId=${product.storeId}` : `brandId=${product.brandId}`}&pageSize=4`), enabled: !product.isService });
  const openBrand = () => router.push({ pathname: '/brand/[id]', params: { id: product.brandId } });
  const openRelated = () => product.sellers?.[0] && product.storeId ? router.push({ pathname: '/dai-ly/[slug]', params: { slug: product.sellers[0].slug, tab: 'products' } }) : openBrand();
  const items = related.data?.items.filter(item => item.id !== product.id).slice(0, 3) ?? [];
  return <View style={{ width, gap: 16 }}>
    {!product.isService && (product.sellers?.length ? product.sellers.map(seller => <ProductSellerCard key={seller.id} seller={seller} />) : <View style={detailPanel}><Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>Cửa hàng bán sản phẩm</Text><Text style={{ color: colors.muted, fontSize: 12 }}>Chưa có thông tin cửa hàng bán sản phẩm này.</Text></View>)}
    {product.isService && <View style={detailPanel}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#F6F7FA', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{brand?.logoUrl ? <Image source={{ uri: brand.logoUrl }} contentFit="contain" style={{ width: 40, height: 40 }} /> : <Package size={22} color={colors.muted} />}</View>
        <View style={{ flex: 1, gap: 4 }}><Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{brand?.name ?? 'Thương hiệu sản phẩm'}</Text><Text style={{ fontSize: 11, color: colors.muted }}>Thông tin thương hiệu</Text></View>
      </View>
      {!!brand?.description && <Text numberOfLines={3} style={{ fontSize: 12, lineHeight: 19, color: colors.muted }}>{brand.description}</Text>}
      <Pressable accessibilityRole="button" onPress={openBrand} style={{ minHeight: 38, borderWidth: 1, borderColor: '#F1BDB9', borderRadius: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8F7' }}><Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12 }}>Xem thương hiệu</Text></Pressable>
      {!!brand?.phone && <Text style={{ color: colors.muted, fontSize: 12 }}>Liên hệ: {brand.phone}</Text>}
    </View>}
    <View style={detailPanel}>
      {[{ Icon: BadgeCheck, title: 'Chọn đúng phiên bản', text: 'Giá và tồn kho theo phân loại bạn chọn.' }, { Icon: Truck, title: 'Thông tin giao hàng', text: 'Phí giao hàng được tính khi thanh toán.' }, { Icon: Headphones, title: 'Hỗ trợ mua hàng', text: product.isService ? 'Liên hệ thương hiệu để được tư vấn.' : 'Liên hệ cửa hàng để được tư vấn.' }].map(({ Icon, title, text }) => <View key={title} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}><View style={{ width: 32, height: 32, backgroundColor: '#FFF2F0', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}><Icon size={18} color={colors.primary} /></View><View style={{ flex: 1, gap: 4 }}><Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>{title}</Text><Text style={{ color: colors.muted, fontSize: 11, lineHeight: 17 }}>{text}</Text></View></View>)}
    </View>
    {!product.isService && <View style={detailPanel}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}><Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{product.storeId ? 'Cùng cửa hàng' : 'Cùng thương hiệu'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Xem thêm sản phẩm" onPress={openRelated} style={{ paddingVertical: 8 }}><ArrowRight size={17} color={colors.primary} /></Pressable></View>
      <Status loading={related.isLoading} error={related.error} retry={() => void related.refetch()} />
      {items.map(item => <ProductCard key={item.id} item={item} width={width - 34} compact />)}
      {!related.isLoading && !related.error && items.length === 0 && <Text style={{ fontSize: 12, color: colors.muted }}>Chưa có sản phẩm khác để hiển thị.</Text>}
    </View>}
    {children}
  </View>;
}
