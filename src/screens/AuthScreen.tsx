import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { useState } from 'react';
import { Button, Field, Page, Status } from '../components/common/ui';
import { useAuth } from '../stores/auth';
import { styles as s } from '../theme';

export default function AuthScreen({ register = false }: { register?: boolean }) {
  const [error, setError] = useState<unknown>(null);
  const schema = z.object({ identifier: z.string().min(3, 'Nhập email hoặc số điện thoại'), password: z.string().min(1, 'Nhập mật khẩu').max(128), fullName: z.string(), phone: z.string(), referralCode: z.string() }).superRefine((value, ctx) => {
    if (!register) return;
    if (!z.email().safeParse(value.identifier).success) ctx.addIssue({ code: 'custom', path: ['identifier'], message: 'Email không hợp lệ' });
    if (value.fullName.trim().length < 2 || value.fullName.length > 150) ctx.addIssue({ code: 'custom', path: ['fullName'], message: 'Họ tên từ 2 đến 150 ký tự' });
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{12,128}$/.test(value.password)) ctx.addIssue({ code: 'custom', path: ['password'], message: 'Tối thiểu 12 ký tự, có chữ hoa, chữ thường và số' });
    if (value.phone && !/^\+?[0-9]{9,15}$/.test(value.phone)) ctx.addIssue({ code: 'custom', path: ['phone'], message: 'Số điện thoại không hợp lệ' });
  });
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { identifier: '', password: '', fullName: '', phone: '', referralCode: '' } });
  const submit = handleSubmit(async values => {
    setError(null);
    try {
      await useAuth.getState().login(register ? { email: values.identifier, password: values.password, fullName: values.fullName, phone: values.phone, referralCode: values.referralCode || null } : { identifier: values.identifier, password: values.password, deviceName: 'BCOBCA App' }, register);
      router.replace('/member');
    } catch (err) { setError(err); }
  });
  const fields = register ? ['fullName', 'identifier', 'phone', 'password', 'referralCode'] as const : ['identifier', 'password'] as const;
  const labels = { fullName: 'Họ và tên', identifier: register ? 'Email' : 'Email hoặc số điện thoại', phone: 'Số điện thoại (không bắt buộc)', password: 'Mật khẩu', referralCode: 'Mã giới thiệu (không bắt buộc)' };
  return <Page title={register ? 'Đăng ký' : 'Đăng nhập'} back><View style={[s.padded, { maxWidth: 480, width: '100%', alignSelf: 'center', paddingTop: 32 }]}>
    <Text style={s.title}>{register ? 'Tạo tài khoản BCOBCA' : 'Chào mừng bạn trở lại'}</Text>
    {fields.map(name => <Controller key={name} control={control} name={name} render={({ field }) => <Field label={labels[name]} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={errors[name]?.message} secureTextEntry={name === 'password'} autoCapitalize={name === 'fullName' ? 'words' : 'none'} autoComplete={name === 'password' ? register ? 'new-password' : 'current-password' : name === 'identifier' ? 'email' : 'off'} />} />)}
    <Status error={error} /><Button title={isSubmitting ? 'Đang xử lý...' : register ? 'Đăng ký' : 'Đăng nhập'} disabled={isSubmitting} onPress={() => void submit()} />
    <Button title={register ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'} outline onPress={() => router.replace(register ? '/login' : '/register')} />
    {!register && <Button title="Quên mật khẩu" outline onPress={() => router.push('/forgot-password')} />}
  </View></Page>;
}
