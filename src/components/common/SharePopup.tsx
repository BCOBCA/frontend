import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ChevronsRight, Copy, ExternalLink, Gift, Link2, Share2, ShoppingBasket, UserRound, X } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { toSVG } from '@bwip-js/generic';
import { SvgXml } from 'react-native-svg';
import { colors } from '../../theme';

const red = '#FF303D';
const steps = [
  { label: 'Chia sẻ Link/\nQR giới thiệu', Icon: ExternalLink },
  { label: 'Bạn bè quét\nQR/Nhấp link', Icon: UserRound },
  { label: 'Bạn bè mua\nsản phẩm', Icon: ShoppingBasket },
  { label: 'Cả hai cùng\nnhận thưởng', Icon: Gift },
];

export function SharePopup({ url, shortUrl, onClose }: { url: string; shortUrl?: string; onClose: () => void }) {
  const { width, height } = useWindowDimensions();
  const [short, setShort] = useState(!!shortUrl);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const selectedUrl = short && shortUrl ? shortUrl : url;
  const xml = useMemo(() => toSVG({ bcid: 'qrcode', text: selectedUrl, scale: 3, padding: 4 }), [selectedUrl]);
  const compact = height < 640;
  const qrSize = Math.max(72, Math.min(224, width - 112, height - 420));
  const copy = async () => {
    setMessage(''); setFailed(false);
    try {
      if (!await Clipboard.setStringAsync(selectedUrl)) throw new Error('clipboard');
      setMessage('Đã sao chép link.');
    } catch { setFailed(true); setMessage('Không thể sao chép. Hãy chọn và sao chép link bên trên.'); }
  };
  const share = async () => {
    setMessage(''); setFailed(false);
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.share) await navigator.share({ title: 'Báo Chí Online BCA', url: selectedUrl });
        else await copy();
      } else await Share.share({ message: selectedUrl, url: selectedUrl });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setFailed(true); setMessage('Chưa thể chia sẻ. Bạn có thể sao chép link để gửi cho bạn bè.');
    }
  };
  return <Modal transparent visible animationType="fade" onRequestClose={onClose}>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#14141E66' }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Đóng nền chia sẻ" onPress={onClose} style={StyleSheet.absoluteFill} />
      <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 390, maxHeight: '100%', borderRadius: 22, backgroundColor: colors.surface, overflow: 'hidden' }}>
        <View style={{ minHeight: 64, justifyContent: 'center', paddingHorizontal: 40, borderBottomWidth: 1, borderBottomColor: '#F6F6F8' }}>
          <Text accessibilityRole="header" style={{ color: red, fontSize: 18, lineHeight: 21, fontWeight: '700', textAlign: 'center' }}>Chia sẻ Báo Chí Online{'\n'}BCA</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Đóng chia sẻ" onPress={onClose} style={{ position: 'absolute', top: 4, right: 4, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><X size={18} color="#858585" /></Pressable>
        </View>
        <View style={{ padding: 14, gap: compact ? 8 : 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: compact ? 2 : 8 }}>
            {steps.map(({ label, Icon }, index) => <View key={label} style={{ flex: 1, alignItems: 'center', gap: 10 }}>
              <Icon size={index >= 2 ? 24 : 21} color={red} fill={index === 1 ? red : 'none'} strokeWidth={index >= 2 ? 2 : index === 0 ? 1.8 : 1.2} aria-hidden />
              <Text style={{ fontSize: 10, lineHeight: 14, color: red, textAlign: 'center' }}>{label}</Text>
              {index < steps.length - 1 && <View style={{ position: 'absolute', right: -7, top: 4 }}><ChevronsRight size={15} color="#FF6570" strokeWidth={1.5} aria-hidden /></View>}
            </View>)}
          </View>
          <View style={{ flexDirection: 'row', padding: 3, borderRadius: 8, backgroundColor: '#EEEFF4' }}>
            {[{ label: 'Link rút gọn', value: true }, { label: 'Link gốc', value: false }].map(tab => <Pressable key={tab.label} accessibilityRole="button" accessibilityLabel={tab.label} accessibilityState={{ selected: short === tab.value, disabled: tab.value && !shortUrl }} disabled={tab.value && !shortUrl} onPress={() => { setShort(tab.value); setMessage(''); }} style={{ flex: 1, minHeight: 36, justifyContent: 'center', borderRadius: 6, backgroundColor: short === tab.value ? colors.surface : 'transparent', opacity: tab.value && !shortUrl ? 0.4 : 1 }}><Text style={{ textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#55565E' }}>{tab.label}</Text></Pressable>)}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 12, backgroundColor: '#F7F7FA', borderRadius: 8 }}>
            <Text selectable numberOfLines={1} style={{ flex: 1, minWidth: 0, color: '#777985', fontSize: 12, lineHeight: 18, paddingVertical: 8 }}>{selectedUrl}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Sao chép đường dẫn" onPress={() => void copy()} style={{ width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Link2 size={16} color="#9698A1" /></Pressable>
          </View>
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 2 }}>
            <View style={{ padding: 5, borderWidth: 5, borderTopColor: '#FA524A', borderLeftColor: '#FA6348', borderRightColor: '#F8B858', borderBottomColor: '#F7CC64', borderRadius: 18, backgroundColor: 'white', boxShadow: '0 4px 12px #2525321A' }}>
              <View accessible accessibilityRole="image" accessibilityLabel="Mã QR chia sẻ Báo Chí Online BCA"><SvgXml xml={xml} width={qrSize} height={qrSize} /></View>
            </View>
          </View>
          <Text accessibilityRole={failed ? 'alert' : undefined} accessibilityLiveRegion="polite" style={{ minHeight: 32, fontSize: 12, lineHeight: 16, color: failed ? '#BA2835' : '#55565E', textAlign: 'center' }}>{message}</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 2 }}>
            {[{ label: 'Chia sẻ ngay', Icon: Share2, action: share }, { label: 'Copy link', Icon: Copy, action: copy }].map(({ label, Icon, action }) => <Pressable key={label} accessibilityRole="button" accessibilityLabel={label} onPress={action} style={({ pressed }) => ({ flex: 1, minHeight: 44, flexDirection: 'row', gap: 7, justifyContent: 'center', alignItems: 'center', backgroundColor: red, borderRadius: 7, opacity: pressed ? 0.7 : 1 })}><Icon size={17} color="white" /><Text style={{ fontSize: 13, lineHeight: 18, color: 'white', fontWeight: '600' }}>{label}</Text></Pressable>)}
          </View>
        </View>
      </View>
    </View>
  </Modal>;
}
