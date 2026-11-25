import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { View, useWindowDimensions } from 'react-native';
import { LoginNotice, Page, Status } from '../../src/components/common/ui';
import { ReviewForm } from '../../src/components/orders/ReviewForm';
import { ReviewDetailView } from '../../src/components/orders/ReviewDetailView';
import type { Review } from '../../src/components/product/ProductReviews';
import type { Product } from '../../src/types/api';
import { request } from '../../src/services/api';
import { useAuth } from '../../src/stores/auth';
import { colors } from '../../src/theme';

export default function ReviewDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const user = useAuth(state => state.user);
  const compact = useWindowDimensions().width < 600;
  const review = useQuery({ queryKey: ['my-review', id, user?.id], queryFn: () => request<Review | null>('GET', `/order-items/${encodeURIComponent(id)}/review`), enabled: !!user && !!id });
  const productId = review.data?.productId;
  const product = useQuery({ queryKey: ['product', productId, undefined], queryFn: () => request<Product>('GET', `/products/${encodeURIComponent(productId!)}`), enabled: !!user && !!productId, retry: false });
  return <Page title="Chi tiết đánh giá" back bodyStyle={{ maxWidth: 760 }}><View style={{ padding: compact ? 16 : 24, paddingTop: compact ? 20 : 32, paddingBottom: 32 }}>
    {!user ? <LoginNotice /> : <>
      <Status loading={review.isLoading} error={review.error} retry={() => void review.refetch()} />
      {review.data && <ReviewDetailView review={review.data} product={product.data} onProduct={() => router.push({ pathname: '/product/[id]', params: { id: review.data!.productId } })} onOrders={() => router.push('/orders')} />}
      {review.data === null && !review.error && <View style={{ padding: compact ? 16 : 24, borderRadius: 14, backgroundColor: colors.surface }}><ReviewForm key={`${user.id}/${id}`} itemId={id} name={name} /></View>}
    </>}
  </View></Page>;
}
