import { useState, type ReactNode } from 'react';
import { Pressable, Text, View, useWindowDimensions, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Check, CircleCheck, CircleX, ClipboardList, CreditCard, History, MapPin, Package, ReceiptText, RotateCcw, ShoppingBag, Store, Truck, X, ChevronRight, type LucideIcon } from 'lucide-react-native';
import { colors, dateTime, money } from '../../theme';
import { groupOrderItems, orderProgress, orderStatusLabels, orderHistoryLabels } from '../../services/order-detail';
import type { Order, OrderItem } from '../../types/api';
import { OrderShippingAddress } from './OrderShippingAddress';

type Props = { order: Order; busy?: boolean; refreshing?: boolean; onCancel: () => void; onRefund: () => void; onReview: (item: OrderItem) => void; onStore: (slug: string) => void };
const card: ViewStyle = { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: '#EEEEF3', boxShadow: '0 3px 14px rgba(35,37,53,0.025)' };
const divider: ViewStyle = { borderTopWidth: 1, borderTopColor: '#EEEEF3' };
const bannerTitles: Record<string, string> = { PENDING: 'Đặt hàng thành công!', CONFIRMED: 'Đơn hàng đã được xác nhận', READY: 'Đơn hàng sẵn sàng giao', SHIPPING: 'Đơn hàng đang được giao', COMPLETED: 'Đơn hàng đã hoàn thành', CANCELLED: 'Đơn hàng đã hủy', REFUNDED: 'Đơn hàng đã hoàn tiền' };

function Panel({ title, Icon, children }: { title: string; Icon: LucideIcon; children: ReactNode }) {
  return <View style={[card, { padding: 16, gap: 14 }]}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Icon size={21} color="#EA2633" strokeWidth={1.8} /><Text accessibilityRole="header" aria-level={2} style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>{title}</Text></View>{children}</View>;
}

function OutlineAction({ title, label, Icon, disabled, onPress }: { title: string; label?: string; Icon: LucideIcon; disabled?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label ?? title} disabled={disabled} accessibilityState={{ disabled: !!disabled }} onPress={onPress} style={({ pressed }) => ({ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 9, gap: 8, borderWidth: 1, borderColor: '#F0525A', borderRadius: 7, backgroundColor: colors.surface, opacity: disabled ? 0.45 : pressed ? 0.65 : 1 })}><Icon size={19} color="#DF2530" strokeWidth={1.8} /><Text style={{ color: '#DF2530', fontSize: 13, fontWeight: '600' }}>{title}</Text></Pressable>;
}

function ProductRow({ item, reviewable, onReview }: { item: OrderItem; reviewable: boolean; onReview: () => void }) {
  const [failed, setFailed] = useState<string | null>(null);
  return <View style={[divider, { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }]}>
    <View style={{ width: 68, height: 68, flexShrink: 0, borderRadius: 7, overflow: 'hidden', backgroundColor: '#F3F3F6', alignItems: 'center', justifyContent: 'center' }}>{item.imageUrl && failed !== item.imageUrl ? <Image source={{ uri: item.imageUrl }} contentFit="contain" accessibilityLabel={item.productName} style={{ width: '100%', height: '100%' }} onError={() => setFailed(item.imageUrl ?? '')} /> : <Package size={28} color={colors.muted} />}</View>
    <View style={{ flex: 1, minWidth: 0, gap: 5 }}><Text style={{ color: colors.text, fontSize: 14, lineHeight: 21, fontWeight: '600' }}>{item.productName}</Text>{!!item.variantName && <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>{item.variantName}</Text>}<Text style={{ color: '#E1232E', fontSize: 15, fontWeight: '700' }}>{money(item.unitPrice)}</Text>{(item.quantity > 1 || item.totalPrice !== item.unitPrice) && <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>Thành tiền: {money(item.totalPrice)}</Text>}{reviewable && <Pressable accessibilityRole="button" accessibilityLabel={`Đánh giá ${item.productName}`} onPress={onReview} style={({ pressed }) => ({ minHeight: 36, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: 10, borderWidth: 1, borderColor: '#F4B6BB', borderRadius: 6, opacity: pressed ? 0.6 : 1 })}><Text style={{ color: '#D92833', fontSize: 12, fontWeight: '600' }}>Đánh giá</Text></Pressable>}</View>
    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>x{item.quantity}</Text>
  </View>;
}

function Progress({ order }: { order: Order }) {
  const { current, dates } = orderProgress(order);
  const steps = [{ title: 'Chờ xác nhận', Icon: ClipboardList }, { title: 'Chờ giao hàng', Icon: Package }, { title: 'Đang giao', Icon: Truck }, { title: 'Hoàn thành', Icon: Check }];
  if (current < 0) return <View style={{ paddingVertical: 6 }}><Text style={{ color: colors.muted, fontSize: 14 }}>{orderStatusLabels[order.status] ?? order.status}</Text></View>;
  return <View accessibilityLabel={`Tiến trình: ${orderStatusLabels[order.status] ?? order.status}`} style={{ flexDirection: 'row', paddingTop: 2, paddingBottom: 5 }}>
    {steps.map(({ title, Icon }, index) => {
      const reached = index <= current;
      return <View key={index} style={{ flex: 1, minWidth: 0, alignItems: 'center', gap: 6 }}>
        <View style={{ width: '100%', alignItems: 'center', height: 34, justifyContent: 'center' }}>
          {index > 0 && <View style={{ position: 'absolute', left: 0, right: '50%', height: 2, backgroundColor: reached ? '#E72B37' : '#E1E2E9' }} />}
          {index < steps.length - 1 && <View style={{ position: 'absolute', left: '50%', right: 0, height: 2, backgroundColor: index < current ? '#E72B37' : '#E1E2E9' }} />}
          <View style={{ width: 32, height: 32, borderRadius: 16, borderWidth: reached ? 0 : 2, borderColor: '#DCDFE7', backgroundColor: reached ? '#E51D2A' : colors.surface, alignItems: 'center', justifyContent: 'center' }}><Icon size={18} color={reached ? colors.surface : '#757B89'} strokeWidth={1.8} /></View>
        </View>
        <Text style={{ color: reached ? '#DA2430' : colors.text, fontSize: 12, lineHeight: 18, fontWeight: index === current ? '700' : '500', textAlign: 'center', paddingHorizontal: 2 }}>{title}</Text>
        {reached && !!dates[index] && <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 15, textAlign: 'center', paddingHorizontal: 2 }}>{dateTime(dates[index]!)}</Text>}
      </View>;
    })}
  </View>;
}

function Amount({ title, value, discount }: { title: string; value: number; discount?: boolean }) {
  return <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}><Text style={{ color: colors.text, fontSize: 13, lineHeight: 20, flex: 1 }}>{title}</Text><Text style={{ color: discount ? '#E52531' : colors.text, fontSize: 13, lineHeight: 20, fontWeight: '700' }}>{discount && value > 0 ? '-' : ''}{money(value)}</Text></View>;
}

export function OrderDetailView({ order, busy, refreshing, onCancel, onRefund, onReview, onStore }: Props) {
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const compact = width < 600;
  const blocked = busy || refreshing;
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const history = [...(order.history ?? [])].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  const reviewable = order.status === 'COMPLETED' || order.status === 'REFUNDED';
  const BannerIcon = order.status === 'CANCELLED' ? CircleX : order.status === 'REFUNDED' ? RotateCcw : CircleCheck;
  const payment = order.paymentMethod === 'COD' || !order.paymentMethod ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod;
  const paymentStatus = order.paymentStatus === 'REFUNDED' ? 'Đã hoàn tiền' : order.paymentStatus === 'PAID' ? 'Đã thanh toán' : order.paymentStatus === 'UNPAID' ? 'Chưa thanh toán' : order.paymentStatus;
  return <View style={{ gap: 16 }}>
    <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'flex-start' : 'stretch', gap: 16 }}>
      <View style={{ flex: wide ? 1 : undefined, minWidth: 0, gap: 12 }}>
        <View style={{ flexDirection: compact ? 'column' : 'row', alignItems: compact ? 'stretch' : 'center', gap: 14, backgroundColor: '#FFF0F2', borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: compact ? undefined : 1, minWidth: 0 }}><BannerIcon size={32} color="#E21E2C" strokeWidth={2.1} /><View style={{ gap: 4, flex: 1 }}><Text style={{ color: '#DB202D', fontSize: 16, lineHeight: 23, fontWeight: '700' }}>{bannerTitles[order.status] ?? 'Thông tin đơn hàng'}</Text><Text style={{ color: colors.text, fontSize: 12, lineHeight: 18 }}>{order.status === 'PENDING' ? 'Cảm ơn bạn đã mua hàng tại Báo chí Online BCA.' : orderStatusLabels[order.status] ?? order.status}</Text></View></View>
          <View style={{ maxWidth: compact ? undefined : 260, gap: 5 }}><Text selectable style={{ color: colors.text, fontSize: 12, lineHeight: 18 }}>Mã đơn hàng: <Text style={{ fontWeight: '700' }}>{order.orderCode}</Text></Text><Text style={{ color: colors.text, fontSize: 11, lineHeight: 17 }}>Đặt lúc: {dateTime(order.createdAt)}</Text></View>
        </View>
        <Panel title="Trạng thái đơn hàng" Icon={ClipboardList}><Progress order={order} /></Panel>
        <Panel title="Thông tin nhận hàng" Icon={MapPin}><View style={{ gap: 6, paddingLeft: compact ? 0 : 31 }}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{order.recipientName}</Text><Text style={{ color: colors.text, fontSize: 14 }}>· {order.recipientPhone}</Text></View><OrderShippingAddress value={order.shippingAddress} /></View></Panel>
        <Panel title={`Sản phẩm (${count})`} Icon={ShoppingBag}>
          {groupOrderItems(order.items).map(group => <View key={group.key}>
            {group.slug ? <Pressable accessibilityRole="button" accessibilityLabel={`Xem cửa hàng ${group.name}`} onPress={() => onStore(group.slug!)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 38, opacity: pressed ? 0.6 : 1 })}><Store size={18} color={colors.primary} /><Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', flexShrink: 1 }}>{group.name}</Text><ChevronRight size={15} color={colors.muted} /></Pressable> : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, minHeight: 38 }}><Store size={18} color={colors.primary} /><Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{group.name}</Text></View>}
            {group.items.map(item => <ProductRow key={item.id} item={item} reviewable={reviewable} onReview={() => onReview(item)} />)}
          </View>)}
        </Panel>
        {!!order.shipments?.length && <Panel title="Thông tin vận chuyển" Icon={Truck}>{order.shipments.map(shipment => <View key={shipment.id} style={{ gap: 6, paddingVertical: 4 }}><Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{shipment.carrier || 'Đơn vị vận chuyển'}{shipment.trackingCode ? ` · ${shipment.trackingCode}` : ''}</Text><Text style={{ color: colors.muted, fontSize: 13 }}>{({ DELIVERED: 'Đã giao hàng', CANCELLED: 'Đã hủy vận đơn', SHIPPING: 'Đang giao', SHIPPED: 'Đã bàn giao vận chuyển', CREATED: 'Đã tạo vận đơn', IN_TRANSIT: 'Đang vận chuyển' } as Record<string, string>)[shipment.status] ?? shipment.status}</Text>{!!shipment.shippedAt && <Text style={{ color: colors.muted, fontSize: 12 }}>Gửi hàng: {dateTime(shipment.shippedAt)}</Text>}{!!shipment.deliveredAt && <Text style={{ color: colors.muted, fontSize: 12 }}>Đã giao: {dateTime(shipment.deliveredAt)}</Text>}</View>)}</Panel>}
        <Panel title="Lịch sử đơn hàng" Icon={History}>
          {history.length ? history.map((entry, index) => <View key={`${entry.createdAt}-${index}`} style={{ flexDirection: 'row', gap: 12 }}><View style={{ width: 16, alignItems: 'center' }}><View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: '#E53641', marginTop: 6 }} />{index < history.length - 1 && <View style={{ flex: 1, minHeight: 40, width: 1, backgroundColor: '#E5E6ED', marginTop: 5 }} />}</View><View style={{ flex: 1, gap: 5, paddingBottom: index < history.length - 1 ? 16 : 0 }}><Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{orderHistoryLabels[entry.newStatus] ?? entry.newStatus}</Text><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>{dateTime(entry.createdAt)}</Text>{!!entry.note && <Text style={{ color: '#575E6D', fontSize: 13, lineHeight: 20 }}>{entry.note}</Text>}</View></View>) : <Text style={{ color: colors.muted, fontSize: 13 }}>Chưa có cập nhật trạng thái.</Text>}
        </Panel>
      </View>
      <View style={{ width: wide ? 350 : undefined, gap: 12, flexShrink: 0 }}>
        <Panel title="Tóm tắt đơn hàng" Icon={ReceiptText}><View style={[divider, { paddingTop: 14, gap: 12 }]}><Amount title={`Tiền hàng (${count} sản phẩm)`} value={order.subtotal} /><Amount title="Giảm tiền hàng" value={order.discountAmount} discount /><Amount title="Phí giao hàng" value={order.shippingFee} />{!!order.shippingDiscountAmount && <Amount title="Giảm phí vận chuyển" value={order.shippingDiscountAmount} discount />}</View><View style={{ backgroundColor: '#FFF0F2', borderRadius: 8, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}><Text style={{ color: '#D91F2C', fontSize: 13, fontWeight: '700' }}>Tổng tiền thanh toán</Text><Text style={{ color: '#E11726', fontSize: 18, fontWeight: '800' }}>{money(order.totalAmount)}</Text></View></Panel>
        <Panel title="Phương thức thanh toán" Icon={CreditCard}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F4F4F7', padding: 12, borderRadius: 7 }}><CreditCard size={20} color={colors.primary} /><Text style={{ color: colors.text, fontSize: 13, lineHeight: 20, flex: 1 }}>{payment}</Text></View><Text style={{ color: colors.muted, fontSize: 12 }}>{paymentStatus}</Text></Panel>
        {((order.status === 'PENDING' && order.paymentStatus === 'UNPAID') || (order.status === 'COMPLETED' && order.paymentStatus === 'PAID')) && <View style={[card, { padding: 16, gap: 10 }]}>
          {order.status === 'PENDING' && order.paymentStatus === 'UNPAID' && <OutlineAction title={busy ? 'Đang hủy...' : 'Hủy đơn hàng'} label="Hủy đơn hàng" Icon={X} disabled={blocked} onPress={onCancel} />}
          {order.status === 'COMPLETED' && order.paymentStatus === 'PAID' && <OutlineAction title="Yêu cầu hoàn tiền" Icon={RotateCcw} onPress={onRefund} />}
        </View>}
      </View>
    </View>
  </View>;
}
