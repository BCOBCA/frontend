import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Status } from '../common/ui';
import { saveDealerCategories } from '../../services/dealers';
import { colors, styles as s } from '../../theme';
import type { DealerCategory, DealerProfile } from '../../types/dealers';

export function DealerCategoryForm({ dealer, categories }: { dealer: DealerProfile; categories: DealerCategory[] }) {
  const client = useQueryClient();
  const [selected, setSelected] = useState(() => (dealer.categoryIds ?? []).filter(id => categories.some(x => x.id === id)));
  const save = useMutation({
    mutationFn: () => saveDealerCategories(dealer.id, selected),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['owned-dealers'] }),
        client.invalidateQueries({ queryKey: ['dealers'] }),
        client.invalidateQueries({ queryKey: ['dealer'] }),
      ]);
    },
  });
  return <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16, gap: 12 }}>
    <Text accessibilityRole="header" style={s.body}>Ngành nghề bán hàng</Text>
    <Text style={s.small}>Chọn các danh mục sản phẩm đại lý kinh doanh.</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {categories.map(category => <Pressable key={category.id} accessibilityRole="checkbox" accessibilityLabel={category.name} aria-checked={selected.includes(category.id)} aria-disabled={save.isPending} accessibilityState={{ checked: selected.includes(category.id), disabled: save.isPending }} disabled={save.isPending}
        onPress={() => { setSelected(current => current.includes(category.id) ? current.filter(id => id !== category.id) : [...current, category.id]); save.reset(); }}
        style={{ minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderRadius: 8, borderColor: selected.includes(category.id) ? colors.primary : colors.border, backgroundColor: selected.includes(category.id) ? '#FFF0EE' : colors.surface }}>
        <Text style={{ color: selected.includes(category.id) ? colors.primary : colors.text }}>{selected.includes(category.id) ? '✓ ' : ''}{category.name}</Text>
      </Pressable>)}
    </View>
    <Text style={s.small}>Đã chọn {selected.length} ngành nghề.</Text>
    <Status error={save.error} />
    {save.isSuccess && <Text accessibilityRole="status" style={s.body}>Đã lưu ngành nghề bán hàng.</Text>}
    <Button title={save.isPending ? 'Đang lưu…' : 'Lưu ngành nghề'} disabled={save.isPending} onPress={() => save.mutate()} />
  </View>;
}
