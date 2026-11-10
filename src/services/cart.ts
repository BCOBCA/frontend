import { request } from './api';
import type { CartItem } from '../types/api';

export type CartGroup = { key: string; name: string; items: CartItem[] };
export type CartOperation =
  | { type: 'quantity'; item: CartItem; quantity: number }
  | { type: 'selection'; item: CartItem; selected: boolean }
  | { type: 'remove'; item: CartItem }
  | { type: 'group'; items: CartItem[]; selected: boolean };

export function canSelectCartItem(item: CartItem): boolean {
  return item.isAvailable && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 999 && item.quantity <= item.availableStock;
}

export function groupCartItems(items: CartItem[]): CartGroup[] {
  const groups = new Map<string, CartGroup>();
  for (const item of items) {
    const key = item.storeId ? `store:${item.storeId}` : `brand:${item.brandId}`;
    let group = groups.get(key);
    if (!group) {
      group = { key, name: item.storeName?.trim() || item.brandName?.trim() || 'Nhà bán hàng', items: [] };
      groups.set(key, group);
    }
    group.items.push(item);
  }
  return [...groups.values()];
}

export function cartGroupSelection(items: CartItem[]): boolean | 'mixed' {
  const candidates = items.filter(item => item.isSelected || canSelectCartItem(item));
  if (!candidates.length || candidates.every(item => !item.isSelected)) return false;
  return candidates.every(item => item.isSelected) ? true : 'mixed';
}

async function update(item: CartItem, quantity: number, selected: boolean) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) throw new Error('Số lượng phải từ 1 đến 999.');
  if (selected && quantity > item.availableStock) throw new Error('Số lượng vượt quá tồn kho hiện có.');
  await request('PUT', `/cart/items/${encodeURIComponent(item.id)}`, { quantity, isSelected: selected });
}

export async function applyCartOperation(operation: CartOperation): Promise<void> {
  switch (operation.type) {
    case 'remove':
      await request('DELETE', `/cart/items/${encodeURIComponent(operation.item.id)}`);
      return;
    case 'quantity':
      await update(operation.item, operation.quantity, operation.item.isSelected);
      return;
    case 'selection':
      if (operation.selected && !canSelectCartItem(operation.item)) throw new Error('Sản phẩm không còn khả dụng hoặc không đủ tồn kho.');
      await update(operation.item, operation.item.quantity, operation.selected);
      return;
    case 'group':
      for (const item of operation.items) {
        if (item.isSelected === operation.selected || operation.selected && !canSelectCartItem(item)) continue;
        await update(item, item.quantity, operation.selected);
      }
  }
}
