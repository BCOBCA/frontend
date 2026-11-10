import { useState, type ReactNode } from 'react';
import { Pressable, Text, View, useWindowDimensions, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight, Circle, CircleCheck, CreditCard, MapPin, MessageSquare, Package, Store, TicketPercent, Truck, type LucideIcon } from 'lucide-react-native';
import { Button, Status } from '../common/ui';
import { CheckoutAddress } from './CheckoutAddress';
import { CheckoutVoucherPicker } from './CheckoutVoucherPicker';
import { CheckoutNoteField } from './CheckoutNoteField';
import type { CheckoutVoucherCategory } from '../../services/checkout-vouchers';
import { canSelectCartItem, groupCartItems } from '../../services/cart';
import type { Address, Cart, CartItem, CheckoutPreview } from '../../types/api';
import { colors, money } from '../../theme';

export type CheckoutViewProps = {
  cart?: Cart; addresses: Address[]; addressId: string; preview?: CheckoutPreview;
  note: string; automaticVouchers?: boolean;
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
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const address = p.addresses.find(item => item.id === p.addressId) ?? p.addresses.find(item => item.isDefault) ?? p.addresses[0];
  const items = p.cart?.items.filter(item => item.isSelected) ?? [];
  const voucherSaving = p.preview ? p.preview.discountAmount + (p.preview.shippingDiscountAmount ?? 0) : 0;
  const selectedCodes = p.preview?.appliedVoucherCodes ?? [];
  const voucherLabel = selectedCodes.length ? `${selectedCodes.length} voucher · Giảm ${money(voucherSaving)}` : 'Chưa áp dụng voucher';
  const locked = !!p.busy;
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
    <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'flex-start' : 'stretch', gap: 16 }}>
      <View style={[panel, { flex: wide ? 1 : undefined, minWidth: 0, paddingHorizontal: compact ? 16 : 20, paddingTop: 2, paddingBottom: 2 }]}>
        {groupCartItems(items).map((group, index) => <View key={group.key} style={index ? line : undefined}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}><Store size={23} color="#ED2632" strokeWidth={1.8} /><Text accessibilityRole="header" style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>{group.name}</Text></View>
          <View style={line}>{group.items.map(item => <ProductLine key={item.id} item={item} />)}</View>
        </View>)}
        {!p.loading && !items.length && <View style={{ gap: 12, paddingVertical: 24 }}><Text style={{ color: colors.muted, fontSize: 14 }}>Chưa có sản phẩm được chọn để thanh toán.</Text><Button title="Quay lại giỏ hàng" outline onPress={p.onCart} /></View>}
        <OptionRow title="Vận chuyển" Icon={Truck} compact={compact}><View style={{ minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>Giao hàng tiêu chuẩn</Text><Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{p.preview ? money(p.preview.shippingFee) : '—'}</Text></View></OptionRow>
        <OptionRow title="Voucher" Icon={TicketPercent} compact={compact}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <View style={{ flexShrink: 1, gap: 4, paddingHorizontal: selectedCodes.length ? 9 : 0, paddingVertical: 6, backgroundColor: selectedCodes.length ? '#FFF0F1' : 'transparent', borderRadius: 5 }}><Text style={{ fontSize: 13, color: selectedCodes.length ? '#C8222B' : colors.muted }}>{voucherLabel}</Text>{!!selectedCodes.length && <Text style={{ fontSize: 11, lineHeight: 17, color: colors.muted }}>{p.automaticVouchers ? 'Đã tự chọn mã giảm nhiều nhất' : 'Đang dùng lựa chọn của bạn'}</Text>}</View>
            <Action title={voucherOpen ? 'Thu gọn' : 'Chọn voucher'} disabled={locked} onPress={() => setVoucherOpen(!voucherOpen)} />
          </View>
        </OptionRow>
        {voucherOpen && <CheckoutVoucherPicker vouchers={p.preview?.vouchers ?? []} selectedCodes={selectedCodes} loading={p.previewLoading} error={p.previewError} disabled={locked} onSelect={p.onSelectVoucher} onAuto={p.onAutoVouchers} />}
        <OptionRow title="Phương thức thanh toán" Icon={CreditCard} compact={compact}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ flex: 1, minWidth: 0, gap: 4 }}><Text style={{ fontSize: 14, lineHeight: 21, color: colors.text }}>Thanh toán khi nhận hàng (COD)</Text><Text style={{ fontSize: 12, lineHeight: 19, color: colors.muted }}>Bạn sẽ thanh toán bằng tiền mặt khi nhận được hàng.</Text></View><Action title={paymentOpen ? 'Thu gọn' : 'Thay đổi'} label={paymentOpen ? 'Thu gọn phương thức thanh toán' : 'Thay đổi phương thức thanh toán'} disabled={locked} onPress={() => setPaymentOpen(!paymentOpen)} /></View>
          {paymentOpen && <View style={{ padding: 12, marginTop: 12, gap: 8, borderWidth: 1, borderColor: '#F1B2B6', backgroundColor: '#FFF9F9', borderRadius: 8 }}><View accessibilityRole="radio" accessibilityState={{ checked: true }} aria-checked style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><CircleCheck size={18} color={colors.primary} /><Text style={{ fontSize: 13, color: colors.text, flex: 1 }}>Thanh toán khi nhận hàng (COD)</Text></View><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>Hiện chỉ hỗ trợ thanh toán khi nhận hàng.</Text></View>}
        </OptionRow>
        <OptionRow title="Lời nhắn" Icon={MessageSquare} compact={compact}><CheckoutNoteField value={p.note} onChange={p.onNote} disabled={locked} /></OptionRow>
      </View>
      <View style={[panel, { width: wide ? 340 : undefined, padding: compact ? 18 : 20, gap: 18, flexShrink: 0 }]}>
        <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Chi tiết thanh toán</Text>
        <Status loading={p.previewLoading} error={p.previewError} retry={p.onRetryPreview} />
        <View style={[line, { paddingTop: 16, gap: 14 }]}><Amount label={`Tiền hàng (${p.preview?.selectedCount ?? p.cart?.selectedCount ?? 0} sản phẩm)`} value={p.preview?.subtotal} /><Amount label="Voucher giảm giá" value={p.preview?.discountAmount} discount /><Amount label="Phí vận chuyển" value={p.preview?.shippingFee} />{!!p.preview?.shippingDiscountAmount && <Amount label="Giảm phí vận chuyển" value={p.preview.shippingDiscountAmount} discount />}</View>
        <View style={[line, { paddingTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }]}><Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>Tổng thanh toán</Text><Text style={{ color: '#E91D2B', fontSize: 22, fontWeight: '700' }}>{p.preview ? money(p.preview.totalAmount) : '—'}</Text></View>
        <View style={{ paddingTop: 8 }}><Button title={locked ? 'Đang đặt hàng...' : 'Đặt hàng'} disabled={!!orderDisabled} onPress={p.onOrder} /></View>
      </View>
    </View>
  </View>;
}
