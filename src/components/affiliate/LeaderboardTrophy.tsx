import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export function LeaderboardTrophy({ size = 96 }: { size?: number }) {
  return <Svg width={size} height={size} viewBox="0 0 120 120" aria-hidden>
    <Defs><LinearGradient id="lb-cup" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#D78A0B" /><Stop offset=".3" stopColor="#FFF3A9" /><Stop offset=".65" stopColor="#FFCF46" /><Stop offset="1" stopColor="#DA8C0A" /></LinearGradient><LinearGradient id="lb-base" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#FFE98C" /><Stop offset="1" stopColor="#D68C18" /></LinearGradient></Defs>
    <Ellipse cx="60" cy="112" rx="35" ry="4" fill="#8E130E" opacity=".3" />
    <Path d="M34 30H15c0 22 9 34 27 35M86 30h19c0 22-9 34-27 35" fill="none" stroke="#FFC639" strokeWidth="7" />
    <Path d="M31 19h58v22c0 24-12 38-29 38S31 65 31 41Z" fill="url(#lb-cup)" stroke="#FFED9E" strokeWidth="2" />
    <Ellipse cx="60" cy="19" rx="29" ry="5" fill="#FFEAA0" stroke="#FFD45B" strokeWidth="2" />
    <Path d="m60 33 5.5 11.1 12.3 1.8-8.9 8.7 2.1 12.2L60 61l-11 5.8 2.1-12.2-8.9-8.7 12.3-1.8Z" fill="#D58B0B" stroke="#FFF0AC" strokeWidth="1.3" />
    <Path d="M54 78h12v16H54Z" fill="url(#lb-cup)" /><Path d="M45 93h30l7 9H38Z" fill="url(#lb-base)" />
    <Rect x="31" y="101" width="58" height="10" rx="3" fill="url(#lb-base)" />
    <Path d="M22 93C9 77 7 61 12 44m86 49c13-16 15-32 10-49" stroke="#FFD35B" strokeWidth="2" fill="none" />
    <Path d="m14 76-8-5 1 10 9 4m-4-20-8-6 1 10 8 4m2 9-7 1 6 9 9 1m83-18 8-5-1 10-9 4m4-20 8-6-1 10-8 4m-2 9 7 1-6 9-9 1" fill="#FFD35B" />
    <Circle cx="18" cy="18" r="2" fill="#FFE8A1" /><Path d="m99 8 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#FFE8A1" />
  </Svg>;
}
