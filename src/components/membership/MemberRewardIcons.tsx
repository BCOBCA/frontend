import Svg, { Circle, Path } from 'react-native-svg';
import { Platform } from 'react-native';

export function AffiliateCoinIcon({ size = 48 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 56 56" accessible={Platform.OS === 'web' ? undefined : false} aria-hidden={true}>
    <Circle cx="25" cy="26" r="22" fill="#FFD45B" stroke="#EB5535" strokeWidth="1.5" />
    <Circle cx="30" cy="31" r="21" fill="#FFE477" stroke="#EB5535" strokeWidth="1.5" />
    <Circle cx="30" cy="31" r="16" fill="#FFD04D" stroke="#ECA529" strokeWidth="1" />
    <Path d="m30 18 3.8 7.7 8.5 1.3-6.1 6 1.4 8.5-7.6-4-7.6 4 1.4-8.5-6.1-6 8.5-1.3Z" fill="#FFFFFF" stroke="#EEBD45" strokeWidth="1" strokeLinejoin="round" />
  </Svg>;
}

export function MemberPointsIcon({ size = 48 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 56 56" accessible={Platform.OS === 'web' ? undefined : false} aria-hidden={true}>
    <Path d="M25.2 5.7Q28 1.2 30.8 5.7l6.1 12.1 13.4 2Q55.4 20.6 51.8 24.5l-9.6 9.6 2.2 13.3Q45.3 52.8 40.4 50.3L28 44l-12.4 6.3Q10.7 52.8 11.6 47.4l2.2-13.3-9.6-9.6Q.6 20.6 5.7 19.8l13.4-2Z" fill="#FFDB6C" stroke="#E46B35" strokeWidth="1.5" strokeLinejoin="round" />
    <Path d="m28 14 5.2 10.4 11.5 1.7-8.3 8.1 2 11.4L28 40.2l-10.4 5.4 2-11.4-8.3-8.1 11.5-1.7Z" fill="#DF4938" />
    <Path d="m28 24 2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8Z" fill="#FFFFFF" />
  </Svg>;
}
