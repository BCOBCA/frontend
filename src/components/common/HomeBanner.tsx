import { useState } from 'react';
import { Linking, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import type { Banner } from '../../types/api';

export function HomeBanner({ banner, width }: { banner: Banner; width: number }) {
  const [imageRatio, setImageRatio] = useState(16 / 9);
  const wide = width >= 768;
  return <Pressable accessibilityRole="button" accessibilityLabel="Xem nội dung nổi bật"
    style={{ width: Math.min(width, 1180), aspectRatio: wide ? imageRatio * 1.5 : 1.76, overflow: 'hidden' }}
    onPress={() => { if (/^https?:\/\//i.test(banner.targetUrl)) void Linking.openURL(banner.targetUrl); }}>
    {wide && <Image source={{ uri: banner.imageUrl }} accessible={false} accessibilityElementsHidden pointerEvents="none"
      style={[StyleSheet.absoluteFill, { transform: [{ scale: 1.08 }] }]} contentFit="cover" blurRadius={32} />}
    <Image source={{ uri: banner.imageUrl }}
      style={StyleSheet.absoluteFill}
      contentFit={wide ? 'contain' : 'cover'}
      onLoad={({ source }) => {
        // Remember dimensions on mobile too, so resizing to desktop uses the original ratio.
        if (Number.isFinite(source.width) && Number.isFinite(source.height) && source.width > 0 && source.height > 0)
          setImageRatio(source.width / source.height);
      }} />
  </Pressable>;
}
