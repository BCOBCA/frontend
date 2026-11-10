import { useCallback } from 'react';
import { useToast } from '../../stores/toast';
import { TopToast } from './TopToast';

export function GlobalToastHost() {
  const toast = useToast(state => state.toast);
  const dismiss = useToast(state => state.dismiss);
  const id = toast?.id;
  const onDismiss = useCallback(() => { if (id !== undefined) dismiss(id); }, [dismiss, id]);
  return toast ? <TopToast key={toast.id} message={toast.message} tone={toast.tone} onDismiss={onDismiss} /> : null;
}
