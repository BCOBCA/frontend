import { useLocalSearchParams } from 'expo-router';
import { Empty, Page } from '../../src/components/common/ui';
import AffiliatePolicyScreen from '../../src/screens/AffiliatePolicyScreen';
import AboutScreen from '../../src/screens/AboutScreen';
const content: Record<string, { title: string; body: string }> = {
  leaderboard: { title: 'Bảng xếp hạng giới thiệu', body: 'Bảng xếp hạng chưa được công bố.' },
  game: { title: 'Mini game', body: 'Hiện chưa có mini game đang diễn ra.' },
  collaboration: { title: 'Cộng tác', body: 'Sắp ra mắt' },
  contact: { title: 'Liên hệ', body: 'Sắp ra mắt' },
};
export default function Information() { const { slug } = useLocalSearchParams<{ slug: string }>(); if (slug === 'about') return <AboutScreen />; if (slug === 'affiliate') return <AffiliatePolicyScreen />; const item = content[slug] ?? { title: 'Thông tin', body: 'Nội dung chưa được công bố.' }; return <Page title={item.title} back><Empty text={item.body} /></Page>; }
