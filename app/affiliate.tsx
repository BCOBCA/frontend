import { Text, View, Share } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Button, LoginNotice, Page, Status } from '../src/components/common/ui';
import { request } from '../src/services/api';
import { useAuth } from '../src/stores/auth';
import type { Affiliate } from '../src/types/api';
import { money, styles as s } from '../src/theme';
export default function AffiliateScreen() {
  const user = useAuth(state => state.user);
  const query = useQuery({ queryKey: ['affiliate'], queryFn: () => request<Affiliate>('GET', '/affiliate'), enabled: !!user });
  return <Page title="Affiliate" back>{!user ? <LoginNotice /> : <View style={s.padded}><Status loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />{query.data && <><View style={s.card}><Text style={s.body}>Số dư khả dụng</Text><Text style={s.price}>{money(query.data.availableBalance)}</Text><Text style={s.small}>Đang chờ duyệt: {money(query.data.pendingBalance)}</Text><Text style={s.body}>Mã giới thiệu: {query.data.code}</Text><Text style={s.body}>Người được giới thiệu: {query.data.totalReferrals}</Text></View><Button title="Chia sẻ mã giới thiệu" onPress={() => void Share.share({ message: `Mã giới thiệu Báo chí Online BCA: ${query.data!.code}` })} />
    {query.data.debtBalance > 0 && <Text style={s.error}>Hoa hồng cần cấn trừ sau hoàn tiền: {money(query.data.debtBalance)}</Text>}
    {query.data.rankInfo && <View style={s.card}>
      <Text style={s.title}>Hạng giới thiệu: {query.data.rankInfo.name}</Text>
      <Text style={s.body}>Hoa hồng: {(query.data.rankInfo.commissionRate * 100).toLocaleString('vi-VN')}%</Text>
      <Text style={s.small}>{query.data.rankInfo.successfulReferrals} lượt giới thiệu thành công</Text>
      <Text style={s.small}>{query.data.rankInfo.nextRank ? `Còn ${query.data.rankInfo.referralsToNextRank} lượt lên hạng ${query.data.rankInfo.nextRank}` : 'Đã đạt hạng cao nhất'}</Text>
    </View>}
    <Button title="Các hạng và tỷ lệ hoa hồng" outline onPress={() => router.push('/affiliate-ranks')} />
    {[['Danh sách người được giới thiệu', '/referrals'], ['Bảng xếp hạng', '/leaderboard'], ['Hoa hồng của tôi', '/commissions'], ['Lịch sử ví', '/wallet-transactions'], ['Yêu cầu rút tiền', '/withdrawal'], ['Lịch sử rút tiền', '/withdrawals']].map(([title, route]) => <Button key={route} title={title} outline onPress={() => router.push(route)} />)}
  </>}</View>}</Page>;
}
