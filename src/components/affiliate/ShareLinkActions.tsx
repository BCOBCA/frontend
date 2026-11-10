import { useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Button, Status } from '../common/ui';
import { styles as s } from '../../theme';

export function ShareLinkActions({ url, code }: { url: string; code?: string }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<unknown>(null);
  const copy = async (text: string, label: string) => {
    setError(null); setMessage('');
    try { const copied = await Clipboard.setStringAsync(text); if (!copied) throw new Error('Không thể sao chép. Bạn có thể chọn link để sao chép trực tiếp.'); setMessage(label); } catch (err) { setError(err); }
  };
  return <View style={{ gap: 10 }}>
    {code && <View style={s.between}><Text selectable style={[s.title, { letterSpacing: 1, flexShrink: 1 }]}>{code}</Text><Pressable accessibilityRole="button" accessibilityLabel="Sao chép mã" onPress={() => void copy(code, 'Đã sao chép mã giới thiệu.')} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Copy size={19} color="#E53935" /></Pressable></View>}
    <Text selectable numberOfLines={2} style={[s.small, { flexShrink: 1 }]}>{url}</Text>
    <View style={[s.row, { flexWrap: 'wrap' }]}>
      <View style={{ flex: 1, minWidth: 110 }}><Button title="Sao chép link" outline onPress={() => void copy(url, 'Đã sao chép link.')} /></View>
      <View style={{ flex: 1, minWidth: 110 }}><Button title="Chia sẻ link" onPress={() => { setError(null); void Share.share({ message: url, url }).catch(setError); }} /></View>
    </View>
    {!!message && <Text accessibilityLiveRegion="polite" style={s.small}>{message}</Text>}
    <Status error={error} />
  </View>;
}
