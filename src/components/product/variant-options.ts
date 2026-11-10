import type { Variant } from '../../types/api';

const labels: Record<string, string> = { color: 'Màu sắc', storage: 'Dung lượng', size: 'Kích thước', ram: 'RAM', configuration: 'Cấu hình', capacity: 'Dung tích', power: 'Công suất' };
const aliases: Record<string, string> = { 'màu sắc': 'color', 'màu': 'color', colour: 'color', 'dung lượng': 'storage', 'kích thước': 'size', ram: 'ram', 'cấu hình': 'configuration', 'dung tích': 'capacity', 'công suất': 'power' };

export function variantAttributes(variant: Variant): Record<string, string> {
  let raw: unknown = variant.attributes;
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch { raw = null; }
  }
  const entries: [string, string][] = [];
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [key, value] of Object.entries(raw)) {
      if ((typeof value !== 'string' && typeof value !== 'number') || !String(value).trim()) continue;
      const normalized = key.trim().toLowerCase();
      if (normalized === 'issample' || normalized.startsWith('_')) continue;
      entries.push([Object.hasOwn(aliases, normalized) ? aliases[normalized] : normalized, String(value).trim()]);
    }
  }
  if (!entries.length) {
    // Explicit labels keep newly seeded demos usable with the deployed legacy API.
    for (const part of variant.name.replace(/^\[Mẫu\]\s*/, '').split(' · ')) {
      const colon = part.indexOf(':');
      const label = part.slice(0, colon).trim().toLowerCase();
      const key = Object.hasOwn(aliases, label) ? aliases[label] : undefined;
      const value = part.slice(colon + 1).trim();
      if (colon > 0 && key && value) entries.push([key, value]);
    }
  }
  return Object.fromEntries(entries);
}

export function variantGroups(variants: Variant[]) {
  if (!variants.length) return [];
  const attributes = variants.map(variantAttributes);
  const keys = [...new Set(attributes.flatMap(Object.keys))];
  if (keys.some(key => attributes.some(values => !values[key]))) return [];
  const order = Object.keys(labels);
  return keys.sort((a, b) => (order.indexOf(a) < 0 ? order.length : order.indexOf(a)) - (order.indexOf(b) < 0 ? order.length : order.indexOf(b))).map(key => ({ key, label: Object.hasOwn(labels, key) ? labels[key] : key, values: [...new Set(attributes.map(values => values[key]))] }));
}

export function selectVariantOption(variants: Variant[], selected: Variant | undefined, key: string, value: string): Variant | undefined {
  const current = selected ? variantAttributes(selected) : {};
  const candidates = variants.filter(variant => variant.availableStock > 0 && variantAttributes(variant)[key] === value);
  const score = (variant: Variant) => Object.entries(variantAttributes(variant)).filter(([other, entry]) => other !== key && current[other] === entry).length;
  return candidates.reduce<Variant | undefined>((best, candidate) => !best || score(candidate) > score(best) ? candidate : best, undefined);
}
