import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { router } from 'expo-router';
import { request } from './api';
import { queryClient, useAuth } from '../stores/auth';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: false, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }) });

export async function enablePushNotifications(prompt = true) {
  const accountId = useAuth.getState().user?.accountId;
  if (!accountId) throw new Error('Vui lòng đăng nhập để bật thông báo.');
  const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId ?? process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  if (!projectId) throw new Error('Bản ứng dụng này chưa được cấu hình thông báo đẩy.');
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('orders', { name: 'Trạng thái đơn hàng', importance: AndroidImportance.HIGH });
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted && prompt) permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) { if (prompt) throw new Error('Bạn chưa cấp quyền thông báo. Có thể bật trong cài đặt điện thoại.'); return; }
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  if (useAuth.getState().user?.accountId !== accountId) return;
  await request('PUT', '/notifications/device', { token: token.data, platform: Platform.OS });
}

export function usePushNotifications(accountId?: string) {
  useEffect(() => {
    if (!accountId) return;
    let active = true;
    const register = () => { if (active && useAuth.getState().user?.accountId === accountId) void enablePushNotifications(false).catch(() => {}); };
    const refresh = () => { for (const key of ['notifications', 'orders', 'order', 'membership']) void queryClient.invalidateQueries({ queryKey: [key] }); };
    const open = (response: Notifications.NotificationResponse) => {
      if (!active || useAuth.getState().user?.accountId !== accountId) return;
      refresh();
      const data = response.notification.request.content.data;
      if (!data) return;
      if (data.targetType === 'Order' && typeof data.targetId === 'string' && /^[0-9a-f-]{36}$/i.test(data.targetId)) router.push({ pathname: '/order/[id]', params: { id: data.targetId } });
    };
    register();
    const wake = AppState.addEventListener('change', state => { if (state === 'active') register(); });
    const tokens = Notifications.addPushTokenListener(register);
    const received = Notifications.addNotificationReceivedListener(refresh);
    const taps = Notifications.addNotificationResponseReceivedListener(open);
    void Notifications.getLastNotificationResponseAsync().then(response => { if (response) { open(response); void Notifications.clearLastNotificationResponseAsync(); } });
    return () => { active = false; wake.remove(); tokens.remove(); received.remove(); taps.remove(); void Notifications.dismissAllNotificationsAsync(); };
  }, [accountId]);
}
