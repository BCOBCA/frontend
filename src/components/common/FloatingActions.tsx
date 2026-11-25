import { useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { Headphones, Share2 } from 'lucide-react-native';
import { colors } from '../../theme';
import { DESKTOP_HEADER_WIDTH } from '../../navigation/tabs';
import { SupportPopover, type SupportAction } from './SupportPopover';
import { SharePopup } from './SharePopup';

export function FloatingActions() {
  const pathname = usePathname();
  return <RouteFloatingActions key={pathname} pathname={pathname} />;
}

function RouteFloatingActions({ pathname }: { pathname: string }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [panel, setPanel] = useState<'support' | 'share' | null>(null);
  const [message, setMessage] = useState('');
  if (/^\/(login|register|forgot-password|reset-password|verify-email)(\/|$)/.test(pathname)) return null;
  const bottom = (width < DESKTOP_HEADER_WIDTH ? 104 : 24) + insets.bottom;
  const select = (action: SupportAction) => {
    if (action === 'hotline' || action === 'chat' || action === 'contact') {
      setMessage(action === 'hotline' ? 'Thông tin tổng đài sẽ được cập nhật.' : action === 'chat' ? 'Chat với shop sẽ sớm được cập nhật.' : 'Chức năng liên hệ lại sẽ sớm được cập nhật.');
      return;
    }
    setPanel(null);
    router.push(action === 'favorites' ? '/favorites' : action === 'feedback' ? '/feedback' : '/info/about');
  };
  return <>
    <View pointerEvents="box-none" style={{ position: 'absolute', bottom, right: 16, gap: 10, zIndex: 20 }}>
      {[{ id: 'support', label: 'Hỗ trợ', Icon: Headphones }, { id: 'share', label: 'Chia sẻ', Icon: Share2 }].map(({ id, label, Icon }) => <Pressable key={id} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ expanded: panel === id }} onPress={() => { setMessage(''); setPanel(panel === id ? null : id as 'support' | 'share'); }} style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface, boxShadow: '0 3px 12px #24242B20', opacity: pressed ? 0.7 : 1 })}>
        <Icon size={23} color={id === 'support' ? '#FA8E80' : '#F1AE58'} strokeWidth={1.8} aria-hidden />
      </Pressable>)}
    </View>
    {panel === 'support' && <SupportPopover bottom={Math.min(bottom + 110, Math.max(16, height - 360))} message={message} onClose={() => setPanel(null)} onSelect={select} />}
    {panel === 'share' && <SharePopup url={Linking.createURL(pathname)} onClose={() => setPanel(null)} />}
  </>;
}
