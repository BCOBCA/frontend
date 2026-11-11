import { useState } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LoginNotice, Page, Status } from '../src/components/common/ui';
import { LeaderboardView } from '../src/components/affiliate/LeaderboardView';
import { ShareLinkActions } from '../src/components/affiliate/ShareLinkActions';
import { request } from '../src/services/api';
import { useAuth } from '../src/stores/auth';
import type { AffiliateRank, LeaderboardPage, LeaderboardPeriod } from '../src/types/api';
export default function Leaderboard() {
  const user = useAuth(state => state.user);
  const [period, setPeriod] = useState<LeaderboardPeriod>('week');
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['leaderboard', user?.id, period, page], enabled: !!user, queryFn: async () => {
    const result = await request<LeaderboardPage>('GET', `/affiliate/leaderboard?page=${page}&pageSize=10&period=${period}`);
    if (period !== 'all' && result.period !== period) throw new Error('Chưa thể tải bảng xếp hạng cho kỳ này. Vui lòng thử lại.');
    return result;
  } });
  const ranks = useQuery({ queryKey: ['affiliate-ranks'], queryFn: () => request<AffiliateRank[]>('GET', '/affiliate/ranks'), enabled: !!user });
  const invitation = useQuery({ queryKey: ['affiliate-invitation', user?.id], queryFn: () => request<{ url: string; code: string }>('GET', '/affiliate/invitation'), enabled: !!user });
  return <Page title="Bảng xếp hạng lượt giới thiệu" back footerTab="member">
    {!user ? <LoginNotice /> : <><Status loading={query.isLoading || ranks.isLoading} error={query.error || ranks.error} retry={() => { void query.refetch(); void ranks.refetch(); }} />
      <LeaderboardView data={query.data} loading={query.isLoading} period={period} ranks={ranks.data ?? []} onPeriod={value => { setPage(1); setPeriod(value); }} onPage={setPage} onDetails={() => router.push('/affiliate-ranks')} onPolicy={() => router.push('/info/affiliate')}
        sharing={<><Status loading={invitation.isLoading} error={invitation.error} retry={() => void invitation.refetch()} />{invitation.data?.url && <ShareLinkActions url={invitation.data.url} compact />}</>} />
    </>}
  </Page>;
}
