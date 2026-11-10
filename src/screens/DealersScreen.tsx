import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, Store } from 'lucide-react-native';
import { Button, Page, Status } from '../components/common/ui';
import { DealerHero } from '../components/dealers/DealerHero';
import { DealerCard, DealerSkeleton } from '../components/dealers/DealerCard';
import { DealerSelect } from '../components/dealers/DealerFilters';
import { dealerFilters, dealerPages, dealerQuery, getDealerCategories, getDealerRegions, listDealers } from '../services/dealers';
import { useAuth } from '../stores/auth';
import { colors } from '../theme';
import type { DealerFilters } from '../types/dealers';

export default function DealersScreen() {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const filters = dealerFilters(params);
  const [draft, setDraft] = useState({ url: filters.search, text: filters.search });
  const search = draft.url === filters.search ? draft.text : filters.search;
  const setSearch = (text: string) => setDraft({ url: filters.search, text });
  const [showFilters, setShowFilters] = useState(false);
  const { width } = useWindowDimensions();
  const userId = useAuth(s => s.user?.id);
  const mobile = width < 700;
  const columns = width >= 850 ? 3 : width >= 500 ? 2 : 1;
  const gutter = mobile ? 16 : 24;
  const cardWidth = (Math.min(width, 1180) - gutter * 2 - (columns - 1) * 16) / columns;
  const update = (patch: Partial<DealerFilters>) => router.setParams({ ...filters, ...patch, page: String(patch.page ?? 1), verifiedOnly: undefined });
  useEffect(() => {
    if (search === filters.search) return;
    const timer = setTimeout(() => router.setParams({ search, page: '1' }), 350);
    return () => clearTimeout(timer);
  }, [search, filters.search]);
  const query = useQuery({ queryKey: ['dealers', dealerQuery(filters), userId], queryFn: () => listDealers(filters) });
  const regions = useQuery({ queryKey: ['dealer-regions'], queryFn: getDealerRegions });
  const categories = useQuery({ queryKey: ['dealer-categories'], queryFn: getDealerCategories });
  const totalPages = query.data?.totalPages ?? 0;
  const filtered = !!(filters.search || filters.provinceCode || filters.categoryId);
  const reset = () => { setSearch(''); update({ search: '', provinceCode: '', categoryId: '', sortBy: 'popular' }); };
  return <Page title="Đại lý" back bodyStyle={{ padding: gutter, gap: 20 }}>
    <DealerHero compact={width < 850} />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: mobile ? 160 : 220, backgroundColor: 'white', paddingHorizontal: 13, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
        <Search size={18} color={colors.muted} /><TextInput accessibilityLabel="Tìm kiếm đại lý" placeholder="Tìm tên đại lý…" value={search} onChangeText={setSearch} maxLength={200} returnKeyType="search" onSubmitEditing={() => update({ search })} style={{ flex: 1, minWidth: 0, height: 44, color: colors.text, fontSize: 13 }} />
      </View>
      {mobile && <Pressable accessibilityRole="button" accessibilityLabel="Bộ lọc đại lý" accessibilityState={{ expanded: showFilters }} onPress={() => setShowFilters(!showFilters)} style={{ minHeight: 44, paddingHorizontal: 13, gap: 7, flexDirection: 'row', alignItems: 'center', borderRadius: 12, backgroundColor: 'white', borderWidth: 1, borderColor: colors.border }}><SlidersHorizontal size={17} color={colors.primary} /><Text style={{ fontSize: 13, color: colors.primary }}>Bộ lọc</Text></Pressable>}
      {(!mobile || showFilters) && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: mobile ? '100%' : undefined }}>
        <DealerSelect label="Khu vực" value={filters.provinceCode} options={[{ value: '', label: 'Tất cả khu vực' }, { value: 'Toàn quốc', label: 'Toàn quốc' }, ...(regions.data ?? []).map(name => ({ value: name, label: name }))]} onChange={provinceCode => update({ provinceCode })} />
        <DealerSelect label="Ngành nghề bán hàng" value={filters.categoryId} options={[{ value: '', label: 'Tất cả ngành nghề' }, ...(categories.data ?? []).map(category => ({ value: category.id, label: category.name }))]} onChange={categoryId => update({ categoryId })} />
        <DealerSelect label="Sắp xếp đại lý" value={filters.sortBy} options={[{ value: 'popular', label: 'Phổ biến nhất' }, { value: 'newest', label: 'Mới nhất' }, { value: 'name', label: 'Tên A–Z' }]} onChange={value => update({ sortBy: value as DealerFilters['sortBy'] })} />
      </View>}
    </View>
    {regions.error && <Status error={regions.error} retry={() => void regions.refetch()} />}
    {categories.error && <Status error={categories.error} retry={() => void categories.refetch()} />}
    {filtered && <Pressable accessibilityRole="button" onPress={reset} style={{ minHeight: 44, justifyContent: 'center', alignSelf: 'flex-end' }}><Text style={{ color: colors.primary, fontSize: 13 }}>Xóa bộ lọc</Text></Pressable>}
    {query.isLoading && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>{Array.from({ length: columns * 2 }, (_, i) => <DealerSkeleton key={i} width={cardWidth} />)}</View>}
    <Status error={query.error} retry={() => void query.refetch()} />
    {!query.isLoading && !query.error && query.data?.items.length === 0 && <View style={{ minHeight: 240, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: 'white', borderRadius: 16 }}>
      <View style={{ padding: 18, borderRadius: 35, backgroundColor: '#FFF1EF' }}><Store size={32} color={colors.primary} strokeWidth={1.5} /></View>
      <Text accessibilityRole="header" style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{filtered ? 'Không tìm thấy đại lý phù hợp' : 'Chưa có đại lý'}</Text>
      <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center' }}>{filtered ? 'Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm lại.' : 'Các đại lý đang hoạt động sẽ được hiển thị tại đây.'}</Text>
      {filtered && <Button title="Xóa bộ lọc" outline onPress={reset} />}
    </View>}
    {!query.error && !query.isLoading && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>{query.data?.items.map(dealer => <DealerCard key={dealer.id} dealer={dealer} width={cardWidth} />)}</View>}
    {totalPages > 1 && <View accessibilityLabel="Phân trang đại lý" style={{ flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', paddingVertical: 8 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Trang trước" disabled={filters.page <= 1} onPress={() => update({ page: filters.page - 1 })} style={{ padding: 12, minHeight: 44, opacity: filters.page <= 1 ? 0.3 : 1 }}><ChevronLeft size={18} color={colors.text} /></Pressable>
      {dealerPages(filters.page, totalPages).map(page => <Pressable key={page} accessibilityRole="button" accessibilityLabel={`Trang ${page}`} accessibilityState={{ selected: page === filters.page }} onPress={() => update({ page })} style={{ minWidth: 38, minHeight: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: page === filters.page ? colors.primary : 'white' }}><Text style={{ color: page === filters.page ? 'white' : colors.text, fontWeight: '600' }}>{page}</Text></Pressable>)}
      <Pressable accessibilityRole="button" accessibilityLabel="Trang sau" disabled={filters.page >= totalPages} onPress={() => update({ page: filters.page + 1 })} style={{ padding: 12, minHeight: 44, opacity: filters.page >= totalPages ? 0.3 : 1 }}><ChevronRight size={18} color={colors.text} /></Pressable>
      <Text style={{ fontSize: 12, color: colors.muted }}>{filters.page}/{totalPages}</Text>
    </View>}
  </Page>;
}
