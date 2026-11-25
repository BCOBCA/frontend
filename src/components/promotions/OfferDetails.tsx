import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { colors, money, styles as s } from '../../theme';
import type { Voucher } from '../../types/api';
import { voucherTitle } from '../../services/voucher-display';

export const voucherDate = (value: string) => new Date(value).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

export function OfferDetails({ item, onClose, heading = 'Điều kiện ưu đãi', busy = false, children, footer }: {
  item: Omit<Voucher, 'claimed'>; onClose: () => void; heading?: string; busy?: boolean;
  children?: ReactNode; footer?: ReactNode;
}) {
  const close = () => { if (!busy) onClose(); };
  return <Modal transparent visible animationType="fade" onRequestClose={close}>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000066', padding: 16 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Đóng nền điều kiện ưu đãi" disabled={busy} onPress={close} style={{ position: 'absolute', inset: 0 }} />
      <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 460, maxHeight: '90%', backgroundColor: colors.surface, borderRadius: 18, padding: 20, gap: 14 }}>
        <View style={s.between}><Text accessibilityRole="header" style={[s.title, { flex: 1 }]}>{heading}</Text><Pressable accessibilityRole="button" accessibilityLabel="Đóng điều kiện ưu đãi" disabled={busy} onPress={close} style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}><X size={22} color={colors.text} /></Pressable></View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          <Text style={[s.title, { color: colors.primary }]}>{voucherTitle(item)}</Text>
          <Text style={s.small}>{item.storeId ? `Voucher của shop: ${item.storeName || 'Cửa hàng'}` : 'Voucher của nền tảng'}</Text>
          {!!item.description && <Text style={s.body}>{item.description}</Text>}
          <Text style={s.body}>Đơn từ {money(item.minOrderAmount)} {item.storeId ? 'tính trên sản phẩm đủ điều kiện của shop.' : 'tính trên giá trị hàng.'}</Text>
          <Text style={s.body}>{item.discountType === 'SHIPPING' ? 'Giảm trực tiếp phí vận chuyển thực tế, tối đa mức ưu đãi. Không trừ vào tiền hàng.' : 'Giảm tiền hàng, không áp dụng cho phí vận chuyển.'}</Text>
          {item.maxDiscount != null && <Text style={s.body}>Giảm tối đa {money(item.maxDiscount)}.</Text>}
          {(item.minLevel ?? 1) > 1 && <Text style={s.body}>Dành cho thành viên từ Lv.{item.minLevel}.</Text>}
          <Text style={s.small}>Hạn sử dụng: {voucherDate(item.expiresAt)}.</Text>
          {children}
        </ScrollView>
        {footer}
      </View>
    </View>
  </Modal>;
}
