import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { SupportPopover } from '../src/components/common/SupportPopover';
import { SharePopup } from '../src/components/common/SharePopup';

const state = vi.hoisted(() => ({ actions: {} as Record<string, () => unknown>, disabled: {} as Record<string, boolean>, close: () => {}, encode: vi.fn(() => '<svg/>'), copy: vi.fn(async () => true), share: vi.fn(async () => ({})) }));
vi.mock('react-native', () => ({
  View: 'div', Text: 'span', ScrollView: 'div', StyleSheet: { create: (s: unknown) => s },
  useWindowDimensions: () => ({ width: 320, height: 568 }),
  Platform: { OS: 'ios' }, Share: { share: state.share },
  Modal: ({ children, onRequestClose }: { children: React.ReactNode; onRequestClose: () => void }) => { state.close = onRequestClose; return <div role="dialog">{children}</div>; },
  Pressable: ({ children, accessibilityLabel, onPress, disabled }: { children: React.ReactNode; accessibilityLabel: string; onPress: () => unknown; disabled?: boolean }) => { state.actions[accessibilityLabel] = onPress; state.disabled[accessibilityLabel] = !!disabled; return <button disabled={disabled}>{children}</button>; },
}));
vi.mock('lucide-react-native', () => Object.fromEntries(['PhoneCall', 'MessageCircle', 'Phone', 'Heart', 'CircleAlert', 'UsersRound', 'X', 'ExternalLink', 'UserRound', 'ShoppingBasket', 'Gift', 'ChevronsRight', 'Link2', 'Copy', 'Share2'].map(name => [name, () => null])));
vi.mock('expo-clipboard', () => ({ setStringAsync: state.copy }));
vi.mock('react-native-svg', () => ({ SvgXml: () => <svg /> }));
vi.mock('@bwip-js/generic', () => ({ toSVG: state.encode }));
beforeEach(() => { state.actions = {}; state.disabled = {}; vi.clearAllMocks(); });

it('renders all six support actions and delegates the selected destination', () => {
  const select = vi.fn();
  const html = renderToStaticMarkup(<SupportPopover bottom={120} onClose={vi.fn()} onSelect={select} />);
  for (const label of ['Tổng đài', 'Chat với shop', 'Liên hệ lại', 'Sản phẩm yêu thích', 'Phản hồi', 'Về chúng tôi']) expect(html).toContain(label);
  state.actions['Sản phẩm yêu thích'](); expect(select).toHaveBeenCalledWith('favorites');
});
it('dismisses the support popover by backdrop and platform Back/Escape', () => {
  const close = vi.fn(); renderToStaticMarkup(<SupportPopover bottom={120} onClose={close} onSelect={vi.fn()} />);
  state.actions['Đóng hỗ trợ'](); state.close(); expect(close).toHaveBeenCalledTimes(2);
});
it('uses the same real URL for QR, copy and sharing and disables unavailable short links', async () => {
  const url = 'https://bca.example/product/42';
  renderToStaticMarkup(<SharePopup url={url} onClose={vi.fn()} />);
  expect(state.encode).toHaveBeenCalledWith(expect.objectContaining({ bcid: 'qrcode', text: url }));
  expect(state.disabled['Link rút gọn']).toBe(true);
  await state.actions['Copy link'](); expect(state.copy).toHaveBeenCalledWith(url);
  await state.actions['Chia sẻ ngay'](); expect(state.share).toHaveBeenCalledWith({ message: url, url });
});
it('dismisses sharing with the close button and platform Back/Escape', () => {
  const close = vi.fn(); renderToStaticMarkup(<SharePopup url="https://bca.example/" onClose={close} />);
  state.actions['Đóng chia sẻ'](); state.close(); expect(close).toHaveBeenCalledTimes(2);
});
