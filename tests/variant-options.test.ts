import { describe, expect, it } from 'vitest';
import { variantAttributes, variantGroups, selectVariantOption } from '../src/components/product/variant-options';
import type { Variant } from '../src/types/api';

const make = (id: string, color: string, storage: string, availableStock = 2): Variant => ({ id, name: `${color} / ${storage}`, sku: id, price: 100, salePrice: null, availableStock, attributes: { color, storage } });
const variants = [make('a', 'Bạc', '128 GB'), make('b', 'Bạc', '256 GB'), make('c', 'Đen', '256 GB'), make('d', 'Đỏ', '128 GB', 0)];

describe('variant options', () => {
  it('groups phone colors/storage and clothing colors/sizes independently', () => {
    expect(variantGroups(variants)).toEqual([{ key: 'color', label: 'Màu sắc', values: ['Bạc', 'Đen', 'Đỏ'] }, { key: 'storage', label: 'Dung lượng', values: ['128 GB', '256 GB'] }]);
    expect(variantGroups([{ ...variants[0], attributes: { color: 'Trắng', size: 'M' } }]).map(g => g.label)).toEqual(['Màu sắc', 'Kích thước']);
  });
  it('preserves other options when the exact combination exists', () => {
    expect(selectVariantOption(variants, variants[1], 'color', 'Đen')?.id).toBe('c');
    expect(selectVariantOption(variants, variants[0], 'storage', '256 GB')?.id).toBe('b');
  });
  it('resolves missing combinations to a real available variant', () => {
    expect(selectVariantOption(variants, variants[0], 'color', 'Đen')?.id).toBe('c');
    expect(selectVariantOption(variants, variants[0], 'color', 'Đỏ')).toBeUndefined();
    expect(selectVariantOption(variants, variants[0], 'storage', '512 GB')).toBeUndefined();
  });
  it('reads explicitly labeled legacy demo options without guessing names', () => {
    expect(variantAttributes({ ...variants[0], attributes: undefined, name: '[Mẫu] Màu sắc: Bạc · Dung lượng: 128 GB' })).toEqual({ color: 'Bạc', storage: '128 GB' });
    expect(variantAttributes({ ...variants[0], attributes: undefined, name: 'Phiên bản mẫu' })).toEqual({});
  });
  it('separates RAM from storage with both structured and legacy API data', () => {
    const name = '[Mẫu] Màu sắc: Bạc · Dung lượng: 128 GB · RAM: 6 GB';
    const phone = { ...variants[0], name, attributes: undefined };
    expect(variantAttributes(phone)).toEqual({ color: 'Bạc', storage: '128 GB', ram: '6 GB' });
    expect(variantGroups([{ ...phone, attributes: { color: 'Bạc', storage: '128 GB', ram: '6 GB' } }]).find(g => g.key === 'ram')).toEqual({ key: 'ram', label: 'RAM', values: ['6 GB'] });
  });
  it('handles malformed data and uses a flat selector for mixed attribute schemas', () => {
    expect(variantAttributes({ ...variants[0], attributes: '{broken' })).toEqual({});
    expect(variantAttributes({ ...variants[0], attributes: { color: 'Bạc', nested: {}, isSample: true } })).toEqual({ color: 'Bạc' });
    expect(variantGroups([...variants, { ...variants[0], id: 'legacy', attributes: undefined }])).toEqual([]);
  });
});
