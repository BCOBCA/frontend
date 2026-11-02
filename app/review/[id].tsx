import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react-native';
import { Button, Field, LoginNotice, Page, Status } from '../../src/components/common/ui';
import { queryClient, useAuth } from '../../src/stores/auth';
import { request } from '../../src/services/api';
import type { Review } from '../../src/components/product/ProductReviews';
import { colors, styles as s } from '../../src/theme';
const schema = z.object({ rating: z.number().int().min(1).max(5), content: z.string().min(1, 'Nhập nội dung đánh giá').max(5000) });
export default function ReviewEditor() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>(); const user = useAuth(state => state.user);
  const query = useQuery({ queryKey: ['my-review', id], queryFn: () => request<Review | null>('GET', `/order-items/${id}/review`), enabled: !!user });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { rating: 5, content: '' } });
  useEffect(() => { if (query.data) form.reset({ rating: query.data.rating, content: query.data.content }); }, [query.data, form]);
  const save = useMutation({ mutationFn: (values: z.infer<typeof schema>) => request('PUT', `/order-items/${id}/review`, { ...values, imageUrls: query.data?.imageUrls ?? [] }), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['my-review', id] }); void queryClient.invalidateQueries({ queryKey: ['reviews'] }); } });
  return <Page title="Đánh giá sau mua" back>{!user ? <LoginNotice /> : <View style={s.padded}>{name && <Text style={s.title}>{name}</Text>}<Status loading={query.isLoading} error={query.error || save.error} retry={() => void query.refetch()} /><Controller name="rating" control={form.control} render={({ field }) => <View style={s.row}>{[1, 2, 3, 4, 5].map(rating => <Pressable key={rating} accessibilityRole="radio" accessibilityLabel={`${rating} sao`} accessibilityState={{ selected: field.value === rating }} onPress={() => field.onChange(rating)} style={{ padding: 8 }}><Star size={26} color={colors.primary} fill={rating <= field.value ? colors.gold : 'transparent'} /></Pressable>)}</View>} /><Controller name="content" control={form.control} render={({ field }) => <Field label="Trải nghiệm của bạn" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} multiline error={form.formState.errors.content?.message} />} />{save.isSuccess && <Text style={s.body}>Đánh giá đã được gửi và chờ kiểm duyệt.</Text>}<Button title="Gửi đánh giá" disabled={save.isPending || query.isLoading || !!query.error} onPress={() => void form.handleSubmit(values => save.mutate(values))()} /></View>}</Page>;
}
