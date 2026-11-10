import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { UserRound } from 'lucide-react-native';
import { colors } from '../../theme';
import { FavoritesIllustration } from './FavoritesIllustration';

export function FavoritesLoginNotice() {
  const { width } = useWindowDimensions();
  const mobile = width < 600;
  return <View style={{ alignItems: 'center', paddingHorizontal: 24, paddingTop: mobile ? 40 : 56, paddingBottom: 40, gap: 16 }}>
    <View style={{ width: '100%', maxWidth: 340, aspectRatio: 340 / 210 }}><FavoritesIllustration /></View>
    <Text accessibilityRole="header" style={{ color: colors.text, fontSize: mobile ? 20 : 22, lineHeight: mobile ? 28 : 30, fontWeight: '800', textAlign: 'center', maxWidth: 560 }}>Đăng nhập để sử dụng danh sách yêu thích</Text>
    <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'center', maxWidth: 400, marginTop: -8 }}>Lưu lại những sản phẩm bạn yêu thích, theo dõi dễ dàng và mua sắm nhanh hơn mọi lúc, mọi nơi.</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Đăng nhập" onPress={() => router.push('/login')}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, minWidth: 150, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 })}>
      <UserRound size={19} color={colors.surface} strokeWidth={2} /><Text style={{ color: colors.surface, fontSize: 14, lineHeight: 20, fontWeight: '700' }}>Đăng nhập</Text>
    </Pressable>
  </View>;
}
