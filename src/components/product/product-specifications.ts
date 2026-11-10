import type { Brand, Product, Variant } from '../../types/api';
import { variantAttributes } from './variant-options';

type Row = { key: string; label: string; value: string };
export type DisplaySpecificationGroup = { name: string; rows: Row[] };
const marker = '\n\nTHÔNG SỐ KỸ THUẬT\n';
const labels: Record<string, string> = { color: 'Màu sắc', ram: 'RAM', storage: 'Bộ nhớ trong', size: 'Kích thước', configuration: 'Cấu hình', capacity: 'Dung tích', power: 'Công suất' };
const legacyKeys: Record<string, string> = { 'ram': 'ram', 'màu sắc': 'color', 'bộ nhớ trong': 'storage', 'dung lượng': 'storage', 'kích thước': 'size' };

export function productDescription(product: Product): string {
  const description = product.description.replace(/\r\n?/g, '\n');
  const start = description.indexOf(marker);
  return (start < 0 ? description : description.slice(0, start)).trim();
}

function legacyGroups(product: Product): DisplaySpecificationGroup[] {
  const description = product.description.replace(/\r\n?/g, '\n');
  const start = description.indexOf(marker);
  if (start < 0) return [];
  const groups: DisplaySpecificationGroup[] = [];
  let group: DisplaySpecificationGroup = { name: 'Thông số kỹ thuật', rows: [] };
  for (const line of description.slice(start + marker.length).split('\n').map(s => s.trim()).filter(Boolean)) {
    if (line.startsWith('[') && line.endsWith(']')) {
      if (group.rows.length) groups.push(group);
      group = { name: line.slice(1, -1), rows: [] };
      continue;
    }
    const colon = line.indexOf(':');
    if (colon <= 0) continue;
    const label = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    const normalized = label.toLowerCase();
    const key = Object.hasOwn(legacyKeys, normalized) ? legacyKeys[normalized] : `legacy:${group.name}:${label}`;
    if (value) group.rows.push({ key, label, value });
  }
  if (group.rows.length) groups.push(group);
  return groups;
}

export function productSpecificationGroups(product: Product, variant?: Variant, brand?: Brand): DisplaySpecificationGroup[] {
  const selected = variant ? variantAttributes(variant) : {};
  const structured = (product.specifications ?? []).map(group => ({ name: group.name, rows: group.items.flatMap(item => {
    const value = item.value;
    if (value === null || !['string', 'number', 'boolean'].includes(typeof value) || typeof value === 'string' && !value.trim()) return [];
    const formatted = typeof value === 'boolean' ? value ? 'Có' : 'Không' : typeof value === 'number' ? value.toLocaleString('vi-VN') : String(value);
    return [{ key: item.key, label: item.label, value: item.unit ? `${formatted} ${item.unit}` : formatted }];
  }) }));
  const source = structured.some(group => group.rows.length) ? structured : legacyGroups(product);
  const groups = source.map(group => ({ ...group, rows: group.rows.filter(row => !Object.hasOwn(selected, row.key)) })).filter(group => group.rows.length);
  const options = Object.entries(selected).map(([key, value]) => ({ key, label: Object.hasOwn(labels, key) ? labels[key] : key, value }));
  if (options.length) groups.push({ name: 'Phiên bản đang chọn', rows: options });
  const identity: Row[] = [];
  if (brand?.name) identity.push({ key: 'brand', label: 'Thương hiệu', value: brand.name });
  if (product.sku) identity.push({ key: 'sku', label: 'Mã sản phẩm', value: product.sku });
  if (identity.length) groups.push({ name: 'Thông tin sản phẩm', rows: identity });
  return groups;
}
