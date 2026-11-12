import { useId } from 'react';
import { Platform } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export function AffiliateWalletArt() {
  const id = useId().replace(/:/g, '');
  return <Svg width="100%" height="100%" viewBox="0 0 220 190" accessible={Platform.OS === 'web' ? undefined : false} aria-hidden>
    <Defs>
      <LinearGradient id={`${id}-wallet`} x1="0" y1="0" x2="1" y2="1"><Stop stopColor="#FF6770" /><Stop offset="1" stopColor="#E50928" /></LinearGradient>
      <LinearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1"><Stop stopColor="#FFE49B" /><Stop offset="1" stopColor="#F3A923" /></LinearGradient>
    </Defs>
    <Ellipse cx="110" cy="172" rx="88" ry="10" fill="#EF4865" opacity={0.12} />
    <G transform="rotate(-10 111 116)">
      <Rect x="49" y="56" width="105" height="88" rx="15" fill="#D70C29" />
      <Path d="m58 64 86-15 7 37H58Z" fill="#FF936F" />
      <Path d="m71 65 57-10 4 25-57 10Z" fill="#FFC17F" />
      <Rect x="29" y="76" width="145" height="88" rx="17" fill={`url(#${id}-wallet)`} stroke="#FF97A1" strokeWidth="2" />
      <Path d="M35 91v55q0 12 13 12h99" fill="none" stroke="#FFACB5" strokeWidth="2" opacity={0.6} />
      <Rect x="133" y="104" width="53" height="34" rx="10" fill="#E67A1A" />
      <Rect x="132" y="101" width="53" height="32" rx="10" fill={`url(#${id}-gold)`} stroke="#F19A2E" strokeWidth="2" />
      <Circle cx="146" cy="117" r="7" fill="#FFF0A6" stroke="#DA942D" strokeWidth="2" />
    </G>
    {[{ x: 40, y: 47, r: 10 }, { x: 82, y: 20, r: 12 }, { x: 170, y: 37, r: 16 }, { x: 194, y: 148, r: 11 }].map(({ x, y, r }) => <G key={x}>
      <Circle cx={x} cy={y} r={r} fill={`url(#${id}-gold)`} stroke="#ECA32C" strokeWidth="1.5" />
      <Circle cx={x} cy={y} r={r * 0.72} fill="none" stroke="#FFF1B2" strokeWidth="1.5" />
      <Path d={`m${x} ${y - r * 0.5} ${r * 0.17} ${r * 0.33} ${r * 0.35} ${r * 0.04} -${r * 0.25} ${r * 0.24} ${r * 0.05} ${r * 0.35} -${r * 0.32} ${r * 0.17} -${r * 0.31} -${r * 0.17} ${r * 0.05} -${r * 0.35} -${r * 0.25} -${r * 0.24} ${r * 0.35} -${r * 0.04}Z`} fill="#FFF3B9" />
    </G>)}
  </Svg>;
}

export function AffiliatePlaneArt() {
  return <Svg width="100%" height="100%" viewBox="0 0 100 80" accessible={Platform.OS === 'web' ? undefined : false} aria-hidden>
    <Path d="M68 31C8 9 8 61 48 54c39-7 27 27 2 17" fill="none" stroke="#F4A7B5" strokeWidth="1.5" strokeDasharray="3 3" />
    <Path d="m34 20 56-16-19 44-14-17-11 9-1-15Z" fill="#F23C54" />
    <Path d="m45 25 45-21-33 27 14 17-7-21-18 13Z" fill="#D91B39" />
    <Path d="m45 25 45-21-33 27" fill="#FF9AA8" />
  </Svg>;
}
