import { describe, expect, it } from 'vitest';
import { selectCheckoutVoucher } from '../src/services/checkout-vouchers';
import type { CheckoutVoucher } from '../src/types/api';
const option = (code: string, discountType = 'FIXED', isEligible = true): CheckoutVoucher => ({ id: code, code, name: code, description: '', discountType, discountValue: 10000, maxDiscount: null, minOrderAmount: 100000, expiresAt: '2027-01-01', discountAmount: 10000, isEligible, reason: isEligible ? null : 'Không đủ điều kiện' });
const vouchers = [option('PRODUCT1'), option('PRODUCT2'), option('SHIP1', 'SHIPPING'), option('SHIP2', 'SHIPPING'), option('EXPIRED', 'FIXED', false)];
describe('checkout voucher selections', () => {
  it('replaces the product slot and preserves shipping', () => expect(selectCheckoutVoucher(vouchers, ['PRODUCT1', 'SHIP1'], 'product', 'PRODUCT2')).toEqual(['PRODUCT2', 'SHIP1']));
  it('replaces shipping without stacking the same category', () => expect(selectCheckoutVoucher(vouchers, ['PRODUCT1', 'SHIP1'], 'shipping', 'SHIP2')).toEqual(['PRODUCT1', 'SHIP2']));
  it('can explicitly clear either category', () => {
    expect(selectCheckoutVoucher(vouchers, ['PRODUCT1', 'SHIP1'], 'product', null)).toEqual(['SHIP1']);
    expect(selectCheckoutVoucher(vouchers, ['PRODUCT1', 'SHIP1'], 'shipping', null)).toEqual(['PRODUCT1']);
  });
  it.each(['EXPIRED', 'UNKNOWN', 'SHIP1'])('rejects ineligible, unowned or wrong-category product %s', code => expect(() => selectCheckoutVoucher(vouchers, [], 'product', code)).toThrow());
});
