import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
afterEach(() => { vi.useRealTimers(); });

describe('API session recovery', () => {
  it('refreshes before sending requests when the access token is close to expiry', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-12T02:00:00Z'));
    const api = await import('../src/services/api');
    await api.acceptSession({ ...authReply.data, accessToken: 'old-access-token', expiresAt: '2026-11-12T02:00:30Z' });
    const transport = new MockAdapter(state.clients[0]); const client = new MockAdapter(state.clients[1]);
    transport.onPost('/auth/refresh').reply(200, { ...authReply, data: { ...authReply.data, expiresAt: '2026-11-12T02:15:00Z' } });
    client.onGet('/auth/me').reply(200, { success: true, data: 'ok' });
    await expect(api.request('GET', '/auth/me')).resolves.toBe('ok');
    expect(transport.history.post).toHaveLength(1);
    expect(client.history.get).toHaveLength(1);
    expect(client.history.get[0].headers?.Authorization).toBe('Bearer new-access-token');
  });

  it('backs off temporary refresh failures without losing the user or repeatedly calling the API', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-12T02:00:00Z'));
    const api = await import('../src/services/api'); const expired = vi.fn(); api.onSessionExpired(expired);
    const transport = new MockAdapter(state.clients[0]);
    transport.onPost('/auth/refresh').replyOnce(429, {}, { 'Retry-After': '60' }).onPost('/auth/refresh').reply(200, authReply);
    await expect(api.refreshSession()).rejects.toMatchObject({ response: { status: 429 } });
    await expect(api.refreshSession()).rejects.toMatchObject({ response: { status: 429 } });
    expect(transport.history.post).toHaveLength(1); expect(expired).not.toHaveBeenCalled();
    vi.setSystemTime(new Date('2026-11-12T02:01:01Z'));
    await api.refreshSession(); expect(transport.history.post).toHaveLength(2);
  });

  it('retries a refresh conflict once using the latest browser cookie', async () => {
    vi.useFakeTimers();
    const api = await import('../src/services/api'); const expired = vi.fn(); api.onSessionExpired(expired);
    const transport = new MockAdapter(state.clients[0]);
    transport.onPost('/auth/refresh').replyOnce(409).onPost('/auth/refresh').reply(200, authReply);
    const pending = api.refreshSession().then(result => ({ result }), error => ({ error }));
    await vi.advanceTimersByTimeAsync(300);
    await expect(pending).resolves.toMatchObject({ result: { user: { id: 'test-user' } } });
    expect(transport.history.post).toHaveLength(2); expect(expired).not.toHaveBeenCalled();
  });

  it('does not refresh anonymous or still-fresh sessions', async () => {
    const api = await import('../src/services/api'); const transport = new MockAdapter(state.clients[0]);
    await api.ensureFreshSession();
    await api.acceptSession({ ...authReply.data, expiresAt: new Date(Date.now() + 15 * 60_000).toISOString() });
    await api.ensureFreshSession(); expect(transport.history.post).toHaveLength(0);
  });

  it('does not resurrect the session from a refresh queued behind logout', async () => {
    const api = await import('../src/services/api'); await api.acceptSession(authReply.data);
    const transport = new MockAdapter(state.clients[0]);
    transport.onPost('/auth/logout').reply(200, {}); transport.onPost('/auth/refresh').reply(200, authReply);
    const logout = api.signOut(); const background = api.refreshSession().then(() => 'restored', () => 'cancelled');
    await logout; expect(await background).toBe('cancelled');
    expect(transport.history.post.map(r => r.url)).toEqual(['/auth/logout']);
  });

  it('coalesces proactive refresh for simultaneous requests and preserves private cache', async () => {
    const api = await import('../src/services/api'); const { queryClient } = await import('../src/stores/auth');
    await api.acceptSession({ ...authReply.data, expiresAt: new Date(Date.now() + 30_000).toISOString() });
    queryClient.setQueryData(['private-data'], 'retained');
    const transport = new MockAdapter(state.clients[0]); const client = new MockAdapter(state.clients[1]);
    transport.onPost('/auth/refresh').reply(200, { ...authReply, data: { ...authReply.data, expiresAt: new Date(Date.now() + 900_000).toISOString() } });
    client.onGet('/auth/me').reply(200, { success: true, data: 'ok' });
    expect(await Promise.all([api.request('GET', '/auth/me'), api.request('GET', '/auth/me'), api.ensureFreshSession()])).toEqual(['ok', 'ok', undefined]);
    expect(transport.history.post).toHaveLength(1); expect(queryClient.getQueryData(['private-data'])).toBe('retained');
  });

  it('bounds conflict retries and keeps a signed-in user after a temporary server failure', async () => {
    vi.useFakeTimers();
    const api = await import('../src/services/api'); const { useAuth } = await import('../src/stores/auth');
    await api.acceptSession(authReply.data);
    const transport = new MockAdapter(state.clients[0]); transport.onPost('/auth/refresh').reply(409);
    const result = api.refreshSession().catch(error => error.response.status);
    await vi.advanceTimersByTimeAsync(1000); expect(await result).toBe(409);
    expect(transport.history.post).toHaveLength(2); expect(useAuth.getState().user?.id).toBe('test-user');
  });

  it('rejects a late response from a previous login even when the same account signs back in', async () => {
    const api = await import('../src/services/api'); await api.acceptSession(authReply.data);
    const client = new MockAdapter(state.clients[1]);
    let entered!: () => void; let finish!: (value: [number, object]) => void;
    const started = new Promise<void>(resolve => { entered = resolve; });
    client.onGet('/auth/me').reply(() => { entered(); return new Promise<[number, object]>(resolve => { finish = resolve; }); });
    const result = api.request('GET', '/auth/me').then(() => 'accepted', () => 'stale'); await started;
    await api.clearSession(); await api.acceptSession(authReply.data, true);
    finish([200, { success: true, data: 'old profile' }]); expect(await result).toBe('stale');
  });

  it('registers without accepting tokens, publishing a profile or automatically logging in', async () => {
    const api = await import('../src/services/api');
    const changed = vi.fn(); api.onSessionProfileChanged(changed);
    const transport = new MockAdapter(state.clients[0]); const client = new MockAdapter(state.clients[1]);
    // Even a legacy registration response containing credentials must never create a client session.
    transport.onPost('/auth/register').reply(201, authReply);
    await api.registerAccount({ email: 'new@example.com', password: 'StrongPassword123!' });
    expect(changed).not.toHaveBeenCalled();
    expect(transport.history.post.map(r => r.url)).toEqual(['/auth/register']);
    client.onGet('/public-check').reply(200, { success: true, data: {} });
    await api.request('GET', '/public-check');
    expect(client.history.get[0].headers?.Authorization).toBeUndefined();
  });
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

  it('does not log out when refresh is forbidden by origin configuration', async () => {
    const api = await import('../src/services/api'); const expired = vi.fn(); api.onSessionExpired(expired);
    await api.acceptSession(authReply.data);
    const transport = new MockAdapter(state.clients[0]); const client = new MockAdapter(state.clients[1]);
    transport.onPost('/auth/refresh').reply(403); client.onGet('/auth/me').reply(401);
    await expect(api.request('GET', '/auth/me')).rejects.toMatchObject({ response: { status: 403 } });
    expect(expired).not.toHaveBeenCalled(); expect(state.deleted).not.toHaveBeenCalled();
  });

  it('retries late 401 responses with the access token already refreshed by another request', async () => {
    const api = await import('../src/services/api');
    await api.acceptSession({ ...authReply.data, accessToken: 'old-access-token' });
    const transport = new MockAdapter(state.clients[0]); const client = new MockAdapter(state.clients[1]);
    let release!: (value: [number, object]) => void; let started!: () => void;
    const entered = new Promise<void>(resolve => { started = resolve; });
    client.onGet('/slow').replyOnce(() => { started(); return new Promise<[number, object]>(resolve => { release = resolve; }); });
    client.onGet('/slow').reply(200, { success: true, data: 'slow-ok' });
    client.onGet('/fast').replyOnce(401).onGet('/fast').reply(200, { success: true, data: 'fast-ok' });
    transport.onPost('/auth/refresh').reply(200, authReply);
    const slow = api.request('GET', '/slow'); await entered;
    await expect(api.request('GET', '/fast')).resolves.toBe('fast-ok');
    release([401, {}]); await expect(slow).resolves.toBe('slow-ok');
    expect(transport.history.post).toHaveLength(1);
  });

  it('coalesces concurrent startup recovery so the refresh cookie rotates only once', async () => {
    const api = await import('../src/services/api'); const transport = new MockAdapter(state.clients[0]);
    transport.onPost('/auth/session').reply(200, authReply);
    await Promise.all([api.restoreSession(), api.restoreSession()]);
    expect(transport.history.post).toHaveLength(1);
  });

  it('clears the session only when refresh is rejected as unauthorized', async () => {
    const api = await import('../src/services/api'); const expired = vi.fn(); api.onSessionExpired(expired);
    const transport = new MockAdapter(state.clients[0]); const client = new MockAdapter(state.clients[1]);
    transport.onPost('/auth/refresh').reply(401); client.onGet('/auth/me').reply(401);
    await expect(api.request('GET', '/auth/me')).rejects.toMatchObject({ response: { status: 401 } });
    expect(expired).toHaveBeenCalledOnce(); expect(state.deleted).toHaveBeenCalledOnce();
  });

  it('clears a rejected refresh only once for simultaneous protected requests', async () => {
    const api = await import('../src/services/api'); const expired = vi.fn(); api.onSessionExpired(expired);
    await api.acceptSession(authReply.data);
    const transport = new MockAdapter(state.clients[0]); const client = new MockAdapter(state.clients[1]);
    transport.onPost('/auth/refresh').reply(401);
    client.onGet('/auth/me').reply(401); client.onGet('/membership').reply(401);
    await Promise.allSettled([api.request('GET', '/auth/me'), api.request('GET', '/membership')]);
    expect(transport.history.post).toHaveLength(1);
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
    expect(useAuth.getState()).toHaveProperty('restoreError');
    expect(useAuth.getState().restoreError).toBeTruthy();
  });

  it('clears startup failure after retry and restores the signed-in user', async () => {
    await import('../src/services/api'); const transport = new MockAdapter(state.clients[0]);
    transport.onPost('/auth/session').networkErrorOnce().onPost('/auth/session').reply(200, authReply);
    const { useAuth } = await import('../src/stores/auth');
    await useAuth.getState().restore(); expect(useAuth.getState().restoreError).toBeTruthy();
    await useAuth.getState().restore();
    expect(useAuth.getState().user?.id).toBe('test-user'); expect(useAuth.getState().restoreError).toBeNull();
  });

  it('clears an in-memory user when startup explicitly rejects the refresh session', async () => {
    const api = await import('../src/services/api'); const { useAuth } = await import('../src/stores/auth');
    await api.acceptSession(authReply.data);
    const transport = new MockAdapter(state.clients[0]); transport.onPost('/auth/session').reply(401);
    await useAuth.getState().restore();
    expect(useAuth.getState().user).toBeNull();
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
