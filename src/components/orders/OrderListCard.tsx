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

function Action({ title, label, Icon, primary, disabled, onPress }: { title: string; label: string; Icon?: LucideIcon; primary?: boolean; disabled?: boolean; onPress: () => void }) {
  const color = primary ? colors.surface : colors.text;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} hitSlop={4} style={({ pressed }) => ({ minHeight: 36, minWidth: 96, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: primary ? colors.primary : '#A5A6B2', borderRadius: 7, backgroundColor: primary ? colors.primary : colors.surface, opacity: disabled ? 0.45 : pressed ? 0.7 : 1 })}>{Icon && <Icon size={15} color={color} />}<Text style={{ fontSize: 12, fontWeight: '600', color }}>{title}</Text></Pressable>;
}

function Product({ item, compact }: { item: OrderItem; compact: boolean }) {
  const [failed, setFailed] = useState(false);
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: compact ? 10 : 16, paddingVertical: 10 }}>
    <View style={{ width: compact ? 64 : 72, height: compact ? 64 : 72, borderRadius: 7, backgroundColor: '#F4F4F6', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{item.imageUrl && !failed ? <Image source={{ uri: item.imageUrl }} accessibilityLabel={item.productName} contentFit="contain" style={{ width: '100%', height: '100%' }} onError={() => setFailed(true)} /> : <Package size={27} color={colors.muted} />}</View>
    <View style={{ flex: 1, minWidth: 0, gap: 4 }}><Text style={{ fontSize: 14, lineHeight: 20, fontWeight: '600', color: colors.text }}>{item.productName}</Text>{!!item.variantName && <Text style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>{item.variantName}</Text>}{compact && <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{money(item.totalPrice)}</Text>}</View>
    <Text style={{ fontSize: 13, color: colors.muted }}>×{item.quantity}</Text>
    {!compact && <Text style={{ width: 170, textAlign: 'right', fontSize: 14, fontWeight: '600', color: colors.text }}>{money(item.totalPrice)}</Text>}
  </View>;
}

export function OrderListCard({ order, busy, copied, onCopy, onDetails, onCancel, onReview, onBuyAgain, onStore }: Props) {
  const compact = useWindowDimensions().width < 600;
  const tone = tones[order.status] ?? tones.CANCELLED;
  const groups = groupOrderItems(order.items ?? []);
  const singleProduct = order.items?.length === 1 && !!order.items[0].productId;
  const completed = order.status === 'COMPLETED';
  return <View style={{ backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: compact ? 14 : 20, boxShadow: '0 3px 12px rgba(35,37,53,0.04)' }}>
    <View style={{ flexDirection: compact ? 'column' : 'row', alignItems: compact ? 'stretch' : 'center', justifyContent: 'space-between', gap: compact ? 5 : 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ flex: compact ? undefined : 1, minWidth: 0, flexDirection: 'row', alignItems: 'flex-start', gap: 9 }}><Package size={21} color={colors.primary} style={{ marginTop: 7 }} /><View style={{ flex: 1, minWidth: 0 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}><Pressable accessibilityRole="button" accessibilityLabel={`Xem chi tiết đơn ${order.orderCode}`} onPress={onDetails} style={{ minHeight: 44, flexShrink: 1, minWidth: 0, justifyContent: 'center' }}><Text style={{ color: colors.text, fontSize: compact ? 13 : 15, lineHeight: 21, fontWeight: '700', flexShrink: 1 }}>{order.orderCode}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Sao chép mã đơn ${order.orderCode}`} onPress={onCopy} style={({ pressed }) => ({ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}>{copied ? <Check size={16} color="#00844B" /> : <Copy size={15} color={colors.muted} />}</Pressable></View><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>Đặt lúc {dateTime(order.createdAt)}</Text></View></View>
      <View style={{ alignSelf: compact ? 'flex-end' : 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 11, borderRadius: 20, backgroundColor: tone.background }}><tone.Icon size={15} color={tone.color} /><Text style={{ fontSize: 12, fontWeight: '600', color: tone.color }}>{orderStatusLabels[order.status] ?? order.status}</Text></View>
    </View>
    {groups.map(group => <View key={group.key} style={{ paddingTop: 5 }}>{group.slug ? <Pressable accessibilityRole="button" accessibilityLabel={`Xem cửa hàng ${group.name}`} onPress={() => onStore(group.slug!)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, alignSelf: 'flex-start', opacity: pressed ? 0.6 : 1 })}><Store size={16} color={colors.primary} /><Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>{group.name}</Text><ChevronRight size={14} color={colors.muted} /></Pressable> : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36 }}><Store size={16} color={colors.primary} /><Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>{group.name}</Text></View>}<Product item={group.items[0]} compact={compact} />{group.items.length > 1 && <Pressable accessibilityRole="button" accessibilityLabel={`Xem thêm sản phẩm đơn ${order.orderCode}`} onPress={onDetails} style={{ minHeight: 36, justifyContent: 'center', alignSelf: 'flex-end', paddingBottom: 6 }}><Text style={{ color: colors.muted, fontSize: 12 }}>+{group.items.length - 1} sản phẩm khác</Text></Pressable>}</View>)}
    {!groups.length && <View style={{ paddingVertical: 18, gap: 8 }}>{!!order.storeName && <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{order.storeName}</Text>}<Text style={{ fontSize: 13, color: colors.muted }}>Xem sản phẩm trong chi tiết đơn hàng</Text></View>}
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: compact ? 12 : 20, flexWrap: 'wrap', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}><Text style={{ fontSize: 13, color: colors.text }}>Tổng thanh toán:</Text><Text style={{ fontSize: 17, fontWeight: '700', color: colors.primary }}>{money(order.totalAmount)}</Text></View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' }}>
        {order.status === 'PENDING' && order.paymentStatus === 'UNPAID' && <Action title={busy ? 'Đang hủy…' : 'Hủy đơn'} label={`Hủy đơn ${order.orderCode}`} disabled={busy} onPress={onCancel} />}
        {order.status === 'SHIPPING' && <Action title="Theo dõi đơn" label={`Theo dõi đơn ${order.orderCode}`} Icon={MapPin} onPress={onDetails} />}
        {completed && !!order.items?.length && <Action title="Đánh giá" label={`Đánh giá đơn ${order.orderCode}`} Icon={Star} onPress={onReview} />}
        <Action title={completed && singleProduct ? 'Mua lại' : 'Xem chi tiết'} label={completed && singleProduct ? `Mua lại đơn ${order.orderCode}` : `Xem chi tiết đơn ${order.orderCode}`} Icon={completed && singleProduct ? ShoppingCart : undefined} primary onPress={completed && singleProduct ? onBuyAgain : onDetails} />
      </View>
    </View>
  </View>;
}
