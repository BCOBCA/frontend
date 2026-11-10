import Svg, { Ellipse, Path } from 'react-native-svg';
import { Platform } from 'react-native';

export function MemberStar({ size = 38 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 48 48" accessible={Platform.OS === 'web' ? undefined : false} aria-hidden={true}>
    <Ellipse cx="24" cy="39" rx="19" ry="5" fill="#BA7615" opacity={0.35} />
    <Ellipse cx="24" cy="37" rx="18" ry="5" fill="#F7BA25" stroke="#B97112" strokeWidth="1.5" />
    <Ellipse cx="24" cy="36" rx="14" ry="2.5" fill="#FFE17A" />
    <Path d="m24 4 5.7 11.5 12.7 1.9-9.2 9 2.2 12.6L24 33l-11.4 6 2.2-12.6-9.2-9 12.7-1.9Z" fill="#FFC329" stroke="#C07B13" strokeWidth="2" strokeLinejoin="round" />
    <Path d="m24 10 2.8 10-6.7 6.7 1.7-10.1Z" fill="#FFE888" />
    <Path d="m38 5 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="#E8A718" />
  </Svg>;
}
