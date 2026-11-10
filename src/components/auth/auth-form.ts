import { z } from 'zod';

const phonePattern = /^\+?[0-9]{9,15}$/;

export function createAuthSchema(register: boolean) {
  return z.object({
    identifier: z.string().trim().min(3, 'Nhập email hoặc số điện thoại').max(255),
    password: z.string().min(1, 'Nhập mật khẩu').max(128),
    fullName: z.string().trim(),
    confirmPassword: z.string(),
    referralCode: z.string().trim().max(40, 'Mã giới thiệu tối đa 40 ký tự').optional(),
  }).superRefine((value, ctx) => {
    if (!register) return;
    if (!z.email().safeParse(value.identifier).success && !phonePattern.test(value.identifier)) ctx.addIssue({ code: 'custom', path: ['identifier'], message: 'Email hoặc số điện thoại không hợp lệ' });
    if (value.fullName.length < 2 || value.fullName.length > 150) ctx.addIssue({ code: 'custom', path: ['fullName'], message: 'Họ tên từ 2 đến 150 ký tự' });
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{12,128}$/.test(value.password)) ctx.addIssue({ code: 'custom', path: ['password'], message: 'Tối thiểu 12 ký tự, có chữ hoa, chữ thường và số' });
    if (!value.confirmPassword || value.confirmPassword !== value.password) ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Mật khẩu xác nhận không khớp' });
  });
}

export type AuthFormValues = z.infer<ReturnType<typeof createAuthSchema>>;

export function registrationRequest(values: AuthFormValues) {
  const isPhone = phonePattern.test(values.identifier);
  return { email: isPhone ? '' : values.identifier.toLowerCase(), phone: isPhone ? values.identifier : '', password: values.password, fullName: values.fullName, ...(values.referralCode ? { referralCode: values.referralCode.toUpperCase() } : {}) };
}
