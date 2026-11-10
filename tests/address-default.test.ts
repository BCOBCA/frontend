import { describe, expect, it, vi } from 'vitest';
import { setDefaultAddress } from '../src/services/addresses';
import type { Address } from '../src/types/api';

const api = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('../src/services/api', () => api);

describe('default shipping address', () => {
  it('uses the existing update endpoint and preserves all address fields', async () => {
    const address: Address = { id: 'address-1', recipientName: 'Nguyễn An', phone: '0912345678', provinceCode: '01', wardCode: '00004', addressLine: '12 Đội Cấn', isDefault: false };
    api.request.mockResolvedValue({ ...address, isDefault: true });
    expect(await setDefaultAddress(address)).toEqual({ ...address, isDefault: true });
    expect(api.request).toHaveBeenCalledWith('PUT', '/addresses/address-1', { recipientName: 'Nguyễn An', phone: '0912345678', provinceCode: '01', wardCode: '00004', addressLine: '12 Đội Cấn', isDefault: true });
    expect(address.isDefault).toBe(false);
  });
});
