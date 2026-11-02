import { useLocalSearchParams } from 'expo-router';
import { Empty, Page } from '../../src/components/common/ui';
const content: Record<string, { title: string; body: string }> = {
  about: { title: 'Về chúng tôi', body: 'Báo chí Online BCA\nPhiên bản 1.0.0\nThông tin đơn vị vận hành và liên hệ đang chờ công bố.' },
  affiliate: { title: 'Chính sách Affiliate', body: 'Chính sách Affiliate đang chờ đơn vị vận hành công bố.' },
  leaderboard: { title: 'Bảng xếp hạng giới thiệu', body: 'Bảng xếp hạng chưa được công bố.' },
  game: { title: 'Mini game', body: 'Hiện chưa có mini game đang diễn ra.' },
};
export default function Information() { const { slug } = useLocalSearchParams<{ slug: string }>(); const item = content[slug] ?? { title: 'Thông tin', body: 'Nội dung chưa được công bố.' }; return <Page title={item.title} back><Empty text={item.body} /></Page>; }
