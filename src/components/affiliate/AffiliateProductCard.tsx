import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Link2, Package, Star } from 'lucide-react-native';
import { colors, money } from '../../theme';
import { affiliatePrice, type AffiliateProduct } from './affiliate-catalog';

export function AffiliateProductCard({ item, width, imageWidth, busy, disabled, onOpen, onGetLink }: { item: AffiliateProduct; width: number; imageWidth?: number; busy?: boolean; disabled?: boolean; onOpen: () => void; onGetLink: () => void }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const price = affiliatePrice(item);
  return <View style={{ width, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, gap: 10 }}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Xem sản phẩm: ${item.name}`} onPress={onOpen} style={{ width: '100%', ...(imageWidth === undefined ? { aspectRatio: 1.1 } : { height: imageWidth / 1.1 }), marginBottom: -4, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {item.imageUrl && failedImage !== item.imageUrl ? <Image source={{ uri: item.imageUrl }} accessibilityLabel={item.name} contentFit="contain" onError={() => setFailedImage(item.imageUrl)} style={imageWidth === undefined ? { width: '100%', height: '100%' } : { width: imageWidth, height: imageWidth / 1.1 }} /> : <Package size={32} color={colors.muted} />}
      {price.discount > 0 && <View style={{ position: 'absolute', left: 0, top: 0, borderRadius: 9, backgroundColor: colors.primary, paddingHorizontal: 7, paddingVertical: 3 }}><Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>-{price.discount}%</Text></View>}
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel={`Chi tiết: ${item.name}`} onPress={onOpen}><Text numberOfLines={2} style={{ minHeight: 36, fontSize: 12, lineHeight: 18, color: colors.text, fontWeight: '600' }}>{item.name}</Text></Pressable>
    <View style={{ minHeight: 14, flexDirection: 'row', alignItems: 'center', gap: 4 }}>{item.rating !== null ? <><Star size={11} fill="#F5B321" color="#F5B321" /><Text style={{ fontSize: 10, color: colors.text }}>{item.rating.toFixed(1)} ({item.reviewCount.toLocaleString('vi-VN')})</Text></> : <Text style={{ fontSize: 10, color: colors.muted }}>Chưa có đánh giá</Text>}</View>
    <View style={{ gap: 3, marginTop: 'auto' }}>
      <Text accessibilityLabel={`Hoa hồng ước tính: ${money(item.estimatedCommission)}`} style={{ color: colors.primary, fontSize: 13, lineHeight: 19, fontWeight: '700' }}>Kiếm {money(item.estimatedCommission)}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 6, rowGap: 2 }}>
        <Text style={{ color: colors.text, fontSize: width < 190 ? 11 : 13, lineHeight: 18, fontWeight: '700' }}>{price.current === null ? 'Liên hệ' : money(price.current)}</Text>
        {price.original !== null && <Text style={{ fontSize: width < 190 ? 9 : 10, color: colors.muted, textDecorationLine: 'line-through' }}>{money(price.original)}</Text>}
      </View>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={`Lấy link: ${item.name}`} accessibilityHint="Tạo và sao chép liên kết cộng tác để chia sẻ" accessibilityState={{ disabled: !!disabled || !!busy, busy: !!busy }} disabled={disabled || busy} onPress={onGetLink} hitSlop={{ top: 6, bottom: 6 }} style={({ pressed }) => ({ minHeight: 30, borderWidth: 1, borderColor: colors.primary, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, opacity: disabled || busy ? 0.5 : pressed ? 0.65 : 1 })}>{busy ? <ActivityIndicator size="small" color={colors.primary} /> : <Link2 size={14} color={colors.primary} />}<Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{busy ? 'Đang lấy...' : 'Lấy link'}</Text></Pressable>
  </View>;
}
