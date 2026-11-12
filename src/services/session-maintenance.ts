import { AppState, Platform } from 'react-native';

// The API decides whether refresh is due; lifecycle checks never store credentials.
export function startSessionMaintenance(ensureFresh: () => Promise<void>) {
  let stopped = false;
  let running = false;
  let active = Platform.OS === 'web' ? document.visibilityState !== 'hidden' : AppState.currentState === 'active';
  const check = async () => {
    if (stopped || running || !active || Platform.OS === 'web' && navigator.onLine === false) return;
    running = true;
    try { await ensureFresh(); }
    catch { /* Transient failures retain the session; the API handles expiry and retry backoff. */ }
    finally { running = false; }
  };
  const onWake = () => { void check(); };
  let unsubscribe: () => void;
  if (Platform.OS === 'web') {
    const onVisible = () => { active = document.visibilityState !== 'hidden'; onWake(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onWake);
    window.addEventListener('online', onWake);
    unsubscribe = () => { document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('focus', onWake); window.removeEventListener('online', onWake); };
  } else {
    const subscription = AppState.addEventListener('change', state => { active = state === 'active'; onWake(); });
    unsubscribe = () => subscription.remove();
  }
  const interval = setInterval(onWake, 30_000);
  onWake();
  return () => { stopped = true; clearInterval(interval); unsubscribe(); };
}
