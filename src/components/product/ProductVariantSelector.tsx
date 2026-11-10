import { Pressable, Text, View } from 'react-native';
import type { Variant } from '../../types/api';
import { colors, styles as s } from '../../theme';
import { selectVariantOption, variantAttributes, variantGroups } from './variant-options';

export function ProductVariantSelector({ variants, selected, onSelect, compact = false }: { variants: Variant[]; selected?: Variant; onSelect: (id: string) => void; compact?: boolean }) {
  const groups = variantGroups(variants);
  const values = selected ? variantAttributes(selected) : {};
  return <View style={{ gap: 12 }}>
    {groups.length ? <View style={{ flexDirection: compact ? 'row' : 'column', flexWrap: 'wrap', gap: 12 }}>{groups.map(group => <View key={group.key} style={{ gap: 6, ...(compact ? group.key === 'color' ? { width: '100%' } : { flexBasis: 120, flexGrow: 1 } : {}) }}>
      <Text style={[s.body, { fontWeight: '600', fontSize: compact ? 12 : 14 }]}>{group.label}{values[group.key] ? `: ${values[group.key]}` : ''}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={group.label} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {group.values.map(value => {
          const next = selectVariantOption(variants, selected, group.key, value);
          const active = values[group.key] === value;
          return <Pressable key={value} accessibilityRole="radio" accessibilityLabel={`${group.label}: ${value}`} aria-checked={active} aria-disabled={!next} accessibilityState={{ checked: active, disabled: !next }} disabled={!next} onPress={() => { if (next) onSelect(next.id); }}
            style={{ minHeight: compact ? 32 : 36, justifyContent: 'center', paddingHorizontal: compact ? 8 : 10, paddingVertical: compact ? 4 : 6, borderWidth: 1, borderRadius: 6, borderColor: active ? colors.primary : colors.border, backgroundColor: active ? '#FFF5F3' : colors.surface, opacity: next ? 1 : 0.45 }}>
            <Text style={{ color: active ? colors.primary : colors.text, fontSize: compact ? 12 : 13, fontWeight: active ? '600' : '400' }}>{value}</Text>
          </Pressable>;
        })}
      </View>
    </View>)}</View> : <View style={{ gap: 8 }}><Text style={s.body}>Phiên bản</Text><View accessibilityRole="radiogroup" accessibilityLabel="Phiên bản" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {variants.map(item => <Pressable key={item.id} accessibilityRole="radio" accessibilityLabel={item.name} aria-checked={selected?.id === item.id} aria-disabled={item.availableStock <= 0} accessibilityState={{ checked: selected?.id === item.id, disabled: item.availableStock <= 0 }} disabled={item.availableStock <= 0} onPress={() => onSelect(item.id)} style={{ minHeight: compact ? 32 : 36, justifyContent: 'center', paddingHorizontal: compact ? 8 : 10, paddingVertical: compact ? 4 : 6, borderWidth: 1, borderRadius: 6, borderColor: selected?.id === item.id ? colors.primary : colors.border, opacity: item.availableStock > 0 ? 1 : 0.45 }}><Text style={[s.body, { fontSize: compact ? 12 : 13 }]}>{item.name}</Text></Pressable>)}
    </View></View>}
    {!variants.length && <Text style={s.small}>Chưa có phiên bản để đặt mua.</Text>}
  </View>;
}
