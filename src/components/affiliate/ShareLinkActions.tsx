import { useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { Copy, Share2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Button, Status } from '../common/ui';
import { styles as s } from '../../theme';

export function ShareLinkActions({ url, code, compact = false }: { url: string; code?: string; compact?: boolean }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState<unknown>(null);
  const copy = async (text: string, label: string) => {
    setError(null); setMessage('');
    try { const copied = await Clipboard.setStringAsync(text); if (!copied) throw new Error('Không thể sao chép. Bạn có thể chọn link để sao chép trực tiếp.'); setMessage(label); } catch (err) { setError(err); }
  };
  if (compact) return <View style={{ gap: 10 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E9DADD', backgroundColor: '#FFFAFA', borderRadius: 8, paddingLeft: 10 }}><Text selectable numberOfLines={1} style={{ flex: 1, minWidth: 0, color: '#555764', fontSize: 12 }}>{url}</Text><Pressable accessibilityRole="button" accessibilityLabel="Sao chép link giới thiệu" onPress={() => void copy(url, 'Đã sao chép link.')} style={{ minWidth: 40, minHeight: 40, alignItems: 'center', justifyContent: 'center' }}><Copy size={16} color="#D9232C" /></Pressable></View>
    <Pressable accessibilityRole="button" accessibilityLabel="Chia sẻ ngay" onPress={() => { setError(null); void Share.share({ message: url, url }).catch(setError); }} hitSlop={4} style={({ pressed }) => ({ minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 8, borderRadius: 8, backgroundColor: '#D9232C', opacity: pressed ? 0.65 : 1 })}><Share2 size={16} color="white" /><Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Chia sẻ ngay</Text></Pressable>
    {!!message && <Text accessibilityLiveRegion="polite" style={s.small}>{message}</Text>}<Status error={error} />
  </View>;
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
