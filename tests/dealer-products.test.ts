import { describe, expect, it, vi } from 'vitest';
import { dealerProductFilters, dealerProductQuery, dealerPriceRange, getDealerProducts, getDealerProductCategories } from '../src/services/dealer-products';
const transport = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock('../src/services/api', () => transport);

describe('dealer product filters', () => {
  it('bounds pagination and validates category and sorting input', () => {
    expect(dealerProductFilters({ productPage: '999999999', productCategory: 'bad', productSort: 'bad' })).toEqual({ page: 1, categoryId: '', sort: 'popular', minPrice: '', maxPrice: '', view: 'grid' });
    expect(dealerProductFilters({ productPage: '2.5' }).page).toBe(1);
  });
  it('parses Vietnamese thousands separators and rejects invalid or inverted ranges', () => {
    expect(dealerPriceRange('1.000.000', '20.000.000')).toEqual({ min: '1000000', max: '20000000', error: '' });
    expect(dealerPriceRange('', '')).toEqual({ min: '', max: '', error: '' });
    expect(dealerPriceRange('200', '100').error).not.toBe('');
    expect(dealerPriceRange('-1', '').error).not.toBe('');
    expect(dealerPriceRange('abc', '').error).not.toBe('');
    expect(dealerPriceRange('1000000000001', '').error).not.toBe('');
  });
  it('fetches only the explicit dealer with applied category, price, order and page filters', async () => {
    const id = '108799fa-9459-4d41-944c-3fe17436ba72';
    const filters = dealerProductFilters({ productCategory: id, productSort: 'price-asc', productPage: '2', minPrice: '1000000', maxPrice: '9000000', productView: 'list' });
    const query = dealerProductQuery(filters);
    expect(new URLSearchParams(query).get('categoryId')).toBe(id);
    expect(new URLSearchParams(query).get('minPrice')).toBe('1000000');
    expect(filters.view).toBe('list');
    await getDealerProducts('store-qa', filters);
    expect(transport.request).toHaveBeenLastCalledWith('GET', `/dealers/store-qa/products?${query}`);
    await getDealerProductCategories('store-qa');
    expect(transport.request).toHaveBeenLastCalledWith('GET', '/dealers/store-qa/product-categories');
  });
});
