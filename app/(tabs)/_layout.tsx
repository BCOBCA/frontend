import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { colors } from '../../src/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DESKTOP_HEADER_WIDTH, primaryTabs } from '../../src/navigation/tabs';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  return <Tabs screenOptions={({ route }) => ({ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.text,
    tabBarStyle: { display: width >= DESKTOP_HEADER_WIDTH ? 'none' : 'flex', backgroundColor: colors.surface, borderTopColor: colors.border, height: 88 + insets.bottom, paddingTop: 4, paddingBottom: 20 + insets.bottom },
    tabBarLabelStyle: { fontSize: 12, lineHeight: 16, marginTop: 2, flexShrink: 0 }, tabBarLabelPosition: 'below-icon',
    tabBarIcon: ({ color }) => { const Icon = primaryTabs.find(tab => tab.name === route.name)?.Icon; return Icon ? <Icon color={color} size={22} strokeWidth={1.7} /> : null; },
  })}>
    {primaryTabs.map(tab => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title }} />)}
  </Tabs>;
}
