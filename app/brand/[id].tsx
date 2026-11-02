import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { Empty, Page as PageView, Status } from '../../src/components/common/ui';
import { request } from '../../src/services/api';
import type { Brand, Page, Product } from '../../src/types/api';
import { money, styles as s } from '../../src/theme';
export default function BrandDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const brand = useQuery({ queryKey: ['brand', id], queryFn: () => request<Brand>('GET', `/brands/${id}`) });
  const products = useQuery({ queryKey: ['brand-products', id], queryFn: () => request<Page<Product>>('GET', `/products?brandId=${id}`) });
  const services = useQuery({ queryKey: ['brand-services', id], queryFn: () => request<Page<Product>>('GET', `/services?brandId=${id}`) });
  return <PageView title={brand.data?.name ?? 'Thương hiệu'} back><View style={s.padded}><Status loading={brand.isLoading} error={brand.error || products.error || services.error} retry={() => { void brand.refetch(); void products.refetch(); void services.refetch(); }} />
    {brand.data && <View style={s.card}>{brand.data.logoUrl && <Image source={{ uri: brand.data.logoUrl }} style={{ width: '100%', height: 100 }} contentFit="contain" />}<Text style={s.title}>{brand.data.name}</Text><Text style={s.body}>{brand.data.description}</Text></View>}
    {[...(products.data?.items ?? []), ...(services.data?.items ?? [])].map(item => <Pressable accessibilityRole="button" key={item.id} style={s.card} onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id, service: item.isService ? '1' : '0' } })}><Text style={s.body}>{item.name}</Text><Text style={s.price}>{item.price === null ? 'Tư vấn ngay' : money(item.salePrice ?? item.price)}</Text></Pressable>)}
    {products.data?.totalItems === 0 && services.data?.totalItems === 0 && <Empty text="Thương hiệu chưa có sản phẩm hoặc dịch vụ" />}
  </View></PageView>;
}
