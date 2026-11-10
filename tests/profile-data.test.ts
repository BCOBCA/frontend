import { describe, expect, it } from 'vitest';
import { profileDate, profileSchema, profileValues, referrerLabel } from '../src/components/profile/profile-data';
import type { Profile } from '../src/types/api';

const user = { id: 'user', fullName: 'Nguyễn An', nickname: '', phone: '', referralCode: 'ABC123', referredByUserId: null } as Profile;
describe('personal profile values', () => {
  it('keeps missing demographic/date metadata explicitly empty', () => {
    expect(profileValues(user)).toMatchObject({ gender: 0, dateOfBirth: '', nickname: '' });
    expect(profileDate(null)).toBe('—');
    expect(profileDate('0001-01-01')).toBe('—');
  });
  it('formats birthdays without a timezone shift and timestamps in Vietnam time', () => {
    expect(profileDate('2000-02-29')).toBe('29/02/2000');
    expect(profileDate('2026-11-09T00:42:13Z', true)).toBe('09/11/2026 07:42:13');
    expect(profileDate('invalid')).toBe('—');
  });
  it('validates real calendar dates, gender and contact input', () => {
    const values = profileValues(user);
    expect(profileSchema.safeParse({ ...values, dateOfBirth: '2000-02-29', gender: 1 }).success).toBe(true);
    for (const patch of [{ dateOfBirth: '2001-02-29' }, { dateOfBirth: '2099-01-01' }, { dateOfBirth: '01/01/2000' }, { gender: 8 }, { phone: 'bad phone' }]) expect(profileSchema.safeParse({ ...values, ...patch }).success).toBe(false);
  });
  it('uses public referrer labels without exposing private IDs or invented names', () => {
    expect(referrerLabel(user)).toBe('Chưa có');
    expect(referrerLabel({ ...user, referredByUserId: undefined })).toBe('Chưa có thông tin');
    expect(referrerLabel({ ...user, referredByUserId: 'private-user-id' })).toBe('Đã có người giới thiệu');
    expect(referrerLabel({ ...user, referredByUserId: 'private-user-id', referrerNickname: 'Tên công khai' })).toBe('Tên công khai');
  });
});
