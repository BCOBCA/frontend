import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { ChevronDown, LayoutGrid, Search, X } from 'lucide-react-native';
import type { Brand } from '../../types/api';
import { colors } from '../../theme';
import { brandLogoUrl, filterBrands } from './brand-discovery';
import { gridItemWidth } from '../common/grid-layout';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function BrandExplorer({ brands, selectedId, onSelect, onClear }: {
  brands: readonly Brand[]; selectedId?: string; onSelect: (brand: Brand) => void; onClear?: () => void;
}) {
  const [search, setSearch] = useState('');
  const [letter, setLetter] = useState('all');
  const [visible, setVisible] = useState(12);
  const [gridWidth, setGridWidth] = useState(0);
  const width = useWindowDimensions().width;
  const mobile = width < 600;
  const columns = width >= 1000 ? 6 : width >= 700 ? 4 : 3;
  const filtered = filterBrands(brands, search, letter);
  const selected = brands.find(brand => brand.id === selectedId);
  const renderFilter = (value: string) => <Pressable key={value} accessibilityRole="button" accessibilityLabel={value === 'all' ? 'Tất cả thương hiệu' : `Thương hiệu bắt đầu bằng ${value}`} accessibilityState={{ selected: letter === value }} hitSlop={mobile ? { top: 4, bottom: 4 } : undefined} onPress={() => { setLetter(value); setVisible(12); if (value === 'all') onClear?.(); }}
    style={({ pressed }) => ({ flexShrink: 0, minWidth: value === 'all' ? mobile ? 76 : 90 : mobile ? 32 : 30, minHeight: mobile ? 36 : 34, paddingHorizontal: value === 'all' ? mobile ? 10 : 12 : 6, borderWidth: 1, borderColor: letter === value ? colors.primary : '#EBEAF1', borderRadius: mobile ? 10 : 12, backgroundColor: letter === value ? colors.primary : '#FFFFFF', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: mobile ? 5 : 6, opacity: pressed ? 0.8 : 1 })}>
    {value === 'all' && <LayoutGrid size={mobile ? 12 : 14} color={letter === value ? '#FFFFFF' : '#34384A'} />}<Text style={{ fontSize: mobile ? 11 : 12, fontWeight: letter === value ? '700' : '500', color: letter === value ? '#FFFFFF' : '#34384A' }}>{value === 'all' ? 'Tất cả' : value}</Text>
  </Pressable>;
  return <View style={{ padding: mobile ? 12 : 20, gap: mobile ? 12 : 14, borderRadius: 20, borderWidth: 1, borderColor: '#F0E8EE', backgroundColor: '#FFFEFF', boxShadow: '0 3px 20px rgba(200,100,130,0.04)' }}>
    <View style={{ flexDirection: mobile ? 'column' : 'row', alignItems: mobile ? 'stretch' : 'center', justifyContent: 'space-between', gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><LayoutGrid size={22} color={colors.primary} /><Text accessibilityRole="header" style={{ fontSize: mobile ? 16 : 19, lineHeight: 25, fontWeight: '700', color: '#202337', flexShrink: 1 }}>Khám phá tất cả thương hiệu</Text></View>
      <View style={{ width: mobile ? '100%' : '34%', minHeight: 40, borderRadius: 24, borderWidth: 1, borderColor: '#E5E5ED', backgroundColor: '#FAFAFC', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 }}>
        <Search size={17} color="#969AAA" /><TextInput accessibilityLabel="Tìm kiếm thương hiệu" placeholder="Tìm kiếm thương hiệu..." placeholderTextColor="#8B8F9F" value={search} onChangeText={value => { setSearch(value); setVisible(12); }} style={{ flex: 1, minWidth: 0, fontSize: 13, color: colors.text, paddingVertical: 8 }} />
        {!!search && <Pressable accessibilityRole="button" accessibilityLabel="Xóa tìm kiếm thương hiệu" onPress={() => { setSearch(''); setVisible(12); }} style={{ minWidth: 32, minHeight: 36, alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#777985" /></Pressable>}
      </View>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {renderFilter('all')}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, minWidth: 0 }} contentContainerStyle={{ gap: 6 }}>
        {letters.map(renderFilter)}
      </ScrollView>
    </View>
    {!!selected && onClear && <Pressable accessibilityRole="button" accessibilityLabel={`Bỏ lọc ${selected.name}`} onPress={onClear} style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, minHeight: 36, paddingHorizontal: 10, borderRadius: 10, backgroundColor: '#FFF0F0' }}><Text style={{ color: colors.primary, fontSize: 12 }}>Đang xem: {selected.name}</Text><X size={14} color={colors.primary} /></Pressable>}
    <View onLayout={event => setGridWidth(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{filtered.slice(0, visible).map(brand => <Pressable key={brand.id} accessibilityRole="button" accessibilityLabel={`Chọn thương hiệu ${brand.name}`} accessibilityState={{ selected: brand.id === selectedId }} onPress={() => onSelect(brand)}
      style={({ pressed }) => ({ width: gridWidth ? gridItemWidth(gridWidth, columns, 8) : `${100 / columns}%`, minHeight: mobile ? 68 : 92, alignItems: 'center', justifyContent: 'center', gap: mobile ? 4 : 6, padding: mobile ? 6 : 8, borderWidth: 1, borderColor: selectedId === brand.id ? colors.primary : '#EBEAF1', backgroundColor: selectedId === brand.id ? '#FFF4F4' : '#FFFFFF', borderRadius: mobile ? 10 : 12, opacity: pressed ? 0.8 : 1 })}>
      {brand.logoUrl ? <Image source={{ uri: brandLogoUrl(brand.logoUrl) }} style={{ width: mobile ? '76%' : '85%', maxWidth: 120, height: mobile ? 28 : 42 }} contentFit="contain" /> : <View style={{ height: mobile ? 28 : 42, justifyContent: 'center' }}><Text style={{ fontWeight: '700', color: '#34384A' }}>{brand.name.slice(0, 2)}</Text></View>}
      <Text numberOfLines={1} style={{ color: '#25293B', fontSize: mobile ? 11 : 13, lineHeight: mobile ? 16 : 18 }}>{brand.name}</Text>
    </Pressable>)}</View>
    {filtered.length === 0 && <Text accessibilityLiveRegion="polite" style={{ color: '#777985', textAlign: 'center', paddingVertical: 20 }}>Không tìm thấy thương hiệu phù hợp.</Text>}
    {filtered.length > visible && <Pressable accessibilityRole="button" accessibilityLabel="Xem thêm thương hiệu" onPress={() => setVisible(count => count + 12)} style={({ pressed }) => ({ alignSelf: 'center', minHeight: 40, paddingHorizontal: 24, borderRadius: 24, borderWidth: 1, borderColor: '#F3A9AC', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF7F7', opacity: pressed ? 0.8 : 1 })}><Text style={{ color: '#DA252C', fontSize: 13, fontWeight: '600' }}>Xem thêm thương hiệu</Text><ChevronDown size={18} color="#DA252C" /></Pressable>}
  </View>;
}
