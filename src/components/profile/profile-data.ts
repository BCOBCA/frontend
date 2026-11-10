import { z } from 'zod';
import type { Profile } from '../../types/api';

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Họ tên từ 2 ký tự').max(150),
  nickname: z.string().trim().max(100),
  phone: z.string().regex(/^$|^\+?[0-9]{9,15}$/, 'Số điện thoại không hợp lệ'),
  gender: z.number().int().min(0).max(2),
  dateOfBirth: z.string().refine(value => {
    if (!value) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01' || value > new Date().toISOString().slice(0, 10)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Ngày sinh không hợp lệ hoặc nằm trong tương lai'),
});
export type ProfileValues = z.infer<typeof profileSchema>;
export function profileValues(user: Profile): ProfileValues {
  return { fullName: user.fullName, nickname: user.nickname ?? '', phone: user.phone, gender: user.gender ?? 0, dateOfBirth: user.dateOfBirth ?? '' };
}
export function profileDate(value?: string | null, time = false): string {
  if (!value || value.startsWith('0001-')) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split('-').reverse().join('/');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const formatted = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(date);
  return time ? `${formatted} ${new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' }).format(date)}` : formatted;
}
export function referrerLabel(user: Profile): string { return user.referredByUserId === undefined ? 'Chưa có thông tin' : user.referredByUserId ? user.referrerNickname || 'Đã có người giới thiệu' : 'Chưa có'; }
