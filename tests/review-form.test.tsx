import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { ReviewForm } from '../src/components/orders/ReviewForm';

type Options = { mutationFn: (value: { rating: number; content: string }) => unknown; onSuccess: () => void; onSettled: () => void };
const state = vi.hoisted(() => ({ data: null as null | { rating: number; content: string; imageUrls: string[] }, query: undefined as undefined | { queryKey: unknown[]; queryFn: () => unknown }, mutation: undefined as undefined | Options, request: vi.fn(), invalidate: vi.fn(), toast: vi.fn() }));
vi.mock('react-native', () => ({ Platform: { OS: 'web' }, View: 'div', Text: 'span', Pressable: ({ children, accessibilityState }: { children: React.ReactNode; accessibilityState?: { checked: boolean } }) => <button aria-checked={accessibilityState?.checked}>{children}</button> }));
vi.mock('lucide-react-native', () => ({ Star: () => null }));
vi.mock('expo-image', () => ({ Image: () => <img alt="Ảnh đánh giá" /> }));
vi.mock('../src/theme', () => ({ colors: {}, styles: {} }));
vi.mock('../src/components/product/ReviewReply', () => ({ ReviewReply: () => null }));
vi.mock('../src/components/common/ui', () => ({ Button: ({ title }: { title: string }) => <button>{title}</button>, Field: () => <textarea />, LoginNotice: () => null, Status: () => null }));
vi.mock('../src/stores/auth', () => ({ queryClient: { invalidateQueries: state.invalidate }, useAuth: (select: (state: { user: { id: string } }) => unknown) => select({ user: { id: 'buyer' } }) }));
vi.mock('../src/stores/toast', () => ({ useToast: () => state.toast }));
vi.mock('../src/services/api', () => ({ request: state.request }));
vi.mock('@tanstack/react-query', () => ({ useQuery: (options: typeof state.query) => { state.query = options; return { data: state.data, isLoading: false }; }, useMutation: (options: Options) => { state.mutation = options; return { mutate: vi.fn(), isPending: false }; } }));
beforeEach(() => { vi.clearAllMocks(); state.data = null; });
it('loads the selected purchased item in the signed-in buyer cache scope', () => {
  renderToStaticMarkup(<ReviewForm itemId="line-1" />);
  state.query!.queryFn();
  expect(state.query!.queryKey).toEqual(['my-review', 'line-1', 'buyer']);
  expect(state.request).toHaveBeenCalledWith('GET', '/order-items/line-1/review');
});
it('starts without selected stars and requires a deliberate rating', () => {
  const html = renderToStaticMarkup(<ReviewForm itemId="line-1" />);
  expect(html.match(/aria-checked="false"/g)).toHaveLength(5);
  expect(html).not.toContain('aria-checked="true"');
});
it('shows existing reviews as read-only without a submit or edit action', () => {
  state.data = { rating: 4, content: 'Existing review', imageUrls: ['https://example.test/review.jpg'] };
  const html = renderToStaticMarkup(<ReviewForm itemId="line-1" />);
  expect(html).toContain('Existing review');
  expect(html).toContain('4/5 sao');
  expect(html).not.toContain('textarea');
  expect(html).not.toContain('Lưu đánh giá');
  expect(html).not.toContain('Gửi đánh giá');
});
it('refreshes orders and notifies the popup after the first submission', async () => {
  const onSaved = vi.fn(), onBusyChange = vi.fn();
  renderToStaticMarkup(<ReviewForm itemId="line-1" onSaved={onSaved} onBusyChange={onBusyChange} />);
  await state.mutation!.mutationFn({ rating: 5, content: 'New review' });
  expect(state.request).toHaveBeenCalledWith('PUT', '/order-items/line-1/review', { rating: 5, content: 'New review', imageUrls: [] });
  await state.mutation!.onSuccess(); state.mutation!.onSettled();
  expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['my-review', 'line-1'] });
  expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['reviews'] });
  expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['orders'] });
  expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['order'] });
  expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['dealer'] });
  expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['dealers'] });
  expect(onSaved).toHaveBeenCalledOnce(); expect(onBusyChange).toHaveBeenCalledWith(false); expect(state.toast).toHaveBeenCalledOnce();
});
