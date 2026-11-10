import { describe, expect, it } from 'vitest';
import { productDescription, productSpecificationGroups } from '../src/components/product/product-specifications';
import type { Product, Variant } from '../src/types/api';

const product = { name: 'Phone', description: 'Mô tả sản phẩm', specifications: [{ name: 'Màn hình', items: [{ key: 'screen_size', label: 'Kích thước màn hình', value: 6.1, unit: 'inch' }] }, { name: 'Âm thanh', items: [{ key: 'stereo', label: 'Loa stereo', value: true }] }] } as Product;
const variant = { id: 'v', sku: 'SKU-1', name: 'Đen / 128 GB', attributes: { color: 'Đen', storage: '128 GB', ram: '8 GB' } } as Variant;

describe('category-driven specifications', () => {
  it('formats typed values and units without hardcoding product models', () => {
    const groups = productSpecificationGroups(product, variant);
    expect(groups[0].rows[0].value).toBe('6,1 inch');
    expect(groups[1].rows[0].value).toBe('Có');
    expect(groups.flatMap(g => g.rows)).toContainEqual({ key: 'ram', label: 'RAM', value: '8 GB' });
    expect(groups.flatMap(g => g.rows).some(row => row.key === 'sku')).toBe(false);
  });
  it('keeps the product SKU when selecting different variants', () => {
    const item = { ...product, sku: 'PRODUCT-SKU' };
    for (const selected of [undefined, variant, { ...variant, sku: 'OTHER-VARIANT-SKU' }]) {
      const rows = productSpecificationGroups(item, selected).flatMap(group => group.rows);
      expect(rows.filter(row => row.key === 'sku')).toEqual([{ key: 'sku', label: 'Mã sản phẩm', value: 'PRODUCT-SKU' }]);
    }
  });
  it('uses the selected variant when it overrides a common property', () => {
    const groups = productSpecificationGroups({ ...product, specifications: [{ name: 'Hiệu năng', items: [{ key: 'ram', label: 'RAM', value: '4 GB' }] }] }, variant);
    const ram = groups.flatMap(g => g.rows).filter(r => r.key === 'ram');
    expect(ram).toEqual([{ key: 'ram', label: 'RAM', value: '8 GB' }]);
  });
  it('supports clothes and general items through the same structure', () => {
    const groups = productSpecificationGroups({ ...product, specifications: [{ name: 'Chất liệu và sử dụng', items: [{ key: 'material', label: 'Chất liệu', value: 'Cotton' }, { key: 'washable', label: 'Giặt máy', value: false }] }] });
    expect(groups[0].rows.map(r => r.value)).toEqual(['Cotton', 'Không']);
  });
  it('reads the legacy API description section without repeating it in the description', () => {
    const old = { ...product, specifications: undefined, description: 'Mô tả sản phẩm\n\nTHÔNG SỐ KỸ THUẬT\n[Màn hình]\nMàn hình: OLED\n[Pin]\nDung lượng pin: 3.400 mAh' };
    expect(productDescription(old)).toBe('Mô tả sản phẩm');
    expect(productSpecificationGroups(old)[1].rows[0].value).toBe('3.400 mAh');
  });
  it('preserves zero/false and skips empty metadata', () => {
    const groups = productSpecificationGroups({ ...product, specifications: [{ name: 'Thông số', items: [{ key: 'zero', label: 'Giá trị', value: 0 }, { key: 'empty', label: 'Trống', value: null }] }] });
    expect(groups[0].rows).toEqual([{ key: 'zero', label: 'Giá trị', value: '0' }]);
  });
});
