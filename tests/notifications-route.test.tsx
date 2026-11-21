import React, { type ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import Notifications from '../app/notifications';
import type { NotificationsView } from '../src/components/notifications/NotificationsView';
import type { Notification } from '../src/types/api';

type ViewProps = ComponentProps<typeof NotificationsView>;
type Mutation = { mutationFn: (item: Notification | null) => Promise<Notification | null>; onSuccess: (item: Notification | null) => void; onSettled: () => Promise<unknown> };
const state = vi.hoisted(() => ({ user: { id: 'user-a' } as { id: string } | null, props: undefined as ViewProps | undefined, query: undefined as { queryKey: unknown[]; queryFn: () => Promise<unknown> } | undefined, mutation: undefined as Mutation | undefined, request: vi.fn(), invalidate: vi.fn(), push: vi.fn(), mutate: vi.fn() }));
const item: Notification = { id: 'n1', title: 'Đơn hàng', body: 'Đã xác nhận', targetType: 'Order', targetId: 'order-1', readAt: null, createdAt: '2026-11-19T02:00:00Z' };
vi.mock('expo-router', () => ({ router: { push: state.push } }));
vi.mock('../src/components/common/ui', () => ({ Page: ({ children }: { children: React.ReactNode }) => <main>{children}</main>, LoginNotice: () => <span>Đăng nhập</span> }));
vi.mock('../src/components/common/PushNotificationSettings', () => ({ PushNotificationSettings: () => <span>Native push settings</span> }));
vi.mock('../src/components/notifications/NotificationsView', () => ({ NotificationsView: (props: ViewProps) => { state.props = props; return null; } }));
vi.mock('../src/services/api', () => ({ request: state.request }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (s: { user: typeof state.user }) => unknown) => select({ user: state.user }), queryClient: { invalidateQueries: state.invalidate } }));
vi.mock('@tanstack/react-query', () => ({ useQuery: (options: typeof state.query) => { state.query = options; return { data: [item], refetch: vi.fn() }; }, useMutation: (options: Mutation) => { state.mutation = options; return { mutate: state.mutate, reset: vi.fn() }; } }));
beforeEach(() => { vi.clearAllMocks(); state.user = { id: 'user-a' }; state.props = undefined; state.query = undefined; });
it('scopes inbox cache to the signed-in account and loads existing paginated API', async () => {
  state.request.mockResolvedValue({ items: [item], page: 1, totalPages: 1 });
  renderToStaticMarkup(<Notifications />); await state.query!.queryFn();
  expect(state.query!.queryKey).toEqual(['notifications', 'user-a', 'inbox']);
  expect(state.request).toHaveBeenCalledWith('GET', '/notifications?page=1&pageSize=100');
});
it('marks a notification read before navigating to the actual order', async () => {
  renderToStaticMarkup(<Notifications />); state.props!.onOpen(item);
  expect(state.mutate).toHaveBeenCalledWith(item);
  const result = await state.mutation!.mutationFn(item); state.mutation!.onSuccess(result);
  expect(state.request).toHaveBeenCalledWith('PUT', '/notifications/n1/read');
  expect(state.push).toHaveBeenCalledWith({ pathname: '/order/[id]', params: { id: 'order-1' } });
});
it('bulk read uses existing endpoints and refreshes the cache even after failure', async () => {
  renderToStaticMarkup(<Notifications />); state.request.mockRejectedValueOnce(new Error('offline'));
  await expect(state.mutation!.mutationFn(null)).rejects.toThrow('offline'); await state.mutation!.onSettled();
  expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['notifications', 'user-a'] });
});
it('does not fetch or render private notifications for guests', () => {
  state.user = null; expect(renderToStaticMarkup(<Notifications />)).toContain('Đăng nhập'); expect(state.query).toBeUndefined(); expect(state.props).toBeUndefined();
});
