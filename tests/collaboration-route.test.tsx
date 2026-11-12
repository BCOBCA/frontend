import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import CollaborationScreen from '../src/screens/CollaborationScreen';
import type { AffiliateProduct } from '../src/components/affiliate/affiliate-catalog';
type Mutation = { mutationFn: (item: AffiliateProduct) => Promise<{ url: string }>; onSuccess: (result: { url: string }, item: AffiliateProduct) => Promise<void>; onSettled: () => void };
const state = vi.hoisted(() => ({ user: { id: 'me' } as { id: string } | null, queries: [] as { queryKey: unknown[]; queryFn: () => Promise<unknown>; enabled?: boolean }[], request: vi.fn(), mutate: vi.fn(), copy: vi.fn(async () => true), toast: vi.fn(), invalidate: vi.fn(), push: vi.fn(), mutation: null as Mutation | null, grid: null as null | { onGetLink: (item: AffiliateProduct) => void }, page: null as null | { title: string; searchPlaceholder: string } }));
let viewportWidth = 1200;
vi.mock('react-native', () => ({ View: 'div', Text: 'span', useWindowDimensions: () => ({ width: viewportWidth }) }));
vi.mock('../src/navigation/tabs', () => ({ DESKTOP_HEADER_WIDTH: 1024 }));
vi.mock('expo-router', () => ({ router: { push: state.push } }));
vi.mock('expo-clipboard', () => ({ setStringAsync: state.copy }));
vi.mock('../src/services/api', () => ({ request: state.request, errorMessage: () => 'Request failed' }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (value: { user: typeof state.user }) => unknown) => select({ user: state.user }) }));
vi.mock('../src/stores/toast', () => ({ useToast: () => state.toast }));
vi.mock('@tanstack/react-query', () => ({ useQueryClient: () => ({ invalidateQueries: state.invalidate }), useQuery: (options: typeof state.queries[number]) => { state.queries.push(options); return { data: options.queryKey[0] === 'categories' ? [] : options.queryKey[0] === 'affiliate-products' ? { items: [], totalPages: 1 } : undefined, refetch: vi.fn() }; }, useMutation: (options: Mutation) => { state.mutation = options; return { mutate: state.mutate, isPending: false }; } }));
vi.mock('../src/components/common/ui', () => ({ Page: (props: NonNullable<typeof state.page> & { children: React.ReactNode }) => { state.page = props; return <main>{props.children}</main>; }, LoginNotice: () => <p>Login required</p>, Status: () => null }));
vi.mock('../src/components/affiliate/AffiliateCategoryStrip', () => ({ AffiliateCategoryStrip: () => null }));
vi.mock('../src/components/affiliate/ShareLinkActions', () => ({ ShareLinkActions: () => null }));
vi.mock('../src/components/affiliate/AffiliateCatalogGrid', () => ({ AffiliateCatalogGrid: (props: NonNullable<typeof state.grid>) => { state.grid = props; return <p>Affiliate catalog</p>; } }));
vi.mock('../src/components/affiliate/CollaborationSidebar', () => ({ AffiliateIncomeCard: () => null, CollaborationHelp: () => null }));
const item: AffiliateProduct = { id: 'product-one', name: 'Tai nghe', imageUrl: '', price: 100, salePrice: 80, variantId: 'variant', availableStock: 1, rating: null, reviewCount: 0, commissionRate: 0.02, estimatedCommission: 1.6 };
beforeEach(() => { viewportWidth = 1200; vi.clearAllMocks(); state.queries = []; state.user = { id: 'me' }; state.copy.mockResolvedValue(true); });
it('uses compact shared-header search on small screens and keeps the catalog submit handler', () => {
  viewportWidth = 390; renderToStaticMarkup(<CollaborationScreen />);
  expect(state.page).toMatchObject({ onSearch: undefined, onSubmitSearch: expect.any(Function) });
  viewportWidth = 1200; renderToStaticMarkup(<CollaborationScreen />);
  expect(state.page).toMatchObject({ onSearch: expect.any(Function) });
});
it('queries authenticated affiliate products with a user-scoped cache key and preserves home route title', async () => {
  renderToStaticMarkup(<CollaborationScreen />);
  expect(state.page).toMatchObject({ title: 'Cộng tác', searchPlaceholder: 'Tìm kiếm sản phẩm, danh mục...' });
  const products = state.queries.find(q => q.queryKey[0] === 'affiliate-products')!;
  expect(products.queryKey).toEqual(['affiliate-products', 'me', 1, '', '']); await products.queryFn();
  expect(state.request).toHaveBeenCalledWith('GET', '/affiliate/products?page=1&pageSize=12');
});
it('requires login before showing private products and wallet', () => {
  state.user = null; const html = renderToStaticMarkup(<CollaborationScreen />);
  expect(html).toContain('Login required'); expect(html).not.toContain('Affiliate catalog');
  expect(state.queries.filter(q => ['affiliate', 'affiliate-products'].includes(String(q.queryKey[0]))).every(q => q.enabled === false)).toBe(true);
});
it('creates one product link and copies the returned personal URL', async () => {
  renderToStaticMarkup(<CollaborationScreen />); state.grid!.onGetLink(item); state.grid!.onGetLink(item); expect(state.mutate).toHaveBeenCalledTimes(1);
  await state.mutation!.mutationFn(item); expect(state.request).toHaveBeenCalledWith('POST', '/affiliate/links', { productId: item.id });
  await state.mutation!.onSuccess({ url: 'https://example.test/product?aff=mine' }, item);
  expect(state.copy).toHaveBeenCalledWith('https://example.test/product?aff=mine'); expect(state.invalidate).toHaveBeenCalledWith({ queryKey: ['affiliate-links'] });
  state.mutation!.onSettled(); state.grid!.onGetLink(item); expect(state.mutate).toHaveBeenCalledTimes(2);
});
it('retains a manual sharing path and reports clipboard refusal after successful link creation', async () => {
  state.copy.mockResolvedValue(false); renderToStaticMarkup(<CollaborationScreen />);
  await state.mutation!.onSuccess({ url: 'https://example.test/product?aff=mine' }, item);
  expect(state.toast).toHaveBeenCalledWith(expect.stringContaining('Link đã tạo'), 'error');
});
