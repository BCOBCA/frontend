import { ActivityIndicator, Modal, Platform, Text, View } from 'react-native';
import { useIsFocused } from 'expo-router';
import { colors } from '../../theme';

export function ProfileLoadingOverlay({ visible, label = 'Đang tải hồ sơ...' }: { visible: boolean; label?: string }) {
  const focused = useIsFocused();
  if (!visible || !focused) return null;

  return <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={() => {}}>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(20, 26, 38, 0.24)', ...Platform.select({ web: { backdropFilter: 'blur(4px)' } }) }}>
      <View accessibilityViewIsModal accessibilityRole="progressbar" accessibilityLabel={label} accessibilityState={{ busy: true }} style={{ alignItems: 'center', gap: 14, padding: 24, borderRadius: 16, backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.primary} accessible={false} />
        <Text style={{ color: colors.text, fontSize: 14 }}>{label}</Text>
      </View>
    </View>
  </Modal>;
}
