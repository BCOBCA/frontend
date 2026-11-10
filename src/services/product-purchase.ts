import type { Cart } from '../types/api';
import { request } from './api';

export async function prepareProductCheckout(productId: string, variantId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) throw new Error('Số lượng phải từ 1 đến 999.');
  const before = await request<Cart>('GET', '/cart');
  const existing = before.items.find(item => item.productId === productId && item.variantId === variantId);
  if (existing) await request('PUT', `/cart/items/${existing.id}`, { quantity, isSelected: true });
  else await request('POST', '/cart/items', { productId, variantId, quantity });
  const cart = await request<Cart>('GET', '/cart');
  for (const item of cart.items) {
    if (item.isSelected && (item.productId !== productId || item.variantId !== variantId)) {
      await request('PUT', `/cart/items/${item.id}`, { quantity: item.quantity, isSelected: false });
    }
  }
  const verified = await request<Cart>('GET', '/cart');
  const selected = verified.items.filter(item => item.isSelected);
  if (selected.length !== 1 || selected[0].productId !== productId || selected[0].variantId !== variantId || selected[0].quantity !== quantity || !selected[0].isAvailable) {
    throw new Error('Giỏ hàng đã thay đổi. Vui lòng kiểm tra lại trước khi thanh toán.');
  }
}
