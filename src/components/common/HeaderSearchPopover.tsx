import { useEffect, useRef, type ComponentRef } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';
import { useNavigation } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { colors } from '../../theme';

export function HeaderSearchPopover({ top, value, onChange, onSubmit, onClose }: { top: number; value: string; onChange: (value: string) => void; onSubmit: (value: string) => void; onClose: () => void }) {
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const navigation = useNavigation();
  useEffect(() => navigation.addListener('blur', onClose), [navigation, onClose]);

  return <Modal transparent visible animationType="fade" statusBarTranslucent onRequestClose={onClose} onShow={() => input.current?.focus()}>
    <View style={{ flex: 1 }}>
      <Pressable accessible={false} focusable={false} tabIndex={-1} onPress={onClose} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
      <View accessibilityViewIsModal style={{ position: 'absolute', top, left: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, boxShadow: '0 8px 28px #20283C24' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Tìm kiếm" onPress={() => onSubmit(value)} style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8, opacity: pressed ? 0.6 : 1 })}><Search size={21} color={colors.primary} aria-hidden /></Pressable>
        <TextInput ref={input} accessibilityLabel="Tìm kiếm sản phẩm" placeholder="Tìm kiếm sản phẩm ..." placeholderTextColor={colors.muted} value={value} onChangeText={onChange} onSubmitEditing={event => onSubmit(event.nativeEvent.text)} maxLength={200} returnKeyType="search" autoCorrect={false} style={{ flex: 1, minWidth: 0, height: 44, paddingVertical: 10, color: colors.text, fontSize: 14 }} />
        <Pressable accessibilityRole="button" accessibilityLabel="Đóng tìm kiếm" onPress={onClose} style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8, opacity: pressed ? 0.6 : 1 })}><X size={20} color={colors.muted} aria-hidden /></Pressable>
      </View>
    </View>
  </Modal>;
}
