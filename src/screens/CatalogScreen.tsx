import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Gamepad2, Heart, Newspaper, TicketPercent, LayoutGrid } from 'lucide-react-native';
import { Page as PageView, Section, Empty, Status, Button } from '../components/common/ui';
import { ProductCard } from '../components/product/ProductCard';
import { request } from '../services/api';
import type { Banner, Brand, Page, Product } from '../types/api';
import { colors, styles as s } from '../theme';

const shortcuts = [ { label: 'Mini game', Icon: Gamepad2, href: '/info/game' }, { label: 'Yêu thích', Icon: Heart, href: '/favorites' }, { label: 'Tin tức', Icon: Newspaper, href: '/articles' }, { label: 'Ưu đãi', Icon: TicketPercent, href: '/promotions' } ] as const;
export default function CatalogScreen({ home = false }: { home?: boolean }) {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [brand, setBrand] = useState<string>('');
  const [page, setPage] = useState(1);
  const { width } = useWindowDimensions();
  useEffect(() => { const timer = setTimeout(() => { setDebounced(search); setPage(1); }, 350); return () => clearTimeout(timer); }, [search]);
  const brands = useQuery({ queryKey: ['brands'], queryFn: () => request<Page<Brand>>('GET', '/brands?pageSize=100') });
  const banners = useQuery({ queryKey: ['banners'], queryFn: () => request<Banner[]>('GET', '/banners'), enabled: home });
  const params = `page=${page}&search=${encodeURIComponent(debounced)}${brand ? `&brandId=${brand}` : ''}`;
  const products = useQuery({ queryKey: ['products', params], queryFn: () => request<Page<Product>>('GET', `/products?${params}`) });
  const services = useQuery({ queryKey: ['services', params], queryFn: () => request<Page<Product>>('GET', `/services?${params}`) });
  const items = [...(products.data?.items ?? []), ...(services.data?.items ?? [])];
  const columns = width >= 1100 ? 5 : width >= 768 ? 3 : 2;
  const cardWidth = (Math.min(width, 1180) - 16 - (columns - 1) * 8) / columns;
  const maxPages = Math.max(products.data?.totalPages ?? 1, services.data?.totalPages ?? 1, 1);
  return <PageView search={search} onSearch={setSearch}>
    {home && <>
      <Status loading={banners.isLoading} error={banners.error} retry={() => void banners.refetch()} />
      {banners.data?.length ? <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>{banners.data.map(banner => <Pressable key={banner.id} accessibilityRole="button" accessibilityLabel={banner.title} onPress={() => { if (/^https?:\/\//i.test(banner.targetUrl)) void Linking.openURL(banner.targetUrl); }}><Image source={{ uri: banner.imageUrl }} style={{ width: Math.min(width, 1180), aspectRatio: width >= 768 ? 3.5 : 1.76 }} contentFit="cover" /></Pressable>)}</ScrollView> : !banners.isLoading && !banners.error && <Empty text="Chưa có nội dung nổi bật" />}
      <ScrollView horizontal contentContainerStyle={{ gap: 28, padding: 16, minWidth: '100%', justifyContent: 'space-around', backgroundColor: colors.surface }} showsHorizontalScrollIndicator={false}>
        {shortcuts.map(({ label, Icon, href }) => <Pressable accessibilityRole="button" key={label} onPress={() => router.push(href)} style={{ alignItems: 'center', gap: 8 }}><View style={{ padding: 14, borderRadius: 40, backgroundColor: colors.primary }}><Icon size={26} color={colors.surface} /></View><Text style={{ color: colors.primary, fontSize: 15 }}>{label}</Text></Pressable>)}
      </ScrollView>
      <Section title="Thương hiệu" action="Xem tất cả" onPress={() => router.push('/brands')} />
      <Status loading={brands.isLoading} error={brands.error} retry={() => void brands.refetch()} />
      <View style={{ padding: 8, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: colors.surface, borderRadius: 12 }}>
        {brands.data?.items.slice(0, 6).map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.name} onPress={() => router.push({ pathname: '/brand/[id]', params: { id: item.id } })} style={{ width: '33.3333%', padding: 6 }}><View style={{ height: 64, borderColor: colors.border, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>{item.logoUrl ? <Image source={{ uri: item.logoUrl }} style={{ width: '90%', height: 54 }} contentFit="contain" /> : <Text numberOfLines={2} style={[s.small, { textAlign: 'center' }]}>{item.name}</Text>}</View></Pressable>)}
        {brands.data?.items.length === 0 && <Empty text="Chưa có thương hiệu" />}
      </View>
    </>}
    <ScrollView horizontal contentContainerStyle={{ padding: 16, gap: 20, backgroundColor: colors.surface }} showsHorizontalScrollIndicator={false}>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: !brand }} onPress={() => { setBrand(''); setPage(1); }} style={{ width: 86, alignItems: 'center', gap: 10 }}><LayoutGrid size={48} color={colors.primary} /><Text style={{ color: !brand ? colors.surface : colors.text, backgroundColor: !brand ? colors.primary : colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 3, fontSize: 16 }}>Tất cả</Text></Pressable>
      {brands.data?.items.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: brand === item.id }} onPress={() => { setBrand(item.id); setPage(1); }} style={{ width: 90, alignItems: 'center', gap: 10 }}>{item.logoUrl ? <Image source={{ uri: item.logoUrl }} style={{ width: 60, height: 48 }} contentFit="contain" /> : <View style={{ height: 48, justifyContent: 'center' }}><Text style={s.small}>{item.name.slice(0, 2)}</Text></View>}<Text numberOfLines={3} style={{ textAlign: 'center', fontSize: 14, color: brand === item.id ? colors.primary : colors.text }}>{item.name}</Text></Pressable>)}
    </ScrollView>
    <Status loading={products.isLoading || services.isLoading} error={products.error || services.error} retry={() => { void products.refetch(); void services.refetch(); }} />
    {!products.isLoading && !services.isLoading && !products.error && !services.error && items.length === 0 && <Empty text={search ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm hoặc dịch vụ'} />}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 8 }}>{items.map(item => <ProductCard key={`${item.isService}-${item.id}`} item={item} width={cardWidth} />)}</View>
    {maxPages > 1 && <View style={[s.between, { padding: 16 }]}><Button title="Trước" disabled={page === 1} outline onPress={() => setPage(page - 1)} /><Text style={s.body}>{page}/{maxPages}</Text><Button title="Sau" disabled={page >= maxPages} outline onPress={() => setPage(page + 1)} /></View>}
  </PageView>;
}
