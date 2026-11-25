import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { ArrowLeft, ChevronRight, MessageCircle, Package, Star, Store } from 'lucide-react-native';
import type { Review } from '../product/ProductReviews';
import type { Product } from '../../types/api';
import { colors, dateTime } from '../../theme';

type Props = { review: Review; product?: Pick<Product, 'id' | 'name' | 'imageUrl'>; onProduct: () => void; onOrders: () => void };

export function ReviewDetailView({ review, product, onProduct, onOrders }: Props) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  return <View style={styles.stack}>
    <View style={styles.intro}><Text accessibilityRole="header" style={styles.title}>Đánh giá & phản hồi</Text><Text style={styles.subtitle}>Xem chi tiết đánh giá của bạn và phản hồi từ cửa hàng.</Text></View>
    {product && <Pressable accessibilityRole="button" accessibilityLabel={`Xem sản phẩm ${product.name}`} onPress={onProduct} style={({ pressed }) => [styles.card, styles.product, { opacity: pressed ? 0.7 : 1 }]}>
        <View style={styles.productImage}>{product.imageUrl && failedImage !== product.imageUrl ? <Image source={{ uri: product.imageUrl }} contentFit="cover" accessibilityLabel={product.name} style={{ width: '100%', height: '100%' }} onError={() => setFailedImage(product.imageUrl)} /> : <Package size={24} color={colors.muted} />}</View>
        <View style={{ flex: 1, minWidth: 0, gap: 5 }}><Text numberOfLines={2} style={styles.productName}>{product.name}</Text><Text style={styles.productLink}>Xem sản phẩm</Text></View><ChevronRight size={17} color={colors.muted} />
    </Pressable>}
    <View style={[styles.card, styles.section]}>
        <View style={styles.sectionHead}><Text accessibilityRole="header" aria-level={2} style={styles.heading}>Đánh giá của bạn</Text><Text style={styles.date}>{dateTime(review.createdAt)}</Text></View>
        <View style={styles.rating}><View accessible accessibilityRole="image" accessibilityLabel={`${review.rating} trên 5 sao`} style={styles.stars}>{[1, 2, 3, 4, 5].map(star => <Star key={star} aria-hidden size={21} strokeWidth={1.6} color={star <= review.rating ? '#DE9B16' : '#CFD1D9'} fill={star <= review.rating ? '#F6BD35' : 'transparent'} />)}</View><Text style={styles.score}>{review.rating}<Text style={styles.scoreTotal}> / 5</Text></Text></View>
        <Text selectable style={styles.content}>{review.content}</Text>
        {!!review.imageUrls.length && <View style={styles.photos}>{review.imageUrls.map((uri, index) => <Image key={`${uri}/${index}`} source={{ uri }} accessibilityLabel={`Ảnh đánh giá ${index + 1}`} contentFit="cover" style={styles.photo} />)}</View>}
      <View style={styles.replySection}>
        {review.reply ? <View style={styles.replyCard}>
          <View style={styles.replyHead}><View style={styles.replyIdentity}><View style={styles.storeIcon}><Store size={21} color={colors.primary} /></View><View style={{ flex: 1, minWidth: 0, gap: 4 }}><Text accessibilityRole="header" aria-level={2} style={styles.replyLabel}>Phản hồi từ cửa hàng</Text><Text style={styles.storeName}>{review.reply.storeName}</Text></View></View><Text style={styles.date}>{dateTime(review.reply.updatedAt)}</Text></View>
          <Text selectable style={styles.content}>{review.reply.content}</Text>
        </View> : <View style={styles.emptyReply}><MessageCircle size={23} color={colors.muted} /><View style={{ flex: 1, gap: 5 }}><Text style={styles.heading}>Chưa có phản hồi</Text><Text style={styles.subtitle}>Phản hồi của cửa hàng sẽ xuất hiện tại đây.</Text></View></View>}
      </View>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel="Về đơn hàng của tôi" onPress={onOrders} style={({ pressed }) => [styles.orders, { opacity: pressed ? 0.6 : 1 }]}><ArrowLeft size={15} color={colors.muted} /><Text style={styles.ordersLabel}>Về đơn hàng của tôi</Text></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  stack: { gap: 12 }, intro: { gap: 6, paddingVertical: 4 }, title: { fontSize: 22, lineHeight: 30, fontWeight: '700', color: colors.text }, subtitle: { fontSize: 12, lineHeight: 19, color: colors.muted },
  card: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, product: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }, productImage: { width: 52, height: 52, borderRadius: 9, backgroundColor: colors.background, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, productName: { fontSize: 13, lineHeight: 19, fontWeight: '600', color: colors.text }, productLink: { fontSize: 11, lineHeight: 16, color: colors.primary, fontWeight: '600' },
  section: { padding: 16, gap: 12 }, sectionHead: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, heading: { fontSize: 14, lineHeight: 21, fontWeight: '600', color: colors.text }, date: { fontSize: 11, lineHeight: 17, color: colors.muted }, rating: { flexDirection: 'row', alignItems: 'center', gap: 12 }, stars: { flexDirection: 'row', gap: 4 }, score: { fontSize: 19, fontWeight: '700', color: colors.text }, scoreTotal: { fontSize: 12, fontWeight: '400', color: colors.muted }, content: { fontSize: 14, lineHeight: 22, color: colors.text }, photos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, photo: { width: 72, height: 72, borderRadius: 8 },
  replySection: { borderTopWidth: 1, borderTopColor: '#F0F0F4', paddingTop: 16, marginTop: 4 }, replyCard: { padding: 14, gap: 10, borderRadius: 12, backgroundColor: '#FFF3F5' }, replyHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 8 }, replyIdentity: { flexDirection: 'row', alignItems: 'center', gap: 10, flexGrow: 1, flexBasis: 160, minWidth: 0 }, storeIcon: { width: 36, height: 36, borderRadius: 9, backgroundColor: '#FFE8EC', alignItems: 'center', justifyContent: 'center' }, replyLabel: { fontSize: 11, lineHeight: 16, color: colors.muted }, storeName: { fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.text }, emptyReply: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  orders: { minHeight: 44, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 7, paddingHorizontal: 2 }, ordersLabel: { fontSize: 12, lineHeight: 18, color: colors.muted, fontWeight: '500' },
});
