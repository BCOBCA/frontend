import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { Button } from '../common/ui';
import { colors, money, styles as s } from '../../theme';
import type { OwnedVoucher } from '../../types/api';

const date = (value: string) => new Date(value).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

export function OwnedOfferDetails({ item, onClose, onShop }: { item: OwnedVoucher; onClose: () => void; onShop: () => void }) {
  return <Modal transparent visible animationType="fade" onRequestClose={onClose}>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000066', padding: 16 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Đóng nền điều kiện ưu đãi" onPress={onClose} style={{ position: 'absolute', inset: 0 }} />
      <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 460, maxHeight: '90%', backgroundColor: colors.surface, borderRadius: 18, padding: 20, gap: 14 }}>
        <View style={s.between}><Text accessibilityRole="header" style={[s.title, { flex: 1 }]}>Điều kiện ưu đãi</Text><Pressable accessibilityRole="button" accessibilityLabel="Đóng điều kiện ưu đãi" onPress={onClose} style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}><X size={22} color={colors.text} /></Pressable></View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          <Text style={[s.title, { color: colors.primary }]}>{item.name}</Text>
          <Text style={s.small}>{item.storeId ? `Voucher của shop: ${item.storeName ?? 'Cửa hàng'}` : 'Voucher của nền tảng'}</Text>
          {!!item.description && <Text style={s.body}>{item.description}</Text>}
          <Text style={s.body}>Đơn từ {money(item.minOrderAmount)} tính trên giá trị hàng.</Text>
          <Text style={s.body}>{item.discountType === 'SHIPPING' ? 'Giảm trực tiếp phí vận chuyển thực tế, tối đa mức ưu đãi. Không trừ vào tiền hàng.' : 'Giảm tiền hàng, không áp dụng cho phí vận chuyển.'}</Text>
          {item.maxDiscount != null && <Text style={s.body}>Giảm tối đa {money(item.maxDiscount)}.</Text>}
          {(item.minLevel ?? 1) > 1 && <Text style={s.body}>Dành cho thành viên từ Lv.{item.minLevel}.</Text>}
          <Text style={s.small}>{(item.pointCost ?? 0) > 0 ? `Đã đổi ${item.pointCost!.toLocaleString('vi-VN')} điểm` : 'Đã thu thập'} · {date(item.claimedAt)}</Text>
          <Text style={s.small}>Hạn sử dụng: {date(item.expiresAt)}.</Text>
        </ScrollView>
        <Button title="Mua sắm ngay" onPress={onShop} />
      </View>
    </View>
  </Modal>;
}
