import { Pressable, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { UserRound } from 'lucide-react-native';
import type { Profile } from '../../types/api';
import { request } from '../../services/api';
import { queryClient, useAuth } from '../../stores/auth';
import { colors } from '../../theme';
import { Button, Field, Status } from '../common/ui';
import { profileSchema, profileValues, type ProfileValues } from './profile-data';
import { ProfileLoadingOverlay } from './ProfileLoadingOverlay';
import { BirthdayField } from './BirthdayField';

export function ProfileEditor({ user, onSaved, onCancel }: { user: Profile; onSaved: () => void; onCancel: () => void }) {
  const form = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: profileValues(user) });
  const save = useMutation({ mutationFn: (values: ProfileValues) => request<Profile>('PUT', '/auth/me', { ...values, avatarUrl: user.avatarUrl }), onSuccess: profile => {
    useAuth.getState().update(profile); queryClient.setQueryData(['profile', user.accountId], profile); onSaved();
  } });
  const labels = { fullName: 'Họ và tên', nickname: 'Tên hiển thị', phone: 'Số điện thoại' };
  return <View style={{ gap: 18 }}>
    <ProfileLoadingOverlay visible={save.isPending} label="Đang lưu thông tin..." />
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><UserRound size={24} color={colors.primary} /><Text accessibilityRole="header" style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Chỉnh sửa thông tin</Text></View>
    {(['fullName', 'nickname', 'phone'] as const).map(name => <Controller key={name} control={form.control} name={name} render={({ field }) => <Field label={labels[name]} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} editable={!save.isPending} autoCapitalize={name === 'fullName' || name === 'nickname' ? 'words' : 'none'} autoCorrect={false} keyboardType={name === 'phone' ? 'phone-pad' : 'default'} error={form.formState.errors[name]?.message} />} />)}
    <Controller name="dateOfBirth" control={form.control} render={({ field }) => <BirthdayField value={field.value} onChange={field.onChange} onBlur={field.onBlur} disabled={save.isPending} error={form.formState.errors.dateOfBirth?.message} />} />
    <View style={{ gap: 8 }}><Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>Giới tính</Text><Controller name="gender" control={form.control} render={({ field }) => <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{[{ value: 1, label: 'Nam' }, { value: 2, label: 'Nữ' }, { value: 0, label: 'Chưa cập nhật' }].map(option => <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: field.value === option.value, disabled: save.isPending }} disabled={save.isPending} onPress={() => field.onChange(option.value)} style={{ minHeight: 40, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: field.value === option.value ? colors.primary : colors.border, backgroundColor: field.value === option.value ? '#FFF1F2' : colors.surface }}><Text style={{ color: field.value === option.value ? colors.primary : colors.text, fontSize: 13 }}>{option.label}</Text></Pressable>)}</View>} /></View>
    <Status error={save.error} />
    <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}><Button title="Hủy" outline disabled={save.isPending} onPress={onCancel} /><Button title={save.isPending ? 'Đang lưu...' : 'Lưu thay đổi'} disabled={save.isPending || !form.formState.isDirty} onPress={() => void form.handleSubmit(values => save.mutate(values))()} /></View>
  </View>;
}
