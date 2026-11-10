import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileLoadingOverlay } from '../src/components/profile/ProfileLoadingOverlay';

const state = vi.hoisted(() => ({ focused: true }));
vi.mock('expo-router', () => ({ useIsFocused: () => state.focused }));
vi.mock('react-native', () => ({
  Modal: ({ children }: { children: React.ReactNode }) => <div role="dialog">{children}</div>,
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  ActivityIndicator: () => <span role="progressbar" />,
  Platform: { select: () => ({}) },
}));
vi.mock('../src/theme', () => ({ colors: {} }));

beforeEach(() => { state.focused = true; });

describe('profile loading navigation', () => {
  it('removes the pending profile overlay when navigating to login or member', () => {
    expect(renderToStaticMarkup(<ProfileLoadingOverlay visible />)).toContain('role="dialog"');
    state.focused = false;
    expect(renderToStaticMarkup(<ProfileLoadingOverlay visible />)).toBe('');
  });

  it('never opens a hidden profile overlay when login starts a profile request', () => {
    state.focused = false;
    expect(renderToStaticMarkup(<ProfileLoadingOverlay visible />)).toBe('');
  });

  it('shows saving feedback on the active profile and removes it after completion', () => {
    expect(renderToStaticMarkup(<ProfileLoadingOverlay visible label="Đang lưu thông tin..." />)).toContain('Đang lưu thông tin...');
    expect(renderToStaticMarkup(<ProfileLoadingOverlay visible={false} />)).toBe('');
  });
});
