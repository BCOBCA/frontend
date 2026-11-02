import { Tabs } from 'expo-router';
import { House, LayoutGrid, TicketPercent, ShoppingCart, UserRound } from 'lucide-react-native';
import { colors } from '../../src/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const icons = { index: House, categories: LayoutGrid, promotions: TicketPercent, cart: ShoppingCart, member: UserRound };
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return <Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.text,
    tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 72 + insets.bottom, paddingTop: 8, paddingBottom: Math.max(8, insets.bottom) },
    tabBarLabelStyle: { fontSize: 12, lineHeight: 16, marginTop: 4 }, tabBarLabelPosition: 'below-icon',
    tabBarIcon: ({ color }) => { const Icon = icons[route.name as keyof typeof icons]; return Icon ? <Icon color={color} size={25} strokeWidth={1.7} /> : null; },
  })}>
    <Tabs.Screen name="index" options={{ title: 'Trang chủ' }} /><Tabs.Screen name="categories" options={{ title: 'Danh mục' }} />
    <Tabs.Screen name="promotions" options={{ title: 'Ưu đãi' }} /><Tabs.Screen name="cart" options={{ title: 'Giỏ hàng' }} /><Tabs.Screen name="member" options={{ title: 'Thành viên' }} />
  </Tabs>;
}
