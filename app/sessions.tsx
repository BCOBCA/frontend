import { View } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LoginNotice, Page, Status } from '../src/components/common/ui';
import { SessionsTable, type LoginSession } from '../src/components/profile/SessionsTable';
import { request } from '../src/services/api';
import { useAuth } from '../src/stores/auth';
import { styles as s } from '../src/theme';
export default function Sessions() {
  const user = useAuth(state => state.user);
  const query = useQuery({ queryKey: ['sessions', user?.accountId], queryFn: () => request<LoginSession[]>('GET', '/auth/sessions'), enabled: !!user });
  const revoke = useMutation({ mutationFn: (id: string) => request('DELETE', `/auth/sessions/${encodeURIComponent(id)}`), onSuccess: async () => { await query.refetch(); } });
  return <Page title="Thiết bị đăng nhập" back footerTab="member">{!user ? <LoginNotice /> : <View style={s.padded}><Status loading={query.isLoading} error={query.error || revoke.error} retry={() => { revoke.reset(); void query.refetch(); }} />{query.data && <SessionsTable sessions={query.data} disabled={revoke.isPending || query.isFetching || !!query.error} busyId={revoke.isPending ? revoke.variables : undefined} onRevoke={id => revoke.mutate(id)} />}</View>}</Page>;
}
