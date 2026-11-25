import { Pressable, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { colors } from '../../theme';
import { isLongSpecificationText, specificationNeedsExpansion } from './product-specifications';
import type { DisplaySpecificationGroup } from './product-specifications';

export function ProductSpecificationSection({ groups, full = false, onExpand }: { groups: DisplaySpecificationGroup[]; full?: boolean; onExpand: () => void }) {
  if (!groups.some(group => group.rows.length)) return null;
  let remaining = full ? Infinity : 6;
  const displayed: DisplaySpecificationGroup[] = [];
  for (const group of groups) {
    const rows = group.rows.slice(0, remaining); remaining -= rows.length;
    if (rows.length) displayed.push({ ...group, rows });
  }
  return <View style={{ gap: 12, minWidth: 0 }}>
    {!full && <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Thông tin sản phẩm</Text>}
    {displayed.map((group, groupIndex) => <View key={`${group.name}:${groupIndex}`} style={{ gap: 7, minWidth: 0 }}>
      {!full && !group.rows.some(row => row.format === 'text') && <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{group.name}</Text>}
      <View style={{ gap: 1, minWidth: 0 }}>
        {group.rows.map((row, index) => row.format === 'text'
          ? <Text key={row.key} selectable numberOfLines={!full && isLongSpecificationText(row.value) ? 6 : undefined} style={{ minWidth: 0, fontSize: 13, lineHeight: 22, color: colors.text }}>{row.value}</Text>
          : <View key={row.key} style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: index % 2 === 0 ? '#F7F8FA' : colors.surface }}>
            <Text style={{ flex: 1, minWidth: 0, color: colors.muted, fontSize: 12, lineHeight: 18 }}>{row.label}</Text>
            <Text style={{ flex: 1.3, minWidth: 0, fontSize: 12, fontWeight: '500', color: colors.text, lineHeight: 18 }}>{row.value}</Text>
          </View>)}
      </View>
    </View>)}
    {!full && specificationNeedsExpansion(groups) && <Pressable accessibilityRole="button" onPress={onExpand} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>Xem đầy đủ thông tin sản phẩm</Text><ChevronDown size={14} color={colors.primary} />
    </Pressable>}
  </View>;
}
