import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export function SupportArt() {
  return <Svg width="100%" height="100%" viewBox="0 0 220 180" aria-hidden>
    <Defs><LinearGradient id="support-red" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#FF8C89" /><Stop offset=".45" stopColor="#F34D4D" /><Stop offset="1" stopColor="#CA1E29" /></LinearGradient><LinearGradient id="support-white" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#FFFFFF" /><Stop offset="1" stopColor="#FFE7E6" /></LinearGradient></Defs>
    <Ellipse cx="119" cy="165" rx="76" ry="8" fill="#EAB8B7" opacity=".45" />
    <Circle cx="115" cy="97" r="66" fill="#FFE0DE" />
    <Path d="M51 89V72a64 64 0 0 1 128 0v17" fill="none" stroke="#D72532" strokeWidth="14" strokeLinecap="round" />
    <Path d="M53 74a62 62 0 0 1 123-4" fill="none" stroke="#FF9792" strokeWidth="5" strokeLinecap="round" />
    <Rect x="65" y="58" width="101" height="82" rx="30" fill="url(#support-white)" stroke="#FFC5C2" strokeWidth="2" />
    <Path d="m89 135-2 18 24-14" fill="#FFE9E7" stroke="#FFC5C2" strokeWidth="2" />
    <Rect x="37" y="83" width="25" height="53" rx="12" fill="url(#support-red)" /><Rect x="49" y="84" width="17" height="52" rx="8" fill="#FFAEAA" />
    <Rect x="171" y="83" width="25" height="53" rx="12" fill="url(#support-red)" /><Rect x="162" y="84" width="17" height="52" rx="8" fill="#FFAEAA" />
    <Path d="M184 134c-5 18-22 23-53 22" fill="none" stroke="#56505A" strokeWidth="6" strokeLinecap="round" /><Rect x="113" y="149" width="27" height="12" rx="6" fill="url(#support-red)" />
    {[91,116,141].map(cx => <Circle key={cx} cx={cx} cy="96" r="7" fill="url(#support-red)" />)}
    <Path d="m31 47-9-7m18-10-5-13m-9 42-13-2" fill="none" stroke="#FFBE54" strokeWidth="6" strokeLinecap="round" />
  </Svg>;
}
