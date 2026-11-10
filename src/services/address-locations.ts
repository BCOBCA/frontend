import axios from 'axios';
import { z } from 'zod';

export type AddressLocation = { code: string; name: string };
const baseURL = 'https://provinces.open-api.vn/api/v2';
const options = { withCredentials: false, timeout: 15000 };
const location = z.object({ code: z.number().int().positive().max(99999), name: z.string().min(1).max(150) });

export async function listAddressProvinces(): Promise<AddressLocation[]> {
  const { data } = await axios.get(`${baseURL}/`, options);
  return z.array(location.extend({ code: z.number().int().positive().max(99) })).max(100).parse(data)
    .map(item => ({ code: String(item.code).padStart(2, '0'), name: item.name }));
}

export async function listAddressWards(provinceCode: string): Promise<AddressLocation[]> {
  if (!/^\d{1,2}$/.test(provinceCode) || Number(provinceCode) < 1) throw new Error('Tỉnh/thành phố không hợp lệ.');
  const { data } = await axios.get(`${baseURL}/p/${Number(provinceCode)}?depth=2`, options);
  const province = z.object({ code: z.literal(Number(provinceCode)), wards: z.array(location).max(5000) }).parse(data);
  return province.wards.map(item => ({ code: String(item.code).padStart(5, '0'), name: item.name }));
}
