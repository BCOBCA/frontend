import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { CircleAlert, Heart, MessageCircle, Phone, PhoneCall, UsersRound } from 'lucide-react-native';
import { colors } from '../../theme';

const items = [
  { id: 'hotline', label: 'Tổng đài', Icon: PhoneCall },
  { id: 'chat', label: 'Chat với shop', Icon: MessageCircle },
  { id: 'contact', label: 'Liên hệ lại', Icon: Phone },
  { id: 'favorites', label: 'Sản phẩm yêu thích', Icon: Heart },
  { id: 'feedback', label: 'Phản hồi', Icon: CircleAlert },
  { id: 'about', label: 'Về chúng tôi', Icon: UsersRound },
] as const;
export type SupportAction = typeof items[number]['id'];

export function SupportPopover({ bottom, onClose, onSelect, message }: { bottom: number; onClose: () => void; onSelect: (action: SupportAction) => void; message?: string }) {
  return <Modal transparent visible animationType="fade" onRequestClose={onClose}>
    <View style={{ flex: 1 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Đóng hỗ trợ" onPress={onClose} style={{ position: 'absolute', inset: 0 }} />
      <View accessibilityViewIsModal style={{ position: 'absolute', right: 16, bottom, maxHeight: '80%', width: 224, paddingVertical: 6, backgroundColor: colors.surface, borderRadius: 12, boxShadow: '0 3px 14px #24242B26' }}>
        <ScrollView>
          {items.map(({ id, label, Icon }) => <Pressable key={id} accessibilityRole="button" accessibilityLabel={label} onPress={() => onSelect(id)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, paddingHorizontal: 14, backgroundColor: pressed ? colors.background : colors.surface })}>
            <Icon size={19} color="#787878" strokeWidth={1.6} aria-hidden />
            <Text style={{ color: '#454545', fontSize: 13, lineHeight: 19 }}>{label}</Text>
          </Pressable>)}
          {!!message && <Text accessibilityLiveRegion="polite" style={{ fontSize: 12, lineHeight: 18, color: colors.muted, padding: 14 }}>{message}</Text>}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}
