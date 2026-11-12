import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Text, useWindowDimensions, View } from 'react-native';
import { ProductCard } from '../../src/components/product/ProductCard';
import { gridItemWidth } from '../../src/components/common/grid-layout';
import { Empty, Page as PageView, Status } from '../../src/components/common/ui';
import { request } from '../../src/services/api';
import type { Brand, Page, Product } from '../../src/types/api';
import { styles as s } from '../../src/theme';
export default function BrandDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const [gridWidth, setGridWidth] = useState(0);
  const columns = width >= 1100 ? 6 : width >= 768 ? 3 : 2;
  const cardWidth = gridItemWidth(gridWidth || Math.min(width, 1180) - 24, columns, 12);
  const brand = useQuery({ queryKey: ['brand', id], queryFn: () => request<Brand>('GET', `/brands/${id}`) });
  const products = useQuery({ queryKey: ['brand-products', id], queryFn: () => request<Page<Product>>('GET', `/products?brandId=${id}`) });
  const services = useQuery({ queryKey: ['brand-services', id], queryFn: () => request<Page<Product>>('GET', `/services?brandId=${id}`) });
  return <PageView title={brand.data?.name ?? 'Thương hiệu'} back><View style={s.padded}><Status loading={brand.isLoading} error={brand.error || products.error || services.error} retry={() => { void brand.refetch(); void products.refetch(); void services.refetch(); }} />
    {brand.data && <View style={s.card}>{brand.data.logoUrl && <Image source={{ uri: brand.data.logoUrl }} style={{ width: '100%', height: 100 }} contentFit="contain" />}<Text style={s.title}>{brand.data.name}</Text><Text style={s.body}>{brand.data.description}</Text></View>}
    <Status loading={products.isLoading || services.isLoading} />
    <View onLayout={event => setGridWidth(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {[...(products.data?.items ?? []), ...(services.data?.items ?? [])].map(item => <ProductCard key={`${item.isService}-${item.id}`} item={item} width={cardWidth} />)}
    </View>
    {products.data?.totalItems === 0 && services.data?.totalItems === 0 && <Empty text="Thương hiệu chưa có sản phẩm hoặc dịch vụ" />}
  </View></PageView>;
}
