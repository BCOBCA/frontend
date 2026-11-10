import { Text, TextInput, View } from 'react-native';
import { colors } from '../../theme';

const placeholder = 'Nhập ghi chú cho người bán (không bắt buộc)';
const typography = { fontSize: 13, lineHeight: 20, includeFontPadding: false };

export function CheckoutNoteField({ value, onChange, disabled }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <View style={{ borderWidth: 1, borderColor: '#DADCE5', borderRadius: 7, padding: 10, gap: 4 }}>
    <View style={{ position: 'relative', minHeight: 30 }}>
      {/* Matching text in normal layout sizes the input for wrapping, newlines and container resizes. */}
      <Text accessible={false} aria-hidden importantForAccessibility="no-hide-descendants" selectable={false} pointerEvents="none" style={[typography, { opacity: 0, minHeight: 30 }]}>{`${value || placeholder}\u200b`}</Text>
      <TextInput accessibilityLabel="Lời nhắn cho người bán" placeholder={placeholder} placeholderTextColor={colors.muted}
        value={value} onChangeText={text => onChange(text.slice(0, 200))} editable={!disabled} multiline maxLength={200} scrollEnabled={false} textAlignVertical="top"
        style={[typography, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', padding: 0, borderWidth: 0, color: colors.text }]} />
    </View>
    <Text style={{ color: colors.muted, fontSize: 11, textAlign: 'right' }}>{value.length}/200</Text>
  </View>;
}
