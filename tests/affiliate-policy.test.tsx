import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Information from '../app/info/[slug]';
vi.mock('../src/screens/AboutScreen', () => ({ default: () => <main>Báo chí Online BCA</main> }));

const state = vi.hoisted(() => ({ slug: 'affiliate', width: 390, user: null as { id: string } | null, push: vi.fn(), query: vi.fn(), actions: {} as Record<string, () => void>, ranks: [{ rank: 0, name: 'Hạng từ DB', minSuccessfulReferrals: 17, commissionRate: 0.0425 }],
  policy: { approvalStatus: 'DRAFT', version: null as string | null, updatedOn: null as string | null, effectiveOn: null as string | null, approvedOn: null as string | null, attributionDays: null as number | null, approvalHoldDays: 14 },
  policyError: null as Error | null, ranksError: null as Error | null,
  layouts: [] as ((event: { nativeEvent: { layout: { y: number } } }) => void)[], scrollTo: vi.fn(),
  scrollers: [] as { horizontal?: boolean; style?: { maxHeight?: number } }[],
}));
vi.mock('react-native', () => {
  const Container = ({ children, onLayout }: { children: React.ReactNode; onLayout?: typeof state.layouts[number] }) => { if (onLayout) state.layouts.push(onLayout); return <div>{children}</div>; };
  const ScrollView = ({ children, ref, ...props }: { children: React.ReactNode; ref?: { current: unknown }; horizontal?: boolean; style?: { maxHeight?: number } }) => { if (ref) ref.current = { scrollTo: state.scrollTo }; state.scrollers.push(props); return <div>{children}</div>; };
  return { View: Container, Text: Container, ScrollView, Platform: { OS: 'web' }, StyleSheet: { create: (styles: unknown) => styles }, useWindowDimensions: () => ({ width: state.width }),
    Pressable: ({ children, accessibilityLabel, onPress }: { children: React.ReactNode; accessibilityLabel: string; onPress: () => void }) => { state.actions[accessibilityLabel] = onPress; return <button>{children}</button>; } };
});
vi.mock('react-native-safe-area-context', () => ({ SafeAreaView: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock('../src/components/affiliate/AffiliatePolicyArt', () => ({ AffiliatePolicyArt: () => null }));
vi.mock('../src/components/affiliate/AffiliateLinkArt', () => ({ AffiliateLinkArt: () => null }));
vi.mock('../src/components/affiliate/AffiliateRankIcon', () => ({ AffiliateRankIcon: () => null }));
vi.mock('lucide-react-native', () => Object.fromEntries(['Info', 'Percent', 'Layers', 'Wallet', 'ShieldCheck', 'ClipboardList', 'Share2', 'Link2', 'ShoppingCart', 'Coins', 'ArrowRight', 'Zap', 'Database', 'ChartNoAxesColumnIncreasing', 'Check', 'Award', 'ChevronDown', 'ChevronUp'].map(name => [name, () => null])));
vi.mock('expo-router', () => ({ useLocalSearchParams: () => ({ slug: state.slug }), router: { push: state.push } }));
vi.mock('../src/stores/auth', () => ({ useAuth: (select: (s: typeof state) => unknown) => select(state) }));
vi.mock('../src/services/api', () => ({ request: vi.fn() }));
vi.mock('../src/components/common/ui', () => ({ Header: () => null, Page: ({ children }: { children: React.ReactNode }) => <main>{children}</main>, Empty: ({ text }: { text: string }) => <span>{text}</span>, Status: ({ error }: { error: Error | null }) => error ? <span>Không tải được cấu hình</span> : null }));
vi.mock('@tanstack/react-query', () => ({ useQuery: (options: { queryKey: string[] }) => { state.query(options); return { data: options.queryKey[0] === 'affiliate-policy' ? state.policyError ? undefined : state.policy : state.ranksError ? undefined : state.ranks, isLoading: false, error: options.queryKey[0] === 'affiliate-policy' ? state.policyError : state.ranksError, refetch: vi.fn() }; } }));
beforeEach(() => { state.slug = 'affiliate'; state.width = 390; state.user = null; state.actions = {}; state.query.mockClear(); state.push.mockClear(); state.layouts = []; state.scrollers = []; state.scrollTo.mockClear(); state.policyError = null; state.ranksError = null; state.policy = { approvalStatus: 'DRAFT', version: null, updatedOn: null, effectiveOn: null, approvedOn: null, attributionDays: null, approvalHoldDays: 14 }; });
describe('affiliate policy route', () => {
  it('renders the reference sections and configured rates rather than sample rates', () => {
    const html = renderToStaticMarkup(<Information />);
    expect(html).toContain('Chương trình'); expect(html).toContain('Affiliate là gì?'); expect(html).toContain('Cách hoạt động');
    expect(html).toContain('Quy định &amp; điều kiện'); expect(html).toContain('Hạng từ DB'); expect(html).toContain('17+'); expect(html).toContain('4,25%');
    expect(state.query).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['affiliate-ranks'] }));
    state.actions['Tham gia ngay'](); expect(state.push).toHaveBeenCalledWith('/login');
    expect(state.actions['Xem hướng dẫn']).toBeTypeOf('function'); expect(state.actions['Thanh toán']).toBeTypeOf('function');
  });
  it('opens existing affiliate tools for members', () => {
    state.user = { id: 'member' }; renderToStaticMarkup(<Information />);
    state.actions['Tham gia ngay'](); expect(state.push).toHaveBeenCalledWith('/affiliate-ranks');
    state.actions['Yêu cầu rút tiền'](); expect(state.push).toHaveBeenCalledWith('/withdrawal');
  });
  it('preserves other info routes', () => {
    state.slug = 'about'; expect(renderToStaticMarkup(<Information />)).toContain('Báo chí Online BCA'); expect(state.query).not.toHaveBeenCalled();
  });
  it.each([390, 768, 1280])('keeps all twelve sections accessible at width %i', width => {
    state.width = width;
    const html = renderToStaticMarkup(<Information />);
    expect(state.layouts).toHaveLength(12);
    expect(html).toContain('12. Câu hỏi thường gặp');
    expect(html).toContain('Ví dụ minh họa, không phải cam kết thu nhập');
    expect(Object.keys(state.actions).filter(label => label.endsWith('?')).length).toBeGreaterThanOrEqual(10);
    expect(state.scrollers[0].horizontal).toBe(width < 900);
    state.layouts.forEach((layout, index) => layout({ nativeEvent: { layout: { y: index * 200 } } }));
    state.actions['Xem hướng dẫn'](); expect(state.scrollTo).toHaveBeenLastCalledWith({ y: 400, animated: true });
    state.actions['Quy định & điều kiện'](); expect(state.scrollTo).toHaveBeenLastCalledWith({ y: 1800, animated: true });
    state.actions['Câu hỏi thường gặp'](); expect(state.scrollTo).toHaveBeenLastCalledWith({ y: 2200, animated: true });
  });
  it('hides publication metadata and operator details while retaining business terms', () => {
    const html = renderToStaticMarkup(<Information />);
    expect(html).not.toContain('Dự thảo – chưa được công bố chính thức'); expect(html).not.toContain('Ngày cập nhật:'); expect(html).not.toContain('Ngày hiệu lực:');
    expect(html).not.toContain('Phiên bản:'); expect(html).not.toContain('Đơn vị vận hành:'); expect(html).not.toContain('Địa chỉ liên hệ:');
    expect(html).toContain('14 ngày'); expect(html).toContain('không có nghĩa là 0 ngày');
    state.actions['Gửi phản ánh / khiếu nại'](); expect(state.push).toHaveBeenCalledWith('/login');
  });
  it('keeps publication metadata hidden even when configured', () => {
    state.policy = { ...state.policy, approvalStatus: 'APPROVED', version: 'approved-v1', updatedOn: '2001-01-01', approvedOn: '2001-01-02', effectiveOn: '2001-02-01' };
    const html = renderToStaticMarkup(<Information />);
    expect(html).not.toContain('01/01/2001'); expect(html).not.toContain('01/02/2001'); expect(html).not.toContain('Đã được phê duyệt');
  });
  it('does not imply approval or substitute sample ranks on API failure', () => {
    state.policyError = new Error('offline'); state.ranksError = new Error('offline');
    const html = renderToStaticMarkup(<Information />);
    expect(html).toContain('Không tải được cấu hình');
    expect(html).not.toContain('Đã được phê duyệt'); expect(html).not.toContain('4,25%');
    expect(html).toContain('Chưa đủ dữ liệu hạng để tính ví dụ');
  });
});
