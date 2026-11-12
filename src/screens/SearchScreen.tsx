import { useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react-native';
import { Button, Page, Status } from '../components/common/ui';
import { ProductCard } from '../components/product/ProductCard';
import { gridItemWidth } from '../components/common/grid-layout';
import { DealerSelect } from '../components/dealers/DealerFilters';
import { productSearchFilters, productSearchQuery, searchCategories, searchProducts, type ProductSearchFilters } from '../services/product-search';
import { useAuth } from '../stores/auth';
import { colors } from '../theme';

export default function SearchScreen() {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const filters = productSearchFilters(params);
  const userId = useAuth(state => state.user?.id);
  const [draft, setDraft] = useState({ url: filters.search, text: filters.search });
  const input = draft.url === filters.search ? draft.text : filters.search;
  const categories = useQuery({ queryKey: ['categories'], queryFn: searchCategories });
  const products = useQuery({ queryKey: ['products', 'search', productSearchQuery(filters), userId], queryFn: () => searchProducts(filters) });
  const { width } = useWindowDimensions();
  const [gridWidth, setGridWidth] = useState(0);
  const gutter = width < 700 ? 16 : 24;
  const columns = width >= 1100 ? 6 : width >= 768 ? 3 : 2;
  const cardWidth = gridItemWidth(gridWidth || Math.min(width, 1180) - gutter * 2, columns, 12);
  const category = categories.data?.items.find(item => item.id === filters.categoryId);
  const update = (patch: Partial<ProductSearchFilters>) => {
    if (patch.search !== undefined) setDraft({ url: patch.search, text: patch.search });
    router.setParams({ ...filters, ...patch, page: String(patch.page ?? 1) });
  };
  const submit = (search: string) => update({ search: search.trim().slice(0, 200) });
  const reset = () => update({ search: '', categoryId: '', sort: 'newest' });
  return <Page title="Tìm kiếm" back search={input} onSearch={text => setDraft({ url: filters.search, text })} onSubmitSearch={submit} bodyStyle={{ padding: gutter, gap: 18 }}>
    <View style={{ gap: 7 }}>
      <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 22, lineHeight: 30, fontWeight: '700' }}>Kết quả tìm kiếm</Text>
      {!!filters.search && <Text style={{ color: colors.muted, fontSize: 14 }}>Từ khóa: “{filters.search}”</Text>}
      {!!filters.categoryId && <Text style={{ color: colors.muted, fontSize: 14 }}>Danh mục: {category?.name ?? 'Danh mục đã chọn'}</Text>}
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, padding: 12, backgroundColor: 'white', borderWidth: 1, borderColor: colors.border, borderRadius: 12 }}>
      <Text style={{ flex: 1, minWidth: 120, color: colors.muted, fontSize: 13 }}>{products.data ? `${products.data.totalItems.toLocaleString('vi-VN')} sản phẩm` : 'Đang tìm sản phẩm…'}</Text>
      <DealerSelect label="Danh mục sản phẩm" value={filters.categoryId} options={[{ value: '', label: 'Tất cả danh mục' }, ...(categories.data?.items.filter(item => !item.parentId) ?? []).map(item => ({ value: item.id, label: item.name }))]} onChange={categoryId => update({ categoryId })} />
      <DealerSelect label="Sắp xếp kết quả" value={filters.sort} options={[{ value: 'newest', label: 'Mới nhất' }, { value: 'name', label: 'Tên A–Z' }, { value: 'price-asc', label: 'Giá tăng dần' }, { value: 'price-desc', label: 'Giá giảm dần' }]} onChange={sort => update({ sort: sort as ProductSearchFilters['sort'] })} />
      {!!(filters.search || filters.categoryId) && <Pressable accessibilityRole="button" onPress={reset} style={{ minHeight: 44, paddingHorizontal: 10, justifyContent: 'center' }}><Text style={{ color: colors.primary, fontSize: 13 }}>Xóa bộ lọc</Text></Pressable>}
    </View>
    <Status error={categories.error} retry={() => void categories.refetch()} />
    <Status loading={products.isLoading} error={products.error} retry={() => void products.refetch()} />
    {!products.isLoading && !products.error && products.data?.items.length === 0 && <View style={{ minHeight: 240, backgroundColor: 'white', borderRadius: 14, padding: 24, gap: 14, alignItems: 'center', justifyContent: 'center' }}>
      <Search size={32} color={colors.muted} />
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Không tìm thấy sản phẩm phù hợp</Text>
      <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' }}>Thử từ khóa khác hoặc thay đổi danh mục.</Text>
      {!!(filters.search || filters.categoryId) && <Button title="Xem tất cả sản phẩm" onPress={reset} outline />}
    </View>}
    {!products.error && <View onLayout={event => setGridWidth(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{products.data?.items.map(item => <ProductCard key={item.id} item={item} width={cardWidth} />)}</View>}
    {!!products.data && products.data.totalPages > 1 && <View accessibilityLabel="Phân trang kết quả tìm kiếm" style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
      <Button title="Trước" outline disabled={filters.page <= 1} onPress={() => update({ page: filters.page - 1 })} />
      <Text style={{ fontSize: 13, color: colors.muted }}>{filters.page}/{products.data.totalPages}</Text>
      <Button title="Sau" outline disabled={filters.page >= products.data.totalPages} onPress={() => update({ page: filters.page + 1 })} />
    </View>}
  </Page>;
}
