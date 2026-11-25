import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { ReviewForm } from './ReviewForm';
import { colors } from '../../theme';
import type { OrderItem } from '../../types/api';

export function ReviewDialog({ items, initialItemId, onDismiss }: { items: OrderItem[]; initialItemId?: string; onDismiss: () => void }) {
  const [selectedId, setSelectedId] = useState(initialItemId ?? (items.length === 1 ? items[0].id : ''));
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const selected = items.find(item => item.id === selectedId);
  const viewing = selected?.hasReview || items.every(item => item.hasReview);
  const close = () => { if (!pending.current) onDismiss(); };
  return <Modal visible transparent animationType="fade" onRequestClose={close}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Đóng popup đánh giá" disabled={busy} onPress={close} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(20,24,35,.4)' }} />
        <View accessibilityViewIsModal accessibilityLabel={viewing ? 'Xem đánh giá sản phẩm' : 'Viết đánh giá sản phẩm'} style={{ width: '100%', maxWidth: 600, maxHeight: '90%', backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingLeft: 20, paddingRight: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}><Text accessibilityRole="header" style={{ flex: 1, color: colors.text, fontSize: 18, fontWeight: '700' }}>{viewing ? 'Xem đánh giá' : 'Đánh giá sản phẩm'}</Text><Pressable accessibilityRole="button" accessibilityLabel="Đóng đánh giá" disabled={busy} onPress={close} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><X size={21} color={colors.muted} /></Pressable></View>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={{ padding: 20, gap: 16 }}>
            {items.length > 1 && <View accessibilityRole="radiogroup" accessibilityLabel="Sản phẩm cần đánh giá" style={{ gap: 8 }}><Text style={{ fontSize: 13, color: colors.muted }}>Chọn sản phẩm bạn muốn đánh giá</Text>{items.map(item => <Pressable key={item.id} accessibilityRole="radio" accessibilityLabel={`${item.hasReview ? 'Xem đánh giá' : 'Đánh giá'} ${item.productName}${item.variantName ? `, ${item.variantName}` : ''}`} accessibilityState={{ checked: item.id === selectedId, disabled: busy }} disabled={busy} onPress={() => setSelectedId(item.id)} style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: item.id === selectedId ? colors.primary : colors.border, backgroundColor: item.id === selectedId ? '#FFF5F5' : colors.surface, padding: 12, borderRadius: 8 }}><View style={{ width: 18, height: 18, borderWidth: item.id === selectedId ? 5 : 1, borderColor: item.id === selectedId ? colors.primary : colors.muted, borderRadius: 9 }} /><View style={{ flex: 1, gap: 3 }}><Text numberOfLines={2} style={{ fontSize: 13, lineHeight: 19, color: colors.text, fontWeight: '600' }}>{item.productName}</Text>{!!item.variantName && <Text style={{ fontSize: 12, color: colors.muted }}>{item.variantName}</Text>}</View></Pressable>)}</View>}
            {selected && <ReviewForm key={selected.id} itemId={selected.id} name={selected.productName} onBusyChange={value => { pending.current = value; setBusy(value); }} onSaved={onDismiss} />}
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
