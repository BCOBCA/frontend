import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { AboutView } from '../src/components/about/AboutView';

const state = vi.hoisted(() => ({ width: 1200, actions: {} as Record<string, () => void> }));
vi.mock('react-native', () => ({ View: 'div', Text: 'span', StyleSheet: { create: (v: unknown) => v }, useWindowDimensions: () => ({ width: state.width }), Pressable: ({ children, accessibilityLabel, onPress, accessibilityState }: { children: React.ReactNode; accessibilityLabel: string; onPress: () => void; accessibilityState?: { expanded?: boolean } }) => { state.actions[accessibilityLabel] = onPress; return <button aria-expanded={accessibilityState?.expanded}>{children}</button>; } }));
vi.mock('expo-image', () => ({ Image: () => <img alt="" /> }));
vi.mock('lucide-react-native', () => Object.fromEntries(['ArrowRight','ArrowUpRight','ShoppingBag','Store','TicketPercent','UserRound','Search','Package','Check','ChevronDown','ChevronUp','Heart','Share2','MessageCircle','MapPin','CircleCheck','Sparkles'].map(name => [name, () => null])));
beforeEach(() => { state.width = 1200; state.actions = {}; });

it.each([375, 1200])('introduces the actual web/app at %ipx without placeholder company details', width => {
  state.width = width;
  const html = renderToStaticMarkup(<AboutView onNavigate={vi.fn()} />);
  for (const text of ['Báo chí Online BCA', 'Mua sắm gần hơn.', 'Kết nối nhiều hơn.', 'Khám phá sản phẩm', 'Ưu đãi', 'Affiliate', 'Câu hỏi thường gặp', 'Gửi phản hồi']) expect(html).toContain(text);
  expect(html).not.toContain('chờ công bố'); expect(html).not.toContain('Sắp ra mắt');
});
it('connects discovery, stores, promotions, membership, policy and support to existing pages', () => {
  const navigate = vi.fn(); renderToStaticMarkup(<AboutView onNavigate={navigate} />);
  for (const [label, destination] of [['Khám phá sản phẩm','/categories'],['Khám phá cửa hàng','/dai-ly'],['Xem ưu đãi','/promotions'],['Không gian thành viên','/member'],['Tìm hiểu Affiliate','/info/affiliate'],['Gửi phản hồi','/feedback']]) {
    state.actions[label](); expect(navigate).toHaveBeenCalledWith(destination);
  }
});
it('provides accessible FAQ state and avoids promising automatic affiliate payouts', () => {
  const html = renderToStaticMarkup(<AboutView onNavigate={vi.fn()} />);
  expect(html).toContain('aria-expanded="true"'); expect(html).toContain('aria-expanded="false"');
  expect(html).toContain('điều kiện'); expect(html).not.toContain('thu nhập đảm bảo');
});
