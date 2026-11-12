import { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { ArrowLeft, ArrowRight, PackageSearch } from 'lucide-react-native';
import { AffiliateProductCard } from './AffiliateProductCard';
import type { AffiliateProduct } from './affiliate-catalog';
import { colors } from '../../theme';
import { gridItemWidth } from '../common/grid-layout';

export function AffiliateCatalogGrid({ items, fallbackWidth, loading, error, page, totalPages, busyId, onRetry, onPage, onOpen, onGetLink }: { items: AffiliateProduct[]; fallbackWidth: number; loading?: boolean; error?: string; page: number; totalPages: number; busyId?: string | null; onRetry: () => void; onPage: (page: number) => void; onOpen: (item: AffiliateProduct) => void; onGetLink: (item: AffiliateProduct) => void }) {
  const [measured, setMeasured] = useState(0);
  const { width: viewportWidth } = useWindowDimensions();
  const width = measured || fallbackWidth;
  const columns = width >= 700 ? 4 : width >= 500 ? 3 : 2;
  const gap = 14;
  const cardWidth = gridItemWidth(width, columns, gap);
  const catalogColumns = viewportWidth >= 1100 ? 6 : viewportWidth >= 768 ? 3 : 2;
  const catalogGap = viewportWidth >= 1100 ? 12 : 8;
  const catalogCardWidth = (Math.min(viewportWidth, 1180) - 16 - (catalogColumns - 1) * catalogGap) / catalogColumns;
  const imageWidth = Math.max(0, Math.min(cardWidth, catalogCardWidth) - 22);
  return <View onLayout={event => setMeasured(event.nativeEvent.layout.width)} style={{ gap: 12 }}>
    {loading ? <View accessibilityRole="progressbar" accessibilityLabel="Đang tải sản phẩm cộng tác" style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>{Array.from({ length: columns * 2 }, (_, index) => <View key={index} style={{ width: cardWidth, backgroundColor: colors.surface, padding: 8, borderRadius: 12, gap: 10 }}><View style={{ aspectRatio: 1.1, borderRadius: 9, backgroundColor: '#ECECF1' }} /><View style={{ width: '90%', height: 14, backgroundColor: '#ECECF1', borderRadius: 4 }} /><View style={{ width: '65%', height: 12, backgroundColor: '#F2F1F5', borderRadius: 4 }} /><View style={{ height: 34, backgroundColor: '#FFF0F1', borderRadius: 7 }} /></View>)}</View>
      : error ? <View style={{ alignItems: 'center', gap: 12, padding: 24 }}><Text accessibilityRole="alert" style={{ color: '#BD2C35', fontSize: 13, textAlign: 'center' }}>{error}</Text><Pressable accessibilityRole="button" accessibilityLabel="Thử lại sản phẩm" onPress={onRetry} style={{ minHeight: 44, paddingHorizontal: 18, justifyContent: 'center' }}><Text style={{ color: colors.primary }}>Thử lại</Text></Pressable></View>
        : !items.length ? <View style={{ padding: 32, alignItems: 'center', gap: 10 }}><PackageSearch size={35} color={colors.muted} /><Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>Chưa có sản phẩm phù hợp</Text><Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center' }}>Thử danh mục hoặc từ khóa khác.</Text></View>
          : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>{items.map(item => <AffiliateProductCard key={item.id} item={item} width={cardWidth} imageWidth={imageWidth} busy={busyId === item.id} disabled={!!busyId} onOpen={() => onOpen(item)} onGetLink={() => onGetLink(item)} />)}</View>}
    {!loading && !error && totalPages > 1 && <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}><Pressable accessibilityRole="button" accessibilityLabel="Trang sản phẩm trước" disabled={page <= 1} onPress={() => onPage(page - 1)} style={{ minHeight: 44, flexDirection: 'row', gap: 5, alignItems: 'center', opacity: page <= 1 ? 0.3 : 1 }}><ArrowLeft size={16} color={colors.text} /><Text style={{ fontSize: 12, color: colors.text }}>Trước</Text></Pressable><Text style={{ fontSize: 12, color: colors.muted }}>{page} / {totalPages}</Text><Pressable accessibilityRole="button" accessibilityLabel="Trang sản phẩm sau" disabled={page >= totalPages} onPress={() => onPage(page + 1)} style={{ minHeight: 44, flexDirection: 'row', gap: 5, alignItems: 'center', opacity: page >= totalPages ? 0.3 : 1 }}><Text style={{ fontSize: 12, color: colors.text }}>Sau</Text><ArrowRight size={16} color={colors.text} /></Pressable></View>}
  </View>;
}
