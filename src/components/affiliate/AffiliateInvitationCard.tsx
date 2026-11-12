import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { toSVG } from '@bwip-js/generic';
import { Link2, QrCode, Share2, X } from 'lucide-react-native';
import { colors } from '../../theme';
import { Status } from '../common/ui';
import { AffiliatePlaneArt } from './AffiliateDashboardArt';
import { dashboardPanel } from './AffiliateDashboardView';

export type AffiliateInvitation = { code: string; url: string; totalInvites: number; successfulInvites: number };

export function AffiliateInvitationCard({ invitation, loading, error, copyError, onRetry, onCopy, onShare }: { invitation?: AffiliateInvitation; loading: boolean; error?: unknown; copyError?: string; onRetry: () => void; onCopy: () => void; onShare: () => void }) {
  const [qrOpen, setQrOpen] = useState(false);
  const disabled = !invitation?.url || loading || !!error;
  return <View style={[dashboardPanel, { flex: 1, padding: 18, minHeight: 192, gap: 8, justifyContent: 'center', overflow: 'hidden' }]}>
    <View pointerEvents="none" style={{ position: 'absolute', right: -30, bottom: -80, width: 260, height: 180, borderRadius: 100, backgroundColor: '#FFF0F4' }} />
    <View pointerEvents="none" style={{ position: 'absolute', right: 8, top: 12, width: 70, height: 60 }}><AffiliatePlaneArt /></View>
    <Text accessibilityRole="header" aria-level={2} style={{ fontSize: 16, lineHeight: 22, fontWeight: '700', color: colors.text, paddingRight: 35 }}>Chia sẻ mã giới thiệu</Text>
    <Text style={{ fontSize: 12, lineHeight: 18, color: '#646678', paddingRight: 30 }}>Mời bạn bè tham gia để nhận hoa hồng</Text>
    <View style={{ flexDirection: 'row', gap: 9, marginTop: 14 }}>
      {[{ label: 'Sao chép link', Icon: Link2, action: onCopy, outline: false }, { label: 'Tạo mã QR', Icon: QrCode, action: () => setQrOpen(true), outline: true }].map(({ label, Icon, action, outline }) => <Pressable key={label} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={action} style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: 44, paddingHorizontal: 8, borderRadius: 13, borderWidth: 1, borderColor: '#E81736', backgroundColor: outline ? '#FFF9FA' : '#E81736', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: disabled ? 0.4 : pressed ? 0.65 : 1 })}><Icon size={18} color={outline ? '#D61B36' : 'white'} /><Text style={{ fontSize: 12, lineHeight: 17, fontWeight: '700', color: outline ? '#D61B36' : 'white' }}>{label}</Text></Pressable>)}
    </View>
    <Status loading={loading} error={error} retry={onRetry} />
    {!!copyError && <><Text accessibilityRole="alert" style={{ color: '#BD2B41', fontSize: 12, lineHeight: 18 }}>{copyError}</Text><Text selectable style={{ fontSize: 12, lineHeight: 18, color: colors.text }}>{invitation?.url}</Text></>}
    {qrOpen && invitation?.url && <AffiliateInvitationQR invitation={invitation} onClose={() => setQrOpen(false)} onCopy={onCopy} onShare={onShare} />}
  </View>;
}

export function AffiliateInvitationQR({ invitation, onClose, onCopy, onShare }: { invitation: AffiliateInvitation; onClose: () => void; onCopy: () => void; onShare: () => void }) {
  const { width, height } = useWindowDimensions();
  const size = Math.max(100, Math.min(240, width - 100, height - 300));
  const xml = useMemo(() => toSVG({ bcid: 'qrcode', text: invitation.url, scale: 3, padding: 6 }), [invitation.url]);
  return <Modal visible transparent animationType="fade" onRequestClose={onClose}>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#17172588', padding: 20 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Đóng mã QR giới thiệu" onPress={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
      <View accessibilityViewIsModal style={[dashboardPanel, { padding: 20, width: '100%', maxWidth: 380, maxHeight: '90%' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text accessibilityRole="header" style={{ color: colors.text, fontSize: 17, fontWeight: '700', flex: 1 }}>Mã QR giới thiệu</Text><Pressable accessibilityRole="button" accessibilityLabel="Đóng" onPress={onClose} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><X size={22} color={colors.text} /></Pressable></View>
        <ScrollView contentContainerStyle={{ alignItems: 'center', gap: 12, paddingTop: 8 }}>
          <View accessible accessibilityRole="image" accessibilityLabel={`Mã QR link giới thiệu ${invitation.code}`}><SvgXml xml={xml} width={size} height={size} /></View>
          <Text selectable style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{invitation.code}</Text>
          <Text style={{ fontSize: 12, lineHeight: 18, color: '#646678', textAlign: 'center' }}>Quét mã để tham gia qua liên kết giới thiệu của bạn.</Text>
          <Text selectable style={{ fontSize: 12, lineHeight: 18, color: '#646678', textAlign: 'center' }}>{invitation.url}</Text>
          <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>{[{ title: 'Sao chép link', Icon: Link2, action: onCopy }, { title: 'Chia sẻ link', Icon: Share2, action: onShare }].map(({ title, Icon, action }) => <Pressable key={title} accessibilityRole="button" accessibilityLabel={title} onPress={action} style={{ flex: 1, minHeight: 44, borderRadius: 10, backgroundColor: '#FFF0F3', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}><Icon size={16} color="#D91C38" /><Text style={{ color: '#D91C38', fontSize: 12, fontWeight: '600' }}>{title}</Text></Pressable>)}</View>
        </ScrollView>
      </View>
    </View>
  </Modal>;
}
