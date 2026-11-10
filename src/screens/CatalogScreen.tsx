import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Gamepad2, Heart, Newspaper, TicketPercent, MessageSquare, Info, Handshake, Store, Phone } from 'lucide-react-native';
import { Page as PageView, Section, Empty, Status, Button } from '../components/common/ui';
import { BannerCarousel } from '../components/common/BannerCarousel';
import { ProductCard } from '../components/product/ProductCard';
import { BrandCoverGrid } from '../components/brands/BrandCoverGrid';
import { BrandExplorer } from '../components/brands/BrandExplorer';
import { CategoryGrid } from '../components/categories/CategoryGrid';
import { request } from '../services/api';
import { productSearchHref } from '../services/product-search';
import type { Banner, Brand, Category, Page, Product } from '../types/api';
import { colors, styles as s } from '../theme';

const shortcuts = [
  { label: 'Mini game', Icon: Gamepad2, href: '/info/game' },
  { label: 'Yêu thích', Icon: Heart, href: '/favorites' },
  { label: 'Tin tức', Icon: Newspaper, href: '/articles' },
  { label: 'Ưu đãi', Icon: TicketPercent, href: '/promotions' },
  { label: 'Góp ý', Icon: MessageSquare, href: '/feedback' },
  { label: 'Về chúng tôi', Icon: Info, href: '/info/about' },
  { label: 'Cộng tác', Icon: Handshake, href: '/info/collaboration' },
  { label: 'Đại lý', Icon: Store, href: '/dai-ly' },
  { label: 'Liên hệ', Icon: Phone, href: '/info/contact' },
] as const;
export default function CatalogScreen({ home = false }: { home?: boolean }) {
  const { search: searchParam } = useLocalSearchParams<{ search?: string }>();
  const search = searchParam ?? '';
  const [debounced, setDebounced] = useState('');
  const [brand, setBrand] = useState<string>('');
  const [page, setPage] = useState(1);
  const { width } = useWindowDimensions();
  useEffect(() => { const timer = setTimeout(() => { setDebounced(search); setPage(1); }, 350); return () => clearTimeout(timer); }, [search]);
  const brands = useQuery({ queryKey: ['brands'], queryFn: () => request<Page<Brand>>('GET', '/brands?pageSize=100'), enabled: home });
  const categories = useQuery({ queryKey: ['categories'], queryFn: () => request<Page<Category>>('GET', '/categories?pageSize=100'), enabled: !home });
  const banners = useQuery({ queryKey: ['banners'], queryFn: () => request<Banner[]>('GET', '/banners'), enabled: home });
  const params = `page=${page}&search=${encodeURIComponent(debounced)}${brand ? `&brandId=${brand}` : ''}`;
  const productParams = `${params}&pageSize=30`;
  const products = useQuery({ queryKey: ['products', productParams], queryFn: () => request<Page<Product>>('GET', `/products?${productParams}`), enabled: home });
  const services = useQuery({ queryKey: ['services', params], queryFn: () => request<Page<Product>>('GET', `/services?${params}`), enabled: home });
  const items = [...(products.data?.items ?? []), ...(services.data?.items ?? [])];
  const columns = width >= 1100 ? 6 : width >= 768 ? 3 : 2;
  const cardGap = width >= 1100 ? 12 : 8;
  const cardWidth = (Math.min(width, 1180) - 16 - (columns - 1) * cardGap) / columns;
  const maxPages = Math.max(products.data?.totalPages ?? 1, services.data?.totalPages ?? 1, 1);
  return <PageView>
    {home && <>
      <Status loading={banners.isLoading} error={banners.error} retry={() => void banners.refetch()} />
      {banners.data?.length ? <BannerCarousel key={banners.data.map(banner => banner.id).join('|')} banners={banners.data} width={width} /> : !banners.isLoading && !banners.error && <Empty text="Chưa có nội dung nổi bật" />}
      <ScrollView horizontal contentContainerStyle={{ gap: 12, padding: 12, minWidth: '100%', justifyContent: 'space-around', backgroundColor: colors.surface }} showsHorizontalScrollIndicator>
        {shortcuts.map(({ label, Icon, href }) => <Pressable accessibilityRole="button" accessibilityLabel={label} key={label} onPress={() => router.push(href)} style={{ alignItems: 'center', gap: 6, minWidth: 80, minHeight: 64 }}><View style={{ padding: 11, borderRadius: 24, backgroundColor: colors.primary }}><Icon size={22} color={colors.surface} /></View><Text style={{ color: colors.primary, fontSize: 14 }}>{label}</Text></Pressable>)}
      </ScrollView>
      <Section title="Thương hiệu" action="Xem tất cả" onPress={() => router.push('/brands')} />
    </>}
    {home && <><Status loading={brands.isLoading} error={brands.error} retry={() => void brands.refetch()} />
    {!!brands.data?.items.length && <View style={{ padding: 12, gap: 16 }}>
      <BrandCoverGrid brands={brands.data.items} onSelect={item => router.push({ pathname: '/brand/[id]', params: { id: item.id } })} />
      <BrandExplorer brands={brands.data.items} selectedId={brand} onSelect={item => { setBrand(item.id); setPage(1); }} onClear={() => { setBrand(''); setPage(1); }} />
    </View>}
    {brands.data?.items.length === 0 && <Empty text="Chưa có thương hiệu" />}</>}
    {!home && <View style={{ padding: 12, gap: 16 }}>
      <Status loading={categories.isLoading} error={categories.error} retry={() => void categories.refetch()} />
      {!!categories.data?.items.length && <CategoryGrid categories={categories.data.items.filter(item => !item.parentId)} selectedId="" onSelect={categoryId => router.push(productSearchHref({ categoryId }))} />}
      {!categories.isLoading && !categories.error && categories.data?.items.length === 0 && <Empty text="Chưa có danh mục" />}
    </View>}
    {home && <><Status loading={products.isLoading || services.isLoading} error={products.error || services.error} retry={() => { void products.refetch(); void services.refetch(); }} />
    {!products.isLoading && !products.error && !services.isLoading && !services.error && items.length === 0 && <Empty text={search ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm hoặc dịch vụ'} />}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: cardGap }}>{items.map(item => <ProductCard key={`${item.isService}-${item.id}`} item={item} width={cardWidth} />)}</View>
    {maxPages > 1 && <View style={[s.between, { padding: 16 }]}><Button title="Trước" disabled={page === 1} outline onPress={() => setPage(page - 1)} /><Text style={s.body}>{page}/{maxPages}</Text><Button title="Sau" disabled={page >= maxPages} outline onPress={() => setPage(page + 1)} /></View>}</>}
  </PageView>;
}
