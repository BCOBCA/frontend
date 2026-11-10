import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applyCartOperation, canSelectCartItem, cartGroupSelection, groupCartItems } from '../src/services/cart';
import type { CartItem } from '../src/types/api';

const api = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('../src/services/api', () => api);
const line = (overrides: Partial<CartItem> = {}): CartItem => ({ id: 'line-1', productId: 'p1', variantId: 'v1', brandId: 'brand', brandName: 'Brand', storeId: 'store-1', storeName: 'Phong Vũ', name: 'Tai nghe', variantName: 'Màu trắng', imageUrl: '', unitPrice: 100000, quantity: 2, availableStock: 5, isSelected: false, isAvailable: true, ...overrides });
beforeEach(() => api.request.mockReset().mockResolvedValue({}));

describe('cart vendor groups', () => {
  it('groups by store identity without merging stores with the same name', () => {
    const groups = groupCartItems([line(), line({ id: 'line-2', brandId: 'other-brand' }), line({ id: 'line-3', storeId: 'store-2' })]);
    expect(groups).toHaveLength(2);
    expect(groups[0].items.map(item => item.id)).toEqual(['line-1', 'line-2']);
    expect(groups[0].name).toBe('Phong Vũ');
  });
  it('uses brand identity and names for legacy items without a store', () => {
    const groups = groupCartItems([line({ storeId: null, storeName: null }), line({ id: 'line-2', storeId: null, storeName: null, brandId: 'b2', brandName: 'Brand 2' })]);
    expect(groups.map(group => group.name)).toEqual(['Brand', 'Brand 2']);
  });
  it('tracks checked/mixed states and ignores unselected unavailable stock', () => {
    expect(cartGroupSelection([line()])).toBe(false);
    expect(cartGroupSelection([line({ isSelected: true }), line({ id: 'two' })])).toBe('mixed');
    expect(cartGroupSelection([line({ isSelected: true }), line({ id: 'two', isAvailable: false })])).toBe(true);
    expect(canSelectCartItem(line({ quantity: 6 }))).toBe(false);
  });
});

describe('cart updates', () => {
  it('changes quantity while preserving row selection', async () => {
    await applyCartOperation({ type: 'quantity', item: line({ isSelected: true }), quantity: 3 });
    expect(api.request).toHaveBeenCalledWith('PUT', '/cart/items/line-1', { quantity: 3, isSelected: true });
  });
  it('selects only eligible changed lines in the requested group', async () => {
    await applyCartOperation({ type: 'group', selected: true, items: [line(), line({ id: 'already', isSelected: true }), line({ id: 'off', isAvailable: false }), line({ id: 'low-stock', availableStock: 1 })] });
    expect(api.request).toHaveBeenCalledTimes(1);
    expect(api.request).toHaveBeenCalledWith('PUT', '/cart/items/line-1', { quantity: 2, isSelected: true });
  });
  it('allows clearing selected unavailable or out-of-stock rows', async () => {
    await applyCartOperation({ type: 'group', selected: false, items: [line({ isSelected: true, isAvailable: false, availableStock: 0 })] });
    expect(api.request).toHaveBeenCalledWith('PUT', '/cart/items/line-1', { quantity: 2, isSelected: false });
  });
  it('rejects invalid quantities without requesting the API', async () => {
    for (const quantity of [0, -1, 1.5, 1000, NaN]) await expect(applyCartOperation({ type: 'quantity', item: line(), quantity })).rejects.toThrow();
    expect(api.request).not.toHaveBeenCalled();
  });
  it('propagates a partial group failure before attempting further changes', async () => {
    api.request.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('offline'));
    await expect(applyCartOperation({ type: 'group', selected: true, items: [line(), line({ id: 'two' }), line({ id: 'three' })] })).rejects.toThrow('offline');
    expect(api.request).toHaveBeenCalledTimes(2);
  });
  it('uses the existing delete endpoint for a line', async () => {
    await applyCartOperation({ type: 'remove', item: line() });
    expect(api.request).toHaveBeenCalledWith('DELETE', '/cart/items/line-1');
  });
});
