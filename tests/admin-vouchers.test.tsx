import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import AdminVouchers from '../app/admin-vouchers';
const state = vi.hoisted(() => ({ user: null as { id: string; roles: string[] } | null, queries: [] as { queryKey: unknown[]; queryFn: () => Promise<unknown> }[], request: vi.fn() }));
vi.mock('react-native', () => ({ View: 'div', Text: 'span', ScrollView: 'div', Pressable: 'button', Modal: () => null, useWindowDimensions: () => ({ width: 1280 }) }));
vi.mock('lucide-react-native', () => ({ X: () => null }));
vi.mock('../src/components/common/ui', () => ({ Page: ({ children }: { children: React.ReactNode }) => <main>{children}</main>, LoginNotice: () => <span>Đăng nhập</span>, Field: () => null, Button: ({ title }: { title: string }) => <button>{title}</button>, Status: () => null }));
vi.mock('../src/components/promotions/OfferCard', () => ({ OfferCard: () => null }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (s: typeof state) => unknown) => select(state), queryClient: {} }));
vi.mock('../src/services/api', () => ({ request: state.request }));
vi.mock('../src/theme', () => ({ colors: {}, styles: {}, dateTime: String, money: String }));
vi.mock('@tanstack/react-query', () => ({ useQuery: (options: typeof state.queries[number]) => { state.queries.push(options); return { data: options.queryKey[0] === 'admin-voucher-stores' ? [] : { vouchers: { items: [], totalPages: 0 }, statistics: { active: 0, upcoming: 0, used: 0 } } }; }, useMutation: () => ({}) }));
beforeEach(() => { state.user = null; state.queries = []; vi.clearAllMocks(); });
it('never requests admin voucher data for a guest or seller-only account', () => {
  expect(renderToStaticMarkup(<AdminVouchers />)).toContain('Đăng nhập');
  state.user = { id: 'seller', roles: ['Seller'] };
  expect(renderToStaticMarkup(<AdminVouchers />)).toContain('không có quyền'); expect(state.queries).toEqual([]);
});
it('uses account-scoped admin queries and existing pagination/filter contract', async () => {
  state.user = { id: 'admin', roles: ['Admin'] };
  expect(renderToStaticMarkup(<AdminVouchers />)).toContain('Giám sát voucher');
  for (const query of state.queries) await query.queryFn();
  expect(state.queries.every(query => query.queryKey[1] === 'admin')).toBe(true);
  expect(state.request).toHaveBeenCalledWith('GET', '/admin/vouchers/stores');
  expect(state.request).toHaveBeenCalledWith('GET', '/admin/vouchers?page=1&pageSize=20&search=&status=ALL');
});
