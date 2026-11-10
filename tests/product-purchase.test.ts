import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prepareProductCheckout } from '../src/services/product-purchase';

const request = vi.hoisted(() => vi.fn());
vi.mock('../src/services/api', () => ({ request }));
const target = { id: 'target', productId: 'product', variantId: 'variant', quantity: 2, isSelected: true, isAvailable: true };
const other = { id: 'other', productId: 'other-product', variantId: 'other-variant', quantity: 3, isSelected: true, isAvailable: true };
beforeEach(() => request.mockReset());

describe('product buy now', () => {
  it('rejects invalid quantities before touching the cart', async () => {
    for (const quantity of [0, -1, 1.5, 1000]) await expect(prepareProductCheckout('product', 'variant', quantity)).rejects.toThrow('Số lượng');
    expect(request).not.toHaveBeenCalled();
  });
  it('adds the requested SKU and leaves other rows unselected before checkout', async () => {
    request.mockResolvedValueOnce({ items: [other] }).mockResolvedValueOnce({}).mockResolvedValueOnce({ items: [target, other] }).mockResolvedValueOnce({}).mockResolvedValueOnce({ items: [target, { ...other, isSelected: false }] });
    await prepareProductCheckout('product', 'variant', 2);
    expect(request).toHaveBeenCalledWith('POST', '/cart/items', { productId: 'product', variantId: 'variant', quantity: 2 });
    expect(request).toHaveBeenCalledWith('PUT', '/cart/items/other', { quantity: 3, isSelected: false });
    expect(request).not.toHaveBeenCalledWith('DELETE', expect.anything());
  });
  it('sets an existing SKU to the requested quantity instead of adding again', async () => {
    request.mockResolvedValueOnce({ items: [{ ...target, quantity: 5 }] }).mockResolvedValueOnce({}).mockResolvedValueOnce({ items: [target] }).mockResolvedValueOnce({ items: [target] });
    await prepareProductCheckout('product', 'variant', 2);
    expect(request).toHaveBeenCalledWith('PUT', '/cart/items/target', { quantity: 2, isSelected: true });
    expect(request.mock.calls.some(call => call[0] === 'POST')).toBe(false);
  });
  it('stops checkout when the cart changed or the target is unavailable', async () => {
    request.mockResolvedValueOnce({ items: [target] }).mockResolvedValueOnce({}).mockResolvedValueOnce({ items: [target] }).mockResolvedValueOnce({ items: [{ ...target, isAvailable: false }] });
    await expect(prepareProductCheckout('product', 'variant', 2)).rejects.toThrow('Giỏ hàng');
  });
});
