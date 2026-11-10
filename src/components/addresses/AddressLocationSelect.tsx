import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useIsFocused } from 'expo-router';
import { Check, ChevronDown, Search, X, type LucideIcon } from 'lucide-react-native';
import type { AddressLocation } from '../../services/address-locations';
import { colors } from '../../theme';
import { AddressLabel } from './AddressField';

type Props = {
  label: string; placeholder: string; Icon: LucideIcon; value: string; options: AddressLocation[];
  onChange: (code: string) => void; disabled?: boolean; loading?: boolean; failed?: boolean; retry: () => void; error?: string;
};
const searchable = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

export function AddressLocationSelect({ label, placeholder, Icon, value, options, onChange, disabled, loading, failed, retry, error }: Props) {
  const focused = useIsFocused();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  if (open && (!focused || disabled)) setOpen(false);
  const selected = options.find(item => Number(item.code) === Number(value));
  const filtered = options.filter(item => searchable(item.name).includes(searchable(search.trim())));

  return <View style={{ gap: 7 }}>
    <AddressLabel label={label} />
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled, expanded: open }} disabled={disabled} onPress={() => { setSearch(''); setOpen(true); }}
      style={({ pressed }) => ({ minHeight: 46, borderWidth: 1, borderColor: error ? '#D8232A' : '#DDDDE6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: disabled ? '#F7F7FA' : colors.surface, opacity: pressed ? 0.7 : 1 })}>
      <Icon size={17} color="#787C8C" strokeWidth={1.7} aria-hidden />
      <Text numberOfLines={1} style={{ flex: 1, fontSize: 13, lineHeight: 20, color: value ? colors.text : '#777C8E' }}>{selected?.name ?? (value || placeholder)}</Text>
      {loading ? <ActivityIndicator size="small" color={colors.primary} accessibilityLabel="Đang tải danh sách" /> : <ChevronDown size={17} color="#565B6D" aria-hidden />}
    </Pressable>
    {error && <Text accessibilityRole="alert" style={{ color: '#C52329', fontSize: 12, lineHeight: 18 }}>{error}</Text>}
    {failed && <Pressable accessibilityRole="button" onPress={retry} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: '#C52329', fontSize: 12 }}>Không tải được danh sách. Nhấn để thử lại.</Text></Pressable>}
    <Modal visible={open && focused && !disabled} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={{ flex: 1, backgroundColor: '#1E243B55', padding: 16, justifyContent: 'center', alignItems: 'center' }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 460, maxHeight: '80%', backgroundColor: colors.surface, borderRadius: 18, padding: 18, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text accessibilityRole="header" style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{label}</Text><Pressable accessibilityRole="button" accessibilityLabel="Đóng danh sách địa phương" onPress={() => setOpen(false)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><X size={20} color={colors.text} /></Pressable></View>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12 }}><Search size={18} color={colors.muted} aria-hidden /><TextInput accessibilityLabel={`Tìm ${label.toLowerCase()}`} placeholder="Nhập tên để tìm nhanh..." value={search} onChangeText={setSearch} style={{ flex: 1, minWidth: 0, minHeight: 44, color: colors.text, fontSize: 14 }} /></View>
          {loading ? <ActivityIndicator accessibilityLabel="Đang tải danh sách" color={colors.primary} style={{ padding: 24 }} /> : failed ? <Pressable accessibilityRole="button" onPress={retry} style={{ padding: 16 }}><Text style={{ color: colors.primary }}>Không tải được danh sách. Thử lại</Text></Pressable> : <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {!filtered.length && <Text style={{ color: colors.muted, padding: 16 }}>Không tìm thấy địa phương phù hợp.</Text>}
            {filtered.map(item => <Pressable key={item.code} accessibilityRole="radio" accessibilityState={{ checked: item.code === selected?.code }} onPress={() => { onChange(item.code); setOpen(false); }} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8, borderRadius: 8, backgroundColor: item.code === selected?.code ? '#FFF1F0' : colors.surface }}><Text style={{ flex: 1, fontSize: 14, color: colors.text }}>{item.name}</Text>{item.code === selected?.code && <Check size={18} color={colors.primary} aria-hidden />}</Pressable>)}
          </ScrollView>}
        </View>
      </View>
    </Modal>
  </View>;
}
