import { router } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { LoginNotice, Page } from '../src/components/common/ui';
import { MyOffersView } from '../src/components/promotions/MyOffersView';
import { request } from '../src/services/api';
import { useAuth } from '../src/stores/auth';
import type { OwnedVoucher, Page as PageResult } from '../src/types/api';

export default function MyOffers() {
  const user = useAuth(state => state.user);
  return <Page title="Ưu đãi của tôi" back footerTab="member">
    {user ? <OwnedOffers key={user.id} userId={user.id} /> : <LoginNotice />}
  </Page>;
}

function OwnedOffers({ userId }: { userId: string }) {
  const offers = useInfiniteQuery({
    queryKey: ['vouchers', 'mine', userId, 'AVAILABLE'], initialPageParam: 1, staleTime: 0,
    queryFn: ({ pageParam }) => request<PageResult<OwnedVoucher>>('GET', `/vouchers/mine?page=${pageParam}&pageSize=20&status=AVAILABLE`),
    getNextPageParam: last => last.page < last.totalPages ? last.page + 1 : undefined,
  });
  return <MyOffersView items={offers.data?.pages.flatMap(page => page.items) ?? []}
    loading={offers.isLoading} error={offers.error} onRetry={() => void offers.refetch()} hasMore={!!offers.hasNextPage}
    loadingMore={offers.isFetchingNextPage} onLoadMore={() => void offers.fetchNextPage()}
    onShop={() => router.push('/categories')} onDiscover={() => router.push('/promotions')} />;
}
