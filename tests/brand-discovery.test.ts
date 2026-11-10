import { describe, expect, it } from 'vitest';
import { brandLogoUrl, filterBrands, featuredBrands } from '../src/components/brands/brand-discovery';
import type { Brand } from '../src/types/api';

const brands = ['Apple', 'ASUS', 'Dell', 'HP', 'LG', 'Lenovo', 'L’Oréal', 'Nestlé', 'Nike', 'UNIQLO', 'Zara', 'TH true MILK'].map(name => ({ id: name, name, slug: name.toLowerCase() } as Brand));
describe('brand discovery', () => {
  it('trims Cloudinary logo padding while preserving other image hosts', () => {
    const url = 'https://res.cloudinary.com/store/image/upload/v123/logo.png';
    expect(brandLogoUrl(url)).toBe('https://res.cloudinary.com/store/image/upload/e_trim:10/v123/logo.png');
    expect(brandLogoUrl(brandLogoUrl(url))).toBe(brandLogoUrl(url));
    expect(brandLogoUrl('https://example.com/logo.png')).toBe('https://example.com/logo.png');
  });
  it('matches names without accents or case differences', () => {
    expect(filterBrands(brands, ' nestle ', 'all').map(x => x.name)).toEqual(['Nestlé']);
    expect(filterBrands(brands, 'LOR', 'all').map(x => x.name)).toEqual(['L’Oréal']);
  });
  it('combines letter and search filters', () => {
    expect(filterBrands(brands, '', 'L').map(x => x.name)).toEqual(['Lenovo', 'LG', 'L’Oréal']);
    expect(filterBrands(brands, 'len', 'L').map(x => x.name)).toEqual(['Lenovo']);
    expect(filterBrands(brands, 'len', 'A')).toEqual([]);
  });
  it('keeps all brands available and sorts consistently', () => {
    expect(filterBrands(brands, '', 'all')).toHaveLength(brands.length);
    expect(filterBrands(brands, '', 'Q')).toEqual([]);
  });
  it('uses the reference order for the six cover banners', () => {
    expect(featuredBrands(brands).map(x => x.name)).toEqual(['ASUS', 'Apple', 'Dell', 'HP', 'LG', 'Lenovo']);
  });
  it('fills missing featured names with other real brands without duplicates', () => {
    const subset = brands.filter(x => !['Dell', 'HP'].includes(x.name));
    const featured = featuredBrands(subset);
    expect(featured).toHaveLength(6); expect(new Set(featured.map(x => x.id)).size).toBe(6);
  });
});
