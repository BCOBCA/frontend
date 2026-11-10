import type { Brand } from '../../types/api';

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[’']/g, '').trim().toLowerCase();
const collator = new Intl.Collator('vi', { sensitivity: 'base', numeric: true, ignorePunctuation: true });

export function brandLogoUrl(url: string) {
  return url.startsWith('https://res.cloudinary.com/') && !url.includes('/e_trim:10/') ? url.replace('/image/upload/', '/image/upload/e_trim:10/') : url;
}

export function filterBrands(brands: readonly Brand[], search: string, letter: string) {
  const query = normalize(search);
  return brands.filter(brand => normalize(brand.name).includes(query) && (letter === 'all' || normalize(brand.name).startsWith(letter.toLowerCase())))
    .sort((a, b) => collator.compare(a.name, b.name));
}

export function featuredBrands(brands: readonly Brand[]) {
  const order = ['asus', 'apple', 'dell', 'hp', 'lg', 'lenovo'];
  return [...brands].sort((a, b) => {
    const rank = (brand: Brand) => { const index = order.indexOf(normalize(brand.name)); return index < 0 ? order.length : index; };
    return rank(a) - rank(b) || collator.compare(a.name, b.name);
  }).slice(0, 6);
}
