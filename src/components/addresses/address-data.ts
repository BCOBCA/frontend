import { z } from 'zod';

export const addressSchema = z.object({
  recipientName: z.string().trim().min(2, 'Nhập họ và tên người nhận từ 2 ký tự.').max(150, 'Họ và tên không quá 150 ký tự.'),
  phone: z.string().trim().regex(/^\+?[0-9]{9,15}$/, 'Nhập số điện thoại hợp lệ từ 9 đến 15 chữ số.'),
  provinceCode: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố.').max(20),
  wardCode: z.string().min(1, 'Vui lòng chọn phường/xã.').max(20),
  addressLine: z.string().trim().min(3, 'Nhập số nhà, tên đường hoặc địa chỉ chi tiết.').max(1000, 'Địa chỉ không quá 1.000 ký tự.'),
  isDefault: z.boolean(),
});
export type AddressValues = z.infer<typeof addressSchema>;

export function addressDefaults(user?: { fullName: string; phone: string } | null): AddressValues {
  return { recipientName: user?.fullName ?? '', phone: user?.phone ?? '', provinceCode: '', wardCode: '', addressLine: '', isDefault: false };
}
