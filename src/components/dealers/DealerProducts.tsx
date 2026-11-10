import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react-native';
import { colors } from '../../theme';
import { dealerProductFilters, dealerProductQuery, getDealerProductCategories, getDealerProducts, type DealerProductFilters } from '../../services/dealer-products';
import { dealerPages } from '../../services/dealers';
import { Status } from '../common/ui';
import { DealerSelect } from './DealerFilters';
import { ProductCard } from '../product/ProductCard';
import { DealerProductSidebar } from './DealerProductSidebar';

export function DealerProducts({ storeId }: { storeId: string }) {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const filters = dealerProductFilters(params);
  const { width } = useWindowDimensions();
  const compact = width < 900;
  const available = Math.min(width, 1180) - (width < 700 ? 32 : 48) - (compact ? 0 : 216);
  const columns = available >= 850 ? 5 : available >= 650 ? 4 : available >= 480 ? 3 : available >= 280 ? 2 : 1;
  const cardWidth = (available - (columns - 1) * 12) / columns;
  const categories = useQuery({ queryKey: ['dealer-product-categories', storeId], queryFn: () => getDealerProductCategories(storeId) });
  const products = useQuery({ queryKey: ['dealer-products', storeId, dealerProductQuery(filters)], queryFn: () => getDealerProducts(storeId, filters) });
  const update = (patch: Partial<DealerProductFilters>) => router.setParams({ tab: 'products', productPage: String(patch.page ?? 1), productCategory: patch.categoryId ?? filters.categoryId, productSort: patch.sort ?? filters.sort, minPrice: patch.minPrice ?? filters.minPrice, maxPrice: patch.maxPrice ?? filters.maxPrice, productView: undefined });
  const title = categories.data?.find(x => x.id === filters.categoryId)?.name ?? 'Tất cả sản phẩm';
  const totalPages = products.data?.totalPages ?? 0;
  return <View style={{ flexDirection: compact ? 'column' : 'row', gap: 16, alignItems: 'flex-start' }}>
    <DealerProductSidebar key={`${storeId}:${filters.minPrice}:${filters.maxPrice}`} categories={categories.data ?? []} categoryId={filters.categoryId} minPrice={filters.minPrice} maxPrice={filters.maxPrice} compact={compact} onCategory={categoryId => update({ categoryId })} onPrice={(minPrice, maxPrice) => update({ minPrice, maxPrice })} />
    <View style={{ flex: compact ? undefined : 1, width: compact ? '100%' : undefined, minWidth: 0, gap: 12 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <Text accessibilityRole="header" style={{ flex: 1, minWidth: 135, fontWeight: '700', fontSize: 14, color: colors.text }}>{title}{products.data ? ` (${products.data.totalItems})` : ''}</Text>
        <DealerSelect label="Sắp xếp sản phẩm" value={filters.sort} options={[{ value: 'popular', label: 'Phổ biến nhất' }, { value: 'newest', label: 'Mới nhất' }, { value: 'price-asc', label: 'Giá tăng dần' }, { value: 'price-desc', label: 'Giá giảm dần' }]} onChange={sort => update({ sort: sort as DealerProductFilters['sort'] })} />
      </View>
      <Status loading={products.isLoading || categories.isLoading} error={products.error || categories.error} retry={() => { void products.refetch(); void categories.refetch(); }} />
      {!products.error && products.data?.items.length === 0 && <View style={{ minHeight: 230, backgroundColor: 'white', borderRadius: 12, padding: 24, gap: 12, alignItems: 'center', justifyContent: 'center' }}><Package size={32} color={colors.muted} /><Text style={{ color: colors.muted, fontSize: 14, textAlign: 'center' }}>Chưa có sản phẩm phù hợp.</Text>{!!(filters.categoryId || filters.minPrice || filters.maxPrice) && <Pressable accessibilityRole="button" onPress={() => update({ categoryId: '', minPrice: '', maxPrice: '' })} style={{ padding: 12 }}><Text style={{ color: colors.primary }}>Xóa bộ lọc</Text></Pressable>}</View>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{products.data?.items.map(item => <ProductCard key={item.id} item={item} width={cardWidth} />)}</View>
      {totalPages > 1 && <View accessibilityLabel="Phân trang sản phẩm" style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 6 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Trang sản phẩm trước" disabled={filters.page <= 1} onPress={() => update({ page: filters.page - 1 })} style={{ minWidth: 38, minHeight: 40, alignItems: 'center', justifyContent: 'center', opacity: filters.page <= 1 ? 0.4 : 1 }}><ChevronLeft size={18} color={colors.text} /></Pressable>
        {dealerPages(filters.page, totalPages).map(page => <Pressable key={page} accessibilityRole="button" accessibilityLabel={`Trang sản phẩm ${page}`} aria-current={page === filters.page ? 'page' : undefined} onPress={() => update({ page })} style={{ minWidth: 38, minHeight: 40, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: page === filters.page ? colors.primary : 'white' }}><Text style={{ color: page === filters.page ? 'white' : colors.text }}>{page}</Text></Pressable>)}
        <Pressable accessibilityRole="button" accessibilityLabel="Trang sản phẩm tiếp theo" disabled={filters.page >= totalPages} onPress={() => update({ page: filters.page + 1 })} style={{ minWidth: 38, minHeight: 40, alignItems: 'center', justifyContent: 'center', opacity: filters.page >= totalPages ? 0.4 : 1 }}><ChevronRight size={18} color={colors.text} /></Pressable>
      </View>}
    </View>
  </View>;
}
