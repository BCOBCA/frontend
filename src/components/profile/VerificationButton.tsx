import { Platform, Pressable, Text } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors } from '../../theme';

type Props = {
  title: string;
  Icon: LucideIcon;
  onPress: () => void;
  variant?: 'neutral' | 'soft' | 'primary';
  disabled?: boolean;
};

export function VerificationButton({ title, Icon, onPress, variant = 'neutral', disabled = false }: Props) {
  const foreground = disabled ? colors.muted : variant === 'primary' ? colors.surface : variant === 'soft' ? '#B52C28' : colors.text;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => ({
      minHeight: 44, paddingVertical: 11, paddingHorizontal: 16, borderRadius: 10,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      borderWidth: 1, borderColor: disabled ? colors.border : variant === 'primary' ? colors.primary : variant === 'soft' ? '#F4D5D2' : colors.border,
      backgroundColor: disabled ? colors.disabled : variant === 'primary' ? colors.primary : variant === 'soft' ? '#FFF2F0' : '#F7F8FA',
      opacity: pressed ? 0.75 : 1,
    })}>
    <Icon size={17} color={foreground} strokeWidth={1.8} accessible={Platform.OS === 'web' ? undefined : false} aria-hidden />
    <Text style={{ color: foreground, fontSize: 14, lineHeight: 20, fontWeight: '600', flexShrink: 1, textAlign: 'center' }}>{title}</Text>
  </Pressable>;
}
