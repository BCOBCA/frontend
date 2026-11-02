import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, View } from 'react-native';
import { Button, Field, LoginNotice, Page, Status } from '../src/components/common/ui';
import { request } from '../src/services/api';
import { useAuth } from '../src/stores/auth';
import { styles as s } from '../src/theme';
import { router } from 'expo-router';
const schema = z.object({ subject: z.string().min(3).max(200), content: z.string().min(5).max(10000) });
export default function Feedback() {
  const user = useAuth(state => state.user); const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { subject: '', content: '' } });
  const send = useMutation({ mutationFn: (values: z.infer<typeof schema>) => request('POST', '/feedbacks', { ...values, type: 'FEEDBACK' }), onSuccess: () => form.reset() });
  return <Page title="Phản hồi và hỗ trợ" back>{!user ? <LoginNotice /> : <View style={s.padded}>{(['subject', 'content'] as const).map(name => <Controller key={name} control={form.control} name={name} render={({ field }) => <Field label={name === 'subject' ? 'Tiêu đề' : 'Nội dung phản hồi'} value={field.value} editable={!send.isPending} onChangeText={field.onChange} onBlur={field.onBlur} multiline={name === 'content'} error={form.formState.errors[name]?.message} />} />)}<Status error={send.error} />{send.isSuccess && <Text style={s.body}>Đã gửi phản hồi. Cảm ơn bạn!</Text>}<Button title="Gửi phản hồi" disabled={send.isPending} onPress={() => void form.handleSubmit(values => send.mutate(values))()} /><Button title="Phản hồi đã gửi" outline onPress={() => router.push('/feedback-history')} /></View>}</Page>;
}
