import { create, isAxiosError, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { deleteRefreshToken, readRefreshToken, saveRefreshToken } from './token-storage';
import type { Profile } from '../types/api';

type Envelope<T> = { success: boolean; message: string; data: T; errors: Record<string, string[]> | null };
export type AuthResult = { accessToken: string; refreshToken: string | null; expiresAt?: string; user: Profile };
const baseURL = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_ANDROID_API_BASE_URL : Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_IOS_API_BASE_URL : undefined) || process.env.EXPO_PUBLIC_API_BASE_URL;
if (!baseURL) throw new Error('Thiếu EXPO_PUBLIC_API_BASE_URL trong frontend/.env');
const platformHeaders = Platform.OS === 'web' ? {} : { 'X-Client-Platform': 'native' };
const transport = create({ baseURL, withCredentials: true, timeout: 15000, headers: platformHeaders });
const client = create({ baseURL, withCredentials: true, timeout: 15000, headers: platformHeaders });
type SessionRequestConfig = InternalAxiosRequestConfig & { retried?: boolean; sessionUserIdAtStart?: string | null; sessionGenerationAtStart?: number };
let accessToken: string | null = null;
let accessTokenExpiresAt = 0;
let sessionUserId: string | null = null;
let sessionGeneration = 0;
let refreshRetryAt = 0;
let refreshFailure: unknown = null;
let refreshing: Promise<AuthResult> | null = null;
let restoring: Promise<AuthResult | null> | null = null;
let expired: () => void = () => {};
let profileChanged: (profile: Profile) => void = () => {};
let sessionQueue: Promise<unknown> = Promise.resolve();
const publicAuthPaths = new Set(['/auth/login', '/auth/register', '/auth/refresh', '/auth/session', '/auth/logout', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email']);
export const onSessionExpired = (callback: () => void) => { expired = callback; };
export const onSessionProfileChanged = (callback: (profile: Profile) => void) => { profileChanged = callback; };
export function isSessionRejected(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401;
}
async function withSessionLock<T>(operation: () => Promise<T>): Promise<T> {
  const run = () => Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.locks ? navigator.locks.request('bcobca-session', operation) : operation();
  const result = sessionQueue.then(run, run);
  sessionQueue = result.then(() => undefined, () => undefined);
  return result;
}
export async function acceptSession(result: AuthResult, allowIdentityChange = false) {
  if (sessionUserId && sessionUserId !== result.user.id && !allowIdentityChange) {
    await clearSession(); expired();
    throw new Error('Tài khoản đã thay đổi ở phiên khác. Vui lòng đăng nhập lại.');
  }
  if (allowIdentityChange) sessionGeneration++;
  accessToken = result.accessToken;
  accessTokenExpiresAt = result.expiresAt ? Date.parse(result.expiresAt) : 0;
  refreshRetryAt = 0; refreshFailure = null;
  sessionUserId = result.user.id;
  if (result.refreshToken) await saveRefreshToken(result.refreshToken);
  profileChanged(result.user);
  return result;
}
export async function clearSession() { sessionGeneration++; accessToken = null; accessTokenExpiresAt = 0; sessionUserId = null; refreshRetryAt = 0; refreshFailure = null; await deleteRefreshToken(); }
export async function registerAccount(input: unknown): Promise<void> {
  await transport.post('/auth/register', input);
}
export function loginSession(input: unknown): Promise<AuthResult> {
  return withSessionLock(async () => {
    const reply = await transport.post<Envelope<AuthResult>>('/auth/login', input);
    return acceptSession(reply.data.data, true);
  });
}
function assertSessionGeneration(generation: number) {
  if (generation !== sessionGeneration) throw new Error('Yêu cầu thuộc phiên đăng nhập trước. Vui lòng thực hiện lại.');
}
async function postSession<T>(path: string, generation: number): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    assertSessionGeneration(generation);
    try {
      const reply = await transport.post<Envelope<T>>(path, { refreshToken: await readRefreshToken() });
      assertSessionGeneration(generation);
      return reply.data.data;
    } catch (error) {
      if (attempt !== 0 || !isAxiosError(error) || error.response?.status !== 409) throw error;
      // A competing tab may have rotated the cookie; reread credentials on retry.
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }
}
function backOffRefresh(error: unknown) {
  const retryAfter = isAxiosError(error) ? error.response?.headers['retry-after'] : undefined;
  const seconds = Number(retryAfter);
  const delay = retryAfter ? Number.isFinite(seconds) ? seconds * 1000 : Date.parse(String(retryAfter)) - Date.now() : 30_000;
  refreshRetryAt = Date.now() + (Number.isFinite(delay) ? Math.max(1000, delay) : 30_000);
  refreshFailure = error;
}
export function refreshSession(): Promise<AuthResult> {
  if (refreshing) return refreshing;
  if (refreshFailure && Date.now() < refreshRetryAt) return Promise.reject(refreshFailure);
  const generation = sessionGeneration;
  refreshing = withSessionLock(async () => {
    assertSessionGeneration(generation);
    try {
      return await acceptSession(await postSession<AuthResult>('/auth/refresh', generation));
    } catch (error) {
      if (generation !== sessionGeneration) throw error;
      // Clear once, inside the session lock, before a queued login can start.
      if (isSessionRejected(error)) { await clearSession(); expired(); }
      else backOffRefresh(error);
      throw error;
    }
  }).finally(() => { refreshing = null; });
  return refreshing;
}
export async function ensureFreshSession(): Promise<void> {
  if (!accessToken || !sessionUserId) return;
  if (refreshing) { await refreshing; return; }
  if (accessTokenExpiresAt && Date.now() >= accessTokenExpiresAt - 60_000) await refreshSession();
}
export function restoreSession(): Promise<AuthResult | null> {
  const generation = sessionGeneration;
  if (!restoring) restoring = withSessionLock(async () => {
    const result = await postSession<AuthResult | null>('/auth/session', generation);
    return result ? acceptSession(result) : null;
  }).finally(() => { restoring = null; });
  return restoring;
}
client.interceptors.request.use(async config => {
  const sessionConfig = config as SessionRequestConfig;
  if (!Object.prototype.hasOwnProperty.call(sessionConfig, 'sessionUserIdAtStart')) sessionConfig.sessionUserIdAtStart = sessionUserId;
  if (sessionConfig.sessionGenerationAtStart === undefined) sessionConfig.sessionGenerationAtStart = sessionGeneration;
  assertSessionGeneration(sessionConfig.sessionGenerationAtStart);
  if (sessionConfig.sessionUserIdAtStart !== sessionUserId) throw new Error('Yêu cầu thuộc phiên đăng nhập trước. Vui lòng thực hiện lại.');
  if (!publicAuthPaths.has(config.url?.split('?')[0] ?? '')) await ensureFreshSession();
  assertSessionGeneration(sessionConfig.sessionGenerationAtStart);
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return sessionConfig;
});
client.interceptors.response.use(response => {
  assertSessionGeneration((response.config as SessionRequestConfig).sessionGenerationAtStart!);
  if ((response.config as SessionRequestConfig).sessionUserIdAtStart !== sessionUserId) return Promise.reject(new Error('Yêu cầu thuộc phiên đăng nhập trước. Vui lòng thực hiện lại.'));
  return response;
}, async (error: AxiosError) => {
  const original = error.config as SessionRequestConfig;
  if (error.response?.status === 401 && original && !original.retried && !publicAuthPaths.has(original.url?.split('?')[0] ?? '')) {
    assertSessionGeneration(original.sessionGenerationAtStart!);
    original.retried = true;
    if (original.sessionUserIdAtStart !== sessionUserId) return Promise.reject(new Error('Yêu cầu thuộc phiên đăng nhập trước. Vui lòng thực hiện lại.'));
    // Another request may have refreshed while this older 401 was in flight.
    if (!accessToken || original.headers.Authorization === `Bearer ${accessToken}`) await refreshSession();
    if (original.sessionUserIdAtStart !== sessionUserId) return Promise.reject(new Error('Phiên đăng nhập đã thay đổi. Vui lòng thực hiện lại.'));
    return client(original);
  }
  return Promise.reject(error);
});
export async function request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, data?: unknown, headers?: Record<string, string>): Promise<T> {
  const result = await client.request<Envelope<T>>({ method, url: path, data, headers });
  return result.data.data;
}
export async function signOut() {
  return withSessionLock(async () => {
    try { await transport.post('/auth/logout', { refreshToken: await readRefreshToken() }); }
    finally { await clearSession(); }
  });
}
export function errorMessage(error: unknown): string {
  if (isAxiosError<Envelope<unknown>>(error)) return error.response?.data?.message ?? 'Không thể kết nối máy chủ. Vui lòng thử lại.';
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu';
}
