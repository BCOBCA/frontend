import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../stores/auth';
import { request } from './api';
import { loadNotifications } from './notifications';
import type { Notification, Page } from '../types/api';

export function useUnreadNotifications() {
  const userId = useAuth(state => state.user?.id);
  const { data } = useQuery({
    queryKey: ['notifications', userId, 'inbox'],
    queryFn: () => loadNotifications(page => request<Page<Notification>>('GET', `/notifications?page=${page}&pageSize=100`)),
    enabled: !!userId,
    select: items => items.some(item => !item.readAt),
  });
  return !!userId && !!data;
}
