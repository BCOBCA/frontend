import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react-native';
import type { Category } from '../../types/api';
import { colors } from '../../theme';

export function AffiliateCategoryStrip({ categories, selectedId, onSelect }: { categories: Category[]; selectedId: string; onSelect: (id: string) => void }) {
  const roots = categories.filter(item => !item.parentId);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [viewport, setViewport] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [offset, setOffset] = useState(0);
  const maxOffset = Math.max(0, contentWidth - viewport);
  const move = (direction: number) => scroll.current?.scrollTo({ x: Math.max(0, Math.min(maxOffset, offset + direction * Math.max(240, viewport * 0.75))), animated: true });
  return <View style={{ backgroundColor: colors.surface, borderRadius: 13, padding: 12, gap: 10 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><LayoutGrid size={18} color="#DE2933" /><Text accessibilityRole="header" aria-level={2} style={{ flex: 1, color: colors.text, fontSize: 14, fontWeight: '700' }}>Danh mục sản phẩm</Text>{maxOffset > 1 && <View style={{ flexDirection: 'row', gap: 4 }}>{[-1, 1].map(direction => { const Icon = direction < 0 ? ChevronLeft : ChevronRight; const disabled = direction < 0 ? offset <= 1 : offset >= maxOffset - 1; return <Pressable key={direction} accessibilityRole="button" accessibilityLabel={direction < 0 ? 'Cuộn danh mục sang trái' : 'Cuộn danh mục sang phải'} disabled={disabled} onPress={() => move(direction)} style={{ minWidth: 34, minHeight: 34, borderRadius: 8, backgroundColor: '#F8F5F6', alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.3 : 1 }}><Icon size={17} color="#D92A33" /></Pressable>; })}</View>}</View>
    <ScrollView ref={scroll} horizontal showsHorizontalScrollIndicator={false} accessibilityLabel="Danh mục sản phẩm, cuộn ngang để xem thêm" onLayout={event => setViewport(event.nativeEvent.layout.width)} onContentSizeChange={width => setContentWidth(width)} onScroll={event => setOffset(event.nativeEvent.contentOffset.x)} scrollEventThrottle={80} contentContainerStyle={{ gap: 8, padding: 1, paddingBottom: 5 }}>
      {[{ id: '', name: 'Tất cả', imageUrl: '' }, ...roots].map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Danh mục: ${item.name}`} accessibilityState={{ selected: item.id === selectedId }} onPress={() => onSelect(item.id)} style={({ pressed }) => ({ width: 76, borderWidth: 1, borderColor: item.id === selectedId ? '#E62C36' : '#F1F0F3', backgroundColor: '#FAF9FA', borderRadius: 9, overflow: 'hidden', opacity: pressed ? 0.65 : 1 })}>
        <View style={{ height: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F1F2' }}>{item.imageUrl ? <Image source={{ uri: item.imageUrl }} contentFit="cover" style={{ width: '100%', height: '100%' }} /> : <LayoutGrid size={23} color={item.id === selectedId ? '#DE2933' : colors.muted} />}</View>
        <Text numberOfLines={2} style={{ minHeight: 32, paddingHorizontal: 3, paddingVertical: 4, textAlign: 'center', color: colors.text, fontSize: 9, lineHeight: 12, fontWeight: '600' }}>{item.name}</Text>
      </Pressable>)}
    </ScrollView>
  </View>;
}
