import { useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react-native';
import { Button, Field, LoginNotice, Status } from '../common/ui';
import { ReviewReply } from '../product/ReviewReply';
import type { Review } from '../product/ProductReviews';
import { queryClient, useAuth } from '../../stores/auth';
import { useToast } from '../../stores/toast';
import { request } from '../../services/api';
import { colors, styles } from '../../theme';

const schema = z.object({ rating: z.number().int().min(1, 'Vui lòng chọn số sao đánh giá').max(5), content: z.string().trim().min(1, 'Nhập nội dung đánh giá').max(5000, 'Nội dung tối đa 5.000 ký tự') });
type Values = z.infer<typeof schema>;

export function ReviewForm({ itemId, name, onBusyChange, onSaved }: { itemId: string; name?: string; onBusyChange?: (busy: boolean) => void; onSaved?: () => void }) {
  const user = useAuth(state => state.user);
  const pending = useRef(false);
  const [contentHeight, setContentHeight] = useState(112);
  const showToast = useToast(state => state.show);
  const query = useQuery({ queryKey: ['my-review', itemId, user?.id], queryFn: () => request<Review | null>('GET', `/order-items/${encodeURIComponent(itemId)}/review`), enabled: !!user && !!itemId });
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { rating: 0, content: '' } });
  const save = useMutation({
    mutationFn: (values: Values) => request('PUT', `/order-items/${encodeURIComponent(itemId)}/review`, { ...values, imageUrls: [] }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-review', itemId] }),
        ...['reviews', 'orders', 'order', 'dealer', 'dealers'].map(key => queryClient.invalidateQueries({ queryKey: [key] })),
      ]);
      if (onSaved) { showToast('Đánh giá của bạn đã được đăng.'); onSaved(); }
    },
    onError: () => { void queryClient.invalidateQueries({ queryKey: ['my-review', itemId] }); },
    onSettled: () => { pending.current = false; onBusyChange?.(false); },
  });
  const disabled = save.isPending || save.isSuccess || query.isLoading || !!query.error || !!query.data || !itemId;
  if (!user) return <LoginNotice />;
  if (query.data) return <View style={{ gap: 16 }}>
    {!!name && <Text style={{ fontSize: 14, lineHeight: 21, fontWeight: '600', color: colors.text }}>{name}</Text>}
    <View accessibilityLabel={`${query.data.rating}/5 sao`} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>{[1, 2, 3, 4, 5].map(rating => <Star key={rating} size={25} color={rating <= query.data!.rating ? '#E8A51B' : colors.muted} fill={rating <= query.data!.rating ? '#F6BD35' : 'transparent'} />)}<Text style={{ fontSize: 13, color: colors.muted }}>{query.data.rating}/5 sao</Text></View>
    <Text selectable style={{ fontSize: 14, lineHeight: 22, color: colors.text }}>{query.data.content}</Text>
    {!!query.data.imageUrls?.length && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{query.data.imageUrls.map((uri, index) => <Image key={`${uri}/${index}`} source={{ uri }} accessibilityLabel={`Ảnh đánh giá ${index + 1}`} contentFit="cover" style={{ width: 72, height: 72, borderRadius: 6 }} />)}</View>}
    <Text style={{ fontSize: 12, lineHeight: 19, color: colors.muted }}>Bạn đã đánh giá sản phẩm này. Mỗi sản phẩm trong đơn chỉ được đánh giá một lần.</Text>
    <ReviewReply reply={query.data.reply} />
  </View>;
  return <View style={{ gap: 16 }}>
    {!!name && <Text style={{ fontSize: 14, lineHeight: 21, fontWeight: '600', color: colors.text }}>{name}</Text>}
    <Status loading={query.isLoading} error={query.error || save.error} retry={() => { save.reset(); void query.refetch(); }} />
    <View style={{ gap: 6 }}><Text style={{ fontSize: 13, color: colors.muted }}>Chất lượng sản phẩm</Text><Controller name="rating" control={form.control} render={({ field }) => <View accessibilityRole="radiogroup" accessibilityLabel="Số sao đánh giá" style={{ flexDirection: 'row', gap: 4 }}>{[1, 2, 3, 4, 5].map(rating => <Pressable key={rating} accessibilityRole="radio" accessibilityLabel={`${rating} sao`} accessibilityState={{ checked: field.value === rating, disabled: save.isPending }} disabled={save.isPending} onPress={() => field.onChange(rating)} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Star size={28} color={rating <= field.value ? '#E8A51B' : colors.muted} fill={rating <= field.value ? '#F6BD35' : 'transparent'} /></Pressable>)}</View>} /></View>
    {!!form.formState.errors.rating && <Text accessibilityRole="alert" style={styles.error}>{form.formState.errors.rating.message}</Text>}
    <Controller name="content" control={form.control} render={({ field }) => <Field label="Trải nghiệm của bạn" placeholder="Chia sẻ về chất lượng, màu sắc và trải nghiệm sử dụng…" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} multiline scrollEnabled={false} onContentSizeChange={event => { if (Platform.OS !== 'web') setContentHeight(Math.max(112, Math.ceil(event.nativeEvent.contentSize.height))); }} onChange={event => { if (Platform.OS === 'web') { const input = event.target as unknown as HTMLTextAreaElement; input.style.height = '0px'; const height = Math.max(112, input.scrollHeight + 2); input.style.height = `${height}px`; setContentHeight(height); } }} style={[styles.input, { height: contentHeight, minHeight: 112, paddingVertical: 10, textAlignVertical: 'top' }]} maxLength={5000} editable={!save.isPending} error={form.formState.errors.content?.message} />} />
    <Text style={{ fontSize: 12, lineHeight: 19, color: colors.muted }}>Đánh giá được hiển thị công khai sau khi gửi.</Text>
    {save.isSuccess && !onSaved && <Text accessibilityLiveRegion="polite" style={{ color: colors.text, fontSize: 13 }}>Đánh giá của bạn đã được đăng.</Text>}
    <View style={{ alignItems: 'flex-end' }}><Button title={save.isPending ? 'Đang gửi…' : 'Gửi đánh giá'} disabled={disabled} onPress={() => { if (!disabled) void form.handleSubmit(values => { if (pending.current) return; pending.current = true; onBusyChange?.(true); save.mutate(values); })(); }} /></View>
  </View>;
}
