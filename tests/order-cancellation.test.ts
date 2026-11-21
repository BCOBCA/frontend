import { expect, it } from 'vitest';
import { buyerCancellationReason, buyerCancellationReasons } from '../src/services/order-cancellation';

it.each(buyerCancellationReasons)('accepts and trims the listed buyer reason %s', reason => {
  expect(buyerCancellationReason(` ${reason} `)).toBe(reason);
});
it.each(['', '   ', 'OTHER', 'Hết hàng'])('rejects missing, custom or seller reasons %j', reason => {
  expect(() => buyerCancellationReason(reason)).toThrow();
});
