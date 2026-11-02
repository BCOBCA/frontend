import { Text } from 'react-native';
import { DataList } from '../src/components/common/DataList';
import { Button } from '../src/components/common/ui';
import type { Notification } from '../src/types/api';
import { dateTime, styles as s } from '../src/theme';
import { request } from '../src/services/api';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../src/stores/auth';
export default function Notifications() {
  const read = useMutation({ mutationFn: (id: string) => request('PUT', `/notifications/${id}/read`), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['notifications'] }) });
  return <DataList<Notification> title="Thông báo" path="/notifications" name="notifications" render={item => <><Text style={s.title}>{item.title}</Text><Text style={s.body}>{item.body}</Text><Text style={s.small}>{dateTime(item.createdAt)}</Text><Button title={item.readAt ? 'Đã đọc' : 'Đánh dấu đã đọc'} disabled={!!item.readAt || read.isPending} outline onPress={() => read.mutate(item.id)} /></>} />;
}
