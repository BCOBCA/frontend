import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { OrderShippingAddress } from '../src/components/orders/OrderShippingAddress';
import { parseOrderAddress } from '../src/services/order-detail';

const state = vi.hoisted(() => ({ loading: false, missing: false, enabled: [] as boolean[], retry: vi.fn(), press: undefined as undefined | (() => void) }));
vi.mock('react-native', () => ({ View: 'div', Text: 'span', Pressable: ({ onPress, children }: { onPress: () => void; children: React.ReactNode }) => { state.press = onPress; return <button>{children}</button>; }, StyleSheet: { create: (v: unknown) => v } }));
vi.mock('../src/services/address-locations', () => ({ listAddressProvinces: vi.fn(), listAddressWards: vi.fn() }));
vi.mock('@tanstack/react-query', () => ({ useQuery: ({ queryKey, enabled }: { queryKey: string[]; enabled: boolean }) => { state.enabled.push(enabled); return { isPending: state.loading, refetch: state.retry, data: state.loading || state.missing ? undefined : queryKey[0] === 'address-provinces' ? [{ code: '79', name: 'Thành phố Hồ Chí Minh' }] : [{ code: '27637', name: 'Xã Bình Chánh' }] }; } }));
beforeEach(() => { state.loading = false; state.missing = false; state.enabled = []; vi.clearAllMocks(); });

it('recognizes only the stored administrative suffix and retains street numbers', () => {
  expect(parseOrderAddress('123 Đường số 7, 27637, 79')).toEqual({ addressLine: '123 Đường số 7', wardCode: '27637', provinceCode: '79' });
  expect(parseOrderAddress('123 Đường số 7, Xã Bình Chánh, Thành phố Hồ Chí Minh')).toBeNull();
  expect(parseOrderAddress('123 Đường số 7')).toBeNull();
});
it('replaces stored province and ward codes with their names', () => {
  const html = renderToStaticMarkup(<OrderShippingAddress value="123 Đường số 7, 27637, 79" />);
  expect(html).toContain('123 Đường số 7, Xã Bình Chánh, Thành phố Hồ Chí Minh');
  expect(html).not.toContain('27637');
  expect(html).not.toContain(', 79');
});
it('keeps an already named snapshot unchanged', () => {
  const address = '12 Nguyễn Huệ, Phường Sài Gòn, Thành phố Hồ Chí Minh';
  expect(renderToStaticMarkup(<OrderShippingAddress value={address} />)).toContain(address);
  expect(state.enabled).toEqual([false, false]);
});
it('retains the street while names load and never flashes administrative codes', () => {
  state.loading = true;
  const html = renderToStaticMarkup(<OrderShippingAddress value="123 Đường số 7, 27637, 79" />);
  expect(html).toContain('123 Đường số 7'); expect(html).not.toContain('27637');
});
it('lets the user retry missing names without exposing raw codes', () => {
  state.missing = true;
  const html = renderToStaticMarkup(<OrderShippingAddress value="123 Đường số 7, 27637, 79" />);
  expect(html).toContain('Thử lại'); expect(html).not.toContain('27637');
  state.press!(); expect(state.retry).toHaveBeenCalled();
});
