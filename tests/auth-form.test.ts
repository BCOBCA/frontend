import { describe, expect, it } from 'vitest';
import { createAuthSchema, registrationRequest } from '../src/components/auth/auth-form';

const valid = { fullName: 'Nguyễn An', identifier: 'an@example.com', password: 'StrongPassword123', confirmPassword: 'StrongPassword123' };

describe('registration form', () => {
  it('normalizes an optional referral code from the registration form', () => {
    const values = createAuthSchema(true).parse({ ...valid, referralCode: ' abc123 ' });
    expect(registrationRequest(values).referralCode).toBe('ABC123');
  });
  it('rejects referral codes longer than the server limit', () => {
    expect(createAuthSchema(true).safeParse({ ...valid, referralCode: 'A'.repeat(41) }).success).toBe(false);
  });
  it.each(['an@example.com', '0901234567', '+84901234567'])('accepts registration with %s', identifier => {
    expect(createAuthSchema(true).safeParse({ ...valid, identifier }).success).toBe(true);
  });

  it.each(['invalid', '123', 'abc@', '1234567890123456'])('rejects invalid identifier %s', identifier => {
    expect(createAuthSchema(true).safeParse({ ...valid, identifier }).success).toBe(false);
  });

  it('reports mismatched passwords on the confirmation field', () => {
    const result = createAuthSchema(true).safeParse({ ...valid, confirmPassword: 'OtherPassword123' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some(issue => issue.path[0] === 'confirmPassword')).toBe(true);
  });

  it('rejects empty confirmation and weak passwords', () => {
    expect(createAuthSchema(true).safeParse({ ...valid, confirmPassword: '' }).success).toBe(false);
    expect(createAuthSchema(true).safeParse({ ...valid, password: 'weak', confirmPassword: 'weak' }).success).toBe(false);
  });

  it('preserves login without a name or confirmation', () => {
    expect(createAuthSchema(false).safeParse({ identifier: '0901234567', password: 'existing', fullName: '', confirmPassword: '' }).success).toBe(true);
  });

  it('maps a trimmed email without sending confirmation or referral data', () => {
    const values = createAuthSchema(true).parse({ ...valid, identifier: ' AN@EXAMPLE.COM ', fullName: ' Nguyễn An ' });
    expect(registrationRequest(values)).toEqual({ email: 'an@example.com', phone: '', password: valid.password, fullName: 'Nguyễn An' });
  });

  it('maps a phone without fabricating an email', () => {
    expect(registrationRequest({ ...valid, identifier: '0901234567' })).toEqual({ email: '', phone: '0901234567', password: valid.password, fullName: valid.fullName });
  });
});
