import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { DealerCard } from '../src/components/dealers/DealerCard';
import type { Dealer } from '../src/types/dealers';

vi.mock('react-native', () => {
  const Container = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return { View: Container, Text: Container, Pressable: Container, Image: () => null };
});
vi.mock('expo-router', () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>, router: { push: vi.fn() } }));
vi.mock('lucide-react-native', () => Object.fromEntries(['BadgeCheck', 'Check', 'MapPin', 'Store', 'Users'].map(name => [name, () => null])));
vi.mock('@tanstack/react-query', () => ({ useMutation: () => ({ isPending: false, error: null, mutate: vi.fn() }), useQueryClient: () => ({ invalidateQueries: vi.fn() }) }));
vi.mock('../src/stores/auth', () => ({ useAuth: () => null }));
vi.mock('../src/services/dealers', () => ({ followDealer: vi.fn() }));
vi.mock('../src/services/api', () => ({ errorMessage: () => '' }));
vi.mock('../src/theme', () => ({ colors: {} }));

const dealer: Dealer = { id: 'dealer', name: 'Nguyễn Kim', slug: 'nguyen-kim', logoUrl: '', coverUrl: '', description: '', isVerified: false, followerCount: 0, branchCount: 3, isFollowing: false,
  locationLabel: '63–65–67 Trần Hưng Đạo, Phường Bến Thành, TP. Hồ Chí Minh' };

describe('dealer card operating coverage', () => {
  it('renders selected province names instead of a street address', () => {
    const html = renderToStaticMarkup(<DealerCard dealer={{ ...dealer, provinces: 'Hà Nội, Hồ Chí Minh, Đà Nẵng' }} width={270} />);
    expect(html).toContain('Hà Nội, Hồ Chí Minh, Đà Nẵng');
    expect(html).not.toContain(dealer.locationLabel);
    expect(html).not.toContain('Mã tỉnh/thành');
  });
  it('does not infer coverage from an existing address', () => {
    const html = renderToStaticMarkup(<DealerCard dealer={dealer} width={270} />);
    expect(html).toContain('Chưa thiết lập phạm vi');
    expect(html).not.toContain(dealer.locationLabel);
    expect(html).not.toContain('Mã tỉnh/thành');
  });
  it('renders nationwide coverage', () => {
    expect(renderToStaticMarkup(<DealerCard dealer={{ ...dealer, provinces: 'Toàn quốc' }} width={270} />)).toContain('Toàn quốc');
  });
});
