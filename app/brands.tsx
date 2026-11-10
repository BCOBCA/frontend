import { View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Empty, Page as PageView, Status } from '../src/components/common/ui';
import { BrandCoverGrid } from '../src/components/brands/BrandCoverGrid';
import { BrandExplorer } from '../src/components/brands/BrandExplorer';
import { request } from '../src/services/api';
import type { Brand, Page } from '../src/types/api';

export default function Brands() {
  const query = useQuery({ queryKey: ['brands'], queryFn: () => request<Page<Brand>>('GET', '/brands?pageSize=100') });
  const open = (brand: Brand) => router.push({ pathname: '/brand/[id]', params: { id: brand.id } });
  return <PageView title="Thương hiệu" back>
    <Status loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
    {!!query.data?.items.length && <View style={{ padding: 12, gap: 16 }}><BrandCoverGrid brands={query.data.items} onSelect={open} /><BrandExplorer brands={query.data.items} onSelect={open} /></View>}
    {query.data?.items.length === 0 && <Empty text="Chưa có thương hiệu" />}
  </PageView>;
}
