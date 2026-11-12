import { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import type { Brand } from '../../types/api';
import { colors } from '../../theme';
import { featuredBrands } from './brand-discovery';
import { gridItemWidth } from '../common/grid-layout';

export function BrandCoverGrid({ brands, onSelect }: { brands: readonly Brand[]; onSelect: (brand: Brand) => void }) {
  const mobile = useWindowDimensions().width < 700;
  const [gridWidth, setGridWidth] = useState(0);
  const columns = mobile ? 2 : 3;
  const gap = mobile ? 8 : 12;
  return <View onLayout={event => setGridWidth(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
    {featuredBrands(brands).map(brand => <Pressable key={brand.id} accessibilityRole="button" accessibilityLabel={`Khám phá ${brand.name}`} onPress={() => onSelect(brand)}
      style={({ pressed }) => ({ width: gridWidth ? gridItemWidth(gridWidth, columns, gap) : `${100 / columns}%`, aspectRatio: 4.3, borderRadius: mobile ? 12 : 18, overflow: 'hidden', backgroundColor: '#F0F4FC', opacity: pressed ? 0.8 : 1 })}>
      {brand.coverUrl ? <Image source={{ uri: brand.coverUrl }} accessibilityLabel={`Banner ${brand.name}`} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={150} />
        : brand.logoUrl ? <Image source={{ uri: brand.logoUrl }} style={{ width: '65%', height: '65%', alignSelf: 'center', marginTop: '4%' }} contentFit="contain" />
          : <Text style={{ textAlign: 'center', color: colors.text, padding: 12 }}>{brand.name}</Text>}
    </Pressable>)}
  </View>;
}
