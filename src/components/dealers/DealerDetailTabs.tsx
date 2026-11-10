import { Platform, Pressable, ScrollView, Text, View, type PressableProps } from 'react-native';
import { Info, Package, Star, Tags } from 'lucide-react-native';
import { colors } from '../../theme';

export const dealerDetailTabs = [
  { id: 'products', label: 'Sản phẩm', Icon: Package, empty: 'Chưa có sản phẩm để hiển thị.' },
  { id: 'promotions', label: 'Khuyến mãi', Icon: Tags, empty: 'Chưa có khuyến mãi để hiển thị.' },
  { id: 'reviews', label: 'Đánh giá', Icon: Star, empty: 'Chưa có đánh giá để hiển thị.' },
  { id: 'about', label: 'Giới thiệu', Icon: Info, empty: '' },
] as const;

type DealerTabId = typeof dealerDetailTabs[number]['id'];
type TabKeyEvent = Parameters<NonNullable<PressableProps['onKeyDown']>>[0];

export function DealerDetailTabs({ value, onChange }: { value: DealerTabId; onChange: (value: DealerTabId) => void }) {
  const handleKeyDown = (event: TabKeyEvent, index: number) => {
    const key = event.nativeEvent.key;
    let next: number;
    if (key === 'ArrowRight') next = (index + 1) % dealerDetailTabs.length;
    else if (key === 'ArrowLeft') next = (index + dealerDetailTabs.length - 1) % dealerDetailTabs.length;
    else if (key === 'Home') next = 0;
    else if (key === 'End') next = dealerDetailTabs.length - 1;
    else return;
    event.preventDefault();
    const target = (event.currentTarget as unknown as HTMLElement).parentElement?.querySelectorAll<HTMLElement>('[role="tab"]')[next];
    onChange(dealerDetailTabs[next].id);
    target?.focus();
  };
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }} style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
    <View accessibilityRole="tablist" accessibilityLabel="Nội dung đại lý" style={{ flexDirection: 'row', minWidth: '100%', paddingHorizontal: 10 }}>
      {dealerDetailTabs.map(({ id, label, Icon }, index) => <Pressable key={id} nativeID={`dealer-tab-${id}`} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: value === id }} aria-selected={value === id} aria-controls="dealer-detail-panel" tabIndex={value === id ? 0 : -1}
        {...(Platform.OS === 'web' ? { onKeyDown: (event: TabKeyEvent) => handleKeyDown(event, index) } : {})}
        onPress={() => onChange(id)} style={({ pressed }) => ({ minWidth: 140, minHeight: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderBottomWidth: 2, borderBottomColor: value === id ? colors.primary : 'transparent', opacity: pressed ? 0.65 : 1 })}>
        <Icon size={18} strokeWidth={1.8} color={value === id ? colors.primary : colors.text} />
        <Text style={{ color: value === id ? colors.primary : colors.text, fontSize: 13, fontWeight: '600' }}>{label}</Text>
      </Pressable>)}
    </View>
  </ScrollView>;
}
