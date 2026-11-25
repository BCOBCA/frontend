import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import RootLayout from '../app/_layout';

const state = vi.hoisted(() => ({
  auth: { ready: false, restoring: false, user: null as { id: string; accountId: string } | null, restoreError: null as unknown, restore: vi.fn() },
}));
vi.mock('expo-router', () => ({
  Stack: ({ screenLayout }: { screenLayout?: (props: { children: React.ReactNode }) => React.ReactNode }) => {
    const route = <span>Route content</span>;
    return <main data-navigator="mounted">{screenLayout ? screenLayout({ children: route }) : route}</main>;
  },
}));
vi.mock('react-native', () => {
  const Container = ({ children, accessibilityLabel }: { children?: React.ReactNode; accessibilityLabel?: string }) => <div aria-label={accessibilityLabel}>{children}</div>;
  return { View: Container, Text: Container, ActivityIndicator: Container, Platform: { OS: 'web' }, AppState: { addEventListener: vi.fn() } };
});
vi.mock('react-native-safe-area-context', () => ({ SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('expo-status-bar', () => ({ StatusBar: () => null }));
vi.mock('@tanstack/react-query', () => ({ QueryClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>, focusManager: { setFocused: vi.fn() } }));
vi.mock('../src/stores/auth', () => ({ queryClient: {}, useAuth: Object.assign((select: (auth: typeof state.auth) => unknown) => select(state.auth), { getState: () => state.auth }) }));
vi.mock('../src/components/common/ui', () => ({ Button: ({ title }: { title: string }) => <button>{title}</button> }));
vi.mock('../src/components/common/GlobalToastHost', () => ({ GlobalToastHost: () => null }));
vi.mock('../src/components/common/FloatingActions', () => ({ FloatingActions: () => <aside>Floating actions</aside> }));
vi.mock('../src/services/api', () => ({ ensureFreshSession: vi.fn(), errorMessage: () => 'Không thể kết nối máy chủ.' }));
vi.mock('../src/services/session-maintenance', () => ({ startSessionMaintenance: vi.fn() }));
vi.mock('../src/services/use-live-notifications', () => ({ useLiveNotifications: vi.fn() }));
vi.mock('../src/services/push-notifications', () => ({ usePushNotifications: vi.fn() }));
vi.mock('../src/theme', () => ({ colors: { background: '#F3F3F7', primary: '#DF403B', text: '#24242B', muted: '#777985' } }));

beforeEach(() => {
  state.auth = { ready: false, restoring: false, user: null, restoreError: null, restore: vi.fn() };
});

it.each(['initial', 'restoring', 'error', 'retry'] as const)('keeps the root navigator mounted while blocking route content during %s', phase => {
  state.auth.ready = phase !== 'initial';
  state.auth.restoring = phase === 'restoring' || phase === 'retry';
  state.auth.restoreError = phase === 'error' ? new Error('offline') : null;
  const html = renderToStaticMarkup(<RootLayout />);
  expect(html).toContain('data-navigator="mounted"');
  expect(html).not.toContain('Route content');
  expect(html).not.toContain('Floating actions');
  expect(html).toContain(phase === 'error' ? 'Kết nối lại' : 'Đang khôi phục phiên đăng nhập');
});

it.each([null, { id: 'user', accountId: 'account' }])('renders routes after session restoration for guest/user %j', user => {
  Object.assign(state.auth, { ready: true, user });
  expect(renderToStaticMarkup(<RootLayout />)).toContain('Route content');
  expect(renderToStaticMarkup(<RootLayout />)).toContain('Floating actions');
});

it('keeps routes available while recovering an existing signed-in session', () => {
  Object.assign(state.auth, { ready: true, restoring: true, user: { id: 'user', accountId: 'account' } });
  expect(renderToStaticMarkup(<RootLayout />)).toContain('Route content');
});
