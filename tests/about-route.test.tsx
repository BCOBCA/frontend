import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import Information from '../app/info/[slug]';
const state = vi.hoisted(() => ({ slug: 'about' }));
vi.mock('expo-router', () => ({ useLocalSearchParams: () => ({ slug: state.slug }) }));
vi.mock('../src/screens/AboutScreen', () => ({ default: () => <main>About landing</main> }));
vi.mock('../src/screens/AffiliatePolicyScreen', () => ({ default: () => <main>Affiliate policy</main> }));
vi.mock('../src/components/common/ui', () => ({ Page: ({ children }: { children: React.ReactNode }) => <main>{children}</main>, Empty: ({ text }: { text: string }) => <p>{text}</p> }));
it('replaces only the about placeholder and preserves the other information routes', () => {
  state.slug = 'about'; expect(renderToStaticMarkup(<Information />)).toContain('About landing');
  state.slug = 'affiliate'; expect(renderToStaticMarkup(<Information />)).toContain('Affiliate policy');
  state.slug = 'unknown'; expect(renderToStaticMarkup(<Information />)).toContain('Nội dung chưa được công bố.');
});
