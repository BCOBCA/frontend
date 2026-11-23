import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import Member from '../app/(tabs)/member';

const state = vi.hoisted(() => ({ actions: {} as Record<string, () => void>, push: vi.fn() }));
vi.mock('react-native', () => ({ View: 'div', Text: 'span', ScrollView: 'div', Platform: { OS: 'web' }, useWindowDimensions: () => ({ width: 1280 }), Pressable: ({ children, accessibilityLabel, onPress }: { children: React.ReactNode; accessibilityLabel: string; onPress: () => void }) => { if (accessibilityLabel) state.actions[accessibilityLabel] = onPress; return <button aria-label={accessibilityLabel}>{children}</button>; } }));
vi.mock('expo-image', () => ({ Image: () => null }));
vi.mock('react-native-svg', () => ({ default: () => null, Path: () => null }));
vi.mock('expo-router', () => ({ router: { push: state.push } }));
vi.mock('lucide-react-native', () => Object.fromEntries(['Clock', 'CircleCheck', 'CircleAlert', 'Package', 'Truck', 'ReceiptText', 'TicketPercent', 'UsersRound', 'Medal', 'FileText', 'UserRound', 'Heart', 'MessageSquare', 'MapPin', 'Info', 'ChevronRight'].map(name => [name, () => null])));
vi.mock('@tanstack/react-query', () => ({ useQuery: () => ({}), useMutation: () => ({}) }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (s: { user: null }) => unknown) => select({ user: null }) }));
vi.mock('../src/services/api', () => ({ request: vi.fn() }));
vi.mock('../src/theme', () => ({ colors: {}, styles: {}, money: String }));
vi.mock('../src/components/common/ui', () => ({ Page: ({ children }: { children: React.ReactNode }) => <main>{children}</main>, Button: () => null, Empty: () => null, Status: () => null }));
vi.mock('../src/components/membership/MemberQRCode', () => ({ MemberQRCode: () => null }));
vi.mock('../src/components/membership/MemberLevelProgress', () => ({ MemberLevelProgress: () => null }));
vi.mock('../src/components/membership/MemberRewardIcons', () => ({ AffiliateCoinIcon: () => null, MemberPointsIcon: () => null }));
it('places My Offers directly after My Orders and navigates to the new personal wallet', () => {
  const html = renderToStaticMarkup(<Member />);
  const orders = html.lastIndexOf('Đơn hàng của tôi'), offers = html.indexOf('Ưu đãi của tôi'), referrals = html.indexOf('Danh sách giới thiệu người mới');
  expect(orders).toBeGreaterThan(-1); expect(offers).toBeGreaterThan(orders); expect(offers).toBeLessThan(referrals);
  state.actions['Ưu đãi của tôi'](); expect(state.push).toHaveBeenCalledWith('/my-offers');
});
