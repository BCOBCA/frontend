import { useCallback, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { router, useIsFocused } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { Headset, Mail, PencilLine, Send, ShieldCheck } from 'lucide-react-native';
import { LoginNotice, Page, Status } from '../src/components/common/ui';
import { TopToast } from '../src/components/common/TopToast';
import { ProfileIdentity } from '../src/components/profile/ProfileIdentity';
import { ProfileInformation } from '../src/components/profile/ProfileInformation';
import { ProfileEditor } from '../src/components/profile/ProfileEditor';
import { ProfileLoadingOverlay } from '../src/components/profile/ProfileLoadingOverlay';
import { VerificationButton } from '../src/components/profile/VerificationButton';
import { pickProfileImage } from '../src/components/profile/profile-media';
import { request } from '../src/services/api';
import { queryClient, useAuth } from '../src/stores/auth';
import type { Profile } from '../src/types/api';
import { colors } from '../src/theme';

export default function ProfileScreen() {
  const focused = useIsFocused();
  const user = useAuth(state => state.user);
  const ready = useAuth(state => state.ready);
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [tab, setTab] = useState<'info' | 'verification'>('info');
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState('');
  const dismissNotice = useCallback(() => setNotice(''), []);
  const [copyError, setCopyError] = useState<unknown>(null);
  const query = useQuery({ queryKey: ['profile', user?.accountId], queryFn: () => request<Profile>('GET', '/auth/me'), enabled: !!user && focused });
  const profile = query.data ?? user;
  const verification = useMutation({ mutationFn: () => request('POST', '/auth/verification-email'), onSuccess: () => setNotice('Yêu cầu xác minh đã được xử lý. Vui lòng kiểm tra email.') });
  const media = useMutation({ mutationFn: async (kind: 'avatar' | 'cover') => {
    if (!profile) throw new Error('Vui lòng đăng nhập.');
    const url = await pickProfileImage(kind);
    if (!url) return null;
    return request<Profile>('PUT', '/auth/me', { fullName: profile.fullName, nickname: profile.nickname, phone: profile.phone, avatarUrl: kind === 'avatar' ? url : profile.avatarUrl, ...(kind === 'cover' ? { coverUrl: url } : {}) });
  }, onSuccess: updated => { if (updated) { useAuth.getState().update(updated); queryClient.setQueryData(['profile', updated.accountId], updated); setNotice('Đã cập nhật ảnh cá nhân.'); } } });
  const copy = async () => {
    setCopyError(null);
    try { if (!await Clipboard.setStringAsync(profile?.referralCode ?? '')) throw new Error('Không thể sao chép mã.'); setNotice('Đã sao chép mã giới thiệu.'); }
    catch (error) { setCopyError(error); }
  };
  return <Page title="Thông tin cá nhân" back footerTab="member" bodyStyle={{ padding: width < 600 ? 12 : 24 }} overlay={notice ? <TopToast message={notice} onDismiss={dismissNotice} /> : undefined}>
    <ProfileLoadingOverlay visible={!user ? !ready : query.isLoading || media.isPending} label={media.isPending ? 'Đang cập nhật ảnh...' : undefined} />
    {!user ? ready ? <LoginNotice /> : null : profile && <View style={{ flexDirection: desktop ? 'row' : 'column', alignItems: desktop ? 'flex-start' : 'stretch', gap: 22 }}>
      <View style={{ width: desktop ? 264 : undefined }}><ProfileIdentity user={profile} compact={!desktop} tab={tab} onTab={value => { setTab(value); setEditing(false); }} onImage={kind => media.mutate(kind)} imageBusy={media.isPending || editing || !query.data} /></View>
      <View style={{ flex: desktop ? 1 : undefined, minWidth: 0, gap: 12 }}>
        <Status error={query.error || media.error || copyError} retry={() => void query.refetch()} />
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: width < 600 ? 16 : 22, boxShadow: '0 5px 22px #20283C08' }}>
          {tab === 'info' ? editing ? <ProfileEditor key={profile.id} user={profile} onCancel={() => setEditing(false)} onSaved={() => { setEditing(false); setNotice('Đã lưu thông tin cá nhân.'); }} /> : <ProfileInformation user={profile} editDisabled={!query.data || media.isPending} wide={width >= 650} onCopy={() => void copy()} onEdit={() => setEditing(true)} /> : <View style={{ gap: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><ShieldCheck size={24} color={colors.primary} /><Text accessibilityRole="header" style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Xác minh tài khoản</Text></View>
            <Text style={{ fontSize: 14, lineHeight: 22, color: colors.text }}>Số điện thoại: {profile.phone || 'Chưa cập nhật'}</Text>
            <Text style={{ fontSize: 13, color: profile.phoneVerified ? '#16852B' : colors.muted }}>{profile.phoneVerified ? 'Số điện thoại đã được xác minh' : 'Số điện thoại chưa được xác minh'}</Text>
            <View style={{ flexDirection: width >= 650 ? 'row' : 'column', flexWrap: 'wrap', gap: 12 }}>
              <VerificationButton title="Chỉnh sửa số điện thoại" Icon={PencilLine} onPress={() => { setTab('info'); setEditing(true); }} />
              {!profile.phoneVerified && <VerificationButton title="Hỗ trợ xác minh số điện thoại" Icon={Headset} variant="soft" onPress={() => router.push('/feedback')} />}
            </View>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Mail size={19} color={colors.muted} /><Text style={{ fontSize: 14, color: colors.text }}>{profile.email || 'Chưa có email'}</Text></View>
            <Text style={{ fontSize: 13, color: profile.emailVerified ? '#16852B' : colors.muted }}>{profile.emailVerified ? 'Email đã được xác minh' : 'Email chưa được xác minh'}</Text>
            {!profile.emailVerified && <View style={{ alignItems: width >= 650 ? 'flex-start' : 'stretch' }}><VerificationButton title={verification.isPending ? 'Đang gửi...' : 'Gửi email xác minh'} Icon={Send} variant="primary" disabled={verification.isPending || !profile.email} onPress={() => verification.mutate()} /></View>}
            <Status error={verification.error} />
          </View>}
        </View>
      </View>
    </View>}
  </Page>;
}
