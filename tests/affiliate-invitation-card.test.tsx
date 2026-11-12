import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { AffiliateInvitationCard, AffiliateInvitationQR } from '../src/components/affiliate/AffiliateInvitationCard';

const state = vi.hoisted(() => ({ actions: {} as Record<string, () => void>, disabled: {} as Record<string, boolean>, encode: vi.fn(() => '<svg></svg>'), requestClose: vi.fn() }));
vi.mock('react-native', () => ({ View: 'div', Text: 'span', StyleSheet: { create: (value: unknown) => value }, ScrollView: 'div', useWindowDimensions: () => ({ width: 393, height: 852 }), Modal: ({ children, onRequestClose }: { children: React.ReactNode; onRequestClose: () => void }) => { state.requestClose = onRequestClose; return <div role="dialog">{children}</div>; }, Pressable: ({ children, accessibilityLabel, disabled, onPress }: { children: React.ReactNode; accessibilityLabel: string; disabled?: boolean; onPress: () => void }) => { state.actions[accessibilityLabel] = onPress; state.disabled[accessibilityLabel] = !!disabled; return <button disabled={disabled}>{children}</button>; } }));
vi.mock('react-native-svg', () => ({ SvgXml: () => <svg /> }));
vi.mock('@bwip-js/generic', () => ({ toSVG: state.encode }));
vi.mock('lucide-react-native', () => Object.fromEntries(['Link2', 'QrCode', 'Share2', 'X'].map(name => [name, () => null])));
vi.mock('../src/components/common/ui', () => ({ Status: () => null }));
vi.mock('../src/components/affiliate/AffiliateDashboardArt', () => ({ AffiliatePlaneArt: () => null }));
vi.mock('../src/components/affiliate/AffiliateDashboardView', () => ({ dashboardPanel: {} }));
const invitation = { code: 'REAL-CODE', url: 'https://example.test/register?ref=REAL-CODE', totalInvites: 0, successfulInvites: 0 };
beforeEach(() => { state.actions = {}; state.disabled = {}; vi.clearAllMocks(); });
it('disables sharing and QR until the real invitation URL is available', () => {
  renderToStaticMarkup(<AffiliateInvitationCard loading onRetry={vi.fn()} onCopy={vi.fn()} onShare={vi.fn()} />);
  expect(state.disabled['Sao chép link']).toBe(true); expect(state.disabled['Tạo mã QR']).toBe(true); expect(state.encode).not.toHaveBeenCalled();
});
it('copies via the callback and retains a selectable URL when copying fails', () => {
  const copy = vi.fn(); const html = renderToStaticMarkup(<AffiliateInvitationCard invitation={invitation} loading={false} copyError="Không thể sao chép" onRetry={vi.fn()} onCopy={copy} onShare={vi.fn()} />);
  state.actions['Sao chép link'](); expect(copy).toHaveBeenCalledOnce(); expect(state.disabled['Tạo mã QR']).toBe(false); expect(html).toContain(invitation.url); expect(html).toContain('Không thể sao chép');
});
it('encodes the actual invitation URL and supports closing/copying/sharing the QR', () => {
  const close = vi.fn(), copy = vi.fn(), share = vi.fn();
  renderToStaticMarkup(<AffiliateInvitationQR invitation={invitation} onClose={close} onCopy={copy} onShare={share} />);
  expect(state.encode).toHaveBeenCalledWith(expect.objectContaining({ bcid: 'qrcode', text: invitation.url }));
  state.actions['Đóng'](); state.requestClose(); expect(close).toHaveBeenCalledTimes(2);
  state.actions['Sao chép link'](); state.actions['Chia sẻ link'](); expect(copy).toHaveBeenCalledOnce(); expect(share).toHaveBeenCalledOnce();
});
