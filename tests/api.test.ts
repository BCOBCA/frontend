import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

const state = vi.hoisted(() => ({ clients: [] as AxiosInstance[], deleted: vi.fn(async () => {}) }));
vi.mock('react-native', () => ({ Platform: { OS: 'web' } }));
vi.mock('../src/services/token-storage', () => ({ readRefreshToken: async () => null, saveRefreshToken: async () => {}, deleteRefreshToken: state.deleted }));
vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>();
  return { ...actual, create: (...args: Parameters<typeof actual.create>) => {
    const client = actual.default.create(...args); state.clients.push(client); return client;
  } };
});

const profile = (id: string, fullName = 'Test user') => ({ id, accountId: id, email: `${id}@example.com`, phone: '', fullName, nickname: '', avatarUrl: '', referralCode: 'TEST', roles: ['Customer'] });
const authReply = { success: true, data: { accessToken: 'new-access-token', refreshToken: null, user: profile('test-user') } };
beforeEach(() => { vi.unstubAllGlobals(); vi.resetModules(); state.clients.length = 0; state.deleted.mockClear(); process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:5000/api'; });

describe('API session recovery', () => {
  it('refreshes protected /auth/me after access expiry', async () => {
    const api = await import('../src/services/api');
    await api.acceptSession({ ...authReply.data, accessToken: 'old-access-token' });
    const transport = new MockAdapter(state.clients[0]); const client = new MockAdapter(state.clients[1]);
    transport.onPost('/auth/refresh').reply(200, authReply);
    client.onGet('/auth/me').replyOnce(401).onGet('/auth/me').reply(200, { success: true, data: { fullName: 'Test user' } });
    await expect(api.request('GET', '/auth/me')).resolves.toEqual({ fullName: 'Test user' });
    expect(transport.history.post).toHaveLength(1);
    expect(client.history.get[1].headers?.Authorization).toBe('Bearer new-access-token');
  });

  it('keeps a valid session when the retried mutation returns validation error', async () => {
    const api = await import('../src/services/api'); const expired = vi.fn(); api.onSessionExpired(expired);
    await api.acceptSession({ ...authReply.data, accessToken: 'old-access-token' });
    const transport = new MockAdapter(state.clients[0]); const client = new MockAdapter(state.clients[1]);
    transport.onPost('/auth/refresh').reply(200, authReply);
    client.onPut('/cart/items/line').replyOnce(401).onPut('/cart/items/line').reply(422, { message: 'Invalid quantity' });
    await expect(api.request('PUT', '/cart/items/line', { quantity: -1 })).rejects.toMatchObject({ response: { status: 422 } });
    expect(expired).not.toHaveBeenCalled(); expect(state.deleted).not.toHaveBeenCalled();
  });

  it('keeps the session during temporary network failure on refresh', async () => {
    const api = await import('../src/services/api'); const expired = vi.fn(); api.onSessionExpired(expired);
    const transport = new MockAdapter(state.clients[0]); const client = new MockAdapter(state.clients[1]);
    transport.onPost('/auth/refresh').networkError(); client.onGet('/auth/sessions').reply(401);
    await expect(api.request('GET', '/auth/sessions')).rejects.toThrow();
    expect(expired).not.toHaveBeenCalled(); expect(state.deleted).not.toHaveBeenCalled();
  });

  it('clears the session only when refresh is rejected as unauthorized', async () => {
    const api = await import('../src/services/api'); const expired = vi.fn(); api.onSessionExpired(expired);
    const transport = new MockAdapter(state.clients[0]); const client = new MockAdapter(state.clients[1]);
    transport.onPost('/auth/refresh').reply(401); client.onGet('/auth/me').reply(401);
    await expect(api.request('GET', '/auth/me')).rejects.toMatchObject({ response: { status: 401 } });
    expect(expired).toHaveBeenCalledOnce(); expect(state.deleted).toHaveBeenCalledOnce();
  });

  it('coalesces simultaneous refreshes and uses the browser session lock', async () => {
    const lock = vi.fn(async (_name: string, operation: () => Promise<unknown>) => operation());
    vi.stubGlobal('navigator', { locks: { request: lock } });
    const api = await import('../src/services/api'); const transport = new MockAdapter(state.clients[0]);
    transport.onPost('/auth/refresh').reply(200, authReply);
    const first = api.refreshSession(); const second = api.refreshSession();
    expect(first).toBe(second); await Promise.all([first, second]);
    expect(lock).toHaveBeenCalledOnce(); expect(transport.history.post).toHaveLength(1);
  });

  it('does not delete a saved native token when startup session recovery is offline', async () => {
    await import('../src/services/api'); const transport = new MockAdapter(state.clients[0]);
    transport.onPost('/auth/session').networkError();
    const { useAuth } = await import('../src/stores/auth');
    await useAuth.getState().restore();
    expect(useAuth.getState().ready).toBe(true); expect(state.deleted).not.toHaveBeenCalled();
  });

  it('deletes the saved token when startup confirms that there is no valid session', async () => {
    await import('../src/services/api'); const transport = new MockAdapter(state.clients[0]);
    transport.onPost('/auth/session').reply(200, { success: true, data: null });
    const { useAuth } = await import('../src/stores/auth');
    await useAuth.getState().restore(); expect(state.deleted).toHaveBeenCalledOnce();
  });

  it('aborts a mutation when another tab changed the cookie account', async () => {
    const api = await import('../src/services/api'); const { useAuth, queryClient } = await import('../src/stores/auth');
    await api.acceptSession({ ...authReply.data, user: profile('account-a') });
    queryClient.setQueryData(['private-data'], { owner: 'account-a' });
    const transport = new MockAdapter(state.clients[0]); const client = new MockAdapter(state.clients[1]);
    transport.onPost('/auth/refresh').reply(200, { ...authReply, data: { ...authReply.data, user: profile('account-b') } });
    client.onPost('/affiliate/withdrawals').replyOnce(401).onPost('/affiliate/withdrawals').reply(200, { success: true, data: { id: 'must-not-be-created' } });
    await expect(api.request('POST', '/affiliate/withdrawals', { amount: 1 })).rejects.toThrow('Tài khoản đã thay đổi');
    expect(client.history.post).toHaveLength(1); expect(useAuth.getState().user).toBeNull(); expect(queryClient.getQueryData(['private-data'])).toBeUndefined();
  });

  it('does not replay an older account request after an explicit account switch', async () => {
    const api = await import('../src/services/api');
    await api.acceptSession({ ...authReply.data, user: profile('account-a') });
    const transport = new MockAdapter(state.clients[0]); const client = new MockAdapter(state.clients[1]);
    let started!: () => void; let finish!: (value: [number, object]) => void;
    const entered = new Promise<void>(resolve => { started = resolve; });
    client.onPost('/affiliate/withdrawals').reply(() => { started(); return new Promise<[number, object]>(resolve => { finish = resolve; }); });
    const pending = api.request('POST', '/affiliate/withdrawals', { amount: 1 }); await entered;
    await api.acceptSession({ ...authReply.data, user: profile('account-b') }, true); finish([401, {}]);
    await expect(pending).rejects.toThrow('phiên đăng nhập trước');
    expect(transport.history.post).toHaveLength(0); expect(client.history.post).toHaveLength(1);
  });

  it('updates the stored profile on refresh for the same account', async () => {
    const api = await import('../src/services/api'); const { useAuth } = await import('../src/stores/auth');
    await api.acceptSession(authReply.data);
    const transport = new MockAdapter(state.clients[0]);
    transport.onPost('/auth/refresh').reply(200, { ...authReply, data: { ...authReply.data, user: profile('test-user', 'Updated name') } });
    await api.refreshSession(); expect(useAuth.getState().user?.fullName).toBe('Updated name');
  });
});
