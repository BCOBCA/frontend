import { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleAlert, CircleCheck, X } from 'lucide-react-native';
import { colors } from '../../theme';

export function TopToast({ message, onDismiss, tone = 'success' }: { message: string; onDismiss: () => void; tone?: 'success' | 'error' }) {
  const insets = useSafeAreaInsets();
  const [translateY] = useState(() => new Animated.Value(-100));
  const [opacity] = useState(() => new Animated.Value(0));
  const Icon = tone === 'error' ? CircleAlert : CircleCheck;
  useEffect(() => {
    const native = Platform.OS !== 'web';
    const animation = Animated.sequence([
      Animated.parallel([Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: native }), Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: native })]),
      Animated.delay(3000),
      Animated.parallel([Animated.timing(translateY, { toValue: -100, duration: 180, useNativeDriver: native }), Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: native })]),
    ]);
    animation.start(({ finished }) => { if (finished) onDismiss(); });
    return () => animation.stop();
  }, [opacity, translateY, onDismiss]);
  return <View pointerEvents="box-none" style={{ position: 'absolute', top: insets.top + 12, left: 0, right: 0, paddingHorizontal: 16, alignItems: 'center', zIndex: 1000 }}>
    <Animated.View accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ width: '100%', maxWidth: 480, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 16, paddingRight: 6, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: tone === 'error' ? '#F1B8BC' : '#BFE5CE', backgroundColor: colors.surface, boxShadow: '0 6px 24px #172B2026', opacity, transform: [{ translateY }] }}>
      <Icon size={22} color={tone === 'error' ? '#C52A34' : '#21864B'} />
      <Text style={{ flex: 1, color: colors.text, fontSize: 14, lineHeight: 21, fontWeight: '600' }}>{message}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Đóng thông báo" onPress={onDismiss} hitSlop={4} style={{ minWidth: 40, minHeight: 40, alignItems: 'center', justifyContent: 'center' }}><X size={18} color={colors.muted} /></Pressable>
    </Animated.View>
  </View>;
}
