import { describe, expect, it, vi } from 'vitest';
import { dealerFilters, dealerQuery, dealerPages, listDealers, followDealer, getOwnedDealers, saveDealerProvinces, getDealerCategories, saveDealerCategories } from '../src/services/dealers';
const transport = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('../src/services/api', () => transport);

describe('dealer discovery', () => {
  it('uses the catalog category filter instead of the obsolete verified dropdown', async () => {
    const categoryId = '108799fa-9459-4d41-944c-3fe17436ba72';
    const params = new URLSearchParams(dealerQuery(dealerFilters({ categoryId, verifiedOnly: 'true', provinceCode: 'Toàn quốc' })));
    expect(params.get('categoryId')).toBe(categoryId);
    expect(params.get('provinceCode')).toBe('Toàn quốc');
    expect(params.has('verifiedOnly')).toBe(false);
    expect(dealerFilters({ categoryId: 'invalid' }).categoryId).toBe('');
    expect(dealerFilters({ categoryId: [categoryId, 'invalid'] }).categoryId).toBe(categoryId);
    await getDealerCategories();
    expect(transport.request).toHaveBeenLastCalledWith('GET', '/dealers/categories');
    await saveDealerCategories('dealer-id', [categoryId]);
    expect(transport.request).toHaveBeenLastCalledWith('PUT', '/dealers/dealer-id/categories', { categoryIds: [categoryId] });
    await saveDealerCategories('dealer-id', []);
    expect(transport.request).toHaveBeenLastCalledWith('PUT', '/dealers/dealer-id/categories', { categoryIds: [] });
  });
  it('preserves the nationwide-only area filter', async () => {
    const filters = dealerFilters({ provinceCode: 'Toàn quốc', sortBy: 'name' });
    const query = dealerQuery(filters);
    expect(new URLSearchParams(query).get('provinceCode')).toBe('Toàn quốc');
    expect(new URLSearchParams(query).get('sortBy')).toBe('name');
    await listDealers(filters);
    expect(transport.request).toHaveBeenLastCalledWith('GET', `/dealers?${query}`);
  });
  it('loads owner profiles and saves province names as one text field', async () => {
    await getOwnedDealers();
    expect(transport.request).toHaveBeenLastCalledWith('GET', '/dealers/mine');
    await saveDealerProvinces('store-id', 'Hà Nội, Hồ Chí Minh, Đà Nẵng');
    expect(transport.request).toHaveBeenLastCalledWith('PUT', '/dealers/store-id/provinces', { provinces: 'Hà Nội, Hồ Chí Minh, Đà Nẵng' });
    expect(new URLSearchParams(dealerQuery(dealerFilters({ provinceCode: 'Hồ Chí Minh' }))).get('provinceCode')).toBe('Hồ Chí Minh');
  });
  it('normalizes hostile or repeated URL parameters and bounds pagination', () => {
    expect(dealerFilters({ page: '9999999999', sortBy: 'other', verifiedOnly: 'false', search: ['An', 'B'] })).toEqual({ page: 1, search: 'An', provinceCode: '', categoryId: '', sortBy: 'popular' });
    expect(dealerFilters({ page: '2.3' }).page).toBe(1);
  });
  it('encodes Unicode search and province codes and fetches the real endpoint', async () => {
    const filters = dealerFilters({ search: 'Đại lý & An', provinceCode: '79', verifiedOnly: 'true', page: '3' });
    const query = dealerQuery(filters);
    expect(new URLSearchParams(query).get('search')).toBe('Đại lý & An');
    expect(query).not.toContain('verifiedOnly');
    transport.request.mockResolvedValueOnce({ items: [], totalItems: 0 });
    expect(await listDealers(filters)).toEqual({ items: [], totalItems: 0 });
    expect(transport.request).toHaveBeenCalledWith('GET', `/dealers?${query}`);
  });
  it('chooses explicit follow and unfollow methods without changing dealer routing', async () => {
    await followDealer('store-id', false);
    expect(transport.request).toHaveBeenLastCalledWith('POST', '/dealers/store-id/follow');
    await followDealer('store-id', true);
    expect(transport.request).toHaveBeenLastCalledWith('DELETE', '/dealers/store-id/follow');
  });
  it('bounds the visible pagination window for large result sets', () => {
    expect(dealerPages(1, 10)).toEqual([1, 2, 3, 4, 5]);
    expect(dealerPages(10, 10)).toEqual([6, 7, 8, 9, 10]);
  });
});
