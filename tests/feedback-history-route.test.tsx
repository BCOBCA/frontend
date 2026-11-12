import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import FeedbackHistory from '../app/feedback-history';
import { feedbackHistoryPath } from '../src/components/support/feedback-history';
const state = vi.hoisted(() => ({ user: { id: 'me' } as { id: string } | null, request: vi.fn(), openURL: vi.fn(), toast: vi.fn(), push: vi.fn(), filter: { page: 2, search: 'voucher' }, setFilter: vi.fn(), setDraft: vi.fn(), setExpanded: vi.fn(), page: {} as Record<string, any>, view: {} as Record<string, any>, query: {} as Record<string, any> }));
vi.mock('react', async original => ({ ...await original<typeof React>(), useState: (initial: unknown) => initial === null ? [null, state.setExpanded] : typeof initial === 'string' ? ['voucher', state.setDraft] : [state.filter, state.setFilter] }));
vi.mock('expo-router', () => ({ router: { push: state.push } }));
vi.mock('expo-linking', () => ({ openURL: state.openURL }));
vi.mock('../src/services/api', () => ({ request: state.request, errorMessage: (error: unknown) => String(error) }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (v: unknown) => unknown) => select({ user: state.user }) }));
vi.mock('../src/stores/toast', () => ({ useToast: () => state.toast }));
vi.mock('@tanstack/react-query', () => ({ useQuery: (options: unknown) => { state.query = options as typeof state.query; return { data: { items: [], totalPages: 3 }, refetch: vi.fn() }; } }));
vi.mock('../src/components/common/ui', () => ({ Page: (props: Record<string, any>) => { state.page = props; return <main>{props.children}</main>; }, LoginNotice: () => <p>Login required</p> }));
vi.mock('../src/components/support/FeedbackHistoryView', () => ({ FeedbackHistoryView: (props: Record<string, any>) => { state.view = props; return <p>History</p>; } }));
beforeEach(() => { vi.clearAllMocks(); state.user = { id: 'me' }; });
it('uses authenticated paginated search with a per-user query key', async () => {
  renderToStaticMarkup(<FeedbackHistory />); await state.query.queryFn();
  expect(state.query.queryKey).toEqual(['feedback-history', 'me', 2, 'voucher']);
  expect(state.request).toHaveBeenCalledWith('GET', '/feedbacks?page=2&pageSize=20&search=voucher');
  expect(state.page.searchPlaceholder).toBe('Tìm kiếm phản hồi...');
  expect(state.page.footerTab).toBe('member');
});
it('disables private data for guests and renders login notice', () => {
  state.user = null; expect(renderToStaticMarkup(<FeedbackHistory />)).toContain('Login required'); expect(state.query.enabled).toBe(false);
});
it('resets pagination on a new submitted search and opens attachments only on demand', async () => {
  renderToStaticMarkup(<FeedbackHistory />); state.page.onSubmitSearch('  đơn hàng  ');
  expect(state.setFilter).toHaveBeenCalledWith({ page: 1, search: 'đơn hàng' });
  state.openURL.mockRejectedValueOnce(new Error('failed'));
  await state.view.onOpenAttachment({ url: 'https://example.test/a.pdf' });
  expect(state.toast).toHaveBeenCalledWith(expect.stringContaining('Không thể mở tệp'), 'error');
});
it('encodes search terms and bounds the query length', () => {
  expect(feedbackHistoryPath(1, ' a&b ')).toBe('/feedbacks?page=1&pageSize=20&search=a%26b');
  expect(new URLSearchParams(feedbackHistoryPath(1, 'x'.repeat(250)).split('?')[1]).get('search')).toHaveLength(200);
});
