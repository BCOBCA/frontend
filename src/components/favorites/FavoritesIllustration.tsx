import { Platform } from 'react-native';
import Svg, { Defs, Ellipse, G, LinearGradient, Path, Stop } from 'react-native-svg';

export function FavoritesIllustration() {
  return <Svg width="100%" height="100%" viewBox="0 0 340 210" accessible={Platform.OS === 'web' ? undefined : false} aria-hidden={true}>
    <Defs>
      <LinearGradient id="favorites-cloud" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#FFE0E5" /><Stop offset="1" stopColor="#FBEAF0" stopOpacity={0.6} /></LinearGradient>
      <LinearGradient id="favorites-bag" x1="0" y1="0" x2="0.8" y2="1"><Stop offset="0" stopColor="#FFFFFF" /><Stop offset="1" stopColor="#FFE8EA" /></LinearGradient>
      <LinearGradient id="favorites-side" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#FFB3BC" /><Stop offset="1" stopColor="#FFD9DE" /></LinearGradient>
      <LinearGradient id="favorites-bubble" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#FF939B" /><Stop offset="1" stopColor="#FF5965" /></LinearGradient>
    </Defs>
    <Path d="M28 198C4 182 8 153 24 135c14-16 36-13 43-34C76 70 90 41 125 35c22-4 38 7 53 5 23-3 38-20 68-9 31 12 24 47 39 65 14 16 39 19 46 43 7 26-9 58-34 60Z" fill="url(#favorites-cloud)" />
    <Ellipse cx="172" cy="198" rx="108" ry="6" fill="#F5B6C1" opacity={0.3} />
    <Path d="M82 198c-9-15-38-23-31-31 5-6 17 5 23 8-5-15-28-38-20-46 11-12 25 15 30 28-3-15-4-28 3-27 13 1 6 45 13 68Z" fill="#FFB3BD" />
    <Path d="M256 198c6-15 35-24 28-32-5-5-16 5-21 8 4-14 24-29 19-36-8-11-23 8-28 20 3-17 0-24-6-22-11 4-4 44-9 62Z" fill="#FFB6C1" />
    <Path d="m100 94 93-2 13 105H95q-8 0-7-9Z" fill="url(#favorites-side)" />
    <Path d="m103 96-4 99 13-8 4-91Z" fill="#FFA1AE" opacity={0.6} />
    <Path d="M125 96V80c0-30 43-37 45-1v17" fill="none" stroke="#E9414A" strokeWidth="4" strokeLinecap="round" />
    <Path d="M120 94h99q6 0 7 7l10 90q1 8-7 8H117q-7 0-7-7l2-90q0-8 8-8Z" fill="url(#favorites-bag)" />
    <Path d="M119 94h100" stroke="#FFB1BA" strokeWidth="3" strokeLinecap="round" />
    <Path d="M136 104V80c0-30 45-36 46 0v24" fill="none" stroke="#F34C55" strokeWidth="3.5" strokeLinecap="round" />
    <Path d="M169 143c-15-20-43 2-13 25l13 9 13-9c30-23 2-45-13-25Z" fill="none" stroke="#FF7684" strokeWidth="3.5" strokeLinejoin="round" />
    <G transform="rotate(12 242 45)">
      <Path d="M217 14h48q10 0 10 10v37q0 10-10 10h-20l-11 13-5-13h-12q-10 0-10-10V24q0-10 10-10Z" fill="url(#favorites-bubble)" />
      <Path d="M241 36c-10-13-29 3 0 20 29-17 10-33 0-20Z" fill="#FFFFFF" />
    </G>
    <Path d="m72 43-7-8m17 3-1-10m-17 26-10-1" stroke="#FF646F" strokeWidth="3.5" strokeLinecap="round" />
  </Svg>;
}
