import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Check, ChevronDown, X } from 'lucide-react-native';
import { colors } from '../../theme';

export function DealerSelect({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ expanded: open }} onPress={() => setOpen(true)} style={{ minHeight: 44, minWidth: 145, paddingHorizontal: 13, borderWidth: 1, borderColor: colors.border, borderRadius: 12, flexDirection: 'row', gap: 14, alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white' }}>
      <Text style={{ color: colors.text, fontSize: 12 }}>{options.find(x => x.value === value)?.label ?? label}</Text><ChevronDown size={15} color={colors.muted} />
    </Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={{ flex: 1, backgroundColor: '#1B142B66', justifyContent: 'center', padding: 24 }}>
        <View accessibilityViewIsModal style={{ backgroundColor: 'white', borderRadius: 18, width: '100%', maxWidth: 420, maxHeight: '75%', alignSelf: 'center', padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text accessibilityRole="header" style={{ fontSize: 17, fontWeight: '700' }}>{label}</Text><Pressable accessibilityRole="button" accessibilityLabel="Đóng bộ chọn" onPress={() => setOpen(false)} style={{ padding: 12 }}><X size={20} color={colors.text} /></Pressable></View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>{options.map(option => <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: value === option.value }} aria-checked={value === option.value} onPress={() => { onChange(option.value); setOpen(false); }} style={{ flexDirection: 'row', gap: 10, padding: 14, minHeight: 48, borderRadius: 10, backgroundColor: value === option.value ? '#FFF0EE' : 'white' }}>
            <Text style={{ flex: 1, color: value === option.value ? colors.primary : colors.text }}>{option.label}</Text>{value === option.value && <Check size={18} color={colors.primary} />}
          </Pressable>)}</ScrollView>
        </View>
      </View>
    </Modal>
  </>;
}
