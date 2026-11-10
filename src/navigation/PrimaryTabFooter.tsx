import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../theme';
import { primaryTabs } from './tabs';

export function PrimaryTabFooter({ activeTab, bottomInset }: { activeTab: (typeof primaryTabs)[number]['name']; bottomInset: number }) {
  return <View accessibilityRole="tablist" accessibilityLabel="Điều hướng chính" style={{ flexDirection: 'row', flexShrink: 0, height: 88 + bottomInset, paddingTop: 4, paddingBottom: 20 + bottomInset, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}>
    {primaryTabs.map(({ name, href, title, Icon }) => {
      const selected = activeTab === name;
      const color = selected ? colors.primary : colors.text;
      return <Pressable key={name} accessibilityRole="tab" accessibilityLabel={title} accessibilityState={{ selected }} aria-selected={selected} onPress={() => router.navigate(href)} style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 4, opacity: pressed ? 0.65 : 1 })}>
        <Icon size={22} strokeWidth={1.7} color={color} aria-hidden />
        <Text numberOfLines={1} style={{ color, fontSize: 12, lineHeight: 16, fontWeight: selected ? '600' : '400' }}>{title}</Text>
      </Pressable>;
    })}
  </View>;
}
