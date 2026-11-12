import { isAxiosError } from 'axios';
import { z } from 'zod';
import type { Affiliate } from '../../types/api';

export type WithdrawalSettings = { feeAmount: number; minimumAmount: number; maximumAmount: number; revision: string };
export type AffiliateBankAccount = { id: string; bankName: string; accountNumber: string; accountHolder: string };
export type BankDetails = { bankName: string; accountNumber: string; accountHolder: string };
export const bankDetailsSchema = z.object({
  bankName: z.string().trim().min(2, 'Nhập tên ngân hàng').max(150, 'Tên ngân hàng quá dài'),
  accountNumber: z.string().trim().regex(/^[0-9]{6,34}$/, 'Số tài khoản phải gồm 6–34 chữ số'),
  accountHolder: z.string().trim().min(2, 'Nhập tên chủ tài khoản').max(150, 'Tên chủ tài khoản quá dài'),
});
export type WithdrawalPayload = { amount: number; bankAccountId: string; expectedConfigurationRevision: string };
export type WithdrawalAttempt = { key: string; payload: WithdrawalPayload; feeAmount: number; netAmount: number };
export const withdrawalMoney = (amount: number) => `${amount.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} VNĐ`;

export function withdrawalQuote(text: string, wallet?: Pick<Affiliate, 'availableBalance' | 'debtBalance'>, settings?: WithdrawalSettings) {
  const parsed = /^\d+$/.test(text) ? Number(text) : NaN;
  const validAmount = Number.isSafeInteger(parsed * 100) && parsed > 0;
  const amount = validAmount ? parsed : 0;
  const fee = settings?.feeAmount ?? 0;
  const net = Math.max(0, (Math.round(amount * 100) - Math.round(fee * 100)) / 100);
  const withdrawable = wallet && settings ? wallet.debtBalance > 0 ? 0 : Math.max(0, Math.min(wallet.availableBalance, settings.maximumAmount)) : null;
  let error: string | null = null;
  if (!wallet || !settings) error = 'Chưa tải đủ số dư và cấu hình rút tiền.';
  else if (wallet.debtBalance > 0) error = `Cần cấn trừ ${withdrawalMoney(wallet.debtBalance)} trước khi rút tiền.`;
  else if (!validAmount) error = 'Nhập số tiền rút hợp lệ, chỉ gồm chữ số.';
  else if (amount < settings.minimumAmount) error = `Số tiền rút tối thiểu là ${withdrawalMoney(settings.minimumAmount)}.`;
  else if (amount > settings.maximumAmount) error = `Mỗi lần rút tối đa ${withdrawalMoney(settings.maximumAmount)}.`;
  else if (amount > wallet.availableBalance) error = 'Số dư khả dụng không đủ.';
  else if (net <= 0) error = 'Số tiền rút phải lớn hơn phí rút tiền.';
  return { amount, fee, net, withdrawable, error };
}

export function createWithdrawalAttempt(payload: WithdrawalPayload, feeAmount: number): WithdrawalAttempt {
  return { key: `withdraw-${Date.now()}-${Math.random().toString(36).slice(2)}`, payload, feeAmount, netAmount: (Math.round(payload.amount * 100) - Math.round(feeAmount * 100)) / 100 };
}

export function withdrawalResultUnknown(error: unknown) {
  return !isAxiosError(error) || !error.response || error.response.status >= 500;
}
