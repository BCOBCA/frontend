import type { CheckoutVoucher } from '../types/api';

export type CheckoutVoucherCategory = 'product' | 'shipping' | `store:${string}`;
export const checkoutVoucherCategory = (voucher: CheckoutVoucher): CheckoutVoucherCategory => voucher.storeId ? `store:${voucher.storeId}` : voucher.discountType === 'SHIPPING' ? 'shipping' : 'product';

export function selectCheckoutVoucher(vouchers: CheckoutVoucher[], selectedCodes: string[], category: CheckoutVoucherCategory, code: string | null): string[] {
  const chosen = code === null ? null : vouchers.find(item => item.code === code && item.isEligible && checkoutVoucherCategory(item) === category);
  if (code !== null && !chosen) throw new Error('Voucher không khả dụng cho lựa chọn này.');
  const others = vouchers.filter(item => selectedCodes.includes(item.code) && checkoutVoucherCategory(item) !== category);
  return [...(chosen ? [chosen] : []), ...others].sort((a, b) => Number(checkoutVoucherCategory(a) === 'shipping') - Number(checkoutVoucherCategory(b) === 'shipping')).map(item => item.code);
}
