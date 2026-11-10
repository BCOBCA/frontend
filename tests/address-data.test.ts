import { describe, expect, it } from 'vitest';
import { addressDefaults, addressSchema } from '../src/components/addresses/address-data';

describe('shipping address form', () => {
  it('prefills recipient details and leaves location selection empty', () => {
    expect(addressDefaults({ fullName: 'Nguyễn An', phone: '0912345678' })).toEqual({ recipientName: 'Nguyễn An', phone: '0912345678', provinceCode: '', wardCode: '', addressLine: '', isDefault: false });
  });
  it('keeps the backend contract and trims recipient and address details', () => {
    expect(addressSchema.parse({ ...addressDefaults(), recipientName: ' Nguyễn An ', phone: '0912345678', provinceCode: '01', wardCode: '00004', addressLine: ' 12 phố Đội Cấn ', isDefault: true })).toEqual({ recipientName: 'Nguyễn An', phone: '0912345678', provinceCode: '01', wardCode: '00004', addressLine: '12 phố Đội Cấn', isDefault: true });
  });
  it('reports missing or invalid required fields in Vietnamese', () => {
    const result = addressSchema.safeParse({ ...addressDefaults(), recipientName: ' ', phone: 'abc', addressLine: ' ' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map(issue => issue.path[0])).toEqual(expect.arrayContaining(['recipientName', 'phone', 'provinceCode', 'wardCode', 'addressLine']));
      expect(result.error.issues.every(issue => !issue.message.includes('Invalid'))).toBe(true);
    }
  });
});
