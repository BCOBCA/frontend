import { useState } from 'react';
import { router } from 'expo-router';
import { LoginNotice, Page as PageView } from '../src/components/common/ui';
import type { Notification, Page } from '../src/types/api';
import { request } from '../src/services/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, useAuth } from '../src/stores/auth';
import { PushNotificationSettings } from '../src/components/common/PushNotificationSettings';
import { NotificationsView } from '../src/components/notifications/NotificationsView';
import { loadNotifications, markAllNotificationsRead, notificationTarget, type NotificationCategory, type NotificationSort, type NotificationStatus } from '../src/services/notifications';

export default function Notifications() {
  const user = useAuth(state => state.user);
  return <PageView title="Thông báo" back footerTab="member" bodyStyle={{ maxWidth: 1320 }}>{user ? <Inbox key={user.id} accountId={user.id} /> : <LoginNotice />}</PageView>;
}

function Inbox({ accountId }: { accountId: string }) {
  const [category, setCategory] = useState<NotificationCategory>('all');
  const [status, setStatus] = useState<NotificationStatus>('all');
  const [sort, setSort] = useState<NotificationSort>('newest');
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['notifications', accountId, 'inbox'], queryFn: () => loadNotifications(page => request<Page<Notification>>('GET', `/notifications?page=${page}&pageSize=100`)) });
  const mark = (id: string) => request('PUT', `/notifications/${encodeURIComponent(id)}/read`);
  const read = useMutation({
    mutationFn: async (item: Notification | null) => {
      if (item) { if (!item.readAt) await mark(item.id); }
      else await markAllNotificationsRead(query.data ?? [], mark);
      return item;
    },
    onSuccess: item => { if (item) { const target = notificationTarget(item); if (target) router.push(target); } },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications', accountId] }),
  });
  return <NotificationsView items={query.data} category={category} status={status} sort={sort} page={page}
    loading={query.isLoading} refreshing={query.isFetching} busy={read.isPending} error={query.error} actionError={read.error}
    onCategory={value => { setCategory(value); setPage(1); }} onStatus={value => { setStatus(value); setPage(1); }} onSort={value => { setSort(value); setPage(1); }} onPage={setPage}
    onOpen={item => { if (!read.isPending) read.mutate(item); }} onReadAll={() => { if (!read.isPending) read.mutate(null); }} onRetry={() => { read.reset(); void query.refetch(); }}>
    <PushNotificationSettings />
  </NotificationsView>;
}
