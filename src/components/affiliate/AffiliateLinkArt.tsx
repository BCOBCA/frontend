import { Platform } from 'react-native';
import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg';

export function AffiliateLinkArt() {
  return <Svg width="100%" height="100%" viewBox="0 0 180 130" accessible={Platform.OS === 'web' ? undefined : false} aria-hidden={true}>
    <Path d="M17 108C1 88 17 61 43 58c22-3 24-20 47-22 25-2 32 19 49 20 28 1 43 18 35 41-5 16-22 17-39 17H39q-15 0-22-6Z" fill="#FFF1F3" />
    <Ellipse cx="97" cy="82" rx="39" ry="33" fill="#FFDDE2" />
    <Ellipse cx="104" cy="91" rx="34" ry="26" fill="#FFC6CF" opacity={0.6} />
    <G transform="rotate(-46 95 77)" fill="none" stroke="#F63745" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="51" y="62" width="53" height="30" rx="15" />
      <Rect x="88" y="62" width="53" height="30" rx="15" />
      <Path d="M83 77h27" />
    </G>
    <Path d="m65 37-7-7m23 0-4-10m22 6V14m18 16 3-10m11 19 7-7" stroke="#FF5664" strokeWidth="3.5" strokeLinecap="round" />
  </Svg>;
}
