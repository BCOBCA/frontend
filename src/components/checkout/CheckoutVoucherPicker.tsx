import { Pressable, Text, View } from 'react-native';
import { Circle, CircleCheck, Sparkles, TicketPercent, Truck } from 'lucide-react-native';
import { Status } from '../common/ui';
import { checkoutVoucherCategory, type CheckoutVoucherCategory } from '../../services/checkout-vouchers';
import type { CheckoutVoucher } from '../../types/api';
import { colors, money } from '../../theme';

type Props = { vouchers: CheckoutVoucher[]; selectedCodes: string[]; category?: CheckoutVoucherCategory; loading?: boolean; error?: unknown; disabled?: boolean; onSelect: (category: CheckoutVoucherCategory, code: string | null) => void; onAuto: () => void };

export function CheckoutVoucherPicker({ vouchers, selectedCodes, category: activeCategory, loading, error, disabled, onSelect, onAuto }: Props) {
  const locked = disabled || loading;
  return <View style={{ gap: 16, paddingBottom: 16 }}>
    <View style={{ gap: 8 }}><Text accessibilityRole="header" style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>Voucher của bạn</Text><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 19 }}>Mỗi shop một mã riêng, thêm một mã sàn và một mã vận chuyển.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Tự chọn giảm nhiều nhất" disabled={locked} onPress={onAuto} style={({ pressed }) => ({ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: '#FFF0F1', borderWidth: 1, borderColor: '#F6CDD0', opacity: locked ? 0.45 : pressed ? 0.7 : 1 })}><Sparkles color="#D32631" size={18} /><Text style={{ color: '#C1242D', fontSize: 13, fontWeight: '600' }}>Tự chọn giảm nhiều nhất</Text></Pressable>
    </View>
    <Status loading={loading} error={error} />
    {(!loading || vouchers.length > 0) && !error && (activeCategory ? [activeCategory] : ['product', 'shipping'] as const).map(category => {
      const options = vouchers.filter(item => checkoutVoucherCategory(item) === category);
      const selected = options.find(item => selectedCodes.includes(item.code));
      const label = category === 'product' ? 'Voucher sàn' : category === 'shipping' ? 'Voucher vận chuyển' : 'Voucher của shop';
      const Icon = category === 'shipping' ? Truck : TicketPercent;
      return <View key={category} role="radiogroup" accessibilityLabel={label} style={{ gap: 9 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Icon size={19} color={colors.primary} /><Text style={{ color: colors.text, fontSize: 14, fontWeight: '700', flex: 1 }}>{label}</Text><Text style={{ color: colors.muted, fontSize: 12 }}>{selected ? '1/1' : '0/1'}</Text></View>
        <Pressable accessibilityRole="radio" accessibilityLabel={`Không dùng ${label.toLowerCase()}`} accessibilityState={{ checked: !selected, disabled: !!locked }} aria-checked={!selected} disabled={locked} onPress={() => onSelect(category, null)} style={({ pressed }) => ({ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, backgroundColor: '#F7F7FA', opacity: locked ? 0.5 : pressed ? 0.7 : 1 })}>{!selected ? <CircleCheck size={19} color={colors.primary} /> : <Circle size={19} color={colors.muted} />}<Text style={{ color: colors.text, fontSize: 13 }}>Không sử dụng voucher</Text></Pressable>
        {!options.length && <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 19 }}>Bạn chưa có {label.toLowerCase()} trong kho.</Text>}
        {options.map(voucher => {
          const checked = selectedCodes.includes(voucher.code);
          const blocked = !!locked || !voucher.isEligible;
          return <Pressable key={voucher.id} accessibilityRole="radio" accessibilityLabel={`Chọn voucher ${voucher.code}`} accessibilityState={{ checked, disabled: blocked }} aria-checked={checked} disabled={blocked} onPress={() => onSelect(category, voucher.code)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'flex-start', gap: 11, padding: 12, minHeight: 88, borderWidth: 1, borderColor: checked ? '#EF858D' : colors.border, borderRadius: 9, backgroundColor: checked ? '#FFF6F6' : colors.surface, opacity: locked ? 0.5 : pressed ? 0.7 : 1 })}>
            {checked ? <CircleCheck size={20} color={colors.primary} /> : <Circle size={20} color={voucher.isEligible ? colors.muted : '#C1C3CC'} />}
            <View style={{ flex: 1, minWidth: 0, gap: 5 }}><Text style={{ color: colors.text, fontSize: 13, fontWeight: '700', lineHeight: 19 }}>{voucher.name}</Text>
              <Text style={{ color: voucher.isEligible ? '#CD2530' : colors.muted, fontSize: 14, fontWeight: '700' }}>{voucher.isEligible ? `Giảm ${money(voucher.discountAmount)}` : voucher.reason ?? 'Chưa đủ điều kiện sử dụng'}</Text>
              <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 17 }}>Đơn từ {money(voucher.minOrderAmount)}{voucher.maxDiscount !== null ? ` · Giảm tối đa ${money(voucher.maxDiscount)}` : ''}</Text>
              <Text style={{ color: colors.muted, fontSize: 11 }}>HSD: {new Intl.DateTimeFormat('vi-VN').format(new Date(voucher.expiresAt))}</Text>
            </View>
          </Pressable>;
        })}
      </View>;
    })}
  </View>;
}
