import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { buyerCancellationReasons } from '../../services/order-cancellation';
import { colors } from '../../theme';

type Props = { busy?: boolean; error?: string; onSubmit: (reason: string) => void; onDismiss: () => void };

export function CancelOrderForm({ busy, error, onSubmit, onDismiss }: Props) {
  const [reason, setReason] = useState('');
  const close = () => { if (!busy) onDismiss(); };
  return <Modal visible transparent animationType="fade" onRequestClose={close}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Đóng popup hủy đơn" disabled={busy} onPress={close} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(20,24,35,.4)' }} />
        <View accessibilityViewIsModal accessibilityLabel="Hủy đơn hàng" style={{ width: '100%', maxWidth: 520, maxHeight: '90%', backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 16, paddingRight: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text accessibilityRole="header" style={{ flex: 1, color: colors.text, fontSize: 16, fontWeight: '700' }}>Lý do hủy đơn hàng</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Đóng hủy đơn" disabled={busy} onPress={close} style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center', opacity: busy ? 0.4 : 1 }}><Text aria-hidden style={{ fontSize: 26, color: colors.muted }}>×</Text></Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={{ padding: 16, gap: 10 }}>
    <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>Bạn chỉ có thể hủy đơn trước khi cửa hàng xác nhận. Vui lòng chọn một lý do.</Text>
    <View accessibilityRole="radiogroup" accessibilityLabel="Lý do hủy đơn">
      {buyerCancellationReasons.map(choice => <Pressable key={choice} accessibilityRole="radio" accessibilityLabel={choice} accessibilityState={{ checked: reason === choice, disabled: !!busy }} disabled={busy} onPress={() => setReason(choice)}
        style={({ pressed }) => ({ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10, opacity: pressed ? 0.6 : 1 })}>
        <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: reason === choice ? 5 : 1, borderColor: reason === choice ? colors.primary : colors.muted }} />
        <Text style={{ flex: 1, fontSize: 14, color: colors.text }}>{choice}</Text>
      </Pressable>)}
    </View>
    {!!error && <Text accessibilityRole="alert" style={{ color: colors.primary, fontSize: 13 }}>{error}</Text>}
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 10 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Giữ lại đơn hàng" disabled={busy} onPress={close} style={{ minHeight: 44, paddingHorizontal: 14, justifyContent: 'center' }}><Text style={{ color: colors.text }}>Giữ lại đơn hàng</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Xác nhận hủy đơn" accessibilityState={{ disabled: !!busy || !reason }} disabled={busy || !reason} onPress={() => { if (reason && !busy) onSubmit(reason); }} style={{ minHeight: 44, paddingHorizontal: 14, borderRadius: 8, justifyContent: 'center', backgroundColor: colors.primary, opacity: busy || !reason ? 0.5 : 1 }}><Text style={{ color: colors.surface, fontWeight: '600' }}>{busy ? 'Đang hủy…' : 'Xác nhận hủy đơn'}</Text></Pressable>
    </View>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
