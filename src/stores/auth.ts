import { create } from 'zustand';
import { clearSession, isSessionRejected, loginSession, onSessionExpired, onSessionProfileChanged, registerAccount, restoreSession, signOut } from '../services/api';
import type { Profile } from '../types/api';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 }, mutations: { retry: false } } });
type AuthState = { user: Profile | null; ready: boolean; restoring: boolean; restoreError: unknown; restore: () => Promise<void>; register: (input: unknown) => Promise<void>; login: (input: unknown) => Promise<void>; logout: () => Promise<void>; update: (user: Profile) => void };
let restoreInFlight: Promise<void> | null = null;
export const useAuth = create<AuthState>((set) => ({
  user: null, ready: false, restoring: false, restoreError: null,
  restore: () => {
    if (!restoreInFlight) restoreInFlight = (async () => {
      set({ restoring: true, restoreError: null });
      try {
        const result = await restoreSession();
        if (!result) { await clearSession(); queryClient.clear(); }
        set({ user: result?.user ?? null });
      } catch (error) {
        if (isSessionRejected(error)) { await clearSession(); queryClient.clear(); set({ user: null }); }
        else set({ restoreError: error });
      } finally { set({ ready: true, restoring: false }); }
    })().finally(() => { restoreInFlight = null; });
    return restoreInFlight;
  },
  register: registerAccount,
  login: async (input) => {
    const result = await loginSession(input);
    queryClient.clear(); set({ user: result.user, ready: true, restoreError: null });
  },
  logout: async () => { try { await signOut(); } finally { queryClient.clear(); set({ user: null, restoreError: null }); } },
  update: (user) => set({ user }),
}));
onSessionExpired(() => { queryClient.clear(); useAuth.setState({ user: null, restoreError: null }); });
onSessionProfileChanged(user => { if (useAuth.getState().user?.id !== user.id) queryClient.clear(); useAuth.setState({ user, restoreError: null }); });
