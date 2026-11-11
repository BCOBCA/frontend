import { Pressable, Text, View } from 'react-native';
import { money } from '../../theme';

type Props = { total?: number; count: number; saving?: number; disabled?: boolean; busy?: boolean; onOrder: () => void };

export function CheckoutOrderButton({ disabled, busy, onOrder }: Pick<Props, 'disabled' | 'busy' | 'onOrder'>) {
  return <Pressable accessibilityRole="button" accessibilityLabel="Đặt hàng" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onOrder}
    style={({ pressed }) => ({ minHeight: 48, borderRadius: 24, paddingVertical: 9, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F33055', opacity: disabled ? 0.45 : pressed ? 0.75 : 1, gap: 2 })}>
    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>{busy ? 'Đang đặt hàng...' : 'Đặt hàng'}</Text>
    <Text style={{ color: '#FFFFFF', fontSize: 11 }}>Thanh toán khi nhận hàng</Text>
  </Pressable>;
}

export function CheckoutSubmitBar(p: Props) {
  return <View style={{ backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#ECEDEF', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, gap: 10 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}><Text style={{ fontSize: 14, color: '#202127', fontWeight: '700' }}>Tổng ({p.count} mặt hàng)</Text><View style={{ alignItems: 'flex-end', gap: 2 }}><Text style={{ fontSize: 19, fontWeight: '700', color: '#F33055' }}>{p.total === undefined ? '—' : money(p.total)}</Text>{!!p.saving && <Text style={{ fontSize: 11, color: '#F33055' }}>Tiết kiệm {money(p.saving)}</Text>}</View></View>
    <CheckoutOrderButton disabled={p.disabled} busy={p.busy} onOrder={p.onOrder} />
  </View>;
}
