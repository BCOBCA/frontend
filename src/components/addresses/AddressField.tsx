import { Text, TextInput, View, type TextInputProps } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors } from '../../theme';

export function AddressLabel({ label }: { label: string }) {
  return <Text style={{ color: colors.text, fontSize: 13, lineHeight: 19, fontWeight: '600' }}>{label}<Text style={{ color: '#D8232A' }}> *</Text></Text>;
}

export function AddressField({ label, Icon, error, ...props }: TextInputProps & { label: string; Icon: LucideIcon; error?: string }) {
  return <View style={{ gap: 7 }}>
    <AddressLabel label={label} />
    <View style={{ minHeight: 46, borderWidth: 1, borderColor: error ? '#D8232A' : '#DDDDE6', borderRadius: 10, backgroundColor: colors.surface, flexDirection: 'row', alignItems: props.multiline ? 'flex-start' : 'center', paddingHorizontal: 12, gap: 10 }}>
      <View pointerEvents="none" style={{ paddingTop: props.multiline ? 12 : 0 }}><Icon size={17} color="#787C8C" strokeWidth={1.7} aria-hidden /></View>
      <TextInput accessibilityLabel={label} aria-required aria-invalid={!!error} placeholderTextColor="#777C8E" style={{ flex: 1, minWidth: 0, paddingVertical: 12, fontSize: 14, lineHeight: 20, color: colors.text, minHeight: props.multiline ? 72 : 44, textAlignVertical: props.multiline ? 'top' : 'center' }} {...props} />
    </View>
    {error && <Text accessibilityRole="alert" style={{ fontSize: 12, lineHeight: 18, color: '#C52329' }}>{error}</Text>}
  </View>;
}
