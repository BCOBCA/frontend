export type LiveNotification = { id: string; title: string; body: string; targetType: string; targetId: string | null; readAt: string | null; createdAt: string };
export type LiveBatch = { head: string | null; items: LiveNotification[] };

export function parseLiveBatch(value: unknown): LiveBatch {
  if (!value || typeof value !== 'object') throw new Error('Dữ liệu thông báo không hợp lệ.');
  const data = value as LiveBatch;
  if (!(data.head === null || typeof data.head === 'string') || !Array.isArray(data.items) || data.items.length > 100
    || data.items.some(item => !item || typeof item.id !== 'string' || typeof item.title !== 'string' || typeof item.body !== 'string'
      || typeof item.targetType !== 'string' || !(item.targetId === null || typeof item.targetId === 'string')
      || typeof item.createdAt !== 'string' || !Number.isFinite(Date.parse(item.createdAt)))) throw new Error('Dữ liệu thông báo không hợp lệ.');
  return data;
}

export function startNotificationStream(options: {
  load: (after: string | null) => Promise<unknown>;
  onChange: () => void;
  onNotification: (item: LiveNotification) => void;
}) {
  let active = true, initialized = false, failures = 0;
  let head: string | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let seen = new Set<string>();
  const poll = async () => {
    let delay = 500;
    try {
      const batch = parseLiveBatch(await options.load(head));
      if (!active) return;
      const fresh = [...batch.items].reverse().filter(item => !seen.has(item.id));
      if (head !== batch.head || !initialized || fresh.length > 0) options.onChange();
      if (initialized) for (const item of fresh) options.onNotification(item);
      for (const item of batch.items) seen.add(item.id);
      if (seen.size > 2000) seen = new Set(batch.items.map(item => item.id));
      head = batch.head; initialized = true; failures = 0;
      if (!head) delay = 2000;
    } catch { delay = Math.min(30000, 1000 * 2 ** Math.min(failures++, 5)); }
    if (active) timer = setTimeout(() => { void poll(); }, delay);
  };
  void poll();
  return () => { active = false; clearTimeout(timer); };
}
