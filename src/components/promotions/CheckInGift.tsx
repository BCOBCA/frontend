import { Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export function CheckInGift({ size = 34 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 48 48" accessible={Platform.OS === 'web' ? undefined : false} aria-hidden={true}>
    <Path d="M9 22h30v18a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3Z" fill="#E54B40" stroke="#AB332C" strokeWidth="1.6" strokeLinejoin="round" />
    <Path d="M10 23h28v4H10Z" fill="#BE3931" />
    <Path d="M20 22h8v21h-8Z" fill="#FFE0A0" />
    <Path d="M8 15h32a2 2 0 0 1 2 2v6H6v-6a2 2 0 0 1 2-2Z" fill="#F26B58" stroke="#AB332C" strokeWidth="1.6" strokeLinejoin="round" />
    <Path d="M20 15h8v8h-8Z" fill="#FFE7B8" />
    <Path d="M24 15C15 15 11 12 12 8c1-4 9-3 12 7Zm0 0c9 0 13-3 12-7-1-4-9-3-12 7Z" fill="#FFE7B8" stroke="#B67C30" strokeWidth="1.6" strokeLinejoin="round" />
    <Path d="m24 15-6-6m6 6 6-6" fill="none" stroke="#D7A64D" strokeWidth="1.2" strokeLinecap="round" />
  </Svg>;
}
