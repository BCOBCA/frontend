import { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Check, Minus, Package, Plus, ShoppingCart, Trash2 } from 'lucide-react-native';
import { Button, Status } from '../common/ui';
import { CartEmptyState } from './CartEmptyState';
import { canSelectCartItem, cartGroupSelection, groupCartItems, type CartOperation } from '../../services/cart';
import type { Cart, CartItem } from '../../types/api';
import { colors, money, styles as s } from '../../theme';

function Checkbox({ checked, label, disabled, onPress }: { checked: boolean | 'mixed'; label: string; disabled: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="checkbox" accessibilityLabel={label} accessibilityState={{ checked, disabled }} aria-checked={checked} disabled={disabled} onPress={onPress}
    style={({ pressed }) => ({ minWidth: 36, minHeight: 44, alignItems: 'flex-start', justifyContent: 'center', opacity: disabled ? 0.45 : pressed ? 0.65 : 1 })}>
    <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: checked ? colors.primary : '#B6B7C0', backgroundColor: checked ? colors.primary : colors.surface, alignItems: 'center', justifyContent: 'center' }}>
      {checked === 'mixed' ? <Minus size={14} color="white" /> : checked && <Check size={14} color="white" strokeWidth={3} />}
    </View>
  </Pressable>;
}

function CartRow({ item, compact, busy, onChange }: { item: CartItem; compact: boolean; busy: boolean; onChange: (operation: CartOperation) => void }) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const eligible = canSelectCartItem(item);
  const control = (increase: boolean) => {
    const disabled = busy || !item.isAvailable || (increase ? item.quantity >= Math.min(item.availableStock, 999) : item.quantity <= 1);
    const Icon = increase ? Plus : Minus;
    return <Pressable accessibilityRole="button" accessibilityLabel={`${increase ? 'Tăng' : 'Giảm'} số lượng ${item.name}`} disabled={disabled} onPress={() => onChange({ type: 'quantity', item, quantity: item.quantity + (increase ? 1 : -1) })} style={({ pressed }) => ({ width: 36, height: 44, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.3 : pressed ? 0.5 : 1 })}><Icon size={17} color={colors.text} /></Pressable>;
  };
  const controls = <View style={{ flexDirection: 'row', alignItems: 'center', gap: compact ? 12 : 24 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 9, overflow: 'hidden' }}>
      {control(false)}<Text accessibilityLabel={`Số lượng ${item.name}: ${item.quantity}`} style={{ minWidth: 26, textAlign: 'center', fontSize: 14, fontWeight: '600', color: colors.text }}>{item.quantity}</Text>{control(true)}
    </View>
    <View style={{ borderLeftWidth: 1, borderLeftColor: colors.border, paddingLeft: compact ? 8 : 16 }}><Pressable accessibilityRole="button" accessibilityLabel={`Xóa ${item.name}`} disabled={busy} onPress={() => onChange({ type: 'remove', item })} style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.35 : pressed ? 0.5 : 1 })}><Trash2 size={20} color={colors.text} strokeWidth={1.8} /></Pressable></View>
  </View>;
  return <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 12 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Checkbox checked={item.isSelected} label={`Chọn ${item.name}`} disabled={busy || !eligible && !item.isSelected} onPress={() => onChange({ type: 'selection', item, selected: !item.isSelected })} />
      <View style={{ width: compact ? 72 : 96, height: compact ? 76 : 100, borderRadius: 8, backgroundColor: '#F5F5F7', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
        {item.imageUrl && failedImage !== item.imageUrl ? <Image source={{ uri: item.imageUrl }} contentFit="contain" style={{ width: '100%', height: '100%' }} onError={() => setFailedImage(item.imageUrl)} accessibilityLabel={item.name} /> : <Package size={30} color={colors.muted} />}
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 6, paddingLeft: compact ? 12 : 18, paddingRight: compact ? 0 : 24 }}>
        <Text style={{ fontSize: compact ? 14 : 16, lineHeight: compact ? 21 : 23, color: colors.text, fontWeight: '700' }}>{item.name}</Text>
        {!!item.variantName && <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>{item.variantName}</Text>}
        <Text style={{ color: colors.primary, fontSize: compact ? 16 : 18, fontWeight: '700' }}>{money(item.unitPrice)}</Text>
        {!eligible && <Text style={{ fontSize: 12, color: colors.primary }}>{!item.isAvailable ? 'Sản phẩm ngừng kinh doanh' : item.availableStock < 1 ? 'Sản phẩm hết hàng' : `Chỉ còn ${item.availableStock} sản phẩm`}</Text>}
      </View>
      {!compact && controls}
    </View>
    {compact && <View style={{ alignItems: 'flex-end', paddingTop: 12 }}>{controls}</View>}
  </View>;
}

export function CartView({ cart, guest, loading, error, refreshing = false, busy = false, bottomInset = 0, retry, onChange, onCheckout }: {
  cart?: Cart; guest: boolean; loading: boolean; error?: unknown; refreshing?: boolean; busy?: boolean; bottomInset?: number;
  retry: () => void; onChange: (operation: CartOperation) => void; onCheckout: () => void;
}) {
  const { width } = useWindowDimensions();
  const compact = width < 768;
  const items = guest ? [] : cart?.items ?? [];
  const disabled = busy || refreshing;
  const checkoutDisabled = disabled || loading || !!error || !cart?.selectedCount || items.some(item => item.isSelected && !canSelectCartItem(item));
  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[s.container, { flexGrow: 1, paddingHorizontal: compact ? 16 : 24, paddingTop: compact ? 20 : 24, paddingBottom: 24, gap: 16 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><ShoppingCart size={28} color={colors.primary} strokeWidth={1.8} /><Text accessibilityRole="header" style={{ color: colors.text, fontSize: compact ? 19 : 22, fontWeight: '700', flex: 1 }}>Giỏ hàng{!guest && !loading && cart ? ` (${items.length} sản phẩm)` : ''}</Text></View>
      {guest ? <CartEmptyState guest /> : <>
        <Status loading={loading} error={error} retry={retry} />
        {!loading && !error && cart && !items.length && <CartEmptyState />}
        {groupCartItems(items).map(group => {
          const checked = cartGroupSelection(group.items);
          return <View key={group.key} style={{ backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: '#EEEEF3', paddingHorizontal: compact ? 12 : 20, paddingTop: 2, paddingBottom: 4, boxShadow: '0px 4px 16px rgba(24, 24, 40, 0.04)' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}><Checkbox checked={checked} label={`Chọn sản phẩm của ${group.name}`} disabled={disabled || !group.items.some(item => item.isSelected || canSelectCartItem(item))} onPress={() => onChange({ type: 'group', items: group.items, selected: checked !== true })} /><Text style={{ flex: 1, color: colors.text, fontWeight: '600', fontSize: 14, paddingVertical: 10 }}>{group.name}</Text></View>
            {group.items.map(item => <CartRow key={item.id} item={item} compact={compact} busy={disabled} onChange={onChange} />)}
          </View>;
        })}
      </>}
    </ScrollView>
    {!!items.length && <View style={{ backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingBottom: bottomInset }}><View style={[s.container, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingHorizontal: compact ? 16 : 36, paddingVertical: 14 }]}>
      <View style={{ flex: 1, gap: 3 }}><Text style={{ color: colors.muted, fontSize: 13 }}>Tổng tiền:</Text><Text style={{ color: colors.primary, fontSize: compact ? 17 : 19, fontWeight: '700' }}>{money(cart?.selectedTotal ?? 0)}</Text></View>
      <Button title={`Mua hàng (${cart?.selectedCount ?? 0})`} disabled={checkoutDisabled} onPress={onCheckout} />
    </View></View>}
  </View>;
}
