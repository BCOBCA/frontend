import { useRef, useState, type ComponentRef } from 'react';
import { Image } from 'expo-image';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight, Maximize2, Package, X } from 'lucide-react-native';
import { colors } from '../../theme';

export function ProductGallery({ name, imageUrl, imageUrls, vertical = false, height = 260 }: { name: string; imageUrl?: string | null; imageUrls?: string[] | null; vertical?: boolean; height?: number }) {
  const urls = [...new Set([imageUrl, ...(imageUrls ?? [])].filter((url): url is string => typeof url === 'string' && url.trim().length > 0))];
  const [active, setActive] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const index = Math.min(active, Math.max(0, urls.length - 1));
  const select = (next: number) => {
    setActive(next);
    scroll.current?.scrollTo({ x: next * pageWidth, animated: true });
  };
  const thumbnails = urls.length > 1 && <ScrollView horizontal={!vertical} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={vertical ? { width: 60, maxHeight: height, flexGrow: 0 } : undefined} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
    {urls.map((url, position) => <Pressable key={url} accessibilityRole="button" accessibilityLabel={`Xem ảnh ${position + 1} của ${name}`} aria-pressed={index === position} onPress={() => select(position)} style={{ width: 56, height: 56, padding: 4, borderRadius: 8, borderWidth: 2, borderColor: index === position ? colors.primary : colors.border, backgroundColor: colors.surface }}>
      <Image source={{ uri: url }} contentFit="contain" accessibilityLabel="" style={{ width: '100%', height: '100%' }} />
    </Pressable>)}
  </ScrollView>;
  if (!urls.length) return <View style={{ height, alignItems: 'center', justifyContent: 'center', gap: 10 }}><Package size={38} color={colors.muted} /><Text style={{ color: colors.muted }}>Chưa có ảnh sản phẩm</Text></View>;
  return <View style={{ gap: 12, flexDirection: vertical ? 'row' : 'column' }}>
    {vertical && thumbnails}
    <View onLayout={event => setPageWidth(event.nativeEvent.layout.width)} style={{ flex: vertical ? 1 : undefined, width: vertical ? undefined : '100%', minWidth: 0, height, overflow: 'hidden', borderRadius: 10, backgroundColor: '#F7F8FA' }}>
      <ScrollView ref={scroll} horizontal pagingEnabled showsHorizontalScrollIndicator={false} scrollEnabled={urls.length > 1} scrollEventThrottle={16}
        onContentSizeChange={() => scroll.current?.scrollTo({ x: index * pageWidth, animated: false })}
        onScroll={event => { if (pageWidth > 0) setActive(Math.max(0, Math.min(urls.length - 1, Math.round(event.nativeEvent.contentOffset.x / pageWidth)))); }}>
        {urls.map((url, position) => <Image key={url} source={{ uri: url }} contentFit="contain" accessibilityLabel={`${name} - ảnh ${position + 1} / ${urls.length}`} style={{ width: pageWidth || 1, height }} />)}
      </ScrollView>
      {urls.length > 1 && <>
        <Pressable accessibilityRole="button" accessibilityLabel="Ảnh trước" disabled={index === 0} aria-disabled={index === 0} onPress={() => select(index - 1)} style={{ position: 'absolute', left: 6, top: (height - 44) / 2, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', opacity: index === 0 ? 0.4 : 1 }}><ChevronLeft size={22} color={colors.text} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Ảnh tiếp theo" disabled={index === urls.length - 1} aria-disabled={index === urls.length - 1} onPress={() => select(index + 1)} style={{ position: 'absolute', right: 6, top: (height - 44) / 2, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', opacity: index === urls.length - 1 ? 0.4 : 1 }}><ChevronRight size={22} color={colors.text} /></Pressable>
        <View style={{ position: 'absolute', right: 12, bottom: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: colors.surface }}><Text accessibilityRole="status" style={{ color: colors.text, fontSize: 12 }}>{`${index + 1} / ${urls.length}`}</Text></View>
      </>}
      <Pressable accessibilityRole="button" accessibilityLabel="Phóng to ảnh sản phẩm" onPress={() => setExpanded(true)} style={{ position: 'absolute', right: 8, top: 8, width: 36, height: 36, borderRadius: 8, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}><Maximize2 size={17} color={colors.muted} /></Pressable>
    </View>
    {!vertical && thumbnails}
    {expanded && <Modal transparent animationType="fade" visible onRequestClose={() => setExpanded(false)}><View style={{ flex: 1, backgroundColor: 'rgba(15,20,30,0.95)', padding: 24, alignItems: 'center', justifyContent: 'center' }}><Image source={{ uri: urls[index] }} contentFit="contain" accessibilityLabel={`${name} - ảnh phóng to`} style={{ width: '100%', height: '85%' }} /><Pressable accessibilityRole="button" accessibilityLabel="Đóng ảnh phóng to" onPress={() => setExpanded(false)} style={{ position: 'absolute', right: 20, top: 20, padding: 12, borderRadius: 24, backgroundColor: colors.surface }}><X size={24} color={colors.text} /></Pressable></View></Modal>}
  </View>;
}
