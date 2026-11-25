import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { useUnreadNotifications } from '../src/services/use-unread-notifications';
import type { Notification } from '../src/types/api';

type Query = { queryKey: unknown[]; enabled: boolean; queryFn: () => Promise<Notification[]>; select: (items: Notification[]) => boolean };
const state = vi.hoisted(() => ({ userId: 'user-a' as string | undefined, data: undefined as boolean | undefined, query: undefined as Query | undefined, request: vi.fn() }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (value: { user: { id: string } | null }) => unknown) => select({ user: state.userId ? { id: state.userId } : null }) }));
vi.mock('../src/services/api', () => ({ request: state.request }));
vi.mock('@tanstack/react-query', () => ({ useQuery: (query: Query) => { state.query = query; return { data: state.data }; } }));
function Probe() { return <span>{String(useUnreadNotifications())}</span>; }
const read: Notification = { id: 'read', title: 'Order', body: 'Status', createdAt: '2026-11-21T02:00:00Z', readAt: '2026-11-21T03:00:00Z' };
beforeEach(() => { state.userId = 'user-a'; state.data = undefined; state.query = undefined; vi.clearAllMocks(); });

it('shares the inbox cache and scopes unread data to the signed-in account', () => {
  renderToStaticMarkup(<Probe />);
  expect(state.query!.queryKey).toEqual(['notifications', 'user-a', 'inbox']);
  state.userId = 'user-b'; renderToStaticMarkup(<Probe />);
  expect(state.query!.queryKey).toEqual(['notifications', 'user-b', 'inbox']);
});
it('finds unread notifications beyond the first API page', async () => {
  state.request.mockResolvedValueOnce({ items: [read], totalPages: 2 }).mockResolvedValueOnce({ items: [{ ...read, id: 'new', readAt: null }], totalPages: 2 });
  renderToStaticMarkup(<Probe />);
  expect(state.query!.select(await state.query!.queryFn())).toBe(true);
  expect(state.request).toHaveBeenLastCalledWith('GET', '/notifications?page=2&pageSize=100');
});
it('hides the bell indicator for empty/all-read inboxes and guests', () => {
  renderToStaticMarkup(<Probe />);
  expect(state.query!.select([])).toBe(false); expect(state.query!.select([read])).toBe(false);
  state.data = true; state.userId = undefined;
  expect(renderToStaticMarkup(<Probe />)).toContain('false'); expect(state.query!.enabled).toBe(false);
});
