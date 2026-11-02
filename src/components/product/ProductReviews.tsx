import { useState } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useQuery } from '@tanstack/react-query';
import { Button, Empty, Status } from '../common/ui';
import { request } from '../../services/api';
import type { Page } from '../../types/api';
import { dateTime, styles as s } from '../../theme';
export type Review = { id: string; productId: string; displayName: string; rating: number; content: string; status: number; createdAt: string; imageUrls: string[] };
export function ProductReviews({ productId }: { productId: string }) {
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['reviews', productId, page], queryFn: () => request<Page<Review>>('GET', `/products/${productId}/reviews?page=${page}`) });
  return <View style={{ gap: 16 }}><Text style={s.title}>Đánh giá sản phẩm ({query.data?.totalItems ?? 0})</Text><Status loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />{query.data?.items.length === 0 && <Empty text="Chưa có đánh giá được công bố" />}{query.data?.items.map(review => <View key={review.id} style={s.card}><Text style={s.body}>{review.displayName}</Text><Text accessibilityLabel={`${review.rating} trên 5 sao`} style={s.price}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</Text><Text style={s.body}>{review.content}</Text><View style={[s.row, { flexWrap: 'wrap' }]}>{review.imageUrls.map(url => <Image key={url} source={{ uri: url }} style={{ width: 72, height: 72 }} contentFit="cover" accessibilityLabel="Ảnh đánh giá" />)}</View><Text style={s.small}>{dateTime(review.createdAt)}</Text></View>)}{query.data && query.data.totalPages > 1 && <View style={s.between}><Button title="Trước" outline disabled={page === 1} onPress={() => setPage(page - 1)} /><Text>{page}/{query.data.totalPages}</Text><Button title="Sau" outline disabled={page >= query.data.totalPages} onPress={() => setPage(page + 1)} /></View>}</View>;
}
