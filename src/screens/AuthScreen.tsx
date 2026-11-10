import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { ArrowRight, Gift, LockKeyhole, Mail, Star, UserRound, UserRoundPlus } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../components/common/ui';
import { AuthBackground } from '../components/auth/AuthBackground';
import { AuthField } from '../components/auth/AuthField';
import { createAuthSchema, registrationRequest, type AuthFormValues } from '../components/auth/auth-form';
import { useAuth } from '../stores/auth';
import { colors } from '../theme';
import { errorMessage } from '../services/api';

export default function AuthScreen({ register = false }: { register?: boolean }) {
  const [error, setError] = useState<unknown>(null);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { ref: referral, productId, service, aff, registered } = useLocalSearchParams<{ ref?: string; productId?: string; service?: string; aff?: string; registered?: string }>();
  const schema = createAuthSchema(register);
  const { control, handleSubmit, setFocus, setValue, reset, formState: { errors, isSubmitting } } = useForm<AuthFormValues>({ resolver: zodResolver(schema), defaultValues: { identifier: '', password: '', fullName: '', confirmPassword: '', referralCode: typeof referral === 'string' ? referral.trim().toUpperCase() : '' } });
  useEffect(() => { if (register && typeof referral === 'string') setValue('referralCode', referral.trim().toUpperCase()); }, [referral, register, setValue]);
  const submit = handleSubmit(async values => {
    setError(null);
    try {
      if (register) {
        await useAuth.getState().register(registrationRequest(values));
        reset();
        router.replace({ pathname: '/login', params: { registered: '1', ...(typeof referral === 'string' ? { ref: referral } : {}), ...(typeof productId === 'string' ? { productId } : {}), ...(service === '1' ? { service } : {}), ...(typeof aff === 'string' ? { aff } : {}) } });
        return;
      }
      await useAuth.getState().login({ identifier: values.identifier, password: values.password, deviceName: 'BCOBCA App' });
      if (typeof productId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)) router.replace({ pathname: '/product/[id]', params: { id: productId, ...(service === '1' ? { service } : {}), ...(typeof aff === 'string' ? { aff } : {}), ...(typeof referral === 'string' ? { ref: referral } : {}) } });
      else router.replace('/member');
    } catch (err) { setError(err); }
  });
  const fields: (keyof AuthFormValues)[] = register ? ['fullName', 'identifier', 'password', 'confirmPassword', 'referralCode'] : ['identifier', 'password'];
  const labels = { fullName: 'Họ và tên', identifier: 'Email hoặc số điện thoại', password: 'Mật khẩu', confirmPassword: 'Xác nhận lại mật khẩu', referralCode: 'Mã giới thiệu (không bắt buộc)' };
  const icons = { fullName: UserRound, identifier: Mail, password: LockKeyhole, confirmPassword: LockKeyhole, referralCode: Gift };
  return <SafeAreaView style={styles.page} edges={['top', 'left', 'right']}>
    <Header title="Báo chí Online BCA" />
    <KeyboardAvoidingView style={styles.body} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} enabled={Platform.OS !== 'web'}>
      <AuthBackground />
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}>
        <View style={[styles.card, { paddingHorizontal: width < 480 ? 20 : 28 }]}>
          <View style={styles.brand}>
            <View style={styles.logoFrame}><Image source={require('../../assets/logo-baochi.png')} accessibilityLabel="Logo Báo chí Online BCA" resizeMode="contain" style={styles.logo} /></View>
            <Text style={styles.brandName}>Báo chí Online BCA</Text>
            <Text style={styles.tagline}>{register ? 'Tạo tài khoản để khám phá những tiện ích dành cho bạn.' : 'Kết nối thông tin, đồng hành cùng bạn mỗi ngày.'}</Text>
          </View>
          <View accessible={false} style={styles.divider}><View style={styles.dividerLine} /><Star size={13} color="#B62126" fill="#B62126" /><View style={styles.dividerLine} /></View>
          <View style={styles.heading}>
            <Text accessibilityRole="header" style={styles.title}>{register ? 'Tạo tài khoản' : 'Chào mừng bạn trở lại'}</Text>
            {!register && <Text style={styles.subtitle}>Đăng nhập để tiếp tục sử dụng Báo chí Online BCA</Text>}
          </View>
          {!register && registered === '1' && <Text accessibilityRole="alert" style={styles.success}>Đăng ký thành công. Vui lòng đăng nhập để tiếp tục.</Text>}
          <View style={styles.fields}>
            {fields.map((name, index) => <Controller key={name} control={control} name={name} render={({ field }) => <AuthField
              label={labels[name]} Icon={icons[name]} inputRef={field.ref} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur}
              error={errors[name]?.message} editable={!isSubmitting} secureTextEntry={name === 'password' || name === 'confirmPassword'}
              autoCapitalize={name === 'fullName' ? 'words' : name === 'referralCode' ? 'characters' : 'none'} autoCorrect={false}
              keyboardType={name === 'identifier' ? 'email-address' : 'default'}
              autoComplete={name === 'password' || name === 'confirmPassword' ? register ? 'new-password' : 'current-password' : name === 'identifier' ? 'username' : name === 'fullName' ? 'name' : 'off'}
              returnKeyType={index === fields.length - 1 ? 'done' : 'next'}
              onSubmitEditing={() => { const next = fields[index + 1]; if (next) setFocus(next); else if (!isSubmitting) void submit(); }}
            />} />)}
          </View>
          {!register && <Link href="/forgot-password" asChild><Pressable accessibilityRole="link" style={styles.forgot}><Text style={styles.link}>Quên mật khẩu?</Text></Pressable></Link>}
          {register && <Text style={styles.passwordHint}>Mật khẩu từ 12 ký tự, gồm chữ hoa, chữ thường và số.</Text>}
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{errorMessage(error)}</Text>}
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }} disabled={isSubmitting} onPress={() => void submit()}
            style={({ pressed }) => [styles.submit, { opacity: isSubmitting ? 0.65 : pressed ? 0.85 : 1 }]}>
            {isSubmitting ? <ActivityIndicator size="small" color={colors.surface} /> : register ? <UserRoundPlus size={19} color={colors.surface} /> : null}
            <Text style={styles.submitLabel}>{isSubmitting ? 'Đang xử lý...' : register ? 'Đăng ký' : 'Đăng nhập'}</Text>
            {!register && !isSubmitting && <ArrowRight size={19} color={colors.surface} />}
          </Pressable>
          <View style={styles.footer}>
            <Text style={styles.footerText}>{register ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}</Text>
            <Link href={{ pathname: register ? '/login' : '/register', params: { ...(typeof referral === 'string' ? { ref: referral } : {}), ...(typeof productId === 'string' ? { productId } : {}), ...(service === '1' ? { service } : {}), ...(typeof aff === 'string' ? { aff } : {}) } }} replace asChild><Pressable accessibilityRole="link" style={styles.footerLink}><Text style={[styles.link, styles.strong]}>{register ? 'Đăng nhập' : 'Đăng ký ngay'}</Text></Pressable></Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.primary },
  body: { flex: 1, backgroundColor: '#FFF3F3' },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingTop: 24 },
  card: { width: '100%', maxWidth: 420, paddingVertical: 20, borderRadius: 20, borderWidth: 1, borderColor: '#FFFFFF', backgroundColor: '#FFFFFFF5', boxShadow: '0 16px 56px rgba(162, 54, 64, 0.10)' },
  brand: { alignItems: 'center', gap: 6 },
  logoFrame: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', marginBottom: 2 },
  logo: { width: '100%', height: '100%', transform: [{ scale: 1.12 }, { translateY: 0.7 }] },
  brandName: { color: '#B62126', fontSize: 20, lineHeight: 26, fontWeight: '800', textAlign: 'center' },
  tagline: { color: '#66616B', fontSize: 13, lineHeight: 19, textAlign: 'center', maxWidth: 330 },
  divider: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginVertical: 12 },
  dividerLine: { width: 64, height: 1, backgroundColor: '#E8A6A8' },
  heading: { gap: 4, marginBottom: 12 },
  title: { fontSize: 18, lineHeight: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, lineHeight: 19, color: '#66616B' },
  fields: { gap: 8 },
  forgot: { minHeight: 44, alignSelf: 'flex-end', justifyContent: 'center' },
  link: { color: '#B62126', fontSize: 13, lineHeight: 18 },
  strong: { fontWeight: '700' },
  passwordHint: { color: '#66616B', fontSize: 12, lineHeight: 18, marginTop: 10, marginBottom: 16 },
  error: { color: '#B62126', fontSize: 13, lineHeight: 19, marginBottom: 12 },
  success: { color: '#176B40', backgroundColor: '#EDF8F1', borderColor: '#C7E7D2', borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 13, lineHeight: 19, marginBottom: 12 },
  submit: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#CF272C' },
  submitLabel: { color: colors.surface, fontSize: 14, fontWeight: '700' },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', columnGap: 4, marginTop: 10 },
  footerText: { color: '#66616B', fontSize: 13, lineHeight: 18 },
  footerLink: { minHeight: 44, justifyContent: 'center' },
});
