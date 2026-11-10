import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Empty, LoginNotice, Page, Status } from '../src/components/common/ui';
import { getDealerCategories, getDealerRegions, getOwnedDealers, saveDealerProvinces } from '../src/services/dealers';
import { DealerCategoryForm } from '../src/components/dealers/DealerCategoryForm';
import { useAuth } from '../src/stores/auth';
import { colors, styles as s } from '../src/theme';
import type { DealerCategory, DealerProfile } from '../src/types/dealers';

function CoverageForm({ dealer, regions, categories }: { dealer: DealerProfile; regions: string[]; categories: DealerCategory[] }) {
  const client = useQueryClient();
  const [nationwide, setNationwide] = useState(dealer.provinces === 'Toàn quốc');
  const [selected, setSelected] = useState<string[]>(dealer.provinces && dealer.provinces !== 'Toàn quốc' ? dealer.provinces.split(', ') : []);
  const [search, setSearch] = useState('');
  const save = useMutation({
    mutationFn: () => saveDealerProvinces(dealer.id, nationwide ? 'Toàn quốc' : selected.join(', ')),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['dealers'] }),
        client.invalidateQueries({ queryKey: ['dealer'] }),
        client.invalidateQueries({ queryKey: ['owned-dealers'] }),
      ]);
    },
  });
  const resetFeedback = () => save.reset();
  return <View style={[s.card, { gap: 14 }]}>
    <Text accessibilityRole="header" style={s.title}>{dealer.name}</Text>
    <Text style={s.body}>Phạm vi hoạt động</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel="Phạm vi hoạt động" style={{ gap: 6 }}>
      {[true, false].map(value => <Pressable key={String(value)} accessibilityRole="radio" accessibilityLabel={value ? 'Toàn quốc' : 'Theo tỉnh/thành'} aria-checked={nationwide === value} aria-disabled={save.isPending} accessibilityState={{ checked: nationwide === value, disabled: save.isPending }} disabled={save.isPending}
        onPress={() => { setNationwide(value); resetFeedback(); }} style={{ minHeight: 44, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <Text style={{ color: nationwide === value ? colors.primary : colors.muted, fontSize: 20 }}>{nationwide === value ? '◉' : '○'}</Text>
        <Text style={s.body}>{value ? 'Toàn quốc' : 'Theo tỉnh/thành'}</Text>
      </Pressable>)}
    </View>
    {!nationwide && <>
      <TextInput accessibilityLabel="Tìm tỉnh/thành" placeholder="Tìm tỉnh/thành…" value={search} onChangeText={setSearch} style={[s.input, { minHeight: 44 }]} />
      <Text style={s.small}>Đã chọn {selected.length} tỉnh/thành{selected.length ? `: ${selected.join(', ')}` : ''}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {regions.filter(name => name.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi'))).map(name => <Pressable key={name} accessibilityRole="checkbox" accessibilityLabel={name} aria-checked={selected.includes(name)} aria-disabled={save.isPending} accessibilityState={{ checked: selected.includes(name), disabled: save.isPending }} disabled={save.isPending}
          onPress={() => { setSelected(current => current.includes(name) ? current.filter(x => x !== name) : [...current, name]); resetFeedback(); }}
          style={{ minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderRadius: 8, borderColor: selected.includes(name) ? colors.primary : colors.border, backgroundColor: selected.includes(name) ? '#FFF0EE' : colors.surface }}>
          <Text style={{ color: selected.includes(name) ? colors.primary : colors.text }}>{selected.includes(name) ? '✓ ' : ''}{name}</Text>
        </Pressable>)}
      </View>
      {!selected.length && <Text style={s.small}>Chọn ít nhất một tỉnh/thành để lưu.</Text>}
    </>}
    <Status error={save.error} />
    {save.isSuccess && <Text accessibilityRole="status" style={s.body}>Đã lưu phạm vi hoạt động.</Text>}
    <Button title={save.isPending ? 'Đang lưu…' : 'Lưu phạm vi hoạt động'} disabled={save.isPending || (!nationwide && !selected.length)} onPress={() => save.mutate()} />
    <DealerCategoryForm dealer={dealer} categories={categories} />
  </View>;
}

export default function DealerProfileScreen() {
  const user = useAuth(state => state.user);
  const owned = useQuery({ queryKey: ['owned-dealers', user?.id], queryFn: getOwnedDealers, enabled: !!user });
  const regions = useQuery({ queryKey: ['dealer-regions'], queryFn: getDealerRegions, enabled: !!user });
  const categories = useQuery({ queryKey: ['dealer-categories'], queryFn: getDealerCategories, enabled: !!user });
  return <Page title="Hồ sơ đại lý" back bodyStyle={{ padding: 16, gap: 16 }}>
    {!user ? <LoginNotice /> : <>
      <Status loading={owned.isLoading || regions.isLoading || categories.isLoading} error={owned.error || regions.error || categories.error} retry={() => { void owned.refetch(); void regions.refetch(); void categories.refetch(); }} />
      {owned.data?.length === 0 && <Empty text="Tài khoản chưa có đại lý để thiết lập hồ sơ." />}
      {regions.data && categories.data && owned.data?.map(dealer => <CoverageForm key={`${user.id}:${dealer.id}`} dealer={dealer} regions={regions.data} categories={categories.data} />)}
    </>}
  </Page>;
}
