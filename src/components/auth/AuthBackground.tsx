import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

export function AuthBackground() {
  return <View pointerEvents="none" accessible={false} style={StyleSheet.absoluteFill}>
    <Svg width="100%" height="100%" viewBox="0 0 1440 1000" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="auth-base" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFF9FA" />
          <Stop offset="0.5" stopColor="#FDEDF0" />
          <Stop offset="1" stopColor="#FFF2E9" />
        </LinearGradient>
        <LinearGradient id="auth-blush" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F8DCE4" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#FFF9F6" stopOpacity="0.15" />
        </LinearGradient>
      </Defs>
      <Rect width="1440" height="1000" fill="url(#auth-base)" />
      <Path d="M0 250 C400 180 690 10 1110 0 H1440 V270 C1050 380 590 400 0 710Z" fill="url(#auth-blush)" />
      <Path d="M0 560 C450 510 860 330 1440 130 V360 C900 640 420 670 0 850Z" fill="#FFFFFF" opacity="0.35" />
      <Path d="M0 875 C420 970 820 1010 1440 755 V1000 H0Z" fill="#F4B6B5" opacity="0.26" />
      <Path d="M0 945 C500 1040 1040 950 1440 875 V1000 H0Z" fill="#EEA49D" opacity="0.20" />
    </Svg>
  </View>;
}
