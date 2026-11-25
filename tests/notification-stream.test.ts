import { afterEach, expect, it, vi } from 'vitest';
import { parseLiveBatch, startNotificationStream } from '../src/services/notification-stream';
const item = (id: string) => ({ id, title: 'Order', body: 'Status', targetType: 'Order', targetId: 'o1', readAt: null, createdAt: '2026-11-18T00:00:00Z' });
afterEach(() => vi.useRealTimers());
it('refreshes unread state when existing notifications are read elsewhere without replaying toasts', async () => {
  vi.useFakeTimers();
  const onChange = vi.fn(), onNotification = vi.fn();
  const load = vi.fn().mockResolvedValueOnce({ head: 'a', items: [item('a')] }).mockResolvedValue({ head: 'a', items: [{ ...item('a'), readAt: '2026-11-21T02:00:00Z' }] });
  const stop = startNotificationStream({ load, onChange, onNotification });
  await vi.advanceTimersByTimeAsync(1000);
  expect(onChange).toHaveBeenCalledTimes(2); expect(onNotification).not.toHaveBeenCalled();
  stop();
});
it('deduplicates replayed events and preserves chronological delivery', async () => {
  vi.useFakeTimers();
  const onNotification = vi.fn(), onChange = vi.fn();
  const load = vi.fn().mockResolvedValueOnce({ head: 'a', items: [item('a')] }).mockResolvedValue({ head: 'c', items: [item('c'), item('b'), item('a')] });
  const stop = startNotificationStream({ load, onChange, onNotification });
  await vi.advanceTimersByTimeAsync(1500);
  expect(onNotification.mock.calls.map(call => call[0].id)).toEqual(['b', 'c']);
  expect(onChange).toHaveBeenCalledTimes(2);
  stop();
});
it('ignores late responses after logout/unmount', async () => {
  let finish!: (value: unknown) => void;
  const onChange = vi.fn();
  const stop = startNotificationStream({ load: () => new Promise(resolve => { finish = resolve; }), onChange, onNotification: vi.fn() });
  stop(); finish({ head: 'a', items: [item('a')] });
  await Promise.resolve(); expect(onChange).not.toHaveBeenCalled();
});
it('backs off on failure and resumes after reconnect', async () => {
  vi.useFakeTimers();
  const load = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ head: 'a', items: [item('a')] });
  const stop = startNotificationStream({ load, onChange: vi.fn(), onNotification: vi.fn() });
  await vi.advanceTimersByTimeAsync(999); expect(load).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1); expect(load).toHaveBeenCalledTimes(2); stop();
});
it('rejects malformed live responses', () => { expect(() => parseLiveBatch({ head: 'a', items: [{}] })).toThrow(); });
