import { expect, it } from 'vitest';
import { bankDetailsSchema, createWithdrawalAttempt, withdrawalMoney, withdrawalQuote, withdrawalResultUnknown } from '../src/components/affiliate/withdrawal';
const settings = { feeAmount: 5000.25, minimumAmount: 50000, maximumAmount: 50000000, revision: 'fee-revision' };
const wallet = { availableBalance: 100000, debtBalance: 0 };
it('validates and trims new bank details without accepting a masked or non-numeric number', () => {
  expect(bankDetailsSchema.parse({ bankName: ' Bank ', accountNumber: ' 123456789 ', accountHolder: ' USER NAME ' })).toEqual({ bankName: 'Bank', accountNumber: '123456789', accountHolder: 'USER NAME' });
  for (const accountNumber of ['****6789', '12345', '123abc456', '1'.repeat(35)]) expect(bankDetailsSchema.safeParse({ bankName: 'Bank', accountNumber, accountHolder: 'USER NAME' }).success).toBe(false);
});
it('subtracts the fee from gross amount using cents and shows the configured limits', () => {
  expect(withdrawalQuote('50000', wallet, settings)).toEqual({ amount: 50000, fee: 5000.25, net: 44999.75, withdrawable: 100000, error: null });
  expect(withdrawalMoney(5000.25)).toBe('5.000,25 VNĐ');
  expect(withdrawalQuote('50000', wallet, { ...settings, feeAmount: 0 }).net).toBe(50000);
});
it.each(['', '-50000', '5e4', '50.000', '50000.1', '9007199254740992'])('rejects invalid or unsafe withdrawal input %s', text => {
  expect(withdrawalQuote(text, wallet, settings).error).not.toBeNull();
});
it('rejects debt, missing policy, insufficient balance and out-of-range amounts', () => {
  expect(withdrawalQuote('50000', wallet).error).not.toBeNull();
  expect(withdrawalQuote('50000', { ...wallet, debtBalance: 1 }, settings).withdrawable).toBe(0);
  expect(withdrawalQuote('49999', wallet, settings).error).toContain('tối thiểu');
  expect(withdrawalQuote('50000001', wallet, settings).error).toContain('tối đa');
  expect(withdrawalQuote('100001', wallet, settings).error).toContain('không đủ');
});
it('creates a retryable attempt with the reviewed revision and immutable fee snapshot', () => {
  const payload = { amount: 50000, bankAccountId: 'own-bank', expectedConfigurationRevision: 'current' };
  const attempt = createWithdrawalAttempt(payload, settings.feeAmount);
  expect(attempt.payload).toEqual(payload); expect(attempt.key).toMatch(/^withdraw-/); expect(attempt.netAmount).toBe(44999.75);
  expect(withdrawalResultUnknown(new Error('Network lost'))).toBe(true);
  expect(withdrawalResultUnknown({ isAxiosError: true, response: { status: 409 } })).toBe(false);
  expect(withdrawalResultUnknown({ isAxiosError: true, response: { status: 500 } })).toBe(true);
});
