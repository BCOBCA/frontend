import { useEffect } from 'react';
import { Stack, usePathname } from 'expo-router';
import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, AppState, Platform, View } from 'react-native';
import { colors } from '../src/theme';
import { queryClient, useAuth } from '../src/stores/auth';

export default function RootLayout() {
  const restore = useAuth(s => s.restore);
  const ready = useAuth(s => s.ready);
  const pathname = usePathname();
  useEffect(() => { void restore(); }, [restore]);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = AppState.addEventListener('change', state => focusManager.setFocused(state === 'active'));
    return () => subscription.remove();
  }, []);
  return <QueryClientProvider client={queryClient}><SafeAreaProvider><StatusBar style={!ready || pathname === '/member' ? 'dark' : 'light'} />
    {ready ? <Stack screenOptions={{ headerShown: false }} /> : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}><ActivityIndicator color={colors.primary} accessibilityLabel="Đang khôi phục phiên đăng nhập" /></View>}
  </SafeAreaProvider></QueryClientProvider>;
}
