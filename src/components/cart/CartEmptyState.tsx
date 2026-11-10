import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { LayoutGrid, UserRound } from 'lucide-react-native';
import { colors } from '../../theme';
import { CartIllustration } from './CartIllustration';

export function CartEmptyState({ guest = false }: { guest?: boolean }) {
  const { width } = useWindowDimensions();
  const mobile = width < 600;
  const title = guest ? 'Đăng nhập để xem giỏ hàng' : 'Giỏ hàng của bạn đang trống';
  const description = guest ? 'Vui lòng đăng nhập để lưu trữ giỏ hàng, đồng bộ trên mọi thiết bị và mua sắm nhanh chóng hơn.' : 'Hãy khám phá hàng ngàn sản phẩm hấp dẫn và thêm vào giỏ ngay nhé!';
  const action = guest ? 'Đăng nhập' : 'Tiếp tục mua sắm';
  const Icon = guest ? UserRound : LayoutGrid;
  return <View style={{ alignItems: 'center', paddingHorizontal: 16, paddingTop: mobile ? 24 : 40, paddingBottom: 40, gap: 14 }}>
    <View style={{ width: '100%', maxWidth: guest ? 320 : 290, aspectRatio: 340 / 200 }}><CartIllustration guest={guest} /></View>
    <Text accessibilityRole="header" style={{ color: colors.text, fontSize: mobile ? 20 : 22, lineHeight: 28, fontWeight: '800', textAlign: 'center' }}>{title}</Text>
    <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 22, maxWidth: guest ? 440 : 340, textAlign: 'center', marginTop: -6 }}>{description}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={action} onPress={() => router.push(guest ? '/login' : '/categories')}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, minWidth: guest ? 150 : 180, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 9, backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 })}>
      <Icon size={18} color={colors.surface} /><Text style={{ color: colors.surface, fontSize: 14, lineHeight: 20, fontWeight: '700' }}>{action}</Text>
    </Pressable>
  </View>;
}
