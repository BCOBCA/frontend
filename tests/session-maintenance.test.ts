import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { startSessionMaintenance } from '../src/services/session-maintenance';
const state = vi.hoisted(() => ({ platform: 'web', appChange: null as null | ((value: string) => void), remove: vi.fn() }));
vi.mock('react-native', () => ({ Platform: { get OS() { return state.platform; } }, AppState: { currentState: 'active', addEventListener: (_: string, callback: (value: string) => void) => { state.appChange = callback; return { remove: state.remove }; } } }));
let browser: EventTarget;
let page: EventTarget & { visibilityState: string };
let network: { onLine: boolean };
beforeEach(() => {
  vi.useFakeTimers(); state.platform = 'web'; state.remove.mockClear();
  browser = new EventTarget(); page = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  network = { onLine: true };
  vi.stubGlobal('window', browser); vi.stubGlobal('document', page); vi.stubGlobal('navigator', network);
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
it('checks while visible, pauses hidden/offline and rechecks immediately on return', async () => {
  const refresh = vi.fn(async () => {}); const stop = startSessionMaintenance(refresh);
  await vi.advanceTimersByTimeAsync(30_000); expect(refresh).toHaveBeenCalledTimes(2);
  page.visibilityState = 'hidden'; page.dispatchEvent(new Event('visibilitychange'));
  await vi.advanceTimersByTimeAsync(60_000); expect(refresh).toHaveBeenCalledTimes(2);
  page.visibilityState = 'visible'; page.dispatchEvent(new Event('visibilitychange')); await vi.advanceTimersByTimeAsync(0);
  expect(refresh).toHaveBeenCalledTimes(3);
  network.onLine = false;
  await vi.advanceTimersByTimeAsync(30_000); expect(refresh).toHaveBeenCalledTimes(3);
  network.onLine = true; browser.dispatchEvent(new Event('online')); await vi.advanceTimersByTimeAsync(0);
  expect(refresh).toHaveBeenCalledTimes(4);
  stop(); browser.dispatchEvent(new Event('focus')); await vi.advanceTimersByTimeAsync(60_000); expect(refresh).toHaveBeenCalledTimes(4);
});
it('coalesces simultaneous lifecycle events and survives temporary errors', async () => {
  let finish!: () => void;
  const refresh = vi.fn<() => Promise<void>>().mockImplementationOnce(() => new Promise(resolve => { finish = resolve; })).mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
  const stop = startSessionMaintenance(refresh);
  browser.dispatchEvent(new Event('focus')); browser.dispatchEvent(new Event('online'));
  await vi.advanceTimersByTimeAsync(30_000); expect(refresh).toHaveBeenCalledTimes(1);
  finish(); await vi.advanceTimersByTimeAsync(30_000); expect(refresh).toHaveBeenCalledTimes(2);
  await vi.advanceTimersByTimeAsync(30_000); expect(refresh).toHaveBeenCalledTimes(3); stop();
});
it('pauses in native background and resumes on AppState active, with cleanup', async () => {
  state.platform = 'android'; const refresh = vi.fn(async () => {}); const stop = startSessionMaintenance(refresh);
  await vi.advanceTimersByTimeAsync(0); state.appChange!('background');
  await vi.advanceTimersByTimeAsync(60_000); expect(refresh).toHaveBeenCalledTimes(1);
  state.appChange!('active'); await vi.advanceTimersByTimeAsync(0); expect(refresh).toHaveBeenCalledTimes(2);
  stop(); expect(state.remove).toHaveBeenCalledOnce();
});
