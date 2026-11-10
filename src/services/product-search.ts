import { request } from './api';
import type { Category, Page, Product } from '../types/api';

export type ProductSearchFilters = { search: string; categoryId: string; page: number; sort: 'newest' | 'name' | 'price-asc' | 'price-desc' };

export function productSearchFilters(params: Record<string, string | string[] | undefined>): ProductSearchFilters {
  const value = (key: string) => (Array.isArray(params[key]) ? params[key][0] : params[key]) ?? '';
  const category = value('categoryId');
  const page = Number(value('page'));
  const sort = value('sort');
  return { search: value('search').trim().slice(0, 200),
    categoryId: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category) ? category : '',
    page: Number.isInteger(page) && page >= 1 && page <= 100000 ? page : 1,
    sort: sort === 'name' || sort === 'price-asc' || sort === 'price-desc' ? sort : 'newest' };
}

export function productSearchHref(values: Partial<ProductSearchFilters> = {}) {
  const filters = productSearchFilters({ search: values.search, categoryId: values.categoryId, sort: values.sort, page: String(values.page ?? 1) });
  return { pathname: '/search' as const, params: { search: filters.search, categoryId: filters.categoryId, sort: filters.sort, page: String(filters.page) } };
}

export function productSearchQuery(filters: ProductSearchFilters) {
  const query = new URLSearchParams({ page: String(filters.page), pageSize: '20', sort: filters.sort });
  if (filters.search) query.set('search', filters.search);
  if (filters.categoryId) query.set('categoryId', filters.categoryId);
  return query.toString();
}
export const searchProducts = (filters: ProductSearchFilters) => request<Page<Product>>('GET', `/products?${productSearchQuery(filters)}`);
export const searchCategories = () => request<Page<Category>>('GET', '/categories?pageSize=100');
