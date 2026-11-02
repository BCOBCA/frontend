import { useRef } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button, Field, LoginNotice, Page, Status } from '../../src/components/common/ui';
import { request } from '../../src/services/api';
import { queryClient, useAuth } from '../../src/stores/auth';
import { styles as s } from '../../src/theme';
const schema = z.object({ reason: z.string().min(5, 'Vui lòng mô tả lý do').max(2000) });
export default function RefundRequest() {
  const { id } = useLocalSearchParams<{ id: string }>(); const user = useAuth(state => state.user);
  const key = useRef('');
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { reason: '' } });
  const send = useMutation({ mutationFn: (values: z.infer<typeof schema>) => { key.current ||= `refund-${Date.now()}-${Math.random().toString(36).slice(2)}`; return request('POST', `/orders/${id}/refunds`, values, { 'Idempotency-Key': key.current }); }, onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['refunds'] }); } });
  return <Page title="Yêu cầu hoàn tiền" back>{!user ? <LoginNotice /> : <View style={s.padded}><Text style={s.body}>Gửi yêu cầu hoàn toàn bộ đơn đã thanh toán COD. Đơn vị vận hành sẽ kiểm tra yêu cầu và xác nhận khi đã hoàn tiền thực tế.</Text><Controller control={form.control} name="reason" render={({ field }) => <Field label="Lý do hoàn tiền" value={field.value} editable={!send.isPending && !send.isSuccess} multiline onBlur={field.onBlur} onChangeText={value => { field.onChange(value); key.current = `refund-${Date.now()}-${Math.random().toString(36).slice(2)}`; }} error={form.formState.errors.reason?.message} />} /><Status error={send.error} />{send.isSuccess ? <><Text style={s.body}>Đã gửi yêu cầu. Trạng thái chờ xử lý.</Text><Button title="Xem lịch sử hoàn tiền" onPress={() => router.replace('/refunds')} /></> : <Button title="Gửi yêu cầu" disabled={send.isPending} onPress={() => void form.handleSubmit(values => send.mutate(values))()} />}</View>}</Page>;
}
