import { Pressable, Text, View } from 'react-native';
import { Check, TicketPercent, Truck } from 'lucide-react-native';
import { MemberStar } from '../membership/MemberStar';
import { colors } from '../../theme';
import type { Voucher } from '../../types/api';
import { voucherTitle } from '../../services/voucher-display';

export function OfferCard({ voucher, width, restriction, busy, onClaim, onDetails, owned = false }: {
  voucher: Voucher; width: number; restriction?: string; busy: boolean; owned?: boolean;
  onClaim: () => void; onDetails: () => void;
}) {
  const points = voucher.pointCost ?? 0;
  const title = voucherTitle(voucher);
  const shipping = voucher.discountType === 'SHIPPING';
  const badge = voucher.storeId ? voucher.storeName || 'Voucher shop' : (voucher.minLevel ?? 1) > 1 ? `Lv.${voucher.minLevel}+` : voucher.isFlashSale ? 'Có hạn' : 'Thành viên';
  const action = owned ? 'Xem điều kiện' : voucher.claimed ? 'Đã thu thập' : restriction ?? (points > 0 ? 'Đổi ngay' : 'Nhận ngay');
  return <View style={{ width, minWidth: 0, borderRadius: 9, borderWidth: 1, borderColor: '#F5D9DC', backgroundColor: '#FFF4F4', overflow: 'hidden', boxShadow: '0 2px 7px rgba(36,36,43,0.04)' }}>
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 17, bottom: 16, borderLeftWidth: 3, borderColor: colors.primary, borderStyle: 'dashed' }} />
    <View style={{ paddingHorizontal: 9, paddingTop: 5, paddingBottom: 1, flex: 1 }}>
      <Text style={{ alignSelf: 'flex-end', color: '#B5232C', fontSize: 9, lineHeight: 12, fontWeight: '700', backgroundColor: '#FFE0E1', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 }}>{badge}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Điều kiện ${title}`} onPress={onDetails} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}>
        <View style={{ width: 28, height: 28, flexShrink: 0, borderRadius: 6, backgroundColor: '#FFE7E7', alignItems: 'center', justifyContent: 'center' }}>{shipping ? <Truck size={24} color={colors.primary} strokeWidth={1.8} /> : <TicketPercent size={24} color={colors.surface} fill={colors.primary} strokeWidth={1.6} />}</View>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={{ color: '#C8202A', fontWeight: '800', fontSize: 13, lineHeight: 17 }}>{title}</Text>
          <Text style={{ color: '#555964', fontSize: 10, lineHeight: 14 }}>{`Đơn từ ${voucher.minOrderAmount.toLocaleString('vi-VN')}đ${voucher.discountType === 'PERCENT' && voucher.maxDiscount != null ? ` · Tối đa ${voucher.maxDiscount.toLocaleString('vi-VN')}đ` : ''}`}</Text>
        </View>
      </Pressable>
      {points > 0 && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 34 }}><MemberStar size={16} /><Text style={{ color: '#B5232C', fontSize: 11, lineHeight: 16, fontWeight: '700' }}>{`${owned ? 'Đã đổi' : 'Đổi'} ${points.toLocaleString('vi-VN')} điểm`}</Text></View>}
      <Pressable accessibilityRole="button" accessibilityLabel={`${action}: ${title}`} disabled={busy || !owned && (voucher.claimed || !!restriction)} onPress={owned ? onDetails : onClaim}
        style={({ pressed }) => ({ minHeight: 44, marginLeft: 34, marginTop: 'auto', justifyContent: 'center', opacity: busy ? 0.6 : pressed ? 0.8 : 1 })}>
        <View style={{ minHeight: 25, justifyContent: 'center', alignItems: 'center', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 4, flexDirection: 'row', gap: 3, backgroundColor: !voucher.claimed && restriction ? '#E7E7EC' : colors.primary }}>
          {voucher.claimed && !owned && <Check size={12} color={colors.surface} />}
          <Text style={{ fontSize: 10, lineHeight: 13, fontWeight: '700', textAlign: 'center', color: !voucher.claimed && restriction ? '#565B66' : colors.surface }}>{busy && !voucher.claimed ? 'Đang xử lý...' : action}</Text>
        </View>
      </Pressable>
    </View>
  </View>;
}
