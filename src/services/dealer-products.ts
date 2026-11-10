import { request } from './api';
import type { Page } from '../types/api';

export type DealerProduct = { id: string; brandId: string; categoryId: string; name: string; imageUrl: string; price: number; salePrice: number | null; variantId: string | null; availableStock: number; rating: number | null; reviewCount: number; soldCount: number; createdAt: string };
export type DealerProductCategory = { id: string; parentId: string | null; name: string; slug: string; productCount: number };
export type DealerProductFilters = { page: number; categoryId: string; sort: 'popular' | 'newest' | 'price-asc' | 'price-desc'; minPrice: string; maxPrice: string; view: 'grid' | 'list' };

export function dealerPriceRange(from: string, to: string) {
  const normalize = (value: string) => {
    const text = value.trim();
    if (!text) return '';
    if (!/^\d+$/.test(text) && !/^\d{1,3}(\.\d{3})+$/.test(text)) return null;
    const amount = Number(text.replaceAll('.', ''));
    return Number.isSafeInteger(amount) && amount <= 1_000_000_000_000 ? String(amount) : null;
  };
  const min = normalize(from), max = normalize(to);
  const error = min === null || max === null ? 'Vui lòng nhập giá hợp lệ.' : min && max && Number(min) > Number(max) ? 'Giá từ phải nhỏ hơn hoặc bằng giá đến.' : '';
  return { min: min ?? '', max: max ?? '', error };
}

export function dealerProductFilters(params: Record<string, string | string[] | undefined>): DealerProductFilters {
  const value = (key: string) => (Array.isArray(params[key]) ? params[key][0] : params[key]) ?? '';
  const page = Number(value('productPage'));
  const category = value('productCategory');
  const sort = value('productSort');
  const range = dealerPriceRange(value('minPrice'), value('maxPrice'));
  return { page: Number.isInteger(page) && page >= 1 && page <= 100000 ? page : 1,
    categoryId: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category) ? category : '',
    sort: sort === 'newest' || sort === 'price-asc' || sort === 'price-desc' ? sort : 'popular',
    minPrice: range.min, maxPrice: range.max, view: value('productView') === 'list' ? 'list' : 'grid' };
}

export function dealerProductQuery(filters: DealerProductFilters) {
  const query = new URLSearchParams({ page: String(filters.page), pageSize: '15', sort: filters.sort });
  if (filters.categoryId) query.set('categoryId', filters.categoryId);
  if (filters.minPrice) query.set('minPrice', filters.minPrice);
  if (filters.maxPrice) query.set('maxPrice', filters.maxPrice);
  return query.toString();
}
export const getDealerProducts = (id: string, filters: DealerProductFilters) => request<Page<DealerProduct>>('GET', `/dealers/${id}/products?${dealerProductQuery(filters)}`);
export const getDealerProductCategories = (id: string) => request<DealerProductCategory[]>('GET', `/dealers/${id}/product-categories`);
