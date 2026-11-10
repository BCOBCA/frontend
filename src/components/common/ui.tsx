import { useCallback, useEffect, useRef, useState, type ComponentRef, type PropsWithChildren, type ReactNode } from 'react';
import { ActivityIndicator, Image, Keyboard, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, router, usePathname, useSegments } from 'expo-router';
import { ArrowLeft, Bell, Search } from 'lucide-react-native';
import { colors, styles as s } from '../../theme';
import { errorMessage } from '../../services/api';
import { DESKTOP_HEADER_WIDTH, primaryTabs } from '../../navigation/tabs';
import { PrimaryTabFooter } from '../../navigation/PrimaryTabFooter';
import { productSearchHref } from '../../services/product-search';
import { HeaderSearchPopover } from './HeaderSearchPopover';

export function Button({ title, onPress, disabled, outline, black }: { title: string; onPress: () => void; disabled?: boolean; outline?: boolean; black?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: disabled ? colors.disabled : outline ? colors.primary : 'transparent', backgroundColor: disabled ? colors.disabled : outline ? colors.surface : black ? colors.black : colors.primary, opacity: pressed ? 0.75 : 1 })}>
    <Text style={{ color: outline ? colors.primary : colors.surface, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>{title}</Text>
  </Pressable>;
}
export function Page({ children, title, back, search, onSearch, onSubmitSearch, header = true, bodyStyle, overlay, footerTab }: PropsWithChildren<{ title?: string; back?: boolean; search?: string; onSearch?: (value: string) => void; onSubmitSearch?: (value: string) => void; header?: boolean; bodyStyle?: ViewStyle; overlay?: ReactNode; footerTab?: (typeof primaryTabs)[number]['name'] }>) {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const { width } = useWindowDimensions();
  const showFooter = !!footerTab && !segments.includes('(tabs)') && width < DESKTOP_HEADER_WIDTH;
  const showHeader = header || segments.includes('(tabs)');
  return <SafeAreaView style={[s.page, { backgroundColor: showHeader ? colors.primary : colors.background }]} edges={['top', 'left', 'right']}>
    {showHeader && <Header title={title ?? 'Báo chí Online BCA'} back={back} search={search} onSearch={onSearch} onSubmitSearch={onSubmitSearch} />}
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: colors.background }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingBottom: segments.includes('(tabs)') || showFooter ? 0 : insets.bottom }}>
      <View style={[s.container, bodyStyle]}>{children}</View>
    </ScrollView>
    {showFooter && footerTab && <PrimaryTabFooter activeTab={footerTab} bottomInset={insets.bottom} />}
    {overlay}
  </SafeAreaView>;
}
export function Header({ title, back, search, onSearch, onSubmitSearch }: { title: string; back?: boolean; search?: string; onSearch?: (v: string) => void; onSubmitSearch?: (value: string) => void }) {
  const { width } = useWindowDimensions();
  const wide = width >= DESKTOP_HEADER_WIDTH;
  const compactSearch = !wide && !!back && !onSearch;
  const insets = useSafeAreaInsets();
  const header = useRef<ComponentRef<typeof View>>(null);
  const searchTrigger = useRef<ComponentRef<typeof Pressable>>(null);
  const pendingSearch = useRef<(() => void) | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTop, setSearchTop] = useState(0);
  const pathname = usePathname();
  const [submittedSearch, setSubmittedSearch] = useState('');
  if (searchOpen && !compactSearch) setSearchOpen(false);
  const closeSearch = useCallback(() => { setSearchOpen(false); Keyboard.dismiss(); }, []);
  useEffect(() => {
    if (!searchOpen && pendingSearch.current) {
      const navigate = pendingSearch.current;
      pendingSearch.current = null;
      // Let the modal restore focus before leaving the old screen.
      searchTrigger.current?.blur();
      navigate();
    }
  }, [searchOpen]);
  const toggleSearch = () => {
    if (searchOpen) { closeSearch(); return; }
    const openAt = (top: number) => { setSearchTop(top); setSearchOpen(true); };
    if (header.current) header.current.measureInWindow((_x, y, _width, height) => openAt(y + height + 8));
    else openAt(insets.top + 68);
  };
  const submit = (value: string) => {
    const keyword = value.trim().slice(0, 200);
    const navigate = () => { if (onSubmitSearch) onSubmitSearch(keyword); else router.navigate(productSearchHref({ search: keyword })); };
    if (compactSearch) { pendingSearch.current = navigate; closeSearch(); }
    else navigate();
  };
  return <View ref={header} style={{ backgroundColor: colors.primary }}><View style={{ width: '100%', paddingHorizontal: 16, paddingVertical: 8, gap: wide ? 24 : 8, flexDirection: 'row', flexWrap: !wide && back && !compactSearch ? 'wrap' : 'nowrap', alignItems: 'center' }}>
    <View style={[s.row, { minWidth: 0, flex: compactSearch ? 1 : undefined, flexShrink: wide ? 0 : back ? 1 : 0, width: wide ? 240 : back && !compactSearch ? '100%' : undefined, marginRight: wide ? 32 : back ? 0 : 4 }]}>{back ? <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ArrowLeft color={colors.surface} size={24} /></Pressable> : <Link href="/" asChild><Pressable accessibilityRole="link" accessibilityLabel="Báo chí Online BCA - Trang chủ" style={{ width: wide ? 48 : 40, height: wide ? 48 : 40, borderRadius: 24, overflow: 'hidden', flexShrink: 0 }}><Image source={require('../../../assets/logo-baochi.png')} resizeMode="contain" style={{ width: '100%', height: '100%', transform: [{ scale: 1.12 }, { translateY: 0.5 }] }} /></Pressable></Link>}
      {(wide || back) && <Text numberOfLines={1} accessibilityRole="header" style={{ color: colors.surface, fontSize: 16, fontWeight: '700', flexShrink: 1 }}>{back ? title : 'Báo chí Online BCA'}</Text>}</View>
    {compactSearch ? <Pressable ref={searchTrigger} accessibilityRole="button" accessibilityLabel="Tìm kiếm" accessibilityState={{ expanded: searchOpen }} aria-expanded={searchOpen} onPress={toggleSearch} style={({ pressed }) => ({ width: 44, height: 44, flexShrink: 0, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: searchOpen ? '#FFFFFF24' : 'transparent', opacity: pressed ? 0.65 : 1 })}><Search color={colors.surface} size={22} strokeWidth={1.8} aria-hidden /></Pressable> : <View style={[s.row, { flex: 1, maxWidth: wide ? 400 : undefined, minWidth: 0, gap: 8, backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: wide ? 12 : 10 }]}><Pressable accessibilityRole="button" accessibilityLabel="Tìm kiếm" hitSlop={6} onPress={() => submit(onSearch ? search ?? '' : submittedSearch)} style={{ minWidth: 24, minHeight: 36, alignItems: 'center', justifyContent: 'center' }}><Search color={colors.text} size={wide ? 20 : 18} /></Pressable><TextInput accessibilityLabel="Tìm kiếm sản phẩm" placeholder="Tìm kiếm sản phẩm ..." value={onSearch ? search : submittedSearch} onChangeText={onSearch ?? setSubmittedSearch} onSubmitEditing={event => submit(event.nativeEvent.text)} maxLength={200} style={{ flex: 1, minWidth: 0, height: 36, paddingVertical: wide ? 8 : 6, fontSize: 14, color: colors.text }} returnKeyType="search" /></View>}
    {!wide && <Pressable accessibilityRole="button" accessibilityLabel="Thông báo" onPress={() => router.push('/notifications')}
      style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderRadius: 8, opacity: pressed ? 0.65 : 1 })}>
      <Bell color={colors.surface} size={23} strokeWidth={1.8} />
    </Pressable>}
    {wide && <View role="navigation" accessibilityLabel="Điều hướng chính" style={{ flex: 1, minWidth: 432, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', gap: 8 }}>
      {primaryTabs.map(({ href, title: label, Icon }) => <Link key={href} href={href} asChild aria-current={pathname === href ? 'page' : undefined}>
        <Pressable accessibilityRole="link" accessibilityLabel={label} style={{ flex: 1, maxWidth: 104, alignItems: 'center', justifyContent: 'center', gap: 4, height: 48, minWidth: 80, paddingHorizontal: 8, borderRadius: 8, backgroundColor: pathname === href ? '#FFFFFF24' : 'transparent' }}>
          <Icon color={colors.surface} size={22} strokeWidth={1.7} />
          <Text numberOfLines={1} style={{ color: colors.surface, fontSize: 12, lineHeight: 16, textAlign: 'center', fontWeight: pathname === href ? '700' : '600' }}>{label}</Text>
        </Pressable>
      </Link>)}
    </View>}
  </View>{compactSearch && searchOpen && <HeaderSearchPopover top={searchTop} value={submittedSearch} onChange={setSubmittedSearch} onSubmit={submit} onClose={closeSearch} />}</View>;
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
  return <View style={[s.between, { paddingHorizontal: 12, paddingVertical: 8 }]}><Text accessibilityRole="header" style={s.title}>{title}</Text>{action && <Pressable accessibilityRole="button" onPress={onPress} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={s.body}>{action} ›</Text></Pressable>}</View>;
}
