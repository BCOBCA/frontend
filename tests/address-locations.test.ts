import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listAddressProvinces, listAddressWards } from '../src/services/address-locations';

const transport = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('axios', () => ({ default: transport }));
beforeEach(() => transport.get.mockReset());

describe('current address catalog', () => {
  it('loads current provinces with padded codes and without session credentials', async () => {
    transport.get.mockResolvedValue({ data: [{ code: 1, name: 'Thành phố Hà Nội' }] });
    expect(await listAddressProvinces()).toEqual([{ code: '01', name: 'Thành phố Hà Nội' }]);
    expect(transport.get).toHaveBeenCalledWith('https://provinces.open-api.vn/api/v2/', expect.objectContaining({ withCredentials: false, timeout: 15000 }));
  });
  it('loads only wards of the selected province and retains official ward codes', async () => {
    transport.get.mockResolvedValue({ data: { code: 1, wards: [{ code: 4, name: 'Phường Ba Đình' }] } });
    expect(await listAddressWards('01')).toEqual([{ code: '00004', name: 'Phường Ba Đình' }]);
    expect(transport.get).toHaveBeenCalledWith('https://provinces.open-api.vn/api/v2/p/1?depth=2', expect.objectContaining({ withCredentials: false }));
  });
  it('rejects malformed responses instead of offering invalid choices', async () => {
    transport.get.mockResolvedValue({ data: [{ code: -1, name: 'Invalid' }] });
    await expect(listAddressProvinces()).rejects.toThrow();
    transport.get.mockResolvedValue({ data: { code: 1, wards: null } });
    await expect(listAddressWards('01')).rejects.toThrow();
  });
  it('does not request arbitrary paths or wards without a valid province', async () => {
    await expect(listAddressWards('../auth')).rejects.toThrow();
    expect(transport.get).not.toHaveBeenCalled();
  });
  it('rejects wards returned for a different province', async () => {
    transport.get.mockResolvedValue({ data: { code: 79, wards: [{ code: 4, name: 'Phường Ba Đình' }] } });
    await expect(listAddressWards('01')).rejects.toThrow();
  });
});
