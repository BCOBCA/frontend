import { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Package, Copy, Check, Clock3, Truck, CircleCheck, CircleX, Store, ChevronRight, MapPin, Star, ShoppingCart, type LucideIcon } from 'lucide-react-native';
import { colors, dateTime, money } from '../../theme';
import { groupOrderItems, orderStatusLabels } from '../../services/order-detail';
import type { OrderItem, OrderSummary } from '../../types/api';

type Props = { order: OrderSummary; busy?: boolean; copied?: boolean; onCopy: () => void; onDetails: () => void; onCancel: () => void; onReview: () => void; onBuyAgain: () => void; onStore: (slug: string) => void };
const tones: Record<string, { color: string; background: string; Icon: LucideIcon }> = {
  PENDING: { color: '#B94B00', background: '#FFF2E5', Icon: Clock3 },
  CONFIRMED: { color: '#9A6000', background: '#FFF6DD', Icon: Package },
  READY: { color: '#9A6000', background: '#FFF6DD', Icon: Package },
  SHIPPING: { color: '#0869BB', background: '#EAF4FF', Icon: Truck },
  COMPLETED: { color: '#00844B', background: '#E6F8EF', Icon: CircleCheck },
  CANCELLED: { color: '#686875', background: '#F1F1F5', Icon: CircleX },
  REFUNDED: { color: '#686875', background: '#F1F1F5', Icon: CircleCheck },
};

function Action({ title, label, Icon, primary, disabled, smallScreenCompact, onPress }: { title: string; label: string; Icon?: LucideIcon; primary?: boolean; disabled?: boolean; smallScreenCompact?: boolean; onPress: () => void }) {
  const { width } = useWindowDimensions();
  const compact = width < 600;
  const small = smallScreenCompact && width < 400;
  const color = primary ? colors.surface : colors.text;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} hitSlop={4} style={({ pressed }) => ({ minHeight: small ? 36 : compact ? 44 : 32, minWidth: small ? 80 : 88, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: small ? 4 : 5, paddingHorizontal: small ? 8 : 10, paddingVertical: 5, borderWidth: 1, borderColor: primary ? colors.primary : '#A5A6B2', borderRadius: 6, backgroundColor: primary ? colors.primary : colors.surface, opacity: disabled ? 0.45 : pressed ? 0.7 : 1 })}>{Icon && <Icon size={small ? 13 : 14} color={color} />}<Text style={{ fontSize: small ? 11 : 12, fontWeight: '600', color }}>{title}</Text></Pressable>;
}

function Product({ item, compact }: { item: OrderItem; compact: boolean }) {
  const [failed, setFailed] = useState(false);
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: compact ? 8 : 12, paddingVertical: 6 }}>
    <View style={{ width: compact ? 52 : 56, height: compact ? 52 : 56, borderRadius: 6, backgroundColor: '#F4F4F6', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{item.imageUrl && !failed ? <Image source={{ uri: item.imageUrl }} accessibilityLabel={item.productName} contentFit="contain" style={{ width: '100%', height: '100%' }} onError={() => setFailed(true)} /> : <Package size={23} color={colors.muted} />}</View>
    <View style={{ flex: 1, minWidth: 0, gap: 2 }}><Text style={{ fontSize: 13, lineHeight: 18, fontWeight: '600', color: colors.text }}>{item.productName}</Text>{!!item.variantName && <Text style={{ fontSize: 11, lineHeight: 16, color: colors.muted }}>{item.variantName}</Text>}{compact && <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>{money(item.totalPrice)}</Text>}</View>
    <Text style={{ fontSize: 12, color: colors.muted }}>×{item.quantity}</Text>
    {!compact && <Text style={{ width: 130, textAlign: 'right', fontSize: 13, fontWeight: '600', color: colors.text }}>{money(item.totalPrice)}</Text>}
  </View>;
}

export function OrderListCard({ order, busy, copied, onCopy, onDetails, onCancel, onReview, onBuyAgain, onStore }: Props) {
  const compact = useWindowDimensions().width < 600;
  const tone = tones[order.status] ?? tones.CANCELLED;
  const groups = groupOrderItems(order.items ?? []);
  const singleProduct = order.items?.length === 1 && !!order.items[0].productId;
  const completed = order.status === 'COMPLETED';
  const reviewable = order.canReview ?? completed;
  const allReviewed = !!order.items?.length && order.items.every(item => item.hasReview);
  return <View style={{ backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: compact ? 12 : 14, boxShadow: '0 3px 12px rgba(35,37,53,0.04)' }}>
    <View style={{ flexDirection: compact ? 'column' : 'row', alignItems: compact ? 'stretch' : 'center', justifyContent: 'space-between', gap: compact ? 4 : 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ flex: compact ? undefined : 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8 }}><Package size={18} color={colors.primary} /><View style={{ flex: 1, minWidth: 0, flexDirection: compact ? 'column' : 'row', flexWrap: 'wrap', alignItems: compact ? 'stretch' : 'center', gap: compact ? 0 : 10 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, flexShrink: 1, minWidth: 0 }}><Pressable accessibilityRole="button" accessibilityLabel={`Xem chi tiết đơn ${order.orderCode}`} onPress={onDetails} style={{ minHeight: compact ? 44 : 32, flexShrink: 1, minWidth: 0, justifyContent: 'center' }}><Text style={{ color: colors.text, fontSize: compact ? 12 : 13, lineHeight: 18, fontWeight: '700', flexShrink: 1 }}>{order.orderCode}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Sao chép mã đơn ${order.orderCode}`} onPress={onCopy} style={({ pressed }) => ({ minWidth: compact ? 44 : 32, minHeight: compact ? 44 : 32, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}>{copied ? <Check size={16} color="#00844B" /> : <Copy size={15} color={colors.muted} />}</Pressable></View><Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16 }}>Đặt lúc {dateTime(order.createdAt)}</Text></View></View>
      <View style={{ alignSelf: compact ? 'flex-end' : 'center', flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 20, backgroundColor: tone.background }}><tone.Icon size={13} color={tone.color} /><Text style={{ fontSize: 11, fontWeight: '600', color: tone.color }}>{orderStatusLabels[order.status] ?? order.status}</Text></View>
    </View>
    {groups.map(group => <View key={group.key} style={{ paddingTop: 4 }}>{group.slug ? <Pressable accessibilityRole="button" accessibilityLabel={`Xem cửa hàng ${group.name}`} onPress={() => onStore(group.slug!)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: compact ? 44 : 28, alignSelf: 'flex-start', opacity: pressed ? 0.6 : 1 })}><Store size={16} color={colors.primary} /><Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>{group.name}</Text><ChevronRight size={14} color={colors.muted} /></Pressable> : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: compact ? 32 : 28 }}><Store size={16} color={colors.primary} /><Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>{group.name}</Text></View>}<Product item={group.items[0]} compact={compact} />{group.items.length > 1 && <Pressable accessibilityRole="button" accessibilityLabel={`Xem thêm sản phẩm đơn ${order.orderCode}`} onPress={onDetails} style={{ minHeight: compact ? 44 : 28, justifyContent: 'center', alignSelf: 'flex-end', paddingBottom: 2 }}><Text style={{ color: colors.muted, fontSize: 12 }}>+{group.items.length - 1} sản phẩm khác</Text></Pressable>}</View>)}
    {!groups.length && <View style={{ paddingVertical: 12, gap: 6 }}>{!!order.storeName && <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{order.storeName}</Text>}<Text style={{ fontSize: 13, color: colors.muted }}>Xem sản phẩm trong chi tiết đơn hàng</Text></View>}
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: compact ? 8 : 14, flexWrap: 'wrap', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}><Text style={{ fontSize: 12, color: colors.text }}>Tổng thanh toán:</Text><Text style={{ fontSize: 15, fontWeight: '700', color: colors.primary }}>{money(order.totalAmount)}</Text></View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
        {order.status === 'PENDING' && order.paymentStatus === 'UNPAID' && <Action title={busy ? 'Đang hủy…' : 'Hủy đơn'} label={`Hủy đơn ${order.orderCode}`} disabled={busy} onPress={onCancel} />}
        {order.status === 'SHIPPING' && <Action title="Theo dõi đơn" label={`Theo dõi đơn ${order.orderCode}`} Icon={MapPin} onPress={onDetails} />}
        {(reviewable || allReviewed) && !!order.items?.length && <Action title={allReviewed ? 'Xem đánh giá' : 'Đánh giá'} label={`${allReviewed ? 'Xem đánh giá' : 'Đánh giá'} đơn ${order.orderCode}`} Icon={Star} smallScreenCompact onPress={onReview} />}
        <Action title={completed && singleProduct ? 'Mua lại' : 'Xem chi tiết'} label={completed && singleProduct ? `Mua lại đơn ${order.orderCode}` : `Xem chi tiết đơn ${order.orderCode}`} Icon={completed && singleProduct ? ShoppingCart : undefined} smallScreenCompact={completed && singleProduct} primary onPress={completed && singleProduct ? onBuyAgain : onDetails} />
      </View>
    </View>
  </View>;
}
