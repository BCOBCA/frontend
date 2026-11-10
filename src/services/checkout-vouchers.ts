import type { CheckoutVoucher } from '../types/api';

export type CheckoutVoucherCategory = 'product' | 'shipping';
export const checkoutVoucherCategory = (voucher: CheckoutVoucher): CheckoutVoucherCategory => voucher.discountType === 'SHIPPING' ? 'shipping' : 'product';

export function selectCheckoutVoucher(vouchers: CheckoutVoucher[], selectedCodes: string[], category: CheckoutVoucherCategory, code: string | null): string[] {
  const chosen = code === null ? null : vouchers.find(item => item.code === code && item.isEligible && checkoutVoucherCategory(item) === category);
  if (code !== null && !chosen) throw new Error('Voucher không khả dụng cho lựa chọn này.');
  const other = vouchers.find(item => item.isEligible && selectedCodes.includes(item.code) && checkoutVoucherCategory(item) !== category);
  return [chosen, other].filter((item): item is CheckoutVoucher => !!item).sort((a, b) => Number(checkoutVoucherCategory(a) === 'shipping') - Number(checkoutVoucherCategory(b) === 'shipping')).map(item => item.code);
}
