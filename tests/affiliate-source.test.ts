import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ token: null as string | null, request: vi.fn(), save: vi.fn() }));
vi.mock('../src/services/api', () => ({ request: state.request }));
vi.mock('../src/services/affiliate-storage', () => ({ readAffiliateToken: async () => state.token, saveAffiliateToken: async (token: string) => { state.token = token; state.save(token); } }));
beforeEach(() => { vi.resetModules(); state.token = null; state.request.mockReset(); state.save.mockClear(); });

describe('affiliate visit source', () => {
  it('waits for tracking to finish before returning the native checkout source', async () => {
    let started!: () => void; let finish!: (result: { token: string }) => void;
    const ready = new Promise<void>(resolve => { started = resolve; });
    const pending = new Promise<{ token: string }>(resolve => { finish = resolve; });
    state.request.mockImplementation(() => { started(); return pending; });
    const source = await import('../src/services/affiliate-source');
    const visit = source.recordAffiliateVisit('FIRST');
    let checkoutFinished = false;
    const checkout = source.checkoutAffiliateToken().then(token => { checkoutFinished = true; return token; });
    await ready; expect(checkoutFinished).toBe(false);
    finish({ token: 'native-source' }); await visit;
    expect(await checkout).toBe('native-source');
  });
  it('serializes successive clicks so the last valid source wins', async () => {
    state.request.mockResolvedValueOnce({ token: 'FIRST-TOKEN' }).mockResolvedValueOnce({ token: 'LAST-TOKEN' });
    const source = await import('../src/services/affiliate-source');
    await Promise.all([source.recordAffiliateVisit('FIRST'), source.recordAffiliateVisit('LAST')]);
    expect(state.request.mock.calls[1][2]).toEqual({ code: 'LAST', previousToken: 'FIRST-TOKEN' });
    expect(await source.checkoutAffiliateToken()).toBe('LAST-TOKEN');
  });
  it('does not persist a browser HttpOnly source in JavaScript storage', async () => {
    state.request.mockResolvedValue({ token: null });
    const source = await import('../src/services/affiliate-source');
    await source.recordAffiliateVisit('WEB');
    expect(state.save).not.toHaveBeenCalled(); expect(await source.checkoutAffiliateToken()).toBeNull();
  });
  it('keeps the prior source when a new invalid link is rejected', async () => {
    state.token = 'VALID-OLD'; state.request.mockRejectedValue(new Error('Invalid link'));
    const source = await import('../src/services/affiliate-source');
    await expect(source.recordAffiliateVisit('INVALID')).rejects.toThrow('Invalid link');
    expect(await source.checkoutAffiliateToken()).toBe('VALID-OLD');
  });
});
