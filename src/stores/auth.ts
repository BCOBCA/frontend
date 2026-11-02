import { create } from 'zustand';
import { clearSession, isSessionRejected, loginSession, onSessionExpired, onSessionProfileChanged, restoreSession, signOut } from '../services/api';
import type { Profile } from '../types/api';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 }, mutations: { retry: false } } });
type AuthState = { user: Profile | null; ready: boolean; restore: () => Promise<void>; login: (input: unknown, register?: boolean) => Promise<void>; logout: () => Promise<void>; update: (user: Profile) => void };
export const useAuth = create<AuthState>((set) => ({
  user: null, ready: false,
  restore: async () => { try { const result = await restoreSession(); if (!result) await clearSession(); set({ user: result?.user ?? null }); } catch (error) { if (isSessionRejected(error)) await clearSession(); } finally { set({ ready: true }); } },
  login: async (input, register = false) => {
    const result = await loginSession(input, register);
    queryClient.clear(); set({ user: result.user });
  },
  logout: async () => { try { await signOut(); } finally { queryClient.clear(); set({ user: null }); } },
  update: (user) => set({ user }),
}));
onSessionExpired(() => { queryClient.clear(); useAuth.setState({ user: null }); });
onSessionProfileChanged(user => { if (useAuth.getState().user?.id !== user.id) queryClient.clear(); useAuth.setState({ user }); });
