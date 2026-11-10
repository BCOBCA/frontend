import { useState, type ComponentPropsWithRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import { colors } from '../../theme';

type AuthFieldProps = TextInputProps & { label: string; error?: string; Icon: LucideIcon; inputRef?: ComponentPropsWithRef<typeof TextInput>['ref'] };

export function AuthField({ label, error, Icon, inputRef, secureTextEntry, ...props }: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  return <View style={styles.field}>
    <View style={[styles.inputRow, !!error && styles.invalid]}>
      <Icon size={18} color="#85818A" strokeWidth={1.7} />
      <TextInput {...props} ref={inputRef} accessibilityLabel={label} placeholder={label} placeholderTextColor="#77747D"
        secureTextEntry={secureTextEntry && !visible} style={styles.input} />
      {secureTextEntry && <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        onPress={() => setVisible(value => !value)} style={styles.visibility}>
        {visible ? <EyeOff size={18} color="#77747D" /> : <Eye size={18} color="#77747D" />}
      </Pressable>}
    </View>
    {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
  </View>;
}

const styles = StyleSheet.create({
  field: { gap: 5 },
  inputRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 14, paddingRight: 4, borderWidth: 1, borderColor: '#E3DFE5', borderRadius: 10, backgroundColor: '#FFFEFE' },
  invalid: { borderColor: colors.primary },
  input: { flex: 1, minWidth: 0, minHeight: 42, paddingVertical: 10, paddingRight: 10, fontSize: 14, color: colors.text },
  visibility: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#B62126', fontSize: 12, lineHeight: 17 },
});
