import { request } from './api';
import { readAffiliateToken, saveAffiliateToken } from './affiliate-storage';

let tracking: Promise<unknown> = Promise.resolve();

export function recordAffiliateVisit(code: string) {
  const operation = async () => {
    const previousToken = await readAffiliateToken();
    const result = await request<{ token: string | null; expiresAt: string }>('POST', '/affiliate/visits', { code, previousToken });
    if (result.token) await saveAffiliateToken(result.token);
    return result;
  };
  const current = tracking.catch(() => {}).then(operation);
  tracking = current;
  return current;
}

export async function checkoutAffiliateToken() {
  await tracking.catch(() => {});
  return readAffiliateToken();
}
