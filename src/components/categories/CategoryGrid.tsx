import { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Check, LayoutGrid } from 'lucide-react-native';
import type { Category } from '../../types/api';
import { colors } from '../../theme';

const cardBackgrounds = ['#E1F2FF', '#EDE5FF', '#FFF0E2', '#FFEADF', '#FFEAF3', '#FFE4EA', '#FCE6F1', '#F0F7DF', '#F0F8DD', '#E3F2FF'];

export function CategoryGrid({ categories, selectedId, onSelect }: { categories: readonly Category[]; selectedId: string; onSelect: (id: string) => void }) {
  const { width } = useWindowDimensions();
  const [gridWidth, setGridWidth] = useState(0);
  const mobile = width < 600;
  const availableWidth = gridWidth || Math.min(width, 1180) - 24;
  const columns = availableWidth >= 900 ? 5 : availableWidth >= 640 ? 4 : 2;
  const gap = mobile ? 10 : 12;
  return <View style={{ gap: mobile ? 16 : 22 }}>
    <View onLayout={event => setGridWidth(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {categories.map((category, index) => {
        const selected = selectedId === category.id;
        return <Pressable key={category.id} accessibilityRole="button" accessibilityLabel={`Danh mục ${category.name}`} accessibilityState={{ selected }} onPress={() => onSelect(category.id)}
          style={({ pressed }) => ({ width: (availableWidth - (columns - 1) * gap) / columns, aspectRatio: 1.85, minHeight: 100, borderWidth: selected ? 2 : 0, borderColor: colors.primary, backgroundColor: cardBackgrounds[index % cardBackgrounds.length], borderRadius: 15, overflow: 'hidden', opacity: pressed ? 0.8 : 1 })}>
          {category.imageUrl ? <Image source={{ uri: category.imageUrl }} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} contentFit="cover" />
            : <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '60%', alignItems: 'center', justifyContent: 'center' }}><LayoutGrid size={36} color={colors.primary} /></View>}
          {selected && <View style={{ position: 'absolute', top: 7, right: 7, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}><Check size={15} color="#FFFFFF" strokeWidth={2.5} /></View>}
          <View style={{ position: 'absolute', left: 0, bottom: 0, maxWidth: '76%', minHeight: 34, paddingHorizontal: 9, paddingVertical: 6, borderTopRightRadius: 24, backgroundColor: 'rgba(255,255,255,0.85)', justifyContent: 'center' }}>
            <Text numberOfLines={2} style={{ color: selected ? colors.primary : '#111A32', fontWeight: '700', fontSize: mobile ? 11 : 12, lineHeight: mobile ? 14 : 15 }}>{category.name}</Text>
          </View>
        </Pressable>;
      })}
    </View>
  </View>;
}
