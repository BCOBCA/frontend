import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import { AccessibilityInfo, Animated, AppState, Pressable, ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useFocusEffect } from 'expo-router';
import type { Banner } from '../../types/api';
import { HomeBanner } from './HomeBanner';

export function BannerCarousel({ banners, width }: { banners: Banner[]; width: number }) {
  const pageWidth = Math.min(width, 1180);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const currentIndex = useRef(0);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(enabled => { if (mounted) setReduceMotion(enabled); });
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    const activity = AppState.addEventListener('change', state => setAppActive(state === 'active'));
    return () => { mounted = false; motion.remove(); activity.remove(); };
  }, []);

  const select = useCallback((index: number) => {
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    currentIndex.current = index;
    setActiveIndex(index);
    scroll.current?.scrollTo({ x: index * pageWidth, animated: !reduceMotion });
  }, [pageWidth, reduceMotion]);

  useFocusEffect(useCallback(() => {
    if (banners.length < 2 || dragging || !appActive) return;
    const timer = setTimeout(() => select((activeIndex + 1) % banners.length), 3000);
    return () => clearTimeout(timer);
  }, [banners.length, dragging, appActive, activeIndex, select]));

  useEffect(() => {
    // Preserve the current slide when the desktop/mobile viewport changes.
    scroll.current?.scrollTo({ x: currentIndex.current * pageWidth, animated: false });
  }, [pageWidth]);

  useEffect(() => () => { if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current); }, []);

  const synchronizeScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.max(0, Math.min(banners.length - 1, Math.round(event.nativeEvent.contentOffset.x / pageWidth)));
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    // Web scroll events also cover mouse/trackpad scrolling, which has no native drag events.
    scrollEndTimer.current = setTimeout(() => {
      currentIndex.current = index;
      setActiveIndex(index);
    }, 120);
  };

  return <View testID="banner-carousel" style={{ width: pageWidth, position: 'relative' }}>
    <ScrollView ref={scroll} horizontal pagingEnabled showsHorizontalScrollIndicator={false} scrollEventThrottle={16}
      onScroll={synchronizeScroll} onScrollBeginDrag={() => setDragging(true)} onScrollEndDrag={() => setDragging(false)}>
      {banners.map(banner => <HomeBanner key={banner.id} banner={banner} width={width} />)}
    </ScrollView>
    {banners.length > 1 && <>
      <View pointerEvents="box-none" style={{ position: 'absolute', bottom: 0, left: 12, right: 12, alignItems: 'center' }}>
        <View accessibilityRole="tablist" accessibilityLabel="Chọn banner" style={{ flexDirection: 'row', maxWidth: pageWidth - 24, paddingHorizontal: 6 }}>
          {banners.map((banner, index) => <Pressable key={banner.id} testID="banner-dot" accessibilityRole="tab"
            accessibilityLabel={`Hiển thị banner ${index + 1}`} accessibilityState={{ selected: activeIndex === index }} aria-selected={activeIndex === index}
            onPress={() => select(index)} style={{ width: 36, minHeight: 44, flexShrink: 1, alignItems: 'center', justifyContent: 'center' }}>
            <PaginationDot active={activeIndex === index} reduceMotion={reduceMotion} />
          </Pressable>)}
        </View>
      </View>
    </>}
  </View>;
}

function PaginationDot({ active, reduceMotion }: { active: boolean; reduceMotion: boolean }) {
  const [progress] = useState(() => new Animated.Value(active ? 1 : 0));
  useEffect(() => {
    const animation = Animated.timing(progress, { toValue: active ? 1 : 0, duration: reduceMotion ? 0 : 180, useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [active, reduceMotion, progress]);
  return <Animated.View pointerEvents="none" style={{ height: 6, borderRadius: 3, backgroundColor: '#FFFFFF',
    width: progress.interpolate({ inputRange: [0, 1], outputRange: [7, 24] }),
    opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }) }} />;
}
