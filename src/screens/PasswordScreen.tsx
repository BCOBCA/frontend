import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Field, LoginNotice, Page, Status } from '../components/common/ui';
import { request } from '../services/api';
import { useAuth } from '../stores/auth';
import { styles as s } from '../theme';

export default function PasswordScreen({ mode }: { mode: 'forgot' | 'reset' | 'change' }) {
  const user = useAuth(state => state.user);
  const { token } = useLocalSearchParams<{ token?: string }>();
  const schema = z.object({ email: z.string(), currentPassword: z.string(), newPassword: z.string() }).superRefine((value, ctx) => {
    if (mode === 'forgot' && !z.email().safeParse(value.email).success) ctx.addIssue({ code: 'custom', path: ['email'], message: 'Email không hợp lệ' });
    if (mode !== 'forgot' && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{12,128}$/.test(value.newPassword)) ctx.addIssue({ code: 'custom', path: ['newPassword'], message: '12–128 ký tự, có chữ hoa, chữ thường và số' });
    if (mode === 'change' && !value.currentPassword) ctx.addIssue({ code: 'custom', path: ['currentPassword'], message: 'Nhập mật khẩu hiện tại' });
  });
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: '', currentPassword: '', newPassword: '' } });
  const mutation = useMutation({ mutationFn: async (values: z.infer<typeof schema>) => {
    await request('POST', `/auth/${mode === 'forgot' ? 'forgot-password' : mode === 'reset' ? 'reset-password' : 'change-password'}`, mode === 'forgot' ? { email: values.email } : mode === 'reset' ? { token: token ?? '', newPassword: values.newPassword } : { currentPassword: values.currentPassword, newPassword: values.newPassword });
    if (mode === 'change') await useAuth.getState().logout();
    form.reset();
  } });
  const fields = mode === 'forgot' ? ['email'] as const : mode === 'reset' ? ['newPassword'] as const : ['currentPassword', 'newPassword'] as const;
  const labels = { email: 'Email tài khoản', currentPassword: 'Mật khẩu hiện tại', newPassword: 'Mật khẩu mới' };
  return <Page title={mode === 'forgot' ? 'Quên mật khẩu' : mode === 'reset' ? 'Đặt lại mật khẩu' : 'Đổi mật khẩu'} back>{mode === 'change' && !user && !mutation.isSuccess ? <LoginNotice /> : <View style={[s.padded, { maxWidth: 480, width: '100%', alignSelf: 'center' }]}>
    {mode === 'reset' && !token ? <Text style={s.error}>Vui lòng mở liên kết khôi phục trong email.</Text> : <>{fields.map(name => <Controller key={name} name={name} control={form.control} render={({ field }) => <Field label={labels[name]} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} secureTextEntry={name !== 'email'} autoCapitalize="none" error={form.formState.errors[name]?.message} />} />)}<Status error={mutation.error} /><Button title={mutation.isPending ? 'Đang xử lý...' : mode === 'forgot' ? 'Gửi hướng dẫn' : 'Lưu mật khẩu'} disabled={mutation.isPending || mutation.isSuccess} onPress={() => void form.handleSubmit(value => mutation.mutate(value))()} /></>}
    {mutation.isSuccess && <Text style={s.body}>{mode === 'forgot' ? 'Nếu tài khoản tồn tại, hướng dẫn đã được gửi qua email.' : 'Đã cập nhật mật khẩu. Vui lòng đăng nhập lại.'}</Text>}
    {mutation.isSuccess && mode !== 'forgot' && <Button title="Đăng nhập" onPress={() => router.replace('/login')} />}
  </View>}</Page>;
}
