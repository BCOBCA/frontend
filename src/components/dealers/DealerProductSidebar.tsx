import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { ChevronDown, Headphones, Laptop, List, Package, SlidersHorizontal, Smartphone, Tablet, Watch } from 'lucide-react-native';
import { colors } from '../../theme';
import { dealerPriceRange, type DealerProductCategory } from '../../services/dealer-products';

function categoryIcon(slug: string) {
  if (slug.includes('dien-thoai')) return Smartphone;
  if (slug.includes('laptop')) return Laptop;
  if (slug.includes('may-tinh-bang')) return Tablet;
  if (slug.includes('thiet-bi-deo')) return Watch;
  if (slug.includes('am-thanh') || slug.includes('tai-nghe')) return Headphones;
  return Package;
}

export function DealerProductSidebar({ categories, categoryId, minPrice, maxPrice, compact, onCategory, onPrice }: {
  categories: DealerProductCategory[]; categoryId: string; minPrice: string; maxPrice: string; compact: boolean;
  onCategory: (id: string) => void; onPrice: (min: string, max: string) => void;
}) {
  const [expanded, setExpanded] = useState(!compact);
  const [from, setFrom] = useState(minPrice);
  const [to, setTo] = useState(maxPrice);
  const [error, setError] = useState('');
  return <View style={{ width: compact ? '100%' : 200, gap: 12 }}>
    <View style={{ backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 8, gap: 5 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Danh mục cửa hàng" aria-expanded={expanded} onPress={() => setExpanded(!expanded)} style={{ minHeight: 36, flexDirection: 'row', gap: 7, alignItems: 'center', paddingHorizontal: 4 }}>
        <List size={15} color={colors.text} /><Text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: colors.text }}>Danh mục cửa hàng</Text><ChevronDown size={14} color={colors.muted} style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }} />
      </Pressable>
      {expanded && [{ id: '', name: 'Tất cả sản phẩm', slug: '', productCount: 0 }, ...categories].map(category => {
        const Icon = categoryIcon(category.slug);
        return <Pressable key={category.id} accessibilityRole="button" accessibilityLabel={category.name} aria-pressed={category.id === categoryId} onPress={() => onCategory(category.id)}
          style={{ flexDirection: 'row', gap: 7, alignItems: 'center', minHeight: 36, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, backgroundColor: category.id === categoryId ? '#FFE8E7' : 'transparent' }}>
          <Icon size={15} color={category.id === categoryId ? colors.primary : colors.text} /><Text style={{ flex: 1, fontSize: 12, lineHeight: 17, color: category.id === categoryId ? colors.primary : colors.text, fontWeight: category.id === categoryId ? '600' : '400' }}>{category.name}</Text>
        </Pressable>;
      })}
    </View>
    <View style={{ backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 10, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><SlidersHorizontal size={15} color={colors.text} /><Text style={{ color: colors.text, fontWeight: '700', fontSize: 12 }}>Khoảng giá</Text></View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <TextInput accessibilityLabel="Giá từ" placeholder="Từ ₫" keyboardType="numeric" value={from} maxLength={20} onChangeText={value => { setFrom(value); setError(''); }} style={{ flex: 1, minWidth: 0, fontSize: 11, color: colors.text, minHeight: 36, padding: 7, borderWidth: 1, borderColor: colors.border, borderRadius: 6, backgroundColor: colors.background }} />
        <Text style={{ color: colors.muted }}>-</Text>
        <TextInput accessibilityLabel="Giá đến" placeholder="Đến ₫" keyboardType="numeric" value={to} maxLength={20} onChangeText={value => { setTo(value); setError(''); }} style={{ flex: 1, minWidth: 0, fontSize: 11, color: colors.text, minHeight: 36, padding: 7, borderWidth: 1, borderColor: colors.border, borderRadius: 6, backgroundColor: colors.background }} />
      </View>
      {!!error && <Text accessibilityRole="alert" style={{ color: colors.primary, fontSize: 11, lineHeight: 16 }}>{error}</Text>}
      <Pressable accessibilityRole="button" onPress={() => { const range = dealerPriceRange(from, to); setError(range.error); if (!range.error) onPrice(range.min, range.max); }} style={{ minHeight: 36, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}><Text style={{ fontWeight: '600', fontSize: 12, color: 'white' }}>Áp dụng</Text></Pressable>
    </View>
  </View>;
}
