import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Promotions from '../app/(tabs)/promotions';

const state = vi.hoisted(() => ({
  user: null as { id: string } | null,
  member: { data: undefined as undefined | { availablePoints: number; checkedInToday: boolean; checkInStreakDays?: number }, isLoading: false, error: null as Error | null, refetch: vi.fn() },
  push: vi.fn(), mutate: vi.fn(), enabled: false, checkInSuccess: false,
  buttons: [] as { title: string; disabled?: boolean; onPress: () => void }[],
}));
vi.mock('react-native', () => {
  const Container = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Pressable = (props: { accessibilityRole?: string; accessibilityLabel?: string; children: React.ReactNode; disabled?: boolean; onPress: () => void }) => {
    if (props.accessibilityRole === 'button' && /điểm danh/i.test(props.accessibilityLabel ?? '')) state.buttons.push({ title: props.accessibilityLabel!, disabled: props.disabled, onPress: props.onPress });
    return <div>{props.children}</div>;
  };
  return { Platform: { OS: 'web' }, View: Container, Text: Container, ScrollView: Container, Pressable, Modal: () => null, useWindowDimensions: () => ({ width: 390 }) };
});
vi.mock('expo-router', () => ({ router: { push: state.push } }));
vi.mock('expo-clipboard', () => ({ setStringAsync: vi.fn() }));
vi.mock('lucide-react-native', () => Object.fromEntries(['CalendarCheck', 'Check', 'ChevronRight', 'Crown', 'Flame', 'Gift', 'Percent', 'Star', 'TicketPercent', 'X', 'Zap'].map(name => [name, () => null])));
vi.mock('../src/components/membership/MemberStar', () => ({ MemberStar: () => null }));
vi.mock('../src/components/promotions/CheckInGift', () => ({ CheckInGift: () => null }));
vi.mock('../src/components/promotions/OfferCard', () => ({ OfferCard: () => null }));
vi.mock('../src/components/common/TopToast', () => ({ TopToast: () => null }));
vi.mock('../src/theme', () => ({ colors: {}, styles: {}, money: String }));
vi.mock('../src/services/api', () => ({ request: vi.fn(), errorMessage: String }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (s: { user: typeof state.user }) => unknown) => select(state), queryClient: { invalidateQueries: vi.fn() } }));
vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: { enabled: boolean; queryKey: string[] }) => { if (options.queryKey[0] === 'check-in-program') return { data: { rewardPoints: 1, isActive: true } }; state.enabled = options.enabled; return state.member; },
  useInfiniteQuery: () => ({ data: { pages: [] }, isLoading: false }),
  useMutation: () => ({ mutate: state.mutate, isPending: false, isSuccess: state.checkInSuccess, data: { rewardPoints: 1, streakDays: 1 } }),
}));
vi.mock('../src/components/common/ui', () => ({
  Page: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
  Button: (props: typeof state.buttons[number]) => { state.buttons.push(props); return <button disabled={props.disabled}>{props.title}</button>; },
  Status: () => null, Empty: () => null, LoginNotice: () => <span>Đăng nhập để sử dụng chức năng này</span>,
}));

beforeEach(() => {
  state.user = null; state.member.data = undefined; state.member.isLoading = false; state.member.error = null;
  state.buttons = []; state.push.mockClear(); state.mutate.mockClear(); state.checkInSuccess = false;
});
const checkInButton = () => state.buttons.find(button => /điểm danh/i.test(button.title))!;

describe('promotions check-in', () => {
  it('does not leave an inline reward notification below the available points after check-in', () => {
    state.user = { id: 'member' }; state.checkInSuccess = true;
    state.member.data = { availablePoints: 1, checkedInToday: true };
    const html = renderToStaticMarkup(<Promotions />);
    expect(html).not.toContain('Bạn nhận được');
  });
  it('shows guests zero points and a check-in button that opens login without submitting', () => {
    state.member.data = { availablePoints: 900, checkedInToday: true };
    const html = renderToStaticMarkup(<Promotions />);
    expect(html).toContain('Hôm nay'); expect(html).toContain('Ngày 7'); expect(html).not.toContain('900');
    expect(html.match(/\+1\sđiểm/g)).toHaveLength(7);
    expect(checkInButton().title).toBe('Điểm danh ngay'); expect(checkInButton().disabled).toBeFalsy();
    checkInButton().onPress();
    expect(state.push).toHaveBeenCalledWith('/login'); expect(state.mutate).not.toHaveBeenCalled(); expect(state.enabled).toBe(false);
  });
  it('uses the signed-in balance and submits check-in for an eligible member', () => {
    state.user = { id: 'member' }; state.member.data = { availablePoints: 1234, checkedInToday: false };
    expect(renderToStaticMarkup(<Promotions />)).toContain((1234).toLocaleString('vi-VN'));
    checkInButton().onPress(); expect(state.mutate).toHaveBeenCalledOnce(); expect(state.enabled).toBe(true);
  });
  it('shows the actual completed check-in after login', () => {
    state.user = { id: 'member' }; state.member.data = { availablePoints: 10, checkedInToday: true };
    renderToStaticMarkup(<Promotions />);
    expect(checkInButton().title).toBe('Đã điểm danh hôm nay'); expect(checkInButton().disabled).toBe(true);
  });
  it.each(['loading', 'error'])('blocks signed-in check-in during membership %s', condition => {
    state.user = { id: 'member' }; state.member.isLoading = condition === 'loading'; state.member.error = condition === 'error' ? new Error('Offline') : null;
    renderToStaticMarkup(<Promotions />); expect(checkInButton().disabled).toBe(true);
  });
});
