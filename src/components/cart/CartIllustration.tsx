import { Platform } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export function CartIllustration({ guest }: { guest: boolean }) {
  return <Svg width="100%" height="100%" viewBox="0 0 340 200" accessible={Platform.OS === 'web' ? undefined : false} aria-hidden={true}>
    <Defs>
      <LinearGradient id="cart-cloud" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#FFE6EA" /><Stop offset="1" stopColor="#FFF0F2" /></LinearGradient>
      <LinearGradient id="cart-red" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#FF949B" /><Stop offset="1" stopColor="#F52C39" /></LinearGradient>
      <LinearGradient id="cart-bag" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#FFB5BB" /><Stop offset="1" stopColor="#FF6D7B" /></LinearGradient>
    </Defs>
    <Path d="M34 181C8 163 21 134 45 129c-9-36 16-61 48-67 14-3 25 0 35-12 16-23 38-38 62-29 18 6 17 21 32 20 21-3 39 8 41 29 1 13-7 27 6 31 32-2 57 19 55 47-1 24-17 39-43 39H57q-15 0-23-6Z" fill="url(#cart-cloud)" />
    <Ellipse cx="172" cy="185" rx="95" ry="5" fill="#FFD0D7" opacity={0.5} />
    {!guest && <G fill="#FFC8D0"><Path d="M91 179c-15-7-30-20-25-26 4-5 16 3 21 9-7-15-12-27-5-29 9-2 16 25 18 44Z" /><Path d="M248 179c16-7 28-19 23-25-4-4-14 3-20 9 8-16 11-26 5-29-9-3-17 23-18 43Z" /></G>}
    {guest && <G>
      <Path d="m120 77 30-7 13 70-34 6Z" fill="#FFB7C0" />
      <Path d="m123 78 8 63 7-1-8-64Z" fill="#FFD1D7" />
      <Path d="m190 58 30 8-15 71-35-8Z" fill="#FF8794" />
      <Path d="M149 55h54l5 69h-65Z" fill="url(#cart-bag)" />
      <Path d="M163 61V48c0-24 27-24 27 0v13" fill="none" stroke="#FF8F9B" strokeWidth="3" />
      <Path d="M157 59v8m39-8v8" stroke="#FFE0E4" strokeWidth="3" strokeLinecap="round" />
    </G>}
    <Path d="m106 99 133-3-20 64H121Z" fill="#FF6B7C" fillOpacity={0.12} />
    <Path d="m84 78 19 1 19 81h99l21-76" fill="none" stroke="url(#cart-red)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="m110 99 128-3m-123 25 114-1m-108 22 102-1m-90-42 11 59m20-60 5 61m25-62-4 62m29-63-13 63" fill="none" stroke="#FF8D99" strokeWidth="4.5" />
    <Circle cx="134" cy="179" r="11" fill="#F73846" /><Circle cx="134" cy="179" r="4" fill="#FFA5AE" />
    <Circle cx="204" cy="179" r="11" fill="#F73846" /><Circle cx="204" cy="179" r="4" fill="#FFA5AE" />
    {guest && <G>
      <Rect x="206" y="86" width="56" height="68" rx="17" fill="#FFC3CC" opacity={0.5} />
      <Rect x="203" y="82" width="56" height="68" rx="17" fill="#FFFFFF" />
      <Path d="M223 116v-10c0-15 16-15 16 0v10" fill="none" stroke="#FA3543" strokeWidth="4.5" />
      <Rect x="216" y="111" width="30" height="26" rx="6" fill="url(#cart-red)" />
      <Path d="M231 121v7" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" /><Circle cx="231" cy="120" r="2.5" fill="#FFFFFF" />
    </G>}
    <Path d={guest ? 'm249 27 3-10m10 16 9-7m-4 20 10-1' : 'm86 52-8-8m23 1-2-11m-23 32-11-2'} fill="none" stroke="#FF3F4E" strokeWidth="4" strokeLinecap="round" />
  </Svg>;
}
