import { create } from 'zustand';

type Toast = { id: number; message: string; tone: 'success' | 'error' };
type ToastState = { toast: Toast | null; queue: Toast[]; show: (message: string, tone?: Toast['tone']) => void; enqueue: (message: string) => void; dismiss: (id: number) => void };
let nextId = 0;

export const useToast = create<ToastState>(set => ({
  toast: null,
  queue: [],
  enqueue: message => set(state => {
    const toast: Toast = { id: ++nextId, message, tone: 'success' };
    return state.toast ? { queue: [...state.queue, toast].slice(-100) } : { toast };
  }),
  show: (message, tone = 'success') => set({ toast: { id: ++nextId, message, tone } }),
  dismiss: id => set(state => state.toast?.id === id ? { toast: state.queue[0] ?? null, queue: state.queue.slice(1) } : state),
}));
