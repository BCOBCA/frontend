import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useSegments } from 'expo-router';
import { ArrowLeft, Search, BadgeCheck } from 'lucide-react-native';
import { colors, styles as s } from '../../theme';
import { errorMessage } from '../../services/api';

export function Button({ title, onPress, disabled, outline, black }: { title: string; onPress: () => void; disabled?: boolean; outline?: boolean; black?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: disabled ? colors.disabled : outline ? colors.primary : 'transparent', backgroundColor: disabled ? colors.disabled : outline ? colors.surface : black ? colors.black : colors.primary, opacity: pressed ? 0.75 : 1 })}>
    <Text style={{ color: outline ? colors.primary : colors.surface, fontSize: 16, fontWeight: '600' }}>{title}</Text>
  </Pressable>;
}
export function Page({ children, title, back, search, onSearch, header = true, bodyStyle }: PropsWithChildren<{ title?: string; back?: boolean; search?: string; onSearch?: (value: string) => void; header?: boolean; bodyStyle?: ViewStyle }>) {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  return <SafeAreaView style={[s.page, { backgroundColor: header ? colors.primary : colors.background }]} edges={['top', 'left', 'right']}>
    {header && <Header title={title ?? 'Báo chí Online BCA'} back={back} search={search} onSearch={onSearch} />}
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingBottom: segments.includes('(tabs)') ? 0 : insets.bottom }}>
      <View style={[s.container, bodyStyle]}>{children}</View>
    </ScrollView>
  </SafeAreaView>;
}
export function Header({ title, back, search, onSearch }: { title: string; back?: boolean; search?: string; onSearch?: (v: string) => void }) {
  return <View style={{ backgroundColor: colors.primary }}><View style={[s.container, { paddingHorizontal: 16, paddingVertical: 8, gap: 8 }]}>
    <View style={s.row}>{back ? <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={{ padding: 6 }}><ArrowLeft color={colors.surface} size={24} /></Pressable> : <BadgeCheck color={colors.gold} size={28} />}
      <Text accessibilityRole="header" style={{ color: colors.surface, fontSize: 16, fontWeight: '700', flex: 1 }}>{title}</Text></View>
    {onSearch && <View style={[s.row, { backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 12 }]}><Search color={colors.text} size={24} /><TextInput accessibilityLabel="Tìm kiếm sản phẩm" placeholder="Tìm kiếm sản phẩm ..." value={search} onChangeText={onSearch} style={{ flex: 1, minHeight: 44, fontSize: 16, color: colors.text }} returnKeyType="search" /></View>}
  </View></View>;
}
export function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return <View style={{ gap: 6 }}><Text style={s.body}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={colors.muted} style={s.input} {...props} />{error && <Text style={s.error}>{error}</Text>}</View>;
}
export function Empty({ text }: { text: string }) { return <View style={s.center}><Text style={[s.muted, { textAlign: 'center' }]}>{text}</Text></View>; }
export function Status({ loading, error, retry }: { loading?: boolean; error?: unknown; retry?: () => void }) {
  if (loading) return <View style={s.center}><ActivityIndicator color={colors.primary} accessibilityLabel="Đang tải" /></View>;
  if (error) return <View style={s.center}><Text accessibilityRole="alert" style={s.error}>{errorMessage(error)}</Text>{retry && <Button title="Thử lại" onPress={retry} outline />}</View>;
  return null;
}
export function LoginNotice() { return <View style={s.center}><Text style={s.body}>Đăng nhập để sử dụng chức năng này</Text><Button title="Đăng nhập" onPress={() => router.push('/login')} /></View>; }
export function Section({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return <View style={[s.between, { padding: 16 }]}><Text accessibilityRole="header" style={s.title}>{title}</Text>{action && <Pressable accessibilityRole="button" onPress={onPress} style={{ paddingVertical: 10 }}><Text style={s.body}>{action} ›</Text></Pressable>}</View>;
}
