import { Platform } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const coinColors = [
  { face: '#CD7D39', edge: '#A65E25', highlight: '#ECAE73' },
  { face: '#A8AFB9', edge: '#858E9A', highlight: '#DDE1E6' },
  { face: '#FFBF16', edge: '#E49D00', highlight: '#FFE487' },
  { face: '#7BA4EE', edge: '#5B83D3', highlight: '#C5D8FF' },
];

export function AffiliateRankIcon({ level, size = 20 }: { level: number; size?: number }) {
  const coin = coinColors[Math.min(Math.max(level, 0), coinColors.length - 1)];
  return <Svg width={size} height={size} viewBox="0 0 28 28" accessible={Platform.OS === 'web' ? undefined : false} aria-hidden={true}>
    {level >= 4 ? <>
      <Path d="M6 4h16l5 7-13 14L1 11Z" fill="#AE65EC" />
      <Path d="m6 4 4 7H1Zm0 0h8l-4 7Zm8 0h8l-4 7Z" fill="#D9B5FF" />
      <Path d="m22 4 5 7h-9Z" fill="#BF89F6" />
      <Path d="m10 11 4 14 4-14Z" fill="#C89AF9" />
      <Path d="M1 11h26M6 4l8 21L22 4" fill="none" stroke="#9951DD" strokeWidth="0.7" strokeLinejoin="round" />
      <Path d="m10 11 4-7 4 7Z" fill="#E9D2FF" />
    </> : <>
      <Circle cx="14" cy="14.5" r="12" fill={coin.edge} />
      <Circle cx="14" cy="13.5" r="11.5" fill={coin.face} stroke={coin.highlight} strokeWidth="1" />
      <Circle cx="14" cy="13.5" r="8.5" fill="none" stroke={coin.highlight} strokeWidth="0.8" />
      <Path d="m14 6 2.2 4.7 5.2.7-3.8 3.7.9 5.2-4.5-2.5-4.5 2.5.9-5.2-3.8-3.7 5.2-.7Z" fill="#FFFFFF" />
    </>}
  </Svg>;
}
