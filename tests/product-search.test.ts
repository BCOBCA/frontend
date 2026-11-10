import { describe, expect, it, vi } from 'vitest';
import { productSearchFilters, productSearchHref, productSearchQuery, searchProducts } from '../src/services/product-search';
const transport = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('../src/services/api', () => transport);
const categoryId = '108799fa-9459-4d41-944c-3fe17436ba72';

describe('shared product search URLs', () => {
  it('opens a root category on the same search route as a keyword', () => {
    expect(productSearchHref({ categoryId })).toEqual({ pathname: '/search', params: { search: '', categoryId, sort: 'newest', page: '1' } });
    expect(productSearchHref({ search: '  iPhone  ' }).params.search).toBe('iPhone');
  });
  it('normalizes repeated/malformed parameters and bounds query sizes', () => {
    expect(productSearchFilters({ search: ['  Điện thoại & Apple  ', 'other'], categoryId: 'invalid', page: '1000000000', sort: 'invalid' })).toEqual({ search: 'Điện thoại & Apple', categoryId: '', page: 1, sort: 'newest' });
    expect(productSearchFilters({ page: '2.5' }).page).toBe(1);
    expect(productSearchFilters({ search: 'a'.repeat(250) }).search).toHaveLength(200);
  });
  it('combines category, Unicode keyword, sort and pagination on the real product endpoint', async () => {
    const filters = productSearchFilters({ search: 'Điện thoại & Apple', categoryId, page: '2', sort: 'price-asc' });
    const query = productSearchQuery(filters);
    expect(new URLSearchParams(query).get('categoryId')).toBe(categoryId);
    expect(new URLSearchParams(query).get('search')).toBe('Điện thoại & Apple');
    expect(new URLSearchParams(query).get('page')).toBe('2');
    await searchProducts(filters);
    expect(transport.request).toHaveBeenLastCalledWith('GET', `/products?${query}`);
  });
});
