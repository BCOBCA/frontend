import { Text, View } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button, Empty, LoginNotice, Page, Status } from '../src/components/common/ui';
import { request } from '../src/services/api';
import { useAuth } from '../src/stores/auth';
import { dateTime, styles as s } from '../src/theme';
type Session = { id: string; deviceName: string; createdAt: string; expiresAt: string };
export default function Sessions() {
  const user = useAuth(state => state.user);
  const query = useQuery({ queryKey: ['sessions'], queryFn: () => request<Session[]>('GET', '/auth/sessions'), enabled: !!user });
  const revoke = useMutation({ mutationFn: (id: string) => request('DELETE', `/auth/sessions/${id}`), onSuccess: () => void query.refetch() });
  return <Page title="Thiết bị đăng nhập" back>{!user ? <LoginNotice /> : <View style={s.padded}><Status loading={query.isLoading} error={query.error || revoke.error} retry={() => void query.refetch()} />{query.data?.length === 0 && <Empty text="Không có phiên đang hoạt động" />}{query.data?.map(session => <View key={session.id} style={s.card}><Text style={s.title}>{session.deviceName}</Text><Text style={s.small}>{dateTime(session.createdAt)}</Text><Button title="Thu hồi phiên" outline disabled={revoke.isPending} onPress={() => revoke.mutate(session.id)} /></View>)}</View>}</Page>;
}
