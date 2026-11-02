import { create, isAxiosError, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { deleteRefreshToken, readRefreshToken, saveRefreshToken } from './token-storage';
import type { Profile } from '../types/api';

type Envelope<T> = { success: boolean; message: string; data: T; errors: Record<string, string[]> | null };
export type AuthResult = { accessToken: string; refreshToken: string | null; user: Profile };
const baseURL = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_ANDROID_API_BASE_URL : Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_IOS_API_BASE_URL : undefined) || process.env.EXPO_PUBLIC_API_BASE_URL;
if (!baseURL) throw new Error('Thiếu EXPO_PUBLIC_API_BASE_URL trong frontend/.env');
const platformHeaders = Platform.OS === 'web' ? {} : { 'X-Client-Platform': 'native' };
const transport = create({ baseURL, withCredentials: true, timeout: 15000, headers: platformHeaders });
const client = create({ baseURL, withCredentials: true, timeout: 15000, headers: platformHeaders });
type SessionRequestConfig = InternalAxiosRequestConfig & { retried?: boolean; sessionUserIdAtStart?: string | null };
let accessToken: string | null = null;
let sessionUserId: string | null = null;
let refreshing: Promise<AuthResult> | null = null;
let expired: () => void = () => {};
let profileChanged: (profile: Profile) => void = () => {};
let sessionQueue: Promise<unknown> = Promise.resolve();
const publicAuthPaths = new Set(['/auth/login', '/auth/register', '/auth/refresh', '/auth/session', '/auth/logout', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email']);
export const onSessionExpired = (callback: () => void) => { expired = callback; };
export const onSessionProfileChanged = (callback: (profile: Profile) => void) => { profileChanged = callback; };
export function isSessionRejected(error: unknown): boolean {
  return isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0);
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
  accessToken = result.accessToken;
  sessionUserId = result.user.id;
  if (result.refreshToken) await saveRefreshToken(result.refreshToken);
  profileChanged(result.user);
  return result;
}
export async function clearSession() { accessToken = null; sessionUserId = null; await deleteRefreshToken(); }
export function loginSession(input: unknown, register = false): Promise<AuthResult> {
  return withSessionLock(async () => {
    const reply = await transport.post<Envelope<AuthResult>>(register ? '/auth/register' : '/auth/login', input);
    return acceptSession(reply.data.data, true);
  });
}
export function refreshSession(): Promise<AuthResult> {
  if (!refreshing) refreshing = withSessionLock(async () => {
    const reply = await transport.post<Envelope<AuthResult>>('/auth/refresh', { refreshToken: await readRefreshToken() });
    return acceptSession(reply.data.data);
  }).finally(() => { refreshing = null; });
  return refreshing;
}
export async function restoreSession(): Promise<AuthResult | null> {
  return withSessionLock(async () => {
    const reply = await transport.post<Envelope<AuthResult | null>>('/auth/session', { refreshToken: await readRefreshToken() });
    return reply.data.data ? acceptSession(reply.data.data) : null;
  });
}
client.interceptors.request.use(config => {
  const sessionConfig = config as SessionRequestConfig;
  if (!Object.prototype.hasOwnProperty.call(sessionConfig, 'sessionUserIdAtStart')) sessionConfig.sessionUserIdAtStart = sessionUserId;
  if (sessionConfig.sessionUserIdAtStart !== sessionUserId) throw new Error('Yêu cầu thuộc phiên đăng nhập trước. Vui lòng thực hiện lại.');
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return sessionConfig;
});
client.interceptors.response.use(response => {
  if ((response.config as SessionRequestConfig).sessionUserIdAtStart !== sessionUserId) return Promise.reject(new Error('Yêu cầu thuộc phiên đăng nhập trước. Vui lòng thực hiện lại.'));
  return response;
}, async (error: AxiosError) => {
  const original = error.config as SessionRequestConfig;
  if (error.response?.status === 401 && original && !original.retried && !publicAuthPaths.has(original.url?.split('?')[0] ?? '')) {
    original.retried = true;
    if (original.sessionUserIdAtStart !== sessionUserId) return Promise.reject(new Error('Yêu cầu thuộc phiên đăng nhập trước. Vui lòng thực hiện lại.'));
    try { await refreshSession(); }
    catch (refreshError) {
      if (isSessionRejected(refreshError)) { await clearSession(); expired(); }
      return Promise.reject(refreshError);
    }
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
