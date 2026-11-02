import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Button, Empty, Page as PageView, Status } from '../src/components/common/ui';
import { request } from '../src/services/api';
import type { Brand, Page } from '../src/types/api';
import { styles as s } from '../src/theme';
export default function Brands() {
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['brands', page], queryFn: () => request<Page<Brand>>('GET', `/brands?page=${page}`) });
  return <PageView title="Thương hiệu" back><Status loading={query.isLoading} error={query.error} retry={() => void query.refetch()} /><View style={s.padded}>{query.data?.items.map(brand => <Pressable accessibilityRole="button" key={brand.id} onPress={() => router.push({ pathname: '/brand/[id]', params: { id: brand.id } })} style={[s.card, s.row]}>{brand.logoUrl && <Image source={{ uri: brand.logoUrl }} style={{ width: 72, height: 60 }} contentFit="contain" />}<Text style={s.body}>{brand.name}</Text></Pressable>)}{query.data?.items.length === 0 && <Empty text="Chưa có thương hiệu" />}
    {query.data && query.data.totalPages > 1 && <View style={s.between}><Button title="Trước" disabled={page === 1} onPress={() => setPage(page - 1)} /><Text>{page}/{query.data.totalPages}</Text><Button title="Sau" disabled={page === query.data.totalPages} onPress={() => setPage(page + 1)} /></View>}
  </View></PageView>;
}
