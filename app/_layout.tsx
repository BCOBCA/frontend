import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, AppState, Platform, Text, View } from 'react-native';
import { Button } from '../src/components/common/ui';
import { GlobalToastHost } from '../src/components/common/GlobalToastHost';
import { errorMessage } from '../src/services/api';
import { colors } from '../src/theme';
import { queryClient, useAuth } from '../src/stores/auth';

export default function RootLayout() {
  const restore = useAuth(s => s.restore);
  const ready = useAuth(s => s.ready);
  const user = useAuth(s => s.user);
  const restoring = useAuth(s => s.restoring);
  const restoreError = useAuth(s => s.restoreError);
  useEffect(() => { void restore(); }, [restore]);
  useEffect(() => {
    const retryRecovery = () => { if (useAuth.getState().restoreError) void restore(); };
    if (Platform.OS === 'web') {
      const onVisible = () => { if (document.visibilityState === 'visible') retryRecovery(); };
      window.addEventListener('online', retryRecovery);
      document.addEventListener('visibilitychange', onVisible);
      return () => { window.removeEventListener('online', retryRecovery); document.removeEventListener('visibilitychange', onVisible); };
    }
    const subscription = AppState.addEventListener('change', state => { focusManager.setFocused(state === 'active'); if (state === 'active') retryRecovery(); });
    return () => subscription.remove();
  }, [restore]);
  return <QueryClientProvider client={queryClient}><SafeAreaProvider><StatusBar style={!ready ? 'dark' : 'light'} />
    {!ready || restoring && !user ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}><ActivityIndicator color={colors.primary} accessibilityLabel="Đang khôi phục phiên đăng nhập" /></View> : !user && !!restoreError ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 14, backgroundColor: colors.background }}><Text accessibilityRole="header" style={{ color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' }}>Chưa thể khôi phục phiên đăng nhập</Text><Text accessibilityRole="alert" style={{ color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'center', maxWidth: 400 }}>{errorMessage(restoreError)}</Text><Button title="Kết nối lại" onPress={() => void restore()} /></View> : <Stack screenOptions={{ headerShown: false }} />}
    <GlobalToastHost />
  </SafeAreaProvider></QueryClientProvider>;
}
