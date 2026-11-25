import { useEffect } from 'react';
import { queryClient } from '../stores/auth';
import { useToast } from '../stores/toast';
import { request } from './api';
import { startNotificationStream } from './notification-stream';

export function useLiveNotifications(accountId?: string) {
  useEffect(() => {
    if (!accountId) return;
    const stop = startNotificationStream({
      load: after => request('GET', `/notifications/live${after ? `?after=${encodeURIComponent(after)}` : ''}`),
      onChange: () => { for (const key of ['notifications', 'orders', 'order', 'membership', 'reviews', 'my-review']) void queryClient.invalidateQueries({ queryKey: [key] }); },
      onNotification: item => useToast.getState().enqueue(`${item.title}: ${item.body}`),
    });
    return () => { stop(); useToast.setState({ toast: null, queue: [] }); };
  }, [accountId]);
}
