import { request } from './api';
import type { Address } from '../types/api';

export function setDefaultAddress(address: Address): Promise<Address> {
  const { recipientName, phone, provinceCode, wardCode, addressLine } = address;
  return request<Address>('PUT', `/addresses/${encodeURIComponent(address.id)}`, { recipientName, phone, provinceCode, wardCode, addressLine, isDefault: true });
}
