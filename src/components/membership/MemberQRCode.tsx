import { useMemo, useState } from 'react';
import { Modal, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { toSVG } from '@bwip-js/generic';
import { X } from 'lucide-react-native';
import { colors, styles as s } from '../../theme';

export function MemberQRCode({ code }: { code?: string }) {
  const [expanded, setExpanded] = useState(false);
  const { width, height } = useWindowDimensions();
  const zoomSize = Math.max(100, Math.min(280, width - 80, height - 180));
  const label = code ? 'QR code' : 'QR code mẫu';
  const xml = useMemo(() => toSVG({ bcid: 'qrcode', text: code || 'DEMO-MEMBER', scale: 3, padding: 4 }), [code]);
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel={`Phóng to ${label}`} accessibilityState={{ expanded }} onPress={() => setExpanded(true)}
      style={({ pressed }) => ({ alignItems: 'center', gap: 2, flexShrink: 0, opacity: pressed ? 0.7 : 1 })}>
      <View style={{ backgroundColor: colors.surface, borderRadius: 4 }}><SvgXml xml={xml} width={60} height={60} /></View>
      <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 14 }}>{label}</Text>
    </Pressable>
    <Modal visible={expanded} transparent animationType="fade" onRequestClose={() => setExpanded(false)}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#00000099', padding: 20 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Đóng QR code" onPress={() => setExpanded(false)} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
        <View accessibilityViewIsModal style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, gap: 12, maxWidth: '100%' }}>
          <View style={s.between}>
            <Text accessibilityRole="header" style={s.title}>{label}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Đóng" onPress={() => setExpanded(false)} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><X size={22} color={colors.text} /></Pressable>
          </View>
          <View accessible accessibilityRole="image" accessibilityLabel={code ? `QR code thành viên ${code}` : label} style={{ alignItems: 'center' }}><SvgXml xml={xml} width={zoomSize} height={zoomSize} /></View>
        </View>
      </View>
    </Modal>
  </>;
}
