export function voucherTitle(voucher: { discountType: string; discountValue: number }): string {
  const value = voucher.discountValue.toLocaleString('vi-VN');
  if (voucher.discountType === 'PERCENT') return `Giảm ${value}%`;
  return `Giảm ${value}đ${voucher.discountType === 'SHIPPING' ? ' phí giao hàng' : ''}`;
}
