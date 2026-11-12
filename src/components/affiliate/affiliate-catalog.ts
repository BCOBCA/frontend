export type AffiliateProduct = { id: string; name: string; imageUrl: string; price: number | null; salePrice: number | null; variantId: string | null; availableStock: number; rating: number | null; reviewCount: number; commissionRate: number; estimatedCommission: number };
export function affiliateMoney(value: number) { return `${value.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} đ`; }
export function affiliatePercent(rate: number) { return `${(rate * 100).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%`; }
export function affiliatePrice(item: Pick<AffiliateProduct, 'price' | 'salePrice'>) {
  const discounted = item.price !== null && item.salePrice !== null && item.salePrice < item.price;
  return { current: item.salePrice ?? item.price, original: discounted ? item.price : null, discount: discounted && item.price! > 0 ? Math.round((1 - item.salePrice! / item.price!) * 100) : 0 };
}
export function affiliateProductsPath(page: number, search: string, categoryId: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: '12' });
  if (search.trim()) params.set('search', search.trim().slice(0, 200));
  if (categoryId) params.set('categoryId', categoryId);
  return `/affiliate/products?${params}`;
}
export async function loadAllAffiliateCategories<T>(fetchPage: (page: number) => Promise<{ items: T[]; totalPages: number }>): Promise<T[]> {
  const first = await fetchPage(1);
  const items = [...first.items];
  for (let page = 2; page <= first.totalPages; page++) items.push(...(await fetchPage(page)).items);
  return items;
}
