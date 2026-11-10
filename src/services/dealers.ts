import { request } from './api';
import type { Page } from '../types/api';
import type { Dealer, DealerCategory, DealerDetail, DealerFilters, DealerFollow, DealerProfile } from '../types/dealers';

export function dealerFilters(params: Record<string, string | string[] | undefined>): DealerFilters {
  const value = (key: string) => (Array.isArray(params[key]) ? params[key][0] : params[key]) ?? '';
  const page = Number(value('page'));
  const sort = value('sortBy');
  const categoryId = value('categoryId');
  return { page: Number.isInteger(page) && page >= 1 && page <= 100000 ? page : 1,
    search: value('search').slice(0, 200), provinceCode: value('provinceCode').slice(0, 50),
    categoryId: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId) ? categoryId : '', sortBy: sort === 'name' || sort === 'newest' ? sort : 'popular' };
}
export function dealerQuery(filters: DealerFilters) {
  const query = new URLSearchParams({ page: String(filters.page), pageSize: '12', sortBy: filters.sortBy });
  if (filters.search.trim()) query.set('search', filters.search.trim());
  if (filters.provinceCode) query.set('provinceCode', filters.provinceCode);
  if (filters.categoryId) query.set('categoryId', filters.categoryId);
  return query.toString();
}
export function dealerPages(page: number, total: number) {
  const start = Math.max(1, Math.min(page - 2, total - 4));
  return Array.from({ length: Math.min(5, total) }, (_, index) => start + index);
}
export const listDealers = (filters: DealerFilters) => request<Page<Dealer>>('GET', `/dealers?${dealerQuery(filters)}`);
export const getDealer = (slug: string) => request<DealerDetail>('GET', `/dealers/${encodeURIComponent(slug)}`);
export const getDealerRegions = () => request<string[]>('GET', '/dealers/regions');
export const getDealerCategories = () => request<DealerCategory[]>('GET', '/dealers/categories');
export const saveDealerCategories = (id: string, categoryIds: string[]) => request<DealerProfile>('PUT', `/dealers/${id}/categories`, { categoryIds });
export const getOwnedDealers = () => request<DealerProfile[]>('GET', '/dealers/mine');
export const saveDealerProvinces = (id: string, provinces: string) => request<DealerProfile>('PUT', `/dealers/${id}/provinces`, { provinces });
export const followDealer = (id: string, isFollowing: boolean) => request<DealerFollow>(isFollowing ? 'DELETE' : 'POST', `/dealers/${id}/follow`);
