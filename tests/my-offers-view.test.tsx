import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { MyOffersView } from '../src/components/promotions/MyOffersView';
import { OwnedOfferDetails } from '../src/components/promotions/OwnedOfferDetails';
import type { OwnedVoucher } from '../src/types/api';

const state = vi.hoisted(() => ({ actions: {} as Record<string, () => unknown>, copy: vi.fn(async () => true), close: () => {}, cards: [] as { owned: boolean; voucher: { id: string; name: string; claimed: boolean } }[] }));
vi.mock('react-native', () => ({ View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, Text: 'span', ScrollView: 'div', useWindowDimensions: () => ({ width: 390 }), Modal: ({ children, onRequestClose }: { children: React.ReactNode; onRequestClose: () => void }) => { state.close = onRequestClose; return <div role="dialog">{children}</div>; }, Pressable: ({ children, accessibilityLabel, onPress }: { children: React.ReactNode; accessibilityLabel: string; onPress: () => unknown }) => { state.actions[accessibilityLabel] = onPress; return <button>{children}</button>; } }));
vi.mock('lucide-react-native', () => ({ Copy: () => null, TicketPercent: () => null, X: () => null }));
vi.mock('expo-clipboard', () => ({ setStringAsync: state.copy }));
vi.mock('../src/components/promotions/OfferCard', () => ({ OfferCard: (props: typeof state.cards[number]) => { state.cards.push(props); return <article>{props.voucher.name}</article>; } }));
vi.mock('../src/components/common/ui', () => ({ Button: ({ title, onPress }: { title: string; onPress: () => void }) => { state.actions[title] = onPress; return <button>{title}</button>; }, Status: ({ loading, error }: { loading: boolean; error: unknown }) => <span>{loading ? 'Loading' : error ? 'Retry' : ''}</span> }));
vi.mock('../src/theme', () => ({ colors: {}, styles: {}, money: (value: number) => `${value} VNĐ` }));
const item: OwnedVoucher = { id: 'claim', voucherId: 'voucher', code: 'MYCODE', name: 'Giảm tiền hàng', description: 'Điều kiện chỉ có trong popup', discountType: 'PERCENT', discountValue: 15, maxDiscount: 50000, minOrderAmount: 100000, expiresAt: '2099-01-01T00:00:00Z', status: 'AVAILABLE', pointCost: 500, claimedAt: '2026-11-23T00:00:00Z', usedAt: null };
const props = { loading: false, onRetry: vi.fn(), hasMore: false, loadingMore: false, onLoadMore: vi.fn(), onShop: vi.fn(), onDiscover: vi.fn() };
beforeEach(() => { state.actions = {}; state.cards = []; vi.clearAllMocks(); });
it('uses the shared compact card without inline conditions or filter chips', () => {
  const html = renderToStaticMarkup(<MyOffersView {...props} items={[item]} />);
  expect(state.cards).toHaveLength(1); expect(state.cards[0].owned).toBe(true);
  expect(state.cards[0].voucher).toMatchObject({ id: 'voucher', claimed: true });
  expect(html).not.toContain(item.description); expect(html).not.toContain(item.code); expect(html).not.toContain('role="dialog"');
  for (const label of ['Tất cả', 'Còn hạn', 'Đã thu thập', 'Đã đổi điểm', 'Đã dùng', 'Hết hạn']) expect(html).not.toContain(label);
});
it.each(['USED', 'EXPIRED', 'UNAVAILABLE', 'UPCOMING'] as const)('hides a %s voucher even if returned by an older server/cache', status => {
  renderToStaticMarkup(<MyOffersView {...props} items={[{ ...item, status }]} />); expect(state.cards).toHaveLength(0);
});
it('offers discovery when the server returns no available vouchers', () => {
  const html = renderToStaticMarkup(<MyOffersView {...props} items={[]} />);
  expect(state.cards).toHaveLength(0); expect(html).toContain('Bạn chưa có ưu đãi còn dùng được');
  state.actions['Khám phá ưu đãi'](); expect(props.onDiscover).toHaveBeenCalledOnce();
});
it('shows conditions and dates without the voucher code or copy action, and supports close/shop', () => {
  const close = vi.fn(), shop = vi.fn(); const html = renderToStaticMarkup(<OwnedOfferDetails item={item} onClose={close} onShop={shop} />);
  for (const text of [item.description, '100000 VNĐ', '50000 VNĐ', 'Đã đổi 500 điểm', 'Hạn sử dụng']) expect(html).toContain(text);
  expect(html).not.toContain(item.code); expect(state.actions['Sao chép mã MYCODE']).toBeUndefined();
  state.actions['Đóng điều kiện ưu đãi'](); state.actions['Đóng nền điều kiện ưu đãi'](); state.close(); expect(close).toHaveBeenCalledTimes(3);
  state.actions['Mua sắm ngay'](); expect(shop).toHaveBeenCalledOnce();
});
it('identifies the issuing shop in personal voucher details after collection', () => {
  const html = renderToStaticMarkup(<OwnedOfferDetails item={{ ...item, pointCost: 0, storeId: 'shop-qq', storeName: 'Cửa hàng QQ' }} onClose={vi.fn()} onShop={vi.fn()} />);
  expect(html).toContain('Voucher của shop: Cửa hàng QQ');
  expect(html).toContain('tính trên sản phẩm đủ điều kiện của shop.');
  expect(html).toContain('Giảm 15%');
  expect(html).toContain('Đã thu thập');
  expect(html).not.toContain('Voucher của nền tảng');
});
it.each([{ loading: true }, { loading: false, error: new Error('offline') }])('does not mistake loading/failure for an empty wallet', status => {
  expect(renderToStaticMarkup(<MyOffersView {...props} {...status} items={[]} />)).not.toContain('Bạn chưa có ưu đãi còn dùng được');
});
