import { Text, View } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react-native';
import { Page as PageView, Button, Status, LoginNotice, Empty } from '../../src/components/common/ui';
import { colors, styles as s } from '../../src/theme';
import { request } from '../../src/services/api';
import { queryClient, useAuth } from '../../src/stores/auth';
import type { Membership, Page, Voucher } from '../../src/types/api';

export default function Promotions() {
  const user = useAuth(state => state.user);
  const member = useQuery({ queryKey: ['membership'], queryFn: () => request<Membership>('GET', '/membership'), enabled: !!user });
  const vouchers = useQuery({ queryKey: ['vouchers'], queryFn: () => request<Page<Voucher>>('GET', '/vouchers'), enabled: !!user });
  const checkIn = useMutation({ mutationFn: () => request<{ rewardPoints: number }>('POST', '/membership/check-ins'), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['membership'] }); void queryClient.invalidateQueries({ queryKey: ['points'] }); } });
  const claim = useMutation({ mutationFn: (id: string) => request('POST', `/vouchers/${id}/claim`), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['vouchers'] }) });
  return <PageView title="Ưu đãi"><View style={{ backgroundColor: colors.primary, padding: 16, paddingTop: 48, paddingBottom: 22, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}><View style={s.card}>
    <View style={s.row}><Star color={colors.primary} fill={colors.gold} size={26} /><Text style={s.title}>Lợi ích thành viên</Text></View>
    <View style={{ height: 14 }} />
    {user ? <Button title={member.data?.checkedInToday ? 'Đã điểm danh hôm nay' : checkIn.isPending ? 'Đang điểm danh...' : 'Điểm danh'} disabled={checkIn.isPending || member.isLoading || !!member.error || member.data?.checkedInToday} black onPress={() => checkIn.mutate()} /> : <LoginNotice />}
    {checkIn.isSuccess && <Text style={s.body}>Bạn nhận được {checkIn.data.rewardPoints} điểm</Text>}
    <Status error={checkIn.error || member.error} retry={() => void member.refetch()} />
  </View></View>
    {user && <><Status loading={vouchers.isLoading} error={vouchers.error || claim.error} retry={() => void vouchers.refetch()} />
      {vouchers.data?.items.length === 0 && <View style={{ paddingVertical: 120 }}><Empty text="Rất tiếc, hiện đã hết voucher!" /></View>}
      <View style={s.padded}>{vouchers.data?.items.map(voucher => <View key={voucher.id} style={s.card}><Text style={s.title}>{voucher.name}</Text><Text style={s.price}>{voucher.code}</Text><Text style={s.body}>{voucher.description}</Text><Button title={voucher.claimed ? 'Đã nhận' : 'Nhận voucher'} disabled={voucher.claimed || claim.isPending} outline onPress={() => claim.mutate(voucher.id)} /></View>)}</View>
    </>}
  </PageView>;
}
