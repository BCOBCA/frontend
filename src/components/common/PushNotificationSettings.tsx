import { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { Button } from './ui';
import { enablePushNotifications } from '../../services/push-notifications';
import { styles as s } from '../../theme';
export function PushNotificationSettings() {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  if (Platform.OS === 'web') return null;
  const enable = async () => {
    setBusy(true); setMessage('');
    try { await enablePushNotifications(); setMessage('Đã bật thông báo trạng thái đơn hàng.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Chưa bật được thông báo. Vui lòng thử lại.'); }
    finally { setBusy(false); }
  };
  return <View style={s.card}><Text style={s.body}>Nhận thông báo đơn hàng ngay cả khi đóng ứng dụng.</Text><Button title={busy ? 'Đang bật…' : 'Bật thông báo trên điện thoại'} disabled={busy} onPress={() => void enable()} />{!!message && <Text accessibilityLiveRegion="polite" style={s.small}>{message}</Text>}</View>;
}
