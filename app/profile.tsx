import { Text, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Button, Field, LoginNotice, Page, Status } from '../src/components/common/ui';
import { request } from '../src/services/api';
import { useAuth } from '../src/stores/auth';
import type { Profile } from '../src/types/api';
import { styles as s } from '../src/theme';
const schema = z.object({ fullName: z.string().min(2).max(150), nickname: z.string().max(100), phone: z.union([z.string().regex(/^\+?[0-9]{9,15}$/), z.literal('')]) });
export default function ProfileScreen() {
  const user = useAuth(state => state.user);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), values: { fullName: user?.fullName ?? '', nickname: user?.nickname ?? '', phone: user?.phone ?? '' } });
  const save = useMutation({ mutationFn: (values: z.infer<typeof schema>) => request<Profile>('PUT', '/auth/me', { ...values, avatarUrl: user?.avatarUrl ?? '' }), onSuccess: value => useAuth.getState().update(value) });
  const verification = useMutation({ mutationFn: () => request('POST', '/auth/verification-email') });
  return <Page title="Thông tin cá nhân" back>{!user ? <LoginNotice /> : <View style={s.padded}><Text style={s.body}>{user.email}</Text>{(['fullName', 'nickname', 'phone'] as const).map(name => <Controller key={name} name={name} control={form.control} render={({ field }) => <Field label={name === 'fullName' ? 'Họ tên' : name === 'nickname' ? 'Tên hiển thị công khai' : 'Số điện thoại'} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={form.formState.errors[name]?.message} />} />)}<Status error={save.error || verification.error} />{save.isSuccess && <Text style={s.body}>Đã lưu hồ sơ</Text>}{verification.isSuccess && <Text style={s.body}>Yêu cầu xác minh đã được xử lý. Kiểm tra email nếu địa chỉ chưa được xác minh.</Text>}<Button title="Lưu thông tin" disabled={save.isPending} onPress={() => void form.handleSubmit(values => save.mutate(values))()} /><Button title="Gửi email xác minh" disabled={verification.isPending} outline onPress={() => verification.mutate()} /><Button title="Đổi mật khẩu" outline onPress={() => router.push('/change-password')} /><Button title="Thiết bị đăng nhập" outline onPress={() => router.push('/sessions')} /><Button title="Thông báo" outline onPress={() => router.push('/notifications')} /></View>}</Page>;
}
