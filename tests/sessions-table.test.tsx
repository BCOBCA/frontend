import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { SessionsTable, type LoginSession } from '../src/components/profile/SessionsTable';
const state = vi.hoisted(() => ({ actions: {} as Record<string, () => void>, disabled: {} as Record<string, boolean> }));
vi.mock('react-native', () => ({ View: 'div', Text: 'span', useWindowDimensions: () => ({ width: 1200 }), ScrollView: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, StyleSheet: { create: (v: unknown) => v }, Pressable: ({ children, accessibilityLabel, onPress, disabled }: { children: React.ReactNode; accessibilityLabel: string; onPress: () => void; disabled: boolean }) => { state.actions[accessibilityLabel] = onPress; state.disabled[accessibilityLabel] = disabled; return <button disabled={disabled}>{children}</button>; } }));
vi.mock('lucide-react-native', () => ({ MonitorSmartphone: () => null, LogOut: () => null }));
const sessions: LoginSession[] = [{ id: 'one', deviceName: 'BCOBCA App', createdAt: '2026-11-11T08:27:00Z', expiresAt: '2026-12-11T08:27:00Z' }, { id: 'two', deviceName: 'Thiết bị thứ hai', createdAt: '2026-11-10T07:00:00Z', expiresAt: '2026-12-10T07:00:00Z' }];
it('renders session data in table columns including expiry, without invented metadata', () => {
  const html = renderToStaticMarkup(<SessionsTable sessions={sessions} onRevoke={vi.fn()} />);
  for (const value of ['role="table"','role="columnheader"','Thiết bị','Đăng nhập lúc','Hết hạn lúc','Thao tác','BCOBCA App','Thiết bị thứ hai','15:27 11/11/26','15:27 11/12/26']) expect(html).toContain(value);
  expect(html).not.toContain('Thiết bị hiện tại'); expect(html).not.toContain('Địa chỉ IP');
});
it('revokes the selected row and disables actions while a mutation is pending', () => {
  const revoke = vi.fn(); renderToStaticMarkup(<SessionsTable sessions={sessions} onRevoke={revoke} />);
  state.actions['Thu hồi phiên Thiết bị thứ hai, 14:00 10/11/26'](); expect(revoke).toHaveBeenCalledWith('two');
  const html = renderToStaticMarkup(<SessionsTable sessions={sessions} onRevoke={revoke} busyId="one" disabled />);
  expect(html).toContain('Đang thu hồi'); expect(Object.values(state.disabled).every(Boolean)).toBe(true);
});
it('supports an empty list and missing device name', () => {
  expect(renderToStaticMarkup(<SessionsTable sessions={[]} onRevoke={vi.fn()} />)).toContain('Không có phiên đang hoạt động');
  expect(renderToStaticMarkup(<SessionsTable sessions={[{ ...sessions[0], deviceName: '' }]} onRevoke={vi.fn()} />)).toContain('Thiết bị chưa đặt tên');
});
