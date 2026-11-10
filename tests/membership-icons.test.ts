import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { MemberStar } from '../src/components/membership/MemberStar';
import { CheckInGift } from '../src/components/promotions/CheckInGift';
import { AffiliateCoinIcon, MemberPointsIcon } from '../src/components/membership/MemberRewardIcons';

// Reproduce react-native-svg/web forwarding SVG props to a DOM element.
vi.mock('react-native-svg', () => ({ default: 'svg', Circle: 'circle', Ellipse: 'ellipse', Path: 'path' }));
vi.mock('react-native', () => ({ Platform: { OS: 'web' } }));

afterEach(() => vi.restoreAllMocks());

it('renders decorative membership SVGs on web without invalid DOM attributes or React errors', () => {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  for (const Icon of [MemberStar, AffiliateCoinIcon, MemberPointsIcon, CheckInGift]) {
    const html = renderToStaticMarkup(createElement(Icon));
    expect(html).toContain('<svg');
    expect(errors).not.toHaveBeenCalled();
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain(' accessible=');
  }
});
