import { useState, type ReactNode } from 'react';
import { Pressable, Text, View, useWindowDimensions, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight, Circle, CircleCheck, CreditCard, MapPin, MessageSquare, Package, Store, TicketPercent, Truck, type LucideIcon } from 'lucide-react-native';
import { Button, Status } from '../common/ui';
import { CheckoutAddress } from './CheckoutAddress';
import { CheckoutOrderButton } from './CheckoutSubmitBar';
import { CheckoutVoucherPicker } from './CheckoutVoucherPicker';
import { CheckoutNoteField } from './CheckoutNoteField';
import type { CheckoutVoucherCategory } from '../../services/checkout-vouchers';
import { canSelectCartItem, groupCartItems } from '../../services/cart';
import type { Address, Cart, CartItem, CheckoutPreview } from '../../types/api';
import { colors, money } from '../../theme';

export type CheckoutViewProps = {
  cart?: Cart; addresses: Address[]; addressId: string; preview?: CheckoutPreview;
  note: string; automaticVouchers?: boolean; hideSubmitButton?: boolean;
  loading?: boolean; refreshing?: boolean; previewLoading?: boolean; busy?: boolean; error?: unknown; previewError?: unknown;
  onAddress: (id: string) => void; onSelectVoucher: (category: CheckoutVoucherCategory, code: string | null) => void; onAutoVouchers: () => void; onNote: (value: string) => void;
  onAddAddress: () => void; onCart: () => void; onOrder: () => void; onRetry: () => void; onRetryPreview: () => void;
};
const panel: ViewStyle = { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, boxShadow: '0 3px 14px rgba(30,32,45,0.035)' };
const line: ViewStyle = { borderTopWidth: 1, borderTopColor: '#EEEEF3' };

function Action({ title, label, disabled, outline, onPress }: { title: string; label?: string; disabled?: boolean; outline?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label ?? title} disabled={disabled} accessibilityState={{ disabled: !!disabled }} hitSlop={outline ? 5 : undefined} onPress={onPress} style={({ pressed }) => ({ minHeight: outline ? 34 : 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: outline ? 10 : 0, borderWidth: outline ? 1 : 0, borderColor: '#D7D8E0', borderRadius: outline ? 6 : 7, opacity: disabled ? 0.4 : pressed ? 0.6 : 1 })}>
    <Text style={{ fontSize: outline ? 12 : 13, fontWeight: outline ? '500' : '600', color: outline ? '#4A5060' : '#E2242E' }}>{title}</Text>{!outline && <ChevronRight size={16} color="#E2242E" />}
  </Pressable>;
}

function OptionRow({ title, Icon, compact, children }: { title: string; Icon: LucideIcon; compact: boolean; children: ReactNode }) {
  return <View style={[line, { flexDirection: compact ? 'column' : 'row', gap: compact ? 8 : 16, paddingVertical: 13, alignItems: compact ? 'stretch' : 'flex-start' }]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, width: compact ? undefined : 204, minHeight: compact ? 28 : 36, flexShrink: 0 }}><Icon size={21} color={colors.text} strokeWidth={1.7} /><Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, flexShrink: 1 }}>{title}</Text></View>
    <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
  </View>;
}

function ProductLine({ item }: { item: CartItem }) {
  const [failed, setFailed] = useState<string | null>(null);
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16 }}>
    <View style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: '#F3F3F5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {item.imageUrl && failed !== item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="contain" accessibilityLabel={item.name} onError={() => setFailed(item.imageUrl)} /> : <Package size={30} color={colors.muted} />}
    </View>
    <View style={{ flex: 1, minWidth: 0, gap: 7 }}><Text style={{ fontSize: 14, lineHeight: 21, fontWeight: '700', color: colors.text }}>{item.name}</Text>{!!item.variantName && <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>{item.variantName}</Text>}<Text style={{ fontSize: 17, fontWeight: '700', color: '#E4242F' }}>{money(item.unitPrice)}</Text>{!canSelectCartItem(item) && <Text style={{ color: colors.primary, fontSize: 12 }}>Sản phẩm không khả dụng hoặc không đủ tồn kho.</Text>}</View>
    <Text style={{ color: colors.text, fontSize: 14 }}>x{item.quantity}</Text>
  </View>;
}

function Amount({ label, value, discount }: { label: string; value?: number; discount?: boolean }) {
  return <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}><Text style={{ flex: 1, fontSize: 14, lineHeight: 21, color: colors.text }}>{label}</Text><Text style={{ fontSize: 14, lineHeight: 21, fontWeight: '600', color: discount ? '#E4242F' : colors.text }}>{value == null ? '—' : `${discount && value > 0 ? '-' : ''}${money(value)}`}</Text></View>;
}

export function CheckoutView(p: CheckoutViewProps) {
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const compact = width < 700;
  const [addressOpen, setAddressOpen] = useState(false);
  const [voucherOpen, setVoucherOpen] = useState<CheckoutVoucherCategory | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const address = p.addresses.find(item => item.id === p.addressId) ?? p.addresses.find(item => item.isDefault) ?? p.addresses[0];
  const items = p.cart?.items.filter(item => item.isSelected) ?? [];
  const selectedCodes = p.preview?.appliedVoucherCodes ?? [];
  const locked = !!p.busy || !!p.previewLoading;
  const orderDisabled = locked || p.loading || p.refreshing || p.previewLoading || !!p.error || !!p.previewError || !p.preview || !address || !p.cart?.selectedCount || !items.length || items.some(item => !canSelectCartItem(item));
  return <View style={{ gap: 16 }}>
    <Status loading={p.loading} error={p.error} retry={p.onRetry} />
    <View style={[panel, { paddingHorizontal: compact ? 16 : 20, paddingVertical: 14, gap: 12 }]}>
      <View style={{ flexDirection: compact ? 'column' : 'row', alignItems: compact ? 'stretch' : 'center', gap: compact ? 12 : 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingRight: compact ? 0 : 24, borderRightWidth: compact ? 0 : 1, borderRightColor: colors.border }}><MapPin size={25} color="#EE2733" strokeWidth={1.8} /><Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, flex: compact ? 1 : undefined }}>Địa chỉ nhận hàng</Text>{compact && <Action title={address ? addressOpen ? 'Đóng' : 'Thay đổi' : 'Thêm địa chỉ'} label={address ? 'Thay đổi địa chỉ nhận hàng' : 'Thêm địa chỉ'} outline disabled={locked || p.loading} onPress={() => address ? setAddressOpen(!addressOpen) : p.onAddAddress()} />}</View>
        {address ? <CheckoutAddress address={address} /> : <Text style={{ flex: 1, fontSize: 14, color: colors.muted }}>Chưa có địa chỉ nhận hàng.</Text>}
        {!compact && <View style={{ alignSelf: 'center' }}><Action title={address ? addressOpen ? 'Đóng' : 'Thay đổi' : 'Thêm địa chỉ'} label={address ? 'Thay đổi địa chỉ nhận hàng' : 'Thêm địa chỉ'} outline disabled={locked || p.loading} onPress={() => address ? setAddressOpen(!addressOpen) : p.onAddAddress()} /></View>}
      </View>
      {addressOpen && <View style={[line, { paddingTop: 8, gap: 6 }]}>
        {p.addresses.map(item => <Pressable key={item.id} accessibilityRole="radio" accessibilityLabel={`Giao đến ${item.recipientName}, ${item.addressLine}`} accessibilityState={{ checked: address?.id === item.id, disabled: locked }} aria-checked={address?.id === item.id} disabled={locked} onPress={() => { p.onAddress(item.id); setAddressOpen(false); }} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderWidth: 1, borderColor: address?.id === item.id ? '#F0969B' : colors.border, borderRadius: 8, backgroundColor: address?.id === item.id ? '#FFF7F7' : colors.surface, opacity: locked ? 0.5 : pressed ? 0.7 : 1 })}>{address?.id === item.id ? <CircleCheck size={20} color={colors.primary} /> : <Circle size={20} color={colors.muted} />}<CheckoutAddress address={item} /></Pressable>)}
        <Action title="Thêm địa chỉ" disabled={locked} onPress={p.onAddAddress} />
      </View>}
    </View>
    <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'flex-start' : 'stretch', gap: 14 }}>
      <View style={{ flex: wide ? 1 : undefined, minWidth: 0, gap: 12 }}>
        {groupCartItems(items).map(group => {
          const storeId = group.items[0].storeId;
          const category: CheckoutVoucherCategory = `store:${storeId}`;
          const storeOrder = p.preview?.storeOrders?.find(order => order.storeId === storeId);
          const saving = storeOrder?.shopDiscountAmount ?? 0;
          const netShipping = storeOrder ? Math.max(0, storeOrder.shippingFee - storeOrder.shippingDiscountAmount) : undefined;
          return <View key={group.key} style={[panel, { paddingHorizontal: compact ? 14 : 20, paddingBottom: 14 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14 }}><Store size={18} color={colors.text} strokeWidth={1.7} /><Text accessibilityRole="header" style={{ color: colors.text, fontSize: 15, fontWeight: '700', flex: 1 }}>{group.name}</Text></View>
            {group.items.map(item => <ProductLine key={item.id} item={item} />)}
            <Pressable accessibilityRole="button" accessibilityLabel={`Chọn voucher của shop ${group.name}`} disabled={locked || !storeId} onPress={() => setVoucherOpen(voucherOpen === category ? null : category)}
              style={({ pressed }) => ({ minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: '#F0F0F2', opacity: locked ? 0.45 : pressed ? 0.65 : 1 })}>
              <TicketPercent size={16} color="#F33055" /><Text style={{ color: colors.text, fontSize: 13, flex: 1 }}>Voucher của shop</Text><Text style={{ color: saving ? '#F33055' : colors.muted, fontSize: 12 }}>{saving ? `-${money(saving)}` : 'Chọn voucher'}</Text><ChevronRight size={15} color={colors.muted} />
            </Pressable>
            {voucherOpen === category && <CheckoutVoucherPicker category={category} vouchers={p.preview?.vouchers ?? []} selectedCodes={selectedCodes} loading={p.previewLoading} error={p.previewError} disabled={locked} onSelect={p.onSelectVoucher} onAuto={p.onAutoVouchers} />}
            <View style={{ minHeight: 48, backgroundColor: '#F0FAFA', borderRadius: 7, paddingVertical: 10, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Truck size={17} color="#258A8D" /><View style={{ flex: 1, gap: 3 }}><Text style={{ color: '#354C4D', fontSize: 12 }}>Giao hàng GHN</Text>{storeOrder?.expectedDeliveryAt && <Text style={{ color: '#6F8081', fontSize: 11 }}>Dự kiến {new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(storeOrder.expectedDeliveryAt))}</Text>}</View>
              {!!storeOrder?.shippingDiscountAmount && <Text style={{ color: '#8B999A', textDecorationLine: 'line-through', fontSize: 11 }}>{money(storeOrder.shippingFee)}</Text>}
              <Text style={{ color: '#147D80', fontSize: 12, fontWeight: '600' }}>{netShipping === undefined ? 'Đang tính phí' : netShipping === 0 ? 'Miễn phí' : money(netShipping)}</Text>
            </View>
          </View>;
        })}
        {!p.loading && !items.length && <View style={[panel, { gap: 12, padding: 24 }]}><Text style={{ color: colors.muted, fontSize: 14 }}>Chưa có sản phẩm được chọn để thanh toán.</Text><Button title="Quay lại giỏ hàng" outline onPress={p.onCart} /></View>}
        <View style={[panel, { paddingHorizontal: compact ? 14 : 20, paddingVertical: 4 }]}>
          {(['product', 'shipping'] as const).map(category => {
            const platform = category === 'product';
            const saving = platform ? p.preview?.platformDiscountAmount ?? ((p.preview?.discountAmount ?? 0) - (p.preview?.shopDiscountAmount ?? 0)) : p.preview?.shippingDiscountAmount ?? 0;
            const title = platform ? 'Giảm giá từ sàn' : 'Voucher vận chuyển';
            const Icon = platform ? TicketPercent : Truck;
            return <View key={category} style={platform ? undefined : line}>
              <Pressable accessibilityRole="button" accessibilityLabel={platform ? 'Chọn voucher sàn' : 'Chọn voucher vận chuyển'} disabled={locked} onPress={() => setVoucherOpen(voucherOpen === category ? null : category)}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', minHeight: 54, gap: 9, opacity: locked ? 0.45 : pressed ? 0.65 : 1 })}>
                <Icon size={18} color="#F33055" /><Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', flex: 1 }}>{title}</Text><Text style={{ color: saving ? '#F33055' : colors.muted, fontSize: 12 }}>{saving ? `-${money(saving)}` : 'Chọn voucher'}</Text><ChevronRight size={16} color={colors.muted} />
              </Pressable>
              {voucherOpen === category && <CheckoutVoucherPicker category={category} vouchers={p.preview?.vouchers ?? []} selectedCodes={selectedCodes} loading={p.previewLoading} error={p.previewError} disabled={locked} onSelect={p.onSelectVoucher} onAuto={p.onAutoVouchers} />}
            </View>;
          })}
        </View>
        <View style={[panel, { paddingHorizontal: compact ? 14 : 20 }]}>
          <OptionRow title="Phương thức thanh toán" Icon={CreditCard} compact={compact}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Text style={{ flex: 1, fontSize: 13, color: colors.text }}>Thanh toán khi nhận hàng (COD)</Text><Action title={paymentOpen ? 'Thu gọn' : 'Thay đổi'} label="Thay đổi phương thức thanh toán" disabled={locked} onPress={() => setPaymentOpen(!paymentOpen)} /></View>
            {paymentOpen && <View style={{ paddingVertical: 10, gap: 8 }}><View accessibilityRole="radio" accessibilityState={{ checked: true }} aria-checked style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><CircleCheck size={18} color="#F33055" /><Text style={{ fontSize: 13, color: colors.text }}>Thanh toán khi nhận hàng (COD)</Text></View><Text style={{ color: colors.muted, fontSize: 12 }}>Hiện chỉ hỗ trợ thanh toán khi nhận hàng.</Text></View>}
          </OptionRow>
          <OptionRow title="Lời nhắn" Icon={MessageSquare} compact={compact}><CheckoutNoteField value={p.note} onChange={p.onNote} disabled={locked} /></OptionRow>
        </View>
      </View>
      <View style={[panel, { width: wide ? 340 : undefined, padding: compact ? 16 : 20, gap: 16, flexShrink: 0 }]}>
        <View style={{ gap: 5 }}><Text accessibilityRole="header" style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>Tóm tắt thanh toán</Text>{!!p.preview?.storeOrders && <Text style={{ fontSize: 12, color: colors.muted }}>{p.preview.storeOrders.length} cửa hàng · {p.preview.storeOrders.length} đơn hàng</Text>}</View>
        <Status loading={p.previewLoading} error={p.previewError} retry={p.onRetryPreview} />
        <View style={{ gap: 13 }}><Amount label={`Tiền hàng (${p.preview?.selectedCount ?? p.cart?.selectedCount ?? 0} sản phẩm)`} value={p.preview?.subtotal} />
          {!!p.preview?.shopDiscountAmount && <Amount label="Voucher của shop" value={p.preview.shopDiscountAmount} discount />}
          <Amount label="Voucher sàn" value={p.preview?.platformDiscountAmount ?? p.preview?.discountAmount} discount />
          <Amount label="Phí vận chuyển" value={p.preview?.shippingFee} /><Amount label="Giảm phí vận chuyển" value={p.preview?.shippingDiscountAmount ?? 0} discount />
        </View>
        <View style={[line, { paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }]}><Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>Tổng thanh toán</Text><Text style={{ color: '#F33055', fontSize: 21, fontWeight: '700' }}>{p.preview ? money(p.preview.totalAmount) : '—'}</Text></View>
        {!p.hideSubmitButton && <CheckoutOrderButton busy={p.busy} disabled={!!orderDisabled} onOrder={p.onOrder} />}
      </View>
    </View>
  </View>;
}
