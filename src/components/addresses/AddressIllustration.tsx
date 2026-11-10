import { Platform } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export function AddressIllustration() {
  return <Svg width="100%" height="100%" viewBox="0 0 300 240" accessible={Platform.OS === 'web' ? undefined : false} aria-hidden>
    <Defs>
      <LinearGradient id="address-halo" x1="0" y1="0" x2="1" y2="1"><Stop stopColor="#FCECEE" /><Stop offset="1" stopColor="#FFF8F6" /></LinearGradient>
      <LinearGradient id="address-pin" x1="0" y1="0" x2="1" y2="1"><Stop stopColor="#FF5A50" /><Stop offset="1" stopColor="#D71920" /></LinearGradient>
      <LinearGradient id="address-paper" x1="0" y1="0" x2="0" y2="1"><Stop stopColor="#FFFFFF" /><Stop offset="1" stopColor="#FFF8F8" /></LinearGradient>
    </Defs>
    <Path d="M32 167C10 120 44 56 89 32c43-23 46 14 83 12 38-2 53-18 82 14 31 33 43 87 20 117-26 35-217 36-242-8Z" fill="url(#address-halo)" />
    <G fill="#F4CDD0" opacity={0.8}>
      <Path d="M48 136V91h13V72h21v64Zm41 0V91h24v45Zm123 0V83h21v53Zm28 0V104h13v32Z" />
      <Path d="M207 57h15c-2-12 16-16 20-4 6-5 17 0 15 7h10v5h-60Z" />
    </G>
    <G fill="#FFF8F8"><Rect x="56" y="100" width="5" height="7" /><Rect x="69" y="84" width="5" height="7" /><Rect x="69" y="100" width="5" height="7" /><Rect x="57" y="116" width="5" height="7" /><Rect x="96" y="100" width="5" height="7" /><Rect x="96" y="116" width="5" height="7" /></G>
    <G stroke="#EF9D9F" strokeWidth="2" fill="#FFB9BB">
      <Path d="M66 185c-27-18-42-46-33-52 10-7 31 27 33 52Z" /><Path d="M66 185c-27-5-45-16-41-23 5-8 28 4 41 23Z" /><Path d="M66 185c-10-30-7-46 0-44 9 1 7 23 0 44Z" />
      <Path d="M237 183c28-20 42-47 33-53-10-7-31 25-33 53Z" /><Path d="M237 183c28-4 46-18 40-24-6-7-30 6-40 24Z" /><Path d="M237 183c6-30 3-47-5-43-8 4-3 25 5 43Z" />
    </G>
    <Ellipse cx="148" cy="207" rx="92" ry="9" fill="#EFCFD1" opacity={0.45} />
    <Path d="m63 199 20-75 55 9 50-13 32 75-59 13-54-10Z" fill="url(#address-paper)" stroke="white" strokeWidth="7" strokeLinejoin="round" />
    <Path d="m83 124 55 9-31 65-44 1Zm55 9 50-13-27 88-54-10Zm50-13 32 75-59 13Z" fill="#F7D9DC" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round" />
    <Path d="m75 158 46 7 53-17 30 10M123 132l-9 68m69-77-10 82" stroke="white" strokeWidth="5" fill="none" />
    <Ellipse cx="151" cy="168" rx="24" ry="5" fill="#C67F84" opacity={0.2} />
    <Path d="M151 78c-23 0-38 16-38 36 0 25 38 60 38 60s38-35 38-60c0-20-15-36-38-36Z" fill="url(#address-pin)" />
    <Path d="M151 78c-21 1-35 15-35 34 0 20 26 47 35 56-14-21-21-37-21-51 0-17 7-30 21-39Z" fill="#FF6D60" opacity={0.45} />
    <Circle cx="151" cy="112" r="15" fill="white" />
    <Path d="m207 165 35 10-33 12-36-10Z" fill="#FFC278" /><Path d="m173 177 36 10v35l-36-12Z" fill="#F6A54E" /><Path d="m209 187 33-12v35l-33 12Z" fill="#E78D36" />
    <Path d="m186 173 35 10 8-3-35-10Z" fill="#ED9D48" /><Path d="m221 183 8-3v14l-8 3Z" fill="#CC792B" /><Path d="m182 190 8 3v8l-8-3Z" fill="#FFD193" />
  </Svg>;
}
