import { useRef } from 'react';
import { Text, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Button, Field, LoginNotice, Page, Status } from '../src/components/common/ui';
import { request } from '../src/services/api';
import { queryClient, useAuth } from '../src/stores/auth';
import type { Affiliate } from '../src/types/api';
import { money, styles as s } from '../src/theme';
const schema = z.object({ amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Số tiền không hợp lệ').refine(value => Number(value) > 0 && Number.isSafeInteger(Number(value) * 100), 'Số tiền không hợp lệ'), bankName: z.string().min(2).max(150), accountNumber: z.string().regex(/^[0-9]{6,34}$/, 'Số tài khoản không hợp lệ'), accountHolder: z.string().min(2).max(150) });
export default function Withdrawal() {
  const user = useAuth(state => state.user); const key = useRef('');
  const wallet = useQuery({ queryKey: ['affiliate'], queryFn: () => request<Affiliate>('GET', '/affiliate'), enabled: !!user });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { amount: '', bankName: '', accountNumber: '', accountHolder: '' } });
  const send = useMutation({ mutationFn: (values: z.infer<typeof schema>) => { key.current ||= `withdraw-${Date.now()}-${Math.random().toString(36).slice(2)}`; return request('POST', '/affiliate/withdrawals', { ...values, amount: Number(values.amount) }, { 'Idempotency-Key': key.current }); }, onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['affiliate'] }); void queryClient.invalidateQueries({ queryKey: ['withdrawals'] }); void queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] }); form.reset(); } });
  const labels = { amount: 'Số tiền rút (VNĐ)', bankName: 'Tên ngân hàng', accountNumber: 'Số tài khoản', accountHolder: 'Tên chủ tài khoản' };
  return <Page title="Yêu cầu rút tiền" back>{!user ? <LoginNotice /> : <View style={[s.padded, { maxWidth: 540, width: '100%', alignSelf: 'center' }]}><Status loading={wallet.isLoading} error={wallet.error || send.error} retry={() => void wallet.refetch()} /><Text style={s.body}>Số dư khả dụng: {money(wallet.data?.availableBalance ?? 0)}</Text><Text style={s.small}>Số tiền được giữ lại khi tạo yêu cầu. Chỉ xác nhận đã chi sau khi quản trị viên ghi nhận giao dịch chuyển tiền.</Text>
    {!!wallet.data?.debtBalance && <Text style={s.error}>Cần cấn trừ {money(wallet.data.debtBalance)} trước khi rút tiền.</Text>}
    {(Object.keys(labels) as (keyof typeof labels)[]).map(name => <Controller key={name} control={form.control} name={name} render={({ field }) => <Field label={labels[name]} value={field.value} editable={!send.isPending && !send.isSuccess} onChangeText={value => { field.onChange(value); key.current = `withdraw-${Date.now()}-${Math.random().toString(36).slice(2)}`; }} onBlur={field.onBlur} keyboardType={name === 'amount' || name === 'accountNumber' ? 'decimal-pad' : 'default'} error={form.formState.errors[name]?.message} />} />)}
    {send.isSuccess ? <><Text style={s.body}>Đã tạo yêu cầu rút tiền.</Text><Button title="Xem lịch sử rút tiền" onPress={() => router.replace('/withdrawals')} /></> : <Button title={send.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'} disabled={send.isPending || !wallet.data?.availableBalance || !!wallet.error} onPress={() => void form.handleSubmit(values => send.mutate(values))()} />}
  </View>}</Page>;
}
