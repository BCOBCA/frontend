import { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import type { Brand, Product, Variant } from '../../types/api';
import { colors } from '../../theme';
import { productDescription, productSpecificationGroups } from './product-specifications';
import { ProductReviews } from './ProductReviews';
import { detailPanel } from './ProductDetailSidebar';

export function ProductDetailInfo({ product, variant, brand, wide }: { product: Product; variant?: Variant; brand?: Brand; wide: boolean }) {
  const [tab, setTab] = useState('info');
  const groups = productSpecificationGroups(product, variant, brand);
  const rowCount = groups.reduce((sum, group) => sum + group.rows.length, 0);
  const tabs = [{ id: 'info', label: 'Thông tin sản phẩm' }, { id: 'specs', label: 'Thông số kỹ thuật' }];
  const specificationTable = (all: boolean) => {
    let remaining = all ? Infinity : 6;
    const displayed = groups.map(group => { const rows = group.rows.slice(0, remaining); remaining -= rows.length; return { ...group, rows }; }).filter(group => group.rows.length);
    return <View style={{ gap: 12 }}>
    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Thông số kỹ thuật</Text>
    {displayed.length ? displayed.map(group => <View key={group.name} style={{ gap: 7 }}><Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{group.name}</Text><View style={{ gap: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' }}>{group.rows.map((row, index) => <View key={row.key} style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: index % 2 === 0 ? '#F7F8FA' : colors.surface }}><Text style={{ flex: 1, color: colors.muted, fontSize: 12, lineHeight: 18 }}>{row.label}</Text><Text style={{ flex: 1.3, fontSize: 12, fontWeight: '500', color: colors.text, lineHeight: 18 }}>{row.value}</Text></View>)}</View></View>) : <Text style={{ color: colors.muted, fontSize: 13 }}>Liên hệ thương hiệu để biết thông số của sản phẩm.</Text>}
    {!all && rowCount > 6 && <Pressable accessibilityRole="button" onPress={() => setTab('specs')} style={{ minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}><Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>Xem đầy đủ thông số</Text><ChevronDown size={14} color={colors.primary} /></Pressable>}
  </View>;
  };
  return <View style={{ gap: 16 }}>
    <View style={{ ...detailPanel, padding: 0, gap: 0 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 8, gap: 4 }}>
        {tabs.map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityLabel={item.label} aria-selected={tab === item.id} onPress={() => setTab(item.id)} style={{ minHeight: 42, paddingHorizontal: wide ? 22 : 14, paddingVertical: 10, borderRadius: 6, backgroundColor: tab === item.id ? colors.primary : colors.surface, justifyContent: 'center' }}><Text style={{ color: tab === item.id ? colors.surface : colors.muted, fontSize: 12, fontWeight: '600' }}>{item.label}</Text></Pressable>)}
      </ScrollView>
      <View style={{ padding: 20, gap: 22, borderTopWidth: 1, borderColor: colors.border }}>
        {tab === 'info' && <>
          <View style={{ flexDirection: wide ? 'row' : 'column', gap: 20 }}>
            <View style={{ flex: 1, minWidth: 0, gap: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Mô tả sản phẩm</Text>
              {productDescription(product).split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => {
                const lines = paragraph.split('\n');
                const heading = lines.length > 1 && lines[0] === lines[0].toUpperCase();
                return <View key={index} style={{ gap: 8 }}>{heading && <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{({ 'ĐẶC ĐIỂM NỔI BẬT': 'Đặc điểm nổi bật', 'SỬ DỤNG VÀ LỰA CHỌN': 'Sử dụng và lựa chọn' } as Record<string, string>)[lines[0]] ?? lines[0]}</Text>}<Text style={{ fontSize: 13, lineHeight: 22, color: index === 0 ? colors.text : colors.muted }}>{heading ? lines.slice(1).join('\n') : paragraph}</Text></View>;
              })}
            </View>
            {wide && !!product.imageUrl && <View style={{ width: 156, height: 190, borderRadius: 10, backgroundColor: '#F8F5FA', padding: 12 }}><Image source={{ uri: product.imageUrls?.[1] ?? product.imageUrl }} contentFit="contain" style={{ width: '100%', height: '100%' }} accessibilityLabel={`Góc nhìn khác của ${product.name}`} /></View>}
          </View>
          {!product.isService && specificationTable(false)}
        </>}
        {tab === 'specs' && specificationTable(true)}
      </View>
    </View>
    {!product.isService && <ProductReviews productId={product.id} />}
  </View>;
}
